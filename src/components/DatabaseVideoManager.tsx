import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Upload,
  Check,
  Play,
  Eye,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Loader2,
  Link as LinkIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Cloud,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { getPageSettings, savePageSettings, sanitizeVideoUrl } from '@/lib/pageSettings';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { uploadVideo, uploadMediaFile } from '@/lib/mediaUpload';

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail_url?: string | null;
  format: 'horizontal' | 'vertical';
  duration?: string | null;
  file_size?: string | null;
  is_active: number;
  created_at?: string | null;
}

export interface MediaFileItem {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size?: string | null;
  category: string;
  created_at?: string | null;
}

interface Props {
  onVideoSelected?: (videoUrl: string, format: 'horizontal' | 'vertical') => void;
}

export const DatabaseVideoManager: React.FC<Props> = ({ onVideoSelected }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'video_picker' | 'upload_video' | 'images'>('video_picker');

  // Video upload state
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical'>('horizontal');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // Preview modal
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSettings, setPageSettings] = useState(() => getPageSettings());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ configured: boolean; connected: boolean; cloudName?: string } | null>(null);

  const fetchCloudinaryStatus = async () => {
    try {
      const res = await fetch('/api/cloudinary/status');
      if (res.ok) {
        const json = await res.json();
        setCloudinaryStatus(json);
      }
    } catch {
      // ignore
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: VideoItem[] = json.data.map((v: {
            id: string;
            title: string;
            url: string;
            thumbnailUrl?: string;
            thumbnail_url?: string;
            format?: 'horizontal' | 'vertical';
            duration?: string;
            fileSize?: string;
            file_size?: string;
            isActive?: number;
            is_active?: number;
            createdAt?: string;
            created_at?: string;
          }) => ({
            id: v.id,
            title: v.title,
            url: v.url,
            thumbnail_url: v.thumbnailUrl || v.thumbnail_url || '/images/fleet_vito_lounge.jpg',
            format: v.format || 'horizontal',
            duration: v.duration,
            file_size: v.fileSize || v.file_size,
            is_active: v.isActive ?? v.is_active ?? 0,
            created_at: v.createdAt || v.created_at,
          }));
          setVideos(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('API video fetch error:', err);
    }

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setVideos(data as VideoItem[]);
        }
      } catch (e) {
        console.warn('Supabase fetch error:', e);
      }
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const mapped: MediaFileItem[] = json.data.map((m: {
            id: string;
            name: string;
            url: string;
            fileType?: string;
            file_type?: string;
            fileSize?: string;
            file_size?: string;
            category?: string;
            createdAt?: string;
            created_at?: string;
          }) => ({
            id: m.id,
            name: m.name,
            url: m.url,
            file_type: m.fileType || m.file_type || 'image',
            file_size: m.fileSize || m.file_size,
            category: m.category || 'general',
            created_at: m.createdAt || m.created_at,
          }));
          setMediaFiles(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('API media fetch error:', err);
    }

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setMediaFiles(data as MediaFileItem[]);
        }
      } catch (e) {
        console.warn('Supabase media fetch error:', e);
      }
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchMedia();
    fetchCloudinaryStatus();

    const onSettingsUpdate = () => {
      setPageSettings(getPageSettings());
    };
    window.addEventListener('pageSettingsUpdated', onSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', onSettingsUpdate);
  }, []);

  const handleRefresh = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchVideos().catch(err => console.warn('Fetch videos error:', err)),
        fetchMedia().catch(err => console.warn('Fetch media error:', err)),
        fetchCloudinaryStatus().catch(() => {}),
      ]);
      setPageSettings(getPageSettings());
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
  };

  const handleToggleSound = (muted: boolean) => {
    const cur = getPageSettings();
    const next = { ...cur, videoMuted: muted };
    setPageSettings(next);
    savePageSettings(next);
    window.dispatchEvent(new Event('pageSettingsUpdated'));
  };

  const handleToggleMode = (mode: 'video' | 'image') => {
    const cur = getPageSettings();
    const next = { ...cur, heroBackgroundMode: mode, showVideoButton: mode === 'video' };
    setPageSettings(next);
    savePageSettings(next);
    window.dispatchEvent(new Event('pageSettingsUpdated'));
    
    // Auto-switch tab if switching to image mode
    if (mode === 'image' && activeSubTab !== 'images') {
      setActiveSubTab('images');
    } else if (mode === 'video' && activeSubTab === 'images') {
      setActiveSubTab('video_picker');
    }
  };

  // Handle setting a video as active
  const handleSelectVideo = async (video: VideoItem) => {
    try {
      await fetch(`/api/videos/${encodeURIComponent(video.id)}/activate`, {
        method: 'PATCH',
      }).catch(() => {});

      if (isSupabaseConfigured) {
        await supabase.from('videos').update({ is_active: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('videos').update({ is_active: 1 }).eq('id', video.id);
      }

      setVideos((prev) =>
        prev.map((v) => ({
          ...v,
          is_active: v.id === video.id ? 1 : 0,
        }))
      );

      const curSettings = getPageSettings();
      savePageSettings({
        ...curSettings,
        videoUrl: video.url,
        videoTitle: video.title,
        videoFormat: video.format,
        heroBackgroundMode: 'video',
        showVideoButton: true,
      });

      window.dispatchEvent(new Event('pageSettingsUpdated'));
      if (onVideoSelected) {
        onVideoSelected(video.url, video.format);
      }
    } catch (err) {
      console.error('Failed to activate video:', err);
    }
  };

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Video yükleniyor...');
    setUploadError('');

    try {
      await uploadVideo(file, videoTitle, videoFormat, (msg) => setUploadStatus(msg));
      setUploadStatus('Video başarıyla yüklendi ve aktif tanıtım videosu yapıldı!');
      await fetchVideos();

      setVideoTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setUploadStatus('');
        setActiveSubTab('video_picker');
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yükleme başarısız';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle adding video from direct URL / YouTube link
  const handleAddVideoByUrl = async () => {
    const rawUrl = videoUrlInput.trim();
    if (!rawUrl) {
      setUploadError('Lütfen geçerli bir video bağlantısı girin.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Video bağlantısı kaydediliyor...');
    setUploadError('');

    try {
      const resolvedUrl = sanitizeVideoUrl(rawUrl);
      const cleanTitle = videoTitle.trim() || 'VIP Tanıtım Videosu';

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          url: resolvedUrl,
          thumbnailUrl: '/images/fleet_vito_lounge.jpg',
          format: videoFormat,
          isActive: 1,
        }),
      });

      if (!res.ok) throw new Error('Video kaydedilemedi');

      const curSettings = getPageSettings();
      savePageSettings({
        ...curSettings,
        videoUrl: resolvedUrl,
        videoTitle: cleanTitle,
        videoFormat: videoFormat,
        heroBackgroundMode: 'video',
        showVideoButton: true,
      });
      window.dispatchEvent(new Event('pageSettingsUpdated'));

      setUploadStatus('Video başarıyla eklendi!');
      await fetchVideos();

      setVideoUrlInput('');
      setVideoTitle('');
      setTimeout(() => {
        setUploadStatus('');
        setActiveSubTab('video_picker');
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Video eklenirken hata oluştu';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu videoyu silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/videos/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
      if (isSupabaseConfigured) {
        try {
          await supabase.from('videos').delete().eq('id', id);
        } catch {
          // ignore
        }
      }
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDeleteMedia = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu görseli kütüphaneden kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
      setMediaFiles((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete media failed:', err);
    }
  };

  // Multi-image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus(`Görseller yükleniyor (${i + 1}/${files.length}): ${file.name}`);
        const publicUrl = await uploadMediaFile(file, 'gallery', (msg) => {
          setUploadStatus(`[${i + 1}/${files.length}] ${msg}`);
        });
        if (publicUrl) successCount++;
      }
      await fetchMedia();
      setUploadStatus(`${successCount} görsel başarıyla kütüphaneye kaydedildi!`);
      setTimeout(() => setUploadStatus(''), 2500);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadStatus('Görsel yüklenirken bir sorun oluştu.');
      setTimeout(() => setUploadStatus(''), 3000);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const activeVideo = videos.find((v) => v.is_active === 1);

  return (
    <div className="space-y-6">
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-md flex flex-col items-center justify-center text-foam">
          <Loader2 className="w-12 h-12 text-brass animate-spin mb-4" />
          <p className="text-sm font-medium">{uploadStatus || 'İşlem yapılıyor...'}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="sticky top-[116px] sm:top-[128px] z-40 rounded-2xl border border-brass/30 bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brass/10 to-transparent pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/20 text-brass">
                <Film className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-serif text-foam font-bold">
                Medya ve Video Yönetim Merkezi
              </h2>
              {cloudinaryStatus?.connected && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>Cloudinary Aktif ({cloudinaryStatus.cloudName || 'oyzz6k3g'})</span>
                </span>
              )}
            </div>
            <p className="text-xs text-foam/60 max-w-2xl">
              Bodrum VIP Transfer ana sayfa tanıtım videolarınızı ve görsellerinizi buradan kolayca yükleyebilir, dilediğinizi tek tıkla aktif yapabilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 hover:border-brass/40 bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-foam shadow-lg transition-all cursor-pointer disabled:opacity-60"
              title="Videoları ve Medyayı Yenile"
            >
              <RefreshCw className={`w-4 h-4 text-brass ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Yenileniyor...' : 'Şimdi Yenile'}</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-brass/30 bg-brass/10 hover:bg-brass/20 active:scale-95 text-xs font-bold text-brass shadow-lg transition-all cursor-pointer disabled:opacity-60"
              title="Cloudinary'deki tüm resimleri ve videoları kütüphaneye aktar"
            >
              <Cloud className="w-4 h-4" />
              <span>Cloudinary'den Resimleri Çek</span>
            </button>
          </div>
        </div>

        {/* Active Video Status Row */}
        {activeVideo && (
          <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-foam/60">Ana Sayfada Oynatılan Video:</span>
              <span className="font-semibold text-brass truncate max-w-md">{activeVideo.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brass/15 text-brass uppercase font-semibold">
                {activeVideo.format === 'vertical' ? 'Dikey Reels' : 'Yatay'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewVideo(activeVideo)}
              className="inline-flex items-center gap-1 text-brass hover:text-brass-light underline text-xs cursor-pointer font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canlı Önizle</span>
            </button>
          </div>
        )}

        {/* Video Audio Setting: Sesi Otomatik Aç / Kapat */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-foam/75 font-medium">Ana Sayfa Video Sesi:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              pageSettings.videoMuted === false
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {pageSettings.videoMuted === false ? 'Sesi Otomatik Açık' : 'Sesi Kapat (Sessiz)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleSound(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pageSettings.videoMuted === false
                  ? 'bg-emerald-500 text-ink-950 font-bold shadow-md ring-1 ring-emerald-500/40'
                  : 'bg-white/5 text-foam/50 border border-white/10 hover:text-foam hover:bg-white/10'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${pageSettings.videoMuted === false ? 'text-ink-950' : 'text-emerald-400'}`} />
              <span>Sesi Otomatik Aç</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleSound(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pageSettings.videoMuted !== false
                  ? 'bg-amber-500 text-ink-950 font-bold shadow-md ring-1 ring-amber-500/40'
                  : 'bg-white/5 text-foam/50 border border-white/10 hover:text-foam hover:bg-white/10'
              }`}
            >
              <VolumeX className={`w-3.5 h-3.5 ${pageSettings.videoMuted !== false ? 'text-ink-950' : 'text-amber-400'}`} />
              <span>Sesi Kapat (Sessiz)</span>
            </button>
          </div>
        </div>

        {/* Ana Sayfa Arka Plan Tercihi: Video mu / Resim Slaytı mı */}
        <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-foam/75 font-medium">Ana Sayfa Arka Planı:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              pageSettings.heroBackgroundMode === 'image'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-brass/20 text-brass border border-brass/40'
            }`}>
              {pageSettings.heroBackgroundMode === 'image' ? 'Resim Slaytı Yayında' : 'VIP Video Yayında'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleMode('video')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pageSettings.heroBackgroundMode !== 'image'
                  ? 'bg-brass text-ink-950 font-bold shadow-sm ring-1 ring-brass/50'
                  : 'bg-white/5 text-foam/50 border border-white/10 hover:text-foam hover:bg-white/10'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Video Oynat</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('image')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pageSettings.heroBackgroundMode === 'image'
                  ? 'bg-brass text-ink-950 font-bold shadow-sm ring-1 ring-brass/50'
                  : 'bg-white/5 text-foam/50 border border-white/10 hover:text-foam hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Resim Slaytı Göster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveSubTab('video_picker')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'video_picker' ? 'border-brass text-brass bg-white/5' : 'border-transparent text-foam/60 hover:text-foam'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Videolarım ({videos.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('upload_video')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'upload_video' ? 'border-brass text-brass bg-white/5' : 'border-transparent text-foam/60 hover:text-foam'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Yeni Video Yükle / Ekle</span>
        </button>
        <button
          onClick={() => setActiveSubTab('images')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'images' ? 'border-brass text-brass bg-white/5' : 'border-transparent text-foam/60 hover:text-foam'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Görsel Kütüphanesi ({mediaFiles.length})</span>
        </button>
      </div>

      {/* Tab 1: Video Picker */}
      {activeSubTab === 'video_picker' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-foam/60">
            <span>Ana sayfada arka planda oynatmak istediğiniz videoyu &quot;Aktif Yap&quot; butonuna basarak anında seçebilirsiniz.</span>
            <button
              onClick={() => setActiveSubTab('upload_video')}
              className="inline-flex items-center gap-1 text-brass hover:underline cursor-pointer font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Video Yükle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((vid) => {
              const isSelected = vid.is_active === 1;
              return (
                <div
                  key={vid.id}
                  className={`rounded-2xl border p-4 space-y-4 transition-all ${
                    isSelected
                      ? 'border-brass bg-ink-950 shadow-[0_0_24px_-4px_rgba(201,161,90,0.3)] ring-1 ring-brass'
                      : 'border-white/10 bg-ink-900/60 hover:border-white/20'
                  }`}
                >
                  <div className="aspect-video relative rounded-xl overflow-hidden bg-black group border border-white/5">
                    <video
                      src={vid.url}
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setPreviewVideo(vid)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brass text-ink-950 text-xs font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Oynat</span>
                      </button>
                    </div>

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-ink-950/80 backdrop-blur-md text-[10px] text-foam font-medium">
                      {vid.format === 'vertical' ? 'Dikey (9:16)' : 'Yatay'}
                    </span>

                    {vid.file_size && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-ink-950/80 backdrop-blur-md text-[10px] text-foam/80">
                        {vid.file_size}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-foam text-sm font-semibold truncate" title={vid.title}>
                      {vid.title}
                    </h4>
                    <p className="text-[11px] text-foam/50 truncate font-mono">
                      {vid.url}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Yayında (Aktif)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectVideo(vid)}
                        className="inline-flex items-center gap-1.5 text-xs bg-brass hover:bg-brass-light text-ink-950 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Aktif Yap</span>
                      </button>
                    )}

                    <div className="relative group/menu">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-foam/40 hover:text-foam transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 w-32 bg-ink-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-40 overflow-hidden">
                        <button
                          onClick={(e) => handleDeleteVideo(vid.id, e)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Videoyu Sil</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Upload Video */}
      {activeSubTab === 'upload_video' && (
        <div className="max-w-2xl mx-auto space-y-6 bg-ink-900/60 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-foam flex items-center gap-2">
              <Upload className="w-5 h-5 text-brass" />
              <span>Yeni Video Yükle</span>
            </h3>
            <p className="text-xs text-foam/60">
              Bilgisayarınızdan bir video dosyası seçin veya doğrudan bir video linki (MP4 / YouTube) ekleyin.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-foam/70 mb-1.5">
                Video Başlığı (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Örn: Bodrum Marina Gün Batımı VIP Transfer"
                className="w-full bg-[#0b1e2d] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#d4af63] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-foam/70 mb-1.5">
                Video Formatı
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVideoFormat('horizontal')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    videoFormat === 'horizontal'
                      ? 'border-[#d4af63] bg-[#d4af63]/20 text-[#d4af63] shadow-md'
                      : 'border-white/10 text-white/60 hover:text-white bg-[#0b1e2d]'
                  }`}
                >
                  Yatay Video (16:9 - Masaüstü & Web)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoFormat('vertical')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    videoFormat === 'vertical'
                      ? 'border-[#d4af63] bg-[#d4af63]/20 text-[#d4af63] shadow-md'
                      : 'border-white/10 text-white/60 hover:text-white bg-[#0b1e2d]'
                  }`}
                >
                  Dikey Video (9:16 - Instagram Reels / Mobil)
                </button>
              </div>
            </div>

            {/* Method A: File Upload */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs font-semibold uppercase text-foam/70">
                1. Seçenek: Dosya Yükle (MP4 / WebM / MOV)
              </span>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#d4af63]/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#0b1e2d]/60 hover:bg-[#0b1e2d] group"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-foam/40 group-hover:text-[#d4af63] transition-colors" />
                <p className="text-sm font-semibold text-white group-hover:text-[#d4af63] transition-colors">
                  Bilgisayarınızdan Video Seçmek İçin Tıklayın
                </p>
                <p className="text-xs text-white/50 mt-1">
                  MP4, MOV veya WebM dosyalarını destekler (Maksimum 250 MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                />
              </div>
            </div>

            {/* Method B: Direct URL Input */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="block text-xs font-semibold uppercase text-foam/70">
                2. Seçenek: Video Linki (URL / YouTube / Doğrudan MP4)
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://... veya YouTube / Vimeo bağlantısı"
                    className="w-full bg-[#0b1e2d] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#d4af63] focus:outline-none pl-9"
                  />
                  <LinkIcon className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={handleAddVideoByUrl}
                  className="bg-brass hover:bg-brass-light text-ink-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 shadow-md"
                >
                  Linki Ekle
                </button>
              </div>
            </div>

            {uploadStatus && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Images Library */}
      {activeSubTab === 'images' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-foam/60">
            <span>Yüklenen görselleri araç galerinizde veya ana sayfa görsellerinde kullanabilirsiniz.</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-white/15 hover:border-brass/60 rounded-xl flex flex-col items-center justify-center text-foam/40 hover:text-brass transition-all cursor-pointer bg-ink-900/40 hover:bg-ink-900 p-2 text-center"
              title="Cihazınızdan tek seferde birden fazla görsel seçip yükleyebilirsiniz"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">Görseller Yükle</span>
              <span className="text-[10px] text-foam/40 mt-0.5">Çoklu Seçim</span>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />

            {mediaFiles.map((m) => (
              <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10 bg-ink-950">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 group/menu">
                  <button className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-32 bg-ink-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-40 overflow-hidden">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.url);
                        setCopiedId(m.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-foam/70 hover:bg-white/5 transition-colors text-left"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === m.id ? 'Kopyalandı' : 'URL Kopyala'}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteMedia(m.id, e)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kalıcı Olarak Sil</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-ink-950 rounded-2xl overflow-hidden border border-brass/40 shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-foam font-serif font-bold truncate pr-4">{previewVideo.title}</h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-foam/40 hover:text-foam text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
