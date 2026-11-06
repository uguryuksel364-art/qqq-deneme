import crypto from 'crypto';
import { readJsonFile, writeJsonFile } from './local-db-util';
import { supabaseServer, isSupabaseServerConfigured } from '../lib/supabaseServer';
import { cloudinary, checkIsCloudinaryConfigured } from '../lib/cloudinary';

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export interface VideoRecord {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  format: 'horizontal' | 'vertical';
  duration?: string | null;
  fileSize?: string | null;
  isActive: number;
  createdAt: string;
}

export interface MediaFileRecord {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize?: string | null;
  category: string;
  createdAt: string;
}

export interface NewVideoInput {
  id?: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  format?: 'horizontal' | 'vertical';
  duration?: string;
  fileSize?: string;
  isActive?: number;
}

const VIDEOS_FILE = 'videos.json';
const MEDIA_FILE = 'media.json';

const DEFAULT_PRESET_VIDEOS: VideoRecord[] = [
  {
    id: 'preset-video-horizontal',
    title: 'Bodrum Marina & VIP Transfer (Yatay)',
    url: '/videos/bodrum_marina.mp4',
    thumbnailUrl: '/images/fleet_vito_lounge.jpg',
    format: 'horizontal',
    duration: '0:30',
    fileSize: '15 MB',
    isActive: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-video-vertical',
    title: 'Bodrum Marina Reels (Dikey 9:16)',
    url: '/videos/bodrum_marina_vertical.mp4',
    thumbnailUrl: '/images/fleet_maybach_interior.jpg',
    format: 'vertical',
    duration: '0:25',
    fileSize: '12 MB',
    isActive: 0,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Automatically sync any assets from Cloudinary into Supabase and local JSON
 */
async function syncFromCloudinaryIfNeeded() {
  if (!checkIsCloudinaryConfigured()) return;

  try {
    const media = readJsonFile<MediaFileRecord[]>(MEDIA_FILE, []);
    const videos = readJsonFile<VideoRecord[]>(VIDEOS_FILE, []);
    let localChanged = false;

    // 1. Sync images
    const imgRes = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'mert_vip',
      max_results: 100,
    });

    if (imgRes?.resources && Array.isArray(imgRes.resources)) {
      for (const r of imgRes.resources) {
        if (r.public_id?.includes('/test/')) continue;
        const url = r.secure_url || r.url;
        if (!url) continue;

        const existsInLocal = media.some(m => m.url === url);
        if (!existsInLocal) {
          const name = r.public_id.split('/').pop() + (r.format ? `.${r.format}` : '');
          const category = r.public_id.split('/')[1] || 'general';
          const uuid = crypto.randomUUID();
          const newMedia: MediaFileRecord = {
            id: uuid,
            name,
            url,
            fileType: 'image',
            fileSize: r.bytes ? `${(r.bytes / 1024).toFixed(0)} KB` : '150 KB',
            category,
            createdAt: r.created_at || new Date().toISOString(),
          };
          media.push(newMedia);
          localChanged = true;

          if (isSupabaseServerConfigured) {
            await supabaseServer.from('media').insert([newMedia]).catch(() => {});
          }
        }
      }
    }

    // 2. Sync videos
    const vidRes = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      prefix: 'mert_vip',
      max_results: 50,
    });

    if (vidRes?.resources && Array.isArray(vidRes.resources)) {
      for (const vr of vidRes.resources) {
        if (vr.public_id?.includes('/test/')) continue;
        const vUrl = vr.secure_url || vr.url;
        if (!vUrl) continue;

        const existsInLocalV = videos.some(v => v.url === vUrl);
        if (!existsInLocalV) {
          const title = vr.public_id.split('/').pop()?.replace(/[_-]/g, ' ') || 'VIP Video';
          const uuid = crypto.randomUUID();
          const newVid: VideoRecord = {
            id: uuid,
            title,
            url: vUrl,
            thumbnailUrl: vUrl.replace(/\.[^/.]+$/, '.jpg'),
            format: 'horizontal',
            duration: vr.duration ? `${Math.round(vr.duration)}s` : undefined,
            fileSize: vr.bytes ? `${(vr.bytes / (1024 * 1024)).toFixed(1)} MB` : undefined,
            isActive: 0,
            createdAt: vr.created_at || new Date().toISOString(),
          };
          videos.push(newVid);
          localChanged = true;

          if (isSupabaseServerConfigured) {
            await supabaseServer.from('videos').insert([{
              id: newVid.id,
              title: newVid.title,
              url: newVid.url,
              thumbnail_url: newVid.thumbnailUrl,
              format: newVid.format,
              duration: newVid.duration,
              file_size: newVid.fileSize,
              is_active: 0,
              created_at: newVid.createdAt,
            }]).catch(() => {});
          }
        }
      }
    }

    if (localChanged) {
      writeJsonFile(MEDIA_FILE, media);
      writeJsonFile(VIDEOS_FILE, videos);
    }
  } catch (err) {
    console.warn('[Cloudinary Sync Warning]:', err);
  }
}

