import { isSupabaseConfigured, uploadToSupabase, supabase } from './supabase';
import { getPageSettings, savePageSettings } from './pageSettings';

export interface UploadedVideoResult {
  id: string;
  title: string;
  url: string;
  format: 'horizontal' | 'vertical';
  thumbnailUrl?: string | null;
  fileSize?: string | null;
  isActive?: number;
}

export async function uploadVideo(
  file: File,
  title: string,
  format: 'horizontal' | 'vertical' = 'horizontal',
  onProgress?: (status: string) => void
): Promise<UploadedVideoResult> {
  const cleanTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');
  onProgress?.('Video sunucuya yükleniyor...');

  // 1. Try multipart FormData upload to local server
  try {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', cleanTitle);
    formData.append('format', format);

    const res = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.url) {
        const record = json.data;

        // If Supabase is configured, back it up in background
        if (isSupabaseConfigured) {
          uploadToSupabase(file, file.name, 'media')
            .then(async (supaUrl) => {
              if (supaUrl) {
                await supabase.from('videos').insert({
                  title: cleanTitle,
                  url: supaUrl,
                  format,
                  is_active: 1,
                });
              }
            })
            .catch((e) => console.warn('Supabase background sync skipped:', e));
        }

        // Apply immediately to local page settings
        const curSettings = getPageSettings();
        savePageSettings({
          ...curSettings,
          videoUrl: record.url,
          videoTitle: record.title || cleanTitle,
          videoFormat: format,
          heroBackgroundMode: 'video',
          showVideoButton: true,
        });
        window.dispatchEvent(new Event('pageSettingsUpdated'));

        return {
          id: record.id,
          title: record.title || cleanTitle,
          url: record.url,
          format,
          thumbnailUrl: record.thumbnailUrl || '/images/fleet_vito_lounge.jpg',
          fileSize: record.fileSize,
          isActive: 1,
        };
      }
    }
  } catch (err) {
    console.warn('FormData video upload error, attempting base64 fallback:', err);
  }

  // 2. Fallback to base64 upload if FormData is intercepted
  try {
    onProgress?.('Video alternatif yöntemle aktarılıyor...');
    const base64Data = await readFileAsDataUrl(file);

    const res = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        fileName: file.name,
        title: cleanTitle,
        format,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.url) {
        const record = json.data;
        const curSettings = getPageSettings();
        savePageSettings({
          ...curSettings,
          videoUrl: record.url,
          videoTitle: cleanTitle,
          videoFormat: format,
          heroBackgroundMode: 'video',
          showVideoButton: true,
        });
        window.dispatchEvent(new Event('pageSettingsUpdated'));

        return {
          id: record.id,
          title: cleanTitle,
          url: record.url,
          format,
          thumbnailUrl: '/images/fleet_vito_lounge.jpg',
          fileSize: record.fileSize,
          isActive: 1,
        };
      }
    }
  } catch (err) {
    console.warn('Base64 video upload failed:', err);
  }

  // 3. Fallback to Supabase if configured
  if (isSupabaseConfigured) {
    onProgress?.("Supabase Storage'a yükleniyor...");
    const publicUrl = await uploadToSupabase(file, file.name, 'media');
    if (publicUrl) {
      const { data: supaRecord } = await supabase
        .from('videos')
        .insert({
          title: cleanTitle,
          url: publicUrl,
          thumbnail_url: '/images/fleet_vito_lounge.jpg',
          format,
          is_active: 1,
        })
        .select()
        .single();

      const curSettings = getPageSettings();
      savePageSettings({
        ...curSettings,
        videoUrl: publicUrl,
        videoTitle: cleanTitle,
        videoFormat: format,
        heroBackgroundMode: 'video',
        showVideoButton: true,
      });
      window.dispatchEvent(new Event('pageSettingsUpdated'));

      return {
        id: supaRecord?.id || `supa-${Date.now()}`,
        title: cleanTitle,
        url: publicUrl,
        format,
        thumbnailUrl: '/images/fleet_vito_lounge.jpg',
        isActive: 1,
      };
    }
  }

  throw new Error('Video sunucuya aktarılamadı. Lütfen dosya boyutunu ve internet bağlantınızı kontrol edip tekrar deneyin.');
}

export async function uploadMediaFile(
  file: File,
  category: string = 'general',
  onProgress?: (status: string) => void
): Promise<string> {
  onProgress?.('Dosya yükleniyor...');

  // 1. Try server FormData upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.url) {
        return json.data.url;
      }
    }
  } catch (err) {
    console.warn('FormData media upload error, using fallback:', err);
  }

  // 2. Base64 fallback
  try {
    const base64Data = await readFileAsDataUrl(file);
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        fileName: file.name,
        category,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.url) {
        return json.data.url;
      }
    }
  } catch (err) {
    console.warn('Base64 media upload error:', err);
  }

  // 3. Supabase fallback
  if (isSupabaseConfigured) {
    onProgress?.("Bulut depolamaya aktarılıyor...");
    const supaUrl = await uploadToSupabase(file, file.name, 'media');
    if (supaUrl) return supaUrl;
  }

  throw new Error('Görsel bulut depolamaya yüklenemedi. Lütfen dosya boyutunu veya formatını kontrol edip tekrar deneyin.');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