export async function fetchAllVideos(): Promise<VideoRecord[]> {
  let videoList: VideoRecord[] = [];

  if (isSupabaseServerConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        videoList = data.map((v: Record<string, unknown>) => ({
          id: String(v.id),
          title: String(v.title || ''),
          url: String(v.url || ''),
          thumbnailUrl: v.thumbnail_url ? String(v.thumbnail_url) : undefined,
          format: (v.format === 'vertical' ? 'vertical' : 'horizontal') as 'horizontal' | 'vertical',
          duration: v.duration ? String(v.duration) : undefined,
          fileSize: v.file_size ? String(v.file_size) : undefined,
          isActive: Number(v.is_active || 0),
          createdAt: String(v.created_at || ''),
        }));
      }
    } catch (err) {
      console.warn('[Supabase Server] Videos fetch error:', err);
    }
  }

  // Fallback to local files if Supabase has nothing
  const localData = readJsonFile<VideoRecord[]>(VIDEOS_FILE, []);
  if (videoList.length === 0) {
    if (localData && localData.length > 0) {
      videoList = localData;
    } else {
      videoList = DEFAULT_PRESET_VIDEOS;
      writeJsonFile(VIDEOS_FILE, videoList);
    }
  } else {
    // Keep local cache synced
    writeJsonFile(VIDEOS_FILE, videoList);
  }

  return videoList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function insertVideo(data: NewVideoInput): Promise<VideoRecord> {
  const id = (data.id && isValidUUID(data.id)) ? data.id : crypto.randomUUID();
  const format = data.format || 'horizontal';
  const isActive = data.isActive ?? 0;
  const now = new Date().toISOString();

  if (isSupabaseServerConfigured) {
    try {
      if (isActive === 1) {
        // Reset active status on others
        await supabaseServer.from('videos').update({ is_active: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      const { error: supaErr } = await supabaseServer.from('videos').insert([{
        id,
        title: data.title,
        url: data.url,
        thumbnail_url: data.thumbnailUrl || null,
        format,
        duration: data.duration || null,
        file_size: data.fileSize || null,
        is_active: isActive,
        created_at: now,
      }]);

      if (supaErr) {
        console.error('[Supabase Server] Video insert error:', supaErr);
      } else {
        console.log('[Supabase Server] Video successfully persisted:', id);
      }
    } catch (err) {
      console.warn('[Supabase Server] Video insert exception:', err);
    }
  }

  const videos = readJsonFile<VideoRecord[]>(VIDEOS_FILE, []);
  if (isActive === 1) {
    videos.forEach((v) => (v.isActive = 0));
  }

  const newVid: VideoRecord = {
    id,
    title: data.title,
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || null,
    format,
    duration: data.duration || null,
    fileSize: data.fileSize || null,
    isActive,
    createdAt: now,
  };

  videos.push(newVid);
  writeJsonFile(VIDEOS_FILE, videos);

  if (isActive === 1) {
    await syncActiveVideoToSettings(newVid);
  }

  return newVid;
}

export async function setActiveVideo(id: string): Promise<VideoRecord | null> {
  const videos = readJsonFile<VideoRecord[]>(VIDEOS_FILE, []);
  const target = videos.find((v) => v.id === id) || null;

  videos.forEach((v) => {
    v.isActive = v.id === id ? 1 : 0;
  });

  if (isSupabaseServerConfigured) {
    try {
      await supabaseServer.from('videos').update({ is_active: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      if (isValidUUID(id)) {
        await supabaseServer.from('videos').update({ is_active: 1 }).eq('id', id);
      } else if (target && target.url) {
        await supabaseServer.from('videos').update({ is_active: 1 }).eq('url', target.url);
      }
    } catch (err) {
      console.warn('[Supabase Server] Video activate error:', err);
    }
  }

  if (target) {
    writeJsonFile(VIDEOS_FILE, videos);
    await syncActiveVideoToSettings(target);
    return target;
  }
  return null;
}

export async function removeVideo(id: string): Promise<VideoRecord | null> {
  const videos = readJsonFile<VideoRecord[]>(VIDEOS_FILE, []);
  const deleted = videos.find((v) => v.id === id);

  if (isSupabaseServerConfigured) {
    try {
      if (isValidUUID(id)) {
        await supabaseServer.from('videos').delete().eq('id', id);
      } else if (deleted?.url) {
        await supabaseServer.from('videos').delete().eq('url', deleted.url);
      }
    } catch (err) {
      console.warn('[Supabase Server] Video delete error:', err);
    }
  }

  const filtered = videos.filter((v) => v.id !== id);
  writeJsonFile(VIDEOS_FILE, filtered);
  return deleted || null;
}

async function syncActiveVideoToSettings(video: VideoRecord) {
  const { getSetting, saveSetting } = await import('./settings');
  const current = (await getSetting('page_settings')) || {};
  const updated = {
    ...current,
    videoUrl: video.url,
    videoTitle: video.title,
    videoFormat: video.format,
    heroBackgroundMode: 'video',
    showVideoButton: true,
  };
  await saveSetting('page_settings', updated);
}

export async function fetchAllMedia(): Promise<MediaFileRecord[]> {
  // Sync Cloudinary background assets if any exist
  await syncFromCloudinaryIfNeeded();

  let mediaList: MediaFileRecord[] = [];

  if (isSupabaseServerConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        mediaList = data.map((m: Record<string, unknown>) => ({
          id: String(m.id),
          name: String(m.name || ''),
          url: String(m.url || ''),
          fileType: String(m.file_type || 'image'),
          fileSize: m.file_size ? String(m.file_size) : undefined,
          category: String(m.category || 'general'),
          createdAt: String(m.created_at || ''),
        }));
      }
    } catch (err) {
      console.warn('[Supabase Server] Media fetch error:', err);
    }
  }

  const localData = readJsonFile<MediaFileRecord[]>(MEDIA_FILE, []);
  if (mediaList.length === 0) {
    mediaList = localData;
  } else {
    // Keep local disk updated with database
    writeJsonFile(MEDIA_FILE, mediaList);
  }

  return mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function insertMedia(data: {
  id?: string;
  name: string;
  url: string;
  fileType: string;
  fileSize?: string;
  category?: string;
}): Promise<MediaFileRecord> {
  const id = (data.id && isValidUUID(data.id)) ? data.id : crypto.randomUUID();
  const now = new Date().toISOString();

  if (isSupabaseServerConfigured) {
    try {
      const { error: supaErr } = await supabaseServer.from('media').insert([{
        id,
        name: data.name,
        url: data.url,
        file_type: data.fileType,
        file_size: data.fileSize || null,
        category: data.category || 'general',
        created_at: now,
      }]);

      if (supaErr) {
        console.error('[Supabase Server] Media insert error:', supaErr);
      } else {
        console.log('[Supabase Server] Media successfully persisted:', id);
      }
    } catch (err) {
      console.warn('[Supabase Server] Media insert exception:', err);
    }
  }

  const media = readJsonFile<MediaFileRecord[]>(MEDIA_FILE, []);
  const newMedia: MediaFileRecord = {
    id,
    name: data.name,
    url: data.url,
    fileType: data.fileType,
    fileSize: data.fileSize || null,
    category: data.category || 'general',
    createdAt: now,
  };

  media.push(newMedia);
  writeJsonFile(MEDIA_FILE, media);
  return newMedia;
}

export async function removeMedia(id: string): Promise<MediaFileRecord | null> {
  const media = readJsonFile<MediaFileRecord[]>(MEDIA_FILE, []);
  const deleted = media.find((m) => m.id === id);

  if (isSupabaseServerConfigured) {
    try {
      if (isValidUUID(id)) {
        await supabaseServer.from('media').delete().eq('id', id);
      } else if (deleted?.url) {
        await supabaseServer.from('media').delete().eq('url', deleted.url);
      }
    } catch (err) {
      console.warn('[Supabase Server] Media delete error:', err);
    }
  }

  const filtered = media.filter((m) => m.id !== id);
  writeJsonFile(MEDIA_FILE, filtered);
  return deleted || null;
}
