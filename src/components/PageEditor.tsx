import React, { useState, useRef, useEffect } from 'react';
import {
  getPageSettings,
  savePageSettings,
  fetchPageSettingsFromDb,
  PageSettings,
  FleetYacht,
  ExperienceItem,
  sanitizeVideoUrl,
} from '@/lib/pageSettings';

import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Compass,
  Car,
  Film,
  ArrowUp,
  Check,
  Sparkles,
  FolderOpen,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Type,
  RotateCcw,
  Calendar,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import { uploadVideo, uploadMediaFile } from '@/lib/mediaUpload';

export const PageEditor: React.FC = () => {
  const [settings, setSettings] = useState<PageSettings>(() => getPageSettings());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [publishStatus, setPublishStatus] = useState('');
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'hero' | 'fleet' | 'experience'>('hero');
  const [availableMedia, setAvailableMedia] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [draggedFleetImage, setDraggedFleetImage] = useState<{ yachtId: string; index: number } | null>(null);
  const [newlyAddedYachtId, setNewlyAddedYachtId] = useState<string | null>(null);
  const [savedVehicleId, setSavedVehicleId] = useState<string | null>(null);
  const [saveFleetMessage, setSaveFleetMessage] = useState<string | null>(null);
  const [savedExperienceId, setSavedExperienceId] = useState<string | null>(null);
  const [saveExperienceMessage, setSaveExperienceMessage] = useState<string | null>(null);

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const fleetFileInputRef = useRef<HTMLInputElement>(null);
  const experienceFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [activeFleetForUpload, setActiveFleetForUpload] = useState<string | null>(null);
  const [activeExperienceForUpload, setActiveExperienceForUpload] = useState<string | null>(null);

  // Hero text settings state
  const [heroBadgeInput, setHeroBadgeInput] = useState(settings.heroBadge || 'YALIKAVAK MARİNA & BJV, BODRUM');
  const [heroTitle1Input, setHeroTitle1Input] = useState(settings.heroTitleLine1 || 'Lüksü Yaşa.');
  const [heroTitle2Input, setHeroTitle2Input] = useState(settings.heroTitleLine2 || 'Yolculuğunuz bizim');
  const [heroTitle3Input, setHeroTitle3Input] = useState(settings.heroTitleLine3 || 'en büyük tutkumuz.');
  const [heroDescInput, setHeroDescInput] = useState(
    settings.heroDescription ||
      'Bodrum Havalimanı (BJV) ve Yalıkavak Marina başta olmak üzere, tüm yarımadada VIP şoförlü transfer ve özel tahsis hizmeti.'
  );
  const [heroBtnInput, setHeroBtnInput] = useState(settings.heroButtonText || 'Online Rezervasyon');

  // Experience / Hizmet Deneyimleri states
  const [experienceBadgeInput, setExperienceBadgeInput] = useState(
    settings.experienceBadge || 'EXECUTIVE SERVICES'
  );
  const [experienceTitleInput, setExperienceTitleInput] = useState(
    settings.experienceTitle || 'Bodrum VIP Transfer Deneyimi'
  );
  const [experienceDescInput, setExperienceDescInput] = useState(
    settings.experienceDesc ||
      'Yalnızca bir transfer değil; Bodrum’un eşsiz koylarına, lüks otellerine ve marinalarına prestij ve huzur dolu bir seyahat.'
  );

  // Sync settings from authoritative DB on mount and on storage events
  useEffect(() => {
    let isMounted = true;
    fetchPageSettingsFromDb().then((dbSettings) => {
      if (isMounted && dbSettings) {
        setSettings(dbSettings);
      }
    });

    const handleSync = () => {
      setSettings(getPageSettings());
    };

    window.addEventListener('pageSettingsUpdated', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('pageSettingsUpdated', handleSync);
    };
  }, []);

  // Dirty state tracking removed per user request


  const triggerUpdate = (newSettings: PageSettings) => {
    setSettings(newSettings);
    savePageSettings(newSettings);
    window.dispatchEvent(new Event('pageSettingsUpdated'));
  };

  const handlePublishSlideshow = () => {
    const updated: PageSettings = {
      ...settings,
      heroBackgroundMode: 'image',
    };
    triggerUpdate(updated);
    setPublishStatus('Resim slaytı başarıyla ana sayfada yayına alındı!');
    setTimeout(() => setPublishStatus(''), 4000);
  };

  const handlePublishVideo = () => {
    const updated: PageSettings = {
      ...settings,
      heroBackgroundMode: 'video',
      showVideoButton: true,
    };
    triggerUpdate(updated);
    setPublishStatus('VIP Tanıtım Videosu başarıyla ana sayfada yayına alındı!');
    setTimeout(() => setPublishStatus(''), 4000);
  };

  const fetchMediaForModal = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          setAvailableMedia(
            json.data
              .filter((m: { fileType?: string; url: string }) => m.fileType === 'image' || !m.url.endsWith('.mp4'))
              .map((m: { id: string; url: string; name: string }) => ({ id: m.id, url: m.url, name: m.name }))
          );
        }
      }
    } catch (err) {
      console.warn('Error fetching media:', err);
    }
  };

  const openMediaPicker = async (
    mode: 'hero' | 'fleet' | 'experience' = 'hero',
    itemId: string | null = null
  ) => {
    setMediaPickerMode(mode);
    if (mode === 'fleet' && itemId) {
      setActiveFleetForUpload(itemId);
    } else if (mode === 'experience' && itemId) {
      setActiveExperienceForUpload(itemId);
    }
    setShowMediaPickerModal(true);
    setLoadingMedia(true);
    await fetchMediaForModal();
    setLoadingMedia(false);
  };

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    const newUrls: string[] = [];
    try {
      const targetFolder = mediaPickerMode === 'hero' ? 'hero' : mediaPickerMode === 'experience' ? 'experience' : 'fleet';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Görseller yükleniyor (${i + 1}/${files.length}): ${file.name}`);
        const publicUrl = await uploadMediaFile(
          file,
          targetFolder,
          (msg) => setUploadProgress(`[${i + 1}/${files.length}] ${msg}`)
        );
        if (publicUrl) {
          newUrls.push(publicUrl);
        }
      }

      if (newUrls.length > 0) {
        await fetchMediaForModal();
        if (mediaPickerMode === 'hero') {
          const updatedSlides = Array.from(new Set([...settings.heroSlides, ...newUrls]));
          triggerUpdate({ ...settings, heroSlides: updatedSlides });
        } else if (mediaPickerMode === 'fleet' && activeFleetForUpload) {
          const updatedFleet = settings.fleet.map(y => 
            y.id === activeFleetForUpload 
              ? { ...y, images: Array.from(new Set([...y.images, ...newUrls])) } 
              : y
          );
          triggerUpdate({ ...settings, fleet: updatedFleet });
        } else if (mediaPickerMode === 'experience' && activeExperienceForUpload) {
          const updatedExp = settings.experience.map(e =>
            e.id === activeExperienceForUpload
              ? { ...e, images: Array.from(new Set([...(e.images || []), ...newUrls])) }
              : e
          );
          triggerUpdate({ ...settings, experience: updatedExp });
        }
        setUploadProgress(`${newUrls.length} görsel başarıyla yüklendi ve eklendi!`);
        setTimeout(() => setUploadProgress(''), 2500);
      }
    } catch (err) {
      console.error('Modal multi-upload error:', err);
      setUploadProgress('Görseller yüklenirken bir sorun oluştu.');
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  const handleSelectAllMedia = () => {
    const allUrls = availableMedia.map(m => m.url);
    if (allUrls.length === 0) return;
    if (mediaPickerMode === 'hero') {
      triggerUpdate({ ...settings, heroSlides: Array.from(new Set([...settings.heroSlides, ...allUrls])) });
    } else if (mediaPickerMode === 'fleet' && activeFleetForUpload) {
      const updatedFleet = settings.fleet.map(y => 
        y.id === activeFleetForUpload 
          ? { ...y, images: Array.from(new Set([...y.images, ...allUrls])) } 
          : y
      );
      triggerUpdate({ ...settings, fleet: updatedFleet });
    } else if (mediaPickerMode === 'experience' && activeExperienceForUpload) {
      const updatedExp = settings.experience.map(e =>
        e.id === activeExperienceForUpload
          ? { ...e, images: Array.from(new Set([...(e.images || []), ...allUrls])) }
          : e
      );
      triggerUpdate({ ...settings, experience: updatedExp });
    }
  };

  const handleSelectMediaForSlides = (mediaUrl: string) => {
    if (mediaPickerMode === 'hero') {
      if (settings.heroSlides.includes(mediaUrl)) {
        if (settings.heroSlides.length > 1) {
          const filtered = settings.heroSlides.filter((s) => s !== mediaUrl);
          triggerUpdate({ ...settings, heroSlides: filtered });
        }
        return;
      }
      const updatedSlides = [...settings.heroSlides, mediaUrl];
      triggerUpdate({ ...settings, heroSlides: updatedSlides });
    } else if (mediaPickerMode === 'fleet' && activeFleetForUpload) {
      const yacht = settings.fleet.find(y => y.id === activeFleetForUpload);
      if (!yacht) return;

      if (yacht.images.includes(mediaUrl)) {
        if (yacht.images.length > 1) {
          const updatedFleet = settings.fleet.map(y => 
            y.id === activeFleetForUpload 
              ? { ...y, images: y.images.filter(img => img !== mediaUrl) } 
              : y
          );
          triggerUpdate({ ...settings, fleet: updatedFleet });
        }
        return;
      }
      
      const updatedFleet = settings.fleet.map(y => 
        y.id === activeFleetForUpload 
          ? { ...y, images: [...y.images, mediaUrl] } 
          : y
      );
      triggerUpdate({ ...settings, fleet: updatedFleet });
    } else if (mediaPickerMode === 'experience' && activeExperienceForUpload) {
      const expItem = settings.experience.find(e => e.id === activeExperienceForUpload);
      if (!expItem) return;

      const currentImages = expItem.images || [];
      if (currentImages.includes(mediaUrl)) {
        if (currentImages.length > 1) {
          const updatedExp = settings.experience.map(e =>
            e.id === activeExperienceForUpload
              ? { ...e, images: currentImages.filter(img => img !== mediaUrl) }
              : e
          );
          triggerUpdate({ ...settings, experience: updatedExp });
        }
        return;
      }

      const updatedExp = settings.experience.map(e =>
        e.id === activeExperienceForUpload
          ? { ...e, images: [...currentImages, mediaUrl] }
          : e
      );
      triggerUpdate({ ...settings, experience: updatedExp });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress('Video yükleniyor...');
    try {
      const videoResult = await uploadVideo(files[0], files[0].name, 'horizontal', (msg) => setUploadProgress(msg));
      if (videoResult?.url) {
        triggerUpdate({ ...settings, videoUrl: videoResult.url, showVideoButton: true });
        setUploadProgress('Video başarıyla yüklendi!');
        setTimeout(() => setUploadProgress(''), 2000);
      }
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setIsUploading(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Görseller yükleniyor (${i + 1}/${files.length}): ${file.name}`);
        const publicUrl = await uploadMediaFile(file, 'hero', (msg) => 
          setUploadProgress(`[${i + 1}/${files.length}] ${msg}`)
        );
        if (publicUrl) {
          newUrls.push(publicUrl);
        }
      }
      if (newUrls.length > 0) {
        const updatedSlides = [...settings.heroSlides, ...newUrls];
        triggerUpdate({ ...settings, heroSlides: updatedSlides });
        setUploadProgress(`${newUrls.length} görsel slayta başarıyla eklendi!`);
        setTimeout(() => setUploadProgress(''), 2500);
      }
    } catch (err) {
      console.error('Hero upload error:', err);
      setUploadProgress('Görsel yüklenirken bir hata oluştu.');
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  const deleteHeroSlide = (index: number) => {
    if (settings.heroSlides.length <= 1) return;
    const updated = settings.heroSlides.filter((_, i) => i !== index);
    triggerUpdate({ ...settings, heroSlides: updated });
  };

  const moveHeroSlide = (index: number, direction: 'up' | 'down') => {
    const updated = [...settings.heroSlides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    triggerUpdate({ ...settings, heroSlides: updated });
  };

  const handleFleetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !activeFleetForUpload) return;
    setIsUploading(true);
    const targetFleetId = activeFleetForUpload;
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Araç görselleri yükleniyor (${i + 1}/${files.length}): ${file.name}`);
        const publicUrl = await uploadMediaFile(file, 'fleet', (msg) => 
          setUploadProgress(`[${i + 1}/${files.length}] ${msg}`)
        );
        if (publicUrl) {
          newUrls.push(publicUrl);
        }
      }
      if (newUrls.length > 0) {
        const updatedFleet = settings.fleet.map(y => 
          y.id === targetFleetId 
            ? { ...y, images: [...y.images, ...newUrls] } 
            : y
        );
        triggerUpdate({ ...settings, fleet: updatedFleet });
        setUploadProgress(`${newUrls.length} araç resmi başarıyla eklendi!`);
        setTimeout(() => setUploadProgress(''), 2500);
      }
    } catch (err) {
      console.error('Fleet image upload error:', err);
      setUploadProgress('Araç görselleri yüklenirken hata oluştu.');
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
      setActiveFleetForUpload(null);
      if (fleetFileInputRef.current) fleetFileInputRef.current.value = '';
    }
  };

  const deleteFleetImage = (yachtId: string, imageIndex: number) => {
    const yacht = settings.fleet.find(y => y.id === yachtId);
    if (!yacht || yacht.images.length <= 1) return;
    const updatedImages = yacht.images.filter((_, i) => i !== imageIndex);
    const updatedFleet = settings.fleet.map(y => 
      y.id === yachtId ? { ...y, images: updatedImages } : y
    );
    triggerUpdate({ ...settings, fleet: updatedFleet });
  };

  // Move selected image to index 0 (Primary Cover Photo seen first by customers)
  const handleSetFleetCoverImage = (yachtId: string, imageIndex: number) => {
    const yacht = settings.fleet.find(y => y.id === yachtId);
    if (!yacht || imageIndex === 0) return;
    const newImages = [...yacht.images];
    const [chosen] = newImages.splice(imageIndex, 1);
    newImages.unshift(chosen);
    const updatedFleet = settings.fleet.map(y => 
      y.id === yachtId ? { ...y, images: newImages } : y
    );
    triggerUpdate({ ...settings, fleet: updatedFleet });
    setPublishStatus(`"${yacht.name}" aracının kapak görseli güncellendi! Müşteriler ilk bu fotoğrafı görecek.`);
    setTimeout(() => setPublishStatus(''), 4000);
  };

  // Shift image position (left/right or up/down in grid)
  const handleMoveFleetImage = (yachtId: string, fromIndex: number, direction: 'prev' | 'next') => {
    const yacht = settings.fleet.find(y => y.id === yachtId);
    if (!yacht) return;
    const toIndex = direction === 'prev' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= yacht.images.length) return;
    const newImages = [...yacht.images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    const updatedFleet = settings.fleet.map(y => 
      y.id === yachtId ? { ...y, images: newImages } : y
    );
    triggerUpdate({ ...settings, fleet: updatedFleet });
    if (toIndex === 0) {
      setPublishStatus(`"${yacht.name}" aracının kapak görseli güncellendi!`);
      setTimeout(() => setPublishStatus(''), 3000);
    }
  };

  // Move an image by drag and drop
  const handleDropFleetImage = (yachtId: string, targetIndex: number) => {
    if (!draggedFleetImage || draggedFleetImage.yachtId !== yachtId || draggedFleetImage.index === targetIndex) {
      setDraggedFleetImage(null);
      return;
    }
    const yacht = settings.fleet.find(y => y.id === yachtId);
    if (!yacht) {
      setDraggedFleetImage(null);
      return;
    }
    const newImages = [...yacht.images];
    const [moved] = newImages.splice(draggedFleetImage.index, 1);
    newImages.splice(targetIndex, 0, moved);
    const updatedFleet = settings.fleet.map(y => 
      y.id === yachtId ? { ...y, images: newImages } : y
    );
    triggerUpdate({ ...settings, fleet: updatedFleet });
    if (targetIndex === 0) {
      setPublishStatus(`"${yacht.name}" aracının kapak görseli güncellendi!`);
      setTimeout(() => setPublishStatus(''), 3000);
    }
    setDraggedFleetImage(null);
  };

  // Move entire vehicle up or down in list
  const handleMoveYacht = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.fleet.length) return;
    const newFleet = [...settings.fleet];
    const [moved] = newFleet.splice(index, 1);
    newFleet.splice(targetIndex, 0, moved);
    triggerUpdate({ ...settings, fleet: newFleet });
  };

  const handleAddYacht = () => {
    const newId = 'yacht-' + Date.now();
    const newYacht: FleetYacht = {
      id: newId,
      name: 'Yeni VIP Transfer Aracı',
      specs: '6 Kişi • VIP Dizayn • Wi-Fi',
      description: 'Bodrum içi ve havalimanı transferleri için özel donanımlı konforlu VIP araç.',
      images: ['/images/fleet_vito_lounge.jpg'],
    };
    const currentFleet = Array.isArray(settings?.fleet) ? settings.fleet : [];
    const updatedFleet = [...currentFleet, newYacht];
    triggerUpdate({ ...settings, fleet: updatedFleet });
    setNewlyAddedYachtId(newId);
    setPublishStatus('Yeni VIP araç filoya başarıyla eklendi! Bilgilerini ve fotoğraflarını aşağıdan düzenleyebilirsiniz.');
    setTimeout(() => {
      const el = document.getElementById(newId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    setTimeout(() => {
      setNewlyAddedYachtId(null);
      setPublishStatus('');
    }, 4500);
  };

  const handleDeleteYacht = (id: string) => {
    if (confirm('Bu aracı filodan silmek istediğinize emin misiniz?')) {
      const currentFleet = Array.isArray(settings?.fleet) ? settings.fleet : [];
      triggerUpdate({ ...settings, fleet: currentFleet.filter((y) => y.id !== id) });
      setPublishStatus('Araç filodan silindi.');
      setTimeout(() => setPublishStatus(''), 2500);
    }
  };

  const handleSaveVehicle = (yachtId: string) => {
    const yacht = settings.fleet.find((y) => y.id === yachtId);
    triggerUpdate(settings);
    setSavedVehicleId(yachtId);
    setSaveFleetMessage(`"${yacht?.name || 'Araç'}" bilgileri başarıyla kaydedildi!`);
    setTimeout(() => {
      setSavedVehicleId(null);
    }, 2500);
    setTimeout(() => {
      setSaveFleetMessage(null);
    }, 4000);
  };

  const handleSaveAllFleet = () => {
    triggerUpdate(settings);
    setSaveFleetMessage('Tüm VIP Araç Filosu başarıyla kaydedildi!');
    setTimeout(() => {
      setSaveFleetMessage(null);
    }, 4000);
  };

  const [videoInputText, setVideoInputText] = useState(settings.videoUrl || '');

  const [heroSaveSuccess, setHeroSaveSuccess] = useState(false);

  // Sync inputs with settings
  useEffect(() => {
    if (settings.heroBadge !== undefined) setHeroBadgeInput(settings.heroBadge);
    if (settings.heroTitleLine1 !== undefined) setHeroTitle1Input(settings.heroTitleLine1);
    if (settings.heroTitleLine2 !== undefined) setHeroTitle2Input(settings.heroTitleLine2);
    if (settings.heroTitleLine3 !== undefined) setHeroTitle3Input(settings.heroTitleLine3);
    if (settings.heroDescription !== undefined) setHeroDescInput(settings.heroDescription);
    if (settings.heroButtonText !== undefined) setHeroBtnInput(settings.heroButtonText);
  }, [
    settings.heroBadge,
    settings.heroTitleLine1,
    settings.heroTitleLine2,
    settings.heroTitleLine3,
    settings.heroDescription,
    settings.heroButtonText,
  ]);

  const handleSaveHeroTexts = () => {
    const updated: PageSettings = {
      ...settings,
      heroBadge: heroBadgeInput.trim(),
      heroTitleLine1: heroTitle1Input.trim(),
      heroTitleLine2: heroTitle2Input.trim(),
      heroTitleLine3: heroTitle3Input.trim(),
      heroDescription: heroDescInput.trim(),
      heroButtonText: heroBtnInput.trim(),
    };
    triggerUpdate(updated);
    setHeroSaveSuccess(true);
    setPublishStatus('Ana sayfa karşılama yazıları ve rozet başarıyla kaydedildi!');
    setTimeout(() => {
      setHeroSaveSuccess(false);
      setPublishStatus('');
    }, 3500);
  };

  const handleResetHeroTexts = () => {
    const defaultBadge = 'YALIKAVAK MARİNA & BJV, BODRUM';
    const defaultT1 = 'Lüksü Yaşa.';
    const defaultT2 = 'Yolculuğunuz bizim';
    const defaultT3 = 'en büyük tutkumuz.';
    const defaultDesc =
      'Bodrum Havalimanı (BJV) ve Yalıkavak Marina başta olmak üzere, tüm yarımadada VIP şoförlü transfer ve özel tahsis hizmeti.';
    const defaultBtn = 'Online Rezervasyon';

    setHeroBadgeInput(defaultBadge);
    setHeroTitle1Input(defaultT1);
    setHeroTitle2Input(defaultT2);
    setHeroTitle3Input(defaultT3);
    setHeroDescInput(defaultDesc);
    setHeroBtnInput(defaultBtn);

    const updated: PageSettings = {
      ...settings,
      heroBadge: defaultBadge,
      heroTitleLine1: defaultT1,
      heroTitleLine2: defaultT2,
      heroTitleLine3: defaultT3,
      heroDescription: defaultDesc,
      heroButtonText: defaultBtn,
    };
    triggerUpdate(updated);
    setPublishStatus('Karşılama yazıları varsayılana sıfırlandı.');
    setTimeout(() => setPublishStatus(''), 3500);
  };

  // Experience / Hizmet Deneyimleri handlers
  useEffect(() => {
    if (settings.experienceBadge !== undefined) setExperienceBadgeInput(settings.experienceBadge);
    if (settings.experienceTitle !== undefined) setExperienceTitleInput(settings.experienceTitle);
    if (settings.experienceDesc !== undefined) setExperienceDescInput(settings.experienceDesc);
  }, [settings.experienceBadge, settings.experienceTitle, settings.experienceDesc]);

  const handleSaveExperienceSectionTexts = () => {
    const updated: PageSettings = {
      ...settings,
      experienceBadge: experienceBadgeInput.trim(),
      experienceTitle: experienceTitleInput.trim(),
      experienceDesc: experienceDescInput.trim(),
    };
    triggerUpdate(updated);
    setPublishStatus('Bodrum VIP Transfer Deneyimi bölüm başlıkları kaydedildi!');
    setTimeout(() => setPublishStatus(''), 3500);
  };

  const handleExperienceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !activeExperienceForUpload) return;
    setIsUploading(true);
    const targetExpId = activeExperienceForUpload;
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Görseller yükleniyor (${i + 1}/${files.length}): ${file.name}`);
        const publicUrl = await uploadMediaFile(file, 'experience', (msg) =>
          setUploadProgress(`[${i + 1}/${files.length}] ${msg}`)
        );
        if (publicUrl) {
          newUrls.push(publicUrl);
        }
      }
      if (newUrls.length > 0) {
        const updatedExp = settings.experience.map((item) =>
          item.id === targetExpId
            ? { ...item, images: [...(item.images || []), ...newUrls] }
            : item
        );
        triggerUpdate({ ...settings, experience: updatedExp });
        setUploadProgress(`${newUrls.length} görsel başarıyla eklendi!`);
        setTimeout(() => setUploadProgress(''), 2500);
      }
    } catch (err) {
      console.error('Experience image upload error:', err);
      setUploadProgress('Görseller yüklenirken hata oluştu.');
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
      setActiveExperienceForUpload(null);
      if (experienceFileInputRef.current) experienceFileInputRef.current.value = '';
    }
  };

  const deleteExperienceImage = (expId: string, imageIndex: number) => {
    const exp = settings.experience.find((e) => e.id === expId);
    if (!exp || (exp.images && exp.images.length <= 1)) return;
    const updatedImages = exp.images.filter((_, i) => i !== imageIndex);
    const updatedExp = settings.experience.map((e) =>
      e.id === expId ? { ...e, images: updatedImages } : e
    );
    triggerUpdate({ ...settings, experience: updatedExp });
  };

  const handleSetExperienceCoverImage = (expId: string, imageIndex: number) => {
    const exp = settings.experience.find((e) => e.id === expId);
    if (!exp || imageIndex === 0) return;
    const newImages = [...exp.images];
    const [chosen] = newImages.splice(imageIndex, 1);
    newImages.unshift(chosen);
    const updatedExp = settings.experience.map((e) =>
      e.id === expId ? { ...e, images: newImages } : e
    );
    triggerUpdate({ ...settings, experience: updatedExp });
    setPublishStatus(`"${exp.title}" kartının kapak görseli güncellendi!`);
    setTimeout(() => setPublishStatus(''), 3000);
  };

  const handleMoveExperienceImage = (expId: string, fromIndex: number, direction: 'prev' | 'next') => {
    const exp = settings.experience.find((e) => e.id === expId);
    if (!exp) return;
    const toIndex = direction === 'prev' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= exp.images.length) return;
    const newImages = [...exp.images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    const updatedExp = settings.experience.map((e) =>
      e.id === expId ? { ...e, images: newImages } : e
    );
    triggerUpdate({ ...settings, experience: updatedExp });
    if (toIndex === 0) {
      setPublishStatus(`"${exp.title}" kartının kapak görseli güncellendi!`);
      setTimeout(() => setPublishStatus(''), 3000);
    }
  };

  const handleMoveExperienceItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.experience.length) return;
    const newExp = [...settings.experience];
    const [moved] = newExp.splice(index, 1);
    newExp.splice(targetIndex, 0, moved);
    triggerUpdate({ ...settings, experience: newExp });
  };

  const handleSaveExperienceCard = (expId: string) => {
    const exp = settings.experience.find((e) => e.id === expId);
    triggerUpdate(settings);
    setSavedExperienceId(expId);
    setSaveExperienceMessage(`"${exp?.title || 'Hizmet Kartı'}" başarıyla kaydedildi!`);
    setTimeout(() => setSavedExperienceId(null), 2500);
    setTimeout(() => setSaveExperienceMessage(null), 4000);
  };

  const handleSaveAllExperience = () => {
    triggerUpdate(settings);
    setSaveExperienceMessage('Tüm VIP Hizmet Deneyimleri başarıyla kaydedildi!');
    setTimeout(() => setSaveExperienceMessage(null), 4000);
  };

  const handleAddExperienceCard = () => {
    const newId = `exp-${Date.now()}`;
    const newCard: ExperienceItem = {
      id: newId,
      title: 'Yeni VIP Deneyim',
      description: 'Milas-Bodrum Havalimanı (BJV) veya Bodrum içi lüks şoförlü transfer ayrıcalığı.',
      images: ['/images/fleet_vito_lounge.jpg'],
      badge: 'VIP STANDART',
      feature: '7/24 Kesintisiz Hizmet',
      buttonText: 'Rezervasyon Yap →',
      iconName: 'CarFront',
    };
    const updatedExp = [...settings.experience, newCard];
    triggerUpdate({ ...settings, experience: updatedExp });
    setSaveExperienceMessage('Yeni VIP Deneyim kartı eklendi!');
    setTimeout(() => setSaveExperienceMessage(null), 4000);
  };

  const handleDeleteExperienceCard = (expId: string) => {
    if (settings.experience.length <= 1) {
      alert('En az 1 adet deneyim kartı bulunmalıdır.');
      return;
    }
    const exp = settings.experience.find((e) => e.id === expId);
    if (!window.confirm(`"${exp?.title || 'Bu hizmet kartı'}" silinsin mi?`)) return;
    const updatedExp = settings.experience.filter((e) => e.id !== expId);
    triggerUpdate({ ...settings, experience: updatedExp });
    setSaveExperienceMessage('Hizmet kartı silindi.');
    setTimeout(() => setSaveExperienceMessage(null), 3000);
  };

  const handleToggleExperienceVisibility = (visible: boolean) => {
    const updated: PageSettings = {
      ...settings,
      showExperience: visible,
    };
    triggerUpdate(updated);
    setSaveExperienceMessage(
      visible
        ? 'VIP Hizmetler & Deneyim bölümü ana sayfada YAYINA ALINDI (ziyaretçilere gösteriliyor).'
        : 'VIP Hizmetler & Deneyim bölümü ana sayfadan KALDIRILDI (ziyaretçilere gizlendi).'
    );
    setTimeout(() => setSaveExperienceMessage(null), 4000);
  };

  const handleToggleCardVisibility = (expId: string) => {
    const updatedExp = settings.experience.map((e) => {
      if (e.id === expId) {
        return { ...e, hidden: !e.hidden };
      }
      return e;
    });
    const targetItem = settings.experience.find((e) => e.id === expId);
    const willBeHidden = !targetItem?.hidden;
    triggerUpdate({ ...settings, experience: updatedExp });
    setSaveExperienceMessage(
      willBeHidden
        ? `"${targetItem?.title || 'Hizmet Kartı'}" sitede GİZLENDİ.`
        : `"${targetItem?.title || 'Hizmet Kartı'}" sitede YAYINA ALINDI.`
    );
    setTimeout(() => setSaveExperienceMessage(null), 3500);
  };

  const handleSwitchToImageMode = () => {
    setSettings({ ...settings, heroBackgroundMode: 'image' });
    openMediaPicker();
  };

  const handleApplyVideoUrl = (rawUrl?: string) => {
    const inputToUse = (rawUrl !== undefined ? rawUrl : videoInputText).trim();
    const resolvedUrl = sanitizeVideoUrl(inputToUse);
    triggerUpdate({ ...settings, videoUrl: resolvedUrl, showVideoButton: true });
    setVideoInputText(inputToUse);
  };

  return (
    <div className="space-y-12">
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-foam">
          <Loader2 className="w-12 h-12 text-brass animate-spin mb-4" />
          <p>{uploadProgress || 'Yükleniyor...'}</p>
        </div>
      )}

      {/* Başarılı Yayına Alma Bildirim Bandı */}
      {publishStatus && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between text-sm shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="font-semibold">{publishStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setPublishStatus('')}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Logo Yönetimi Section */}
      <section className="bg-ink-900 border border-brass/20 rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/15 border border-brass/30 text-brass text-[10px] font-bold uppercase tracking-widest">
              Branding
            </div>
            <h3 className="font-serif text-2xl text-foam font-bold">Logo Yönetimi</h3>
            <p className="text-xs text-foam/60">Sitedeki ana logoyu buradan güncelleyebilirsiniz.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 p-4 rounded-2xl bg-ink-950/60 border border-white/5">
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-2">
            <img 
              src={settings.logoUrl || '/images/logo.jpeg'} 
              alt="Current Logo" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-[11px] text-foam/50 font-medium">Yeni bir logo dosyası seçin (PNG veya JPEG önerilir).</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const publicUrl = await uploadMediaFile(file, 'branding', (msg) => setUploadProgress(msg));
                      if (publicUrl) {
                        triggerUpdate({ ...settings, logoUrl: publicUrl });
                        setPublishStatus('Logo başarıyla güncellendi!');
                        setTimeout(() => setPublishStatus(''), 3000);
                      }
                    } catch (err) {
                      console.error('Logo upload error:', err);
                    } finally {
                      setIsUploading(false);
                    }
                  };
                  input.click();
                }}
                className="px-5 py-2.5 rounded-xl bg-brass hover:bg-brass-light text-ink-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Logo Yükle
              </button>
              <button
                type="button"
                onClick={() => triggerUpdate({ ...settings, logoUrl: '/images/logo.jpeg' })}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foam/60 hover:text-foam text-xs font-semibold transition-all border border-white/10 cursor-pointer"
              >
                Varsayılana Dön
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ana Sayfa Karşılama Yazıları & Rozet Yönetimi */}
      <section className="bg-gradient-to-br from-ink-900 to-ink-950 border border-brass/25 rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-brass/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/15 border border-brass/30 text-brass text-[10px] font-bold uppercase tracking-widest">
              <Type className="w-3.5 h-3.5" />
              Metin & Slogan Yönetimi
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-foam font-bold leading-tight">
              Karşılama Yazıları & <span className="text-brass">Rozet Yönetimi</span>
            </h3>
            <p className="text-sm text-foam/70 max-w-2xl leading-relaxed">
              Ana sayfanın üst rozetini (<span className="text-brass font-medium">"YALIKAVAK MARİNA & BJV, BODRUM"</span>), ana başlığı (3 satır), açıklama paragrafını ve rezervasyon butonunu dilediğiniz gibi güncelleyin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetHeroTexts}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-ink-950/60 hover:bg-white/5 text-foam/70 hover:text-foam text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="Varsayılan metinlere geri dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Varsayılana Sıfırla</span>
            </button>
            <button
              type="button"
              onClick={handleSaveHeroTexts}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brass to-amber-500 hover:from-amber-400 hover:to-amber-500 text-ink-950 font-bold text-sm transition-all shadow-lg shadow-brass/20 hover:shadow-brass/40 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{heroSaveSuccess ? 'Kaydedildi!' : 'Yazıları Kaydet'}</span>
            </button>
          </div>
        </div>

        {/* 2 Column Layout: Edit Form + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* Inputs Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Rozet (Badge) Input */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-ink-950/60 border border-white/5">
              <label className="block text-xs font-semibold text-brass tracking-wider uppercase">
                1. Üst Rozet (Oval Badge)
              </label>
              <p className="text-[11px] text-foam/50 pb-1">
                Ana sayfa başlığının üzerinde yer alan oval altın çerçeveli etiket
              </p>
              <input
                type="text"
                value={heroBadgeInput}
                onChange={(e) => setHeroBadgeInput(e.target.value)}
                placeholder="Örn: YALIKAVAK MARİNA & BJV, BODRUM"
                className="w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-white/10 text-foam text-sm font-medium focus:outline-none focus:border-brass/60 focus:ring-1 focus:ring-brass/40 transition-all"
              />
            </div>

            {/* 3 Başlık Satırı */}
            <div className="p-4 rounded-2xl bg-ink-950/60 border border-white/5 space-y-3.5">
              <label className="block text-xs font-semibold text-brass tracking-wider uppercase">
                2. Ana Başlık (3 Satır)
              </label>
              
              <div className="space-y-1">
                <span className="text-[11px] text-foam/60">Başlık 1. Satır (Beyaz):</span>
                <input
                  type="text"
                  value={heroTitle1Input}
                  onChange={(e) => setHeroTitle1Input(e.target.value)}
                  placeholder="Örn: Lüksü Yaşa."
                  className="w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-white/10 text-foam text-sm font-medium focus:outline-none focus:border-brass/60 transition-all"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-brass/90 font-medium">Başlık 2. Satır (Altın Renk Vurgulu):</span>
                <input
                  type="text"
                  value={heroTitle2Input}
                  onChange={(e) => setHeroTitle2Input(e.target.value)}
                  placeholder="Örn: Yolculuğunuz bizim"
                  className="w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-brass/30 text-brass text-sm font-medium focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass/40 transition-all"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-foam/60">Başlık 3. Satır (Beyaz):</span>
                <input
                  type="text"
                  value={heroTitle3Input}
                  onChange={(e) => setHeroTitle3Input(e.target.value)}
                  placeholder="Örn: en büyük tutkumuz."
                  className="w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-white/10 text-foam text-sm font-medium focus:outline-none focus:border-brass/60 transition-all"
                />
              </div>
            </div>

            {/* Açıklama Paragrafı */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-ink-950/60 border border-white/5">
              <label className="block text-xs font-semibold text-brass tracking-wider uppercase">
                3. Açıklama Paragrafı
              </label>
              <textarea
                rows={3}
                value={heroDescInput}
                onChange={(e) => setHeroDescInput(e.target.value)}
                placeholder="Açıklama metnini girin..."
                className="w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-white/10 text-foam text-sm focus:outline-none focus:border-brass/60 focus:ring-1 focus:ring-brass/40 transition-all leading-relaxed"
              />
            </div>

            {/* Buton Yazısı */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-ink-950/60 border border-white/5">
              <label className="block text-xs font-semibold text-brass tracking-wider uppercase">
                4. Rezervasyon Buton Metni
              </label>
              <input
                type="text"
                value={heroBtnInput}
                onChange={(e) => setHeroBtnInput(e.target.value)}
                placeholder="Örn: Online Rezervasyon"
                className="w-full px-4 py-2.5 rounded-xl bg-ink-900 border border-white/10 text-foam text-sm font-medium focus:outline-none focus:border-brass/60 transition-all"
              />
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="text-xs font-semibold text-foam/60 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brass" />
              Canlı Karşılama Önizlemesi
            </div>

            <div className="relative flex-1 rounded-2xl bg-gradient-to-b from-[#07131f] to-[#04090f] border border-white/10 p-6 sm:p-7 shadow-inner flex flex-col justify-center overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brass/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-4">
                {/* Badge preview */}
                <div className="inline-block rounded-full border border-[#d4af63]/50 bg-ink-950/80 px-3.5 py-1 text-[10px] tracking-[2px] text-[#e5c47e] font-medium backdrop-blur-md">
                  {heroBadgeInput || 'YALIKAVAK MARİNA & BJV, BODRUM'}
                </div>

                {/* Headings preview */}
                <h4 className="font-serif text-2xl sm:text-3xl text-white font-bold leading-tight tracking-tight">
                  {heroTitle1Input || 'Lüksü Yaşa.'}{' '}
                  <span className="block text-[#d4af63]">
                    {heroTitle2Input || 'Yolculuğunuz bizim'}
                  </span>
                  {heroTitle3Input || 'en büyük tutkumuz.'}
                </h4>

                {/* Subtitle preview */}
                <p className="text-xs text-white/70 leading-relaxed max-w-sm">
                  {heroDescInput || 'Bodrum Havalimanı (BJV) ve Yalıkavak Marina başta olmak üzere VIP transfer...'}
                </p>

                {/* Button preview */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#4da8a8] px-5 py-2.5 text-xs font-bold text-[#071c2b] shadow-md shadow-[#4da8a8]/20">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{heroBtnInput || 'Online Rezervasyon'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-foam/40">
                <span>Ana sayfa canlı yansıması</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Aktif
                </span>
              </div>
            </div>

            {/* Quick save button under preview on mobile/desktop */}
            <button
              type="button"
              onClick={handleSaveHeroTexts}
              className="mt-4 w-full py-3 rounded-xl bg-brass hover:bg-brass-light text-ink-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{heroSaveSuccess ? 'Değişiklikler Kaydedildi!' : 'Tüm Metinleri Kaydet ve Yayınla'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Ana Sayfa Arka Plan Tercihi (Video mu yoksa Resim Slaytı mı?) */}
      <section className="bg-gradient-to-br from-ink-900 to-ink-950 border border-brass/20 rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brass/5 rounded-full blur-3xl group-hover:bg-brass/10 transition-colors" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/10 border border-brass/20 text-brass text-[10px] font-bold uppercase tracking-widest">
              Görünüm Ayarları
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-foam font-bold leading-tight">
              Ana Sayfa <span className="text-brass">Arka Plan Tercihi</span>
            </h3>
            <p className="text-sm text-foam/60 max-w-xl leading-relaxed">
              Ziyaretçilerinizin ana sayfanıza girdiğinde göreceği görsel deneyimi belirleyin. Tam ekran bir VIP video mu yoksa büyüleyici fotoğraflardan oluşan bir slayt mı?
            </p>
          </div>

          {/* Mod Seçici (Video vs Slayt) */}
          <div className="flex p-1.5 rounded-[1.25rem] bg-ink-950 border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, heroBackgroundMode: 'video' })}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                settings.heroBackgroundMode !== 'image'
                  ? 'bg-brass text-ink-950 shadow-[0_8px_20px_-4px_rgba(201,161,90,0.4)] scale-100'
                  : 'text-foam/40 hover:text-foam hover:bg-white/5'
              }`}
            >
              <Film className={`w-4 h-4 ${settings.heroBackgroundMode !== 'image' ? 'animate-pulse' : ''}`} />
              <span>VIP Video Modu</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToImageMode}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                settings.heroBackgroundMode === 'image'
                  ? 'bg-brass text-ink-950 shadow-[0_8px_20px_-4px_rgba(201,161,90,0.4)] scale-100'
                  : 'text-foam/40 hover:text-foam hover:bg-white/5'
              }`}
            >
              <ImageIcon className={`w-4 h-4 ${settings.heroBackgroundMode === 'image' ? 'animate-bounce' : ''}`} />
              <span>Resim Slayt Modu</span>
            </button>
          </div>
        </div>

        {/* Dinamik Editör Alanı */}
        <div className="relative">
          {settings.heroBackgroundMode === 'image' ? (
            /* RESİM SLAYT EDİTÖRÜ */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-ink-950/40 border border-white/5 rounded-[1.5rem] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-foam font-serif text-lg font-bold">Slayt Görsellerini Yönet</h4>
                      <p className="text-xs text-foam/40">Sıralamayı değiştirin, yeni ekleyin veya kütüphaneyi kullanın.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openMediaPicker('hero')}
                      className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-foam text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4 text-brass" />
                      Kütüphaneden Seç
                    </button>
                    <button
                      onClick={() => openMediaPicker('hero')}
                      className="px-4 py-2 rounded-xl bg-brass hover:bg-brass-light text-ink-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Şimdi Resim Yükle
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {settings.heroSlides.map((url, idx) => (
                    <div key={idx} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-ink-900 shadow-lg">
                      <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-2 right-2 group/menu">
                        <button className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute top-full right-0 mt-1 w-32 bg-ink-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-40 overflow-hidden">
                          <button
                            onClick={() => moveHeroSlide(idx, 'up')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-foam/70 hover:bg-white/5 transition-colors text-left"
                          >
                            <ArrowUp className="w-3 h-3" />
                            <span>Öne Taşı</span>
                          </button>
                          <button
                            onClick={() => deleteHeroSlide(idx)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Slaytı Sil</span>
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-ink-950/80 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-brass uppercase">
                        {idx + 1}. Slayt
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-foam/40 italic">
                    <Sparkles className="w-3.5 h-3.5 text-brass" />
                    Resimler her 6 saniyede bir otomatik olarak değişecektir.
                  </div>
                  <input
                    type="file"
                    ref={heroFileInputRef}
                    multiple
                    onChange={handleHeroFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    onClick={handlePublishSlideshow}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-[1.25rem] bg-emerald-500 hover:bg-emerald-400 text-ink-950 font-black text-sm uppercase tracking-wider shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    Resim Slaytını Yayına Al
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* VİDEO EDİTÖRÜ */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-ink-950/40 border border-white/5 rounded-[1.5rem] p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-foam font-serif text-lg font-bold">Tanıtım Videosunu Yönet</h4>
                    <p className="text-xs text-foam/40">URL girerek veya dosya yükleyerek ana sayfa videonuzu güncelleyin.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
                  <div className="space-y-4">
                    <div className="relative">
                      <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foam/30" />
                      <input
                        type="text"
                        value={videoInputText}
                        onChange={(e) => setVideoInputText(e.target.value)}
                        placeholder="Örn: https://youtube.com/watch?v=..."
                        className="w-full bg-ink-900 border border-white/10 rounded-[1.25rem] pl-11 pr-4 py-3 text-sm text-foam focus:border-brass/50 focus:ring-1 focus:ring-brass/30 transition-all outline-none shadow-inner placeholder:text-foam/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplyVideoUrl()}
                        className="flex-1 bg-ink-900 hover:bg-ink-800 border border-white/10 text-foam text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Bağlantıyı Uygula
                      </button>
                      <button
                        onClick={() => videoFileInputRef.current?.click()}
                        className="flex-1 bg-ink-900 hover:bg-ink-800 border border-white/10 text-foam text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Bilgisayardan Yükle
                      </button>
                    </div>
                    <input type="file" ref={videoFileInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
                  </div>

                  <div className="w-full md:w-64 aspect-video rounded-2xl overflow-hidden bg-ink-900 border border-white/10 relative group">
                    {settings.videoUrl ? (
                      <video src={settings.videoUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foam/20">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-ink-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-foam uppercase tracking-widest bg-ink-950/80 px-3 py-1.5 rounded-full border border-white/10">
                        Önizleme
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-ink-900/50 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-foam/40 font-bold uppercase pl-2">Ses:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => triggerUpdate({ ...settings, videoMuted: false })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          !settings.videoMuted ? 'bg-emerald-500 text-ink-950' : 'text-foam/40 hover:text-foam'
                        }`}
                      >
                        AÇIK
                      </button>
                      <button
                        onClick={() => triggerUpdate({ ...settings, videoMuted: true })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          settings.videoMuted ? 'bg-amber-500 text-ink-950' : 'text-foam/40 hover:text-foam'
                        }`}
                      >
                        SESSİZ
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handlePublishVideo}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-[1.25rem] bg-emerald-500 hover:bg-emerald-400 text-ink-950 font-black text-sm uppercase tracking-wider shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    VIP Videoyu Yayına Al
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Fleet Editor */}
      <section className="space-y-6">
        <div className="sticky top-[116px] sm:top-[128px] z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-ink-900/95 to-ink-950/95 border border-brass/30 backdrop-blur-xl shadow-2xl transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-brass/10 text-brass">
                <Car className="w-5 h-5 text-brass" />
              </span>
              <h3 className="font-serif text-2xl text-foam font-bold">VIP Araç Filosu & Görsel Sıralaması</h3>
            </div>
            <p className="text-xs text-foam/60 max-w-xl">
              Filodaki araçları, donanımlarını ve müşterilerinizin göreceği ilk resmi belirleyin. Fotoğrafları <span className="text-brass font-bold">"Başa Koy"</span> butonuna basarak veya <span className="text-brass font-bold">sürükleyip bırakarak</span> ilk sıraya taşıyabilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              type="button"
              onClick={handleSaveAllFleet} 
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-ink-950 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Tüm Filoyu Kaydet</span>
            </button>

            <button 
              type="button"
              onClick={handleAddYacht} 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brass to-brass-light hover:brightness-110 text-ink-950 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brass/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Yeni VIP Araç Ekle</span>
            </button>
          </div>
        </div>

        {saveFleetMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center gap-3 animate-in fade-in duration-300">
            <Check className="w-5 h-5 text-emerald-400 stroke-[3] shrink-0" />
            <span>{saveFleetMessage}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.fleet.map((yacht, yIndex) => (
            <div 
              key={yacht.id} 
              id={yacht.id}
              className={`bg-ink-800/50 border rounded-3xl overflow-hidden p-6 space-y-5 shadow-2xl transition-all duration-300 ${
                newlyAddedYachtId === yacht.id 
                  ? 'border-brass ring-4 ring-brass/40 shadow-[0_0_35px_rgba(201,161,90,0.4)]' 
                  : 'border-white/10 hover:border-brass/30'
              }`}
            >
              {/* Header: Title & Card Ordering */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brass/20 text-brass text-xs font-bold flex items-center justify-center">
                    {yIndex + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foam/80">
                    VIP Araç
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveYacht(yIndex, 'up')}
                    disabled={yIndex === 0}
                    className="p-1 rounded-lg text-foam/40 hover:text-foam hover:bg-white/5 disabled:opacity-20 transition-all cursor-pointer"
                    title="Aracı Yukarı Taşı"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveYacht(yIndex, 'down')}
                    disabled={yIndex === settings.fleet.length - 1}
                    className="p-1 rounded-lg text-foam/40 hover:text-foam hover:bg-white/5 disabled:opacity-20 transition-all cursor-pointer"
                    title="Aracı Aşağı Taşı"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteYacht(yacht.id)} 
                    className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-all ml-1 cursor-pointer"
                    title="Aracı Filodan Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Araç Resimleri Galerisi & Kapak Görseli Seçici */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brass uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-brass fill-brass" />
                    <span>Görsel Sıralaması ({yacht.images.length})</span>
                  </span>
                  <span className="text-[10px] text-foam/50">1. resim kapak fotoğrafıdır</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {yacht.images.map((img, i) => {
                    const isCover = i === 0;
                    return (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={() => setDraggedFleetImage({ yachtId: yacht.id, index: i })}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropFleetImage(yacht.id, i)}
                        className={`relative group aspect-[4/3] rounded-2xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                          isCover 
                            ? 'border-brass ring-2 ring-brass/50 shadow-[0_0_15px_rgba(201,161,90,0.3)]' 
                            : 'border-white/10 hover:border-brass/40'
                        } bg-ink-950`}
                      >
                        <img 
                          src={img} 
                          alt={`${yacht.name} ${i + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />

                        {/* Top Indicator Badge */}
                        <div className="absolute top-1.5 left-1.5 z-10">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded-md bg-brass text-ink-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Kapak (İlk)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-ink-950/80 backdrop-blur-md text-foam/80 text-[9px] font-bold border border-white/10">
                              #{i + 1}
                            </span>
                          )}
                        </div>

                        {/* Drag Handle Indicator */}
                        <div className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-80 transition-opacity bg-ink-950/70 p-0.5 rounded text-foam">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Action Menu (3 dots) */}
                        <div className="absolute top-2 right-2 z-20 group/menu">
                          <button className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute top-full right-0 mt-1 w-40 bg-ink-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-40 overflow-hidden">
                            {!isCover && (
                              <button
                                onClick={() => handleSetFleetCoverImage(yacht.id, i)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-brass hover:bg-white/5 transition-colors text-left"
                              >
                                <Star className="w-3 h-3" />
                                <span>Kapak Yap (Başa Koy)</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleMoveFleetImage(yacht.id, i, 'prev')}
                              disabled={i === 0}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-foam/70 hover:bg-white/5 transition-colors text-left disabled:opacity-20"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span>Öne Taşı</span>
                            </button>
                            <button
                              onClick={() => handleMoveFleetImage(yacht.id, i, 'next')}
                              disabled={i === yacht.images.length - 1}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-foam/70 hover:bg-white/5 transition-colors text-left disabled:opacity-20"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>Arkaya Taşı</span>
                            </button>
                            <button
                              onClick={() => deleteFleetImage(yacht.id, i)}
                              disabled={yacht.images.length <= 1}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors text-left disabled:opacity-20"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Görseli Sil</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Upload & Media Library Triggers */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openMediaPicker('fleet', yacht.id)}
                      className="flex-1 rounded-2xl border-2 border-dashed border-white/15 hover:border-brass/40 flex flex-col items-center justify-center text-foam/40 hover:text-brass transition-all bg-ink-950/40 group p-2 cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-tight text-center">Kütüphaneden</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => openMediaPicker('fleet', yacht.id)}
                      className="flex-1 rounded-2xl border-2 border-dashed border-brass/30 hover:border-brass flex flex-col items-center justify-center text-foam/40 hover:text-brass transition-all bg-brass/5 hover:bg-brass/10 group text-center p-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform text-brass" />
                      <span className="text-[10px] font-bold uppercase tracking-tight text-brass">Şimdi Resim Yükle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications & Description Inputs */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                    Araç Modeli / Adı
                  </label>
                  <div className="flex items-center gap-2 bg-[#0b1e2d] rounded-xl px-3 py-2 border border-white/20 focus-within:border-[#d4af63]">
                    <Car className="w-4 h-4 text-[#d4af63] shrink-0" />
                    <input
                      className="bg-transparent border-none text-white font-serif text-sm w-full focus:ring-0 p-0 font-bold placeholder:text-white/40"
                      value={yacht.name}
                      placeholder="Örn: Mercedes-Benz Maybach Executive"
                      onChange={(e) => triggerUpdate({ ...settings, fleet: settings.fleet.map(y => y.id === yacht.id ? { ...y, name: e.target.value } : y) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                    Kapasite ve Özellikler
                  </label>
                  <input
                    className="bg-[#0b1e2d] rounded-xl px-3 py-2.5 border border-white/20 focus:border-[#d4af63] text-[#d4af63] text-xs w-full focus:outline-none font-medium placeholder:text-white/40"
                    value={yacht.specs}
                    placeholder="Örn: 4 Kişi • Starlight Tavan • Apple TV"
                    onChange={(e) => triggerUpdate({ ...settings, fleet: settings.fleet.map(y => y.id === yacht.id ? { ...y, specs: e.target.value } : y) })}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                    Araç Açıklaması
                  </label>
                  <textarea
                    rows={3}
                    className="bg-[#0b1e2d] rounded-xl px-3 py-2.5 border border-white/20 focus:border-[#d4af63] text-white text-xs w-full focus:outline-none leading-relaxed resize-none placeholder:text-white/40"
                    value={yacht.description || ''}
                    placeholder="Araç konfor ve transfer detayları..."
                    onChange={(e) => triggerUpdate({ ...settings, fleet: settings.fleet.map(y => y.id === yacht.id ? { ...y, description: e.target.value } : y) })}
                  />
                </div>

                {/* ARAÇ DÜZENLEME SONRASI KAYDET BUTONU */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveVehicle(yacht.id)}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                      savedVehicleId === yacht.id
                        ? 'bg-emerald-500 text-ink-950 ring-2 ring-emerald-400 shadow-emerald-500/30 scale-[1.02]'
                        : 'bg-gradient-to-r from-brass via-[#E5C98F] to-brass hover:brightness-110 active:scale-95 text-ink-950 shadow-brass/25'
                    }`}
                  >
                    {savedVehicleId === yacht.id ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>✓ Araç Başarıyla Kaydedildi!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Değişiklikleri Kaydet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <input 
          type="file" 
          ref={fleetFileInputRef} 
          multiple
          onChange={handleFleetImageUpload} 
          className="hidden" 
          accept="image/*" 
        />
      </section>

      {/* Bodrum VIP Transfer Deneyimi Editor */}
      <section className="bg-gradient-to-br from-ink-900 to-ink-950 border border-brass/25 rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-brass/10 rounded-full blur-3xl pointer-events-none" />

        {saveExperienceMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between text-sm shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="font-semibold">{saveExperienceMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveExperienceMessage(null)}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="sticky top-[180px] sm:top-[190px] z-30 bg-ink-900/95 backdrop-blur-xl p-6 rounded-3xl border border-brass/30 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/15 border border-brass/30 text-brass text-[10px] font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              Deneyim & Hizmetler
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-foam font-bold leading-tight">
              VIP Transfer Hizmetleri <span className="text-brass">Yönetimi</span>
            </h3>
            <p className="text-sm text-foam/70 max-w-2xl leading-relaxed">
              Havalimanı VIP Karşılama, Şehir içi & şehir dışı Transfer ve Şoförlü Saatlik Tahsis gibi hizmet kartlarını buradan yönetebilir; tek tuşla ana sayfada gösterip gizleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddExperienceCard}
              className="px-4 py-2.5 rounded-xl border border-brass/40 hover:border-brass bg-brass/10 hover:bg-brass/20 text-brass text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Hizmet Kartı Ekle</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAllExperience}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brass to-amber-500 hover:from-amber-400 hover:to-amber-500 text-ink-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Tüm Deneyimleri Kaydet</span>
            </button>
          </div>
        </div>

        {/* Master Görünürlük Kontrolü (Sitede Göster / Gizle) */}
        <div className={`p-5 rounded-2xl border transition-all ${
          settings.showExperience === true
            ? 'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-950/30'
            : 'bg-amber-950/30 border-amber-500/40 shadow-amber-950/30'
        } shadow-xl backdrop-blur-md`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`p-3 rounded-xl shrink-0 ${
                settings.showExperience === true
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
              }`}>
                {settings.showExperience === true ? (
                  <Eye className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <EyeOff className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white font-bold text-sm sm:text-base">
                    Hizmetler Bölümü Sitede Görünürlüğü
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    settings.showExperience === true
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  }`}>
                    {settings.showExperience === true ? '● Sitede Yayında (Gösteriliyor)' : '○ Sitede Gizli (Kaldırıldı)'}
                  </span>
                </div>
                <p className="text-xs text-foam/70 mt-1">
                  {settings.showExperience === true
                    ? 'Havalimanı VIP Karşılama, Şehir İçi/Dışı Transfer ve Şoförlü Tahsis kartları web sitesinde ziyaretçilere gösteriliyor.'
                    : 'Bu hizmet kartları web sitesinden kaldırıldı (gizlendi). Aşağıdaki butondan dilediğiniz an tek tıkla tekrar yayına alabilirsiniz.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {settings.showExperience === true ? (
                <button
                  type="button"
                  onClick={() => handleToggleExperienceVisibility(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <EyeOff className="w-4 h-4 text-red-400" />
                  <span>Sitede Gizle (Kaldır)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleExperienceVisibility(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Sitede Göster (Yayına Al)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bölüm Başlıkları Yönetimi */}
        <div className="p-5 rounded-2xl bg-ink-950/70 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold text-brass uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-brass" />
              <span>Bölüm Genel Başlık ve Açıklaması</span>
            </h4>
            <button
              type="button"
              onClick={handleSaveExperienceSectionTexts}
              className="px-3 py-1.5 rounded-lg bg-brass/20 hover:bg-brass/30 text-brass border border-brass/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Başlıkları Kaydet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                Bölüm Üst Rozeti
              </label>
              <input
                type="text"
                value={experienceBadgeInput}
                onChange={(e) => setExperienceBadgeInput(e.target.value)}
                placeholder="Örn: EXECUTIVE SERVICES"
                className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/10 text-foam text-xs font-medium focus:outline-none focus:border-brass/60"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                Bölüm Ana Başlığı
              </label>
              <input
                type="text"
                value={experienceTitleInput}
                onChange={(e) => setExperienceTitleInput(e.target.value)}
                placeholder="Örn: Bodrum VIP Transfer Deneyimi"
                className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/10 text-foam text-xs font-medium focus:outline-none focus:border-brass/60"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                Bölüm Açıklama Paragrafı
              </label>
              <textarea
                rows={2}
                value={experienceDescInput}
                onChange={(e) => setExperienceDescInput(e.target.value)}
                placeholder="Bölüm açıklama metni..."
                className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/10 text-foam text-xs focus:outline-none focus:border-brass/60 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Hizmet / Araç Kartları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {settings.experience.map((exp, index) => (
            <div
              key={exp.id || index}
              className={`bg-gradient-to-b from-[#0a1926] to-[#06111a] border rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-5 relative group/card transition-colors ${
                exp.hidden ? 'border-amber-500/30 opacity-80' : 'border-white/10 hover:border-brass/40'
              }`}
            >
              {/* Card Top Action Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brass/20 text-brass text-xs font-bold flex items-center justify-center border border-brass/30">
                    {index + 1}
                  </span>
                  <span className="font-serif text-white font-bold text-sm truncate max-w-[170px]">
                    {exp.title || 'İsimsiz Deneyim'}
                  </span>
                  {exp.hidden && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                      Gizli
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Tekil Kart Gizle / Göster Butonu */}
                  <button
                    type="button"
                    onClick={() => handleToggleCardVisibility(exp.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      exp.hidden
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                    }`}
                    title={exp.hidden ? 'Bu kartı sitede göster' : 'Bu kartı sitede gizle'}
                  >
                    {exp.hidden ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px]">Gizli (Aç)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px]">Göster</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveExperienceItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Yukarı Taşı"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveExperienceItem(index, 'down')}
                    disabled={index === settings.experience.length - 1}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Aşağı Taşı"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperienceCard(exp.id)}
                    disabled={settings.experience.length <= 1}
                    className="p-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 disabled:opacity-20 ml-1 cursor-pointer transition-colors"
                    title="Bu Kartı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photos / Vehicle Images Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-brass tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brass" />
                    <span>Araç / Deneyim Görselleri</span>
                  </label>
                  <span className="text-[10px] text-foam/50">
                    {(exp.images || []).length} Görsel
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {(exp.images || []).map((imgUrl, i) => (
                    <div
                      key={i}
                      className="group/img relative aspect-video rounded-xl overflow-hidden bg-ink-950 border border-white/15 hover:border-brass/60 transition-all shadow-md"
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      
                      {i === 0 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brass text-ink-950 font-black text-[8px] uppercase shadow">
                          Kapak
                        </div>
                      )}

                      {/* Action Menu (3 dots) */}
                      <div className="absolute top-1.5 right-1.5 z-20 group/menu">
                        <button className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-3 h-3" />
                        </button>
                        <div className="absolute top-full right-0 mt-1 w-32 bg-ink-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-40 overflow-hidden">
                          {i !== 0 && (
                            <button
                              onClick={() => handleSetExperienceCoverImage(exp.id, i)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-[9px] text-brass hover:bg-white/5 transition-colors text-left"
                            >
                              <Star className="w-2.5 h-2.5" />
                              <span>Kapak Yap</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleMoveExperienceImage(exp.id, i, 'prev')}
                            disabled={i === 0}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-[9px] text-foam/70 hover:bg-white/5 transition-colors text-left disabled:opacity-20"
                          >
                            <ChevronLeft className="w-2.5 h-2.5" />
                            <span>Öne Al</span>
                          </button>
                          <button
                            onClick={() => handleMoveExperienceImage(exp.id, i, 'next')}
                            disabled={i === exp.images.length - 1}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-[9px] text-foam/70 hover:bg-white/5 transition-colors text-left disabled:opacity-20"
                          >
                            <ChevronRight className="w-2.5 h-2.5" />
                            <span>Arkaya Al</span>
                          </button>
                          <button
                            onClick={() => deleteExperienceImage(exp.id, i)}
                            disabled={exp.images.length <= 1}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-[9px] text-red-400 hover:bg-red-500/10 transition-colors text-left disabled:opacity-20"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Görseli Sil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Images Buttons */}
                  <div className="flex flex-col gap-1.5 aspect-video justify-between">
                    <button
                      type="button"
                      onClick={() => openMediaPicker('experience', exp.id)}
                      className="flex-1 rounded-xl border border-dashed border-white/20 hover:border-brass/50 bg-ink-950/60 flex flex-col items-center justify-center text-foam/50 hover:text-brass text-[9px] font-bold transition-all p-1 cursor-pointer"
                      title="Kayıtlı medya kütüphanesinden seç"
                    >
                      <FolderOpen className="w-3 h-3 mb-0.5 text-brass" />
                      <span>Kütüphane</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openMediaPicker('experience', exp.id)}
                      className="flex-1 rounded-xl border border-dashed border-brass/30 hover:border-brass bg-brass/10 hover:bg-brass/20 flex flex-col items-center justify-center text-brass text-[9px] font-bold transition-all p-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 mb-0.5" />
                      <span>Şimdi Resim Yükle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Inputs */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                {/* Title and Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                      Başlık (Hizmet Adı)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/15 focus:border-[#d4af63] text-white text-xs font-bold focus:outline-none"
                      value={exp.title}
                      placeholder="Örn: Havalimanı VIP Karşılama"
                      onChange={(e) =>
                        triggerUpdate({
                          ...settings,
                          experience: settings.experience.map((item) =>
                            item.id === exp.id ? { ...item, title: e.target.value } : item
                          ),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-brass tracking-wider block mb-1">
                      Üst Rozet (Badge)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/15 focus:border-[#d4af63] text-[#d4af63] text-xs font-semibold focus:outline-none"
                      value={exp.badge || 'VIP STANDART'}
                      placeholder="Örn: VIP STANDART"
                      onChange={(e) =>
                        triggerUpdate({
                          ...settings,
                          experience: settings.experience.map((item) =>
                            item.id === exp.id ? { ...item, badge: e.target.value } : item
                          ),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                    Açıklama Metni
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-white/15 focus:border-[#d4af63] text-white/80 text-xs focus:outline-none leading-relaxed resize-none"
                    value={exp.description || ''}
                    placeholder="Milas-Bodrum Havalimanı kapısında karşılama ve transfer detayları..."
                    onChange={(e) =>
                      triggerUpdate({
                        ...settings,
                        experience: settings.experience.map((item) =>
                          item.id === exp.id ? { ...item, description: e.target.value } : item
                        ),
                      })
                    }
                  />
                </div>

                {/* Bottom Row: Feature & Button text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                      Alt Özellik Notu
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-xl bg-ink-900 border border-white/15 focus:border-[#d4af63] text-[#d4af63] text-xs focus:outline-none"
                      value={exp.feature || '7/24 Kesintisiz Hizmet'}
                      placeholder="Örn: 7/24 Kesintisiz Hizmet"
                      onChange={(e) =>
                        triggerUpdate({
                          ...settings,
                          experience: settings.experience.map((item) =>
                            item.id === exp.id ? { ...item, feature: e.target.value } : item
                          ),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-foam/60 tracking-wider block mb-1">
                      Buton Metni
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-xl bg-ink-900 border border-white/15 focus:border-[#d4af63] text-white text-xs focus:outline-none"
                      value={exp.buttonText || 'Rezervasyon Yap →'}
                      placeholder="Örn: Rezervasyon Yap →"
                      onChange={(e) =>
                        triggerUpdate({
                          ...settings,
                          experience: settings.experience.map((item) =>
                            item.id === exp.id ? { ...item, buttonText: e.target.value } : item
                          ),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Save Single Card Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveExperienceCard(exp.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                      savedExperienceId === exp.id
                        ? 'bg-emerald-500 text-ink-950 ring-2 ring-emerald-400 shadow-emerald-500/30'
                        : 'bg-brass hover:bg-brass-light text-ink-950 active:scale-98'
                    }`}
                  >
                    {savedExperienceId === exp.id ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>✓ Kart Başarıyla Kaydedildi!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Bu Kartı Kaydet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hidden File Input for Experience Upload */}
        <input
          type="file"
          ref={experienceFileInputRef}
          multiple
          onChange={handleExperienceImageUpload}
          className="hidden"
          accept="image/*"
        />
      </section>

      {/* Görsel Kütüphanesi Seçim Modalı */}
      {showMediaPickerModal && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-brass/30 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-lg text-foam font-bold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-brass" />
                  <span>
                    Kütüphaneden {mediaPickerMode === 'hero' ? 'Slayt' : mediaPickerMode === 'experience' ? 'Deneyim / Araç' : 'Filo Araç'} Görseli Seç
                  </span>
                </h4>
                <p className="text-xs text-foam/60 mt-0.5">
                  Görsellere tıklayarak ekleyin veya çıkarın. Birden fazla seçim yapabilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brass/20 hover:bg-brass/30 text-brass border border-brass/30 text-xs font-bold transition-all cursor-pointer"
                  title="Cihaz galerisinden birden fazla görsel seçip yükleyin"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cihazdan Çoklu Yükle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaPickerModal(false)}
                  className="p-2 rounded-xl text-foam/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hidden multi-file input for modal */}
            <input
              type="file"
              ref={modalFileInputRef}
              multiple
              onChange={handleModalFileUpload}
              className="hidden"
              accept="image/*"
            />

            <div className="px-4 pt-3 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-foam/50">
                Seçmek için görsele tıklayın veya cihazınızdan toplu yükleyin.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllMedia}
                  className="text-[11px] font-semibold text-brass hover:underline cursor-pointer"
                >
                  Tüm Kütüphaneyi Ekle
                </button>
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="sm:hidden text-[11px] font-semibold text-teal-400 hover:underline cursor-pointer"
                >
                  + Çoklu Yükle
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {loadingMedia ? (
                <div className="py-12 flex flex-col items-center justify-center text-foam/50 text-sm">
                  <Loader2 className="w-8 h-8 text-brass animate-spin mb-2" />
                  <span>Görseller taranıyor...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Upload Card */}
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="group relative aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-brass/70 bg-ink-950/40 hover:bg-ink-950 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer"
                  >
                    <Plus className="w-6 h-6 text-brass mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-foam">Cihazdan Çoklu Yükle</span>
                    <span className="text-[10px] text-foam/40 mt-0.5">Galeriden birden fazla seç</span>
                  </button>

                  {availableMedia.map((item) => {
                    const isSelected = mediaPickerMode === 'hero' 
                      ? settings.heroSlides.includes(item.url)
                      : mediaPickerMode === 'experience'
                        ? settings.experience.find(e => e.id === activeExperienceForUpload)?.images.includes(item.url)
                        : settings.fleet.find(y => y.id === activeFleetForUpload)?.images.includes(item.url);
                    return (
                      <button
                        type="button"
                        key={item.id || item.url}
                        onClick={() => handleSelectMediaForSlides(item.url)}
                        className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-md'
                            : 'border-white/10 hover:border-brass/50'
                        }`}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent flex flex-col justify-end p-2">
                          <span className="text-[11px] font-medium text-foam truncate">{item.name}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-ink-950 shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-ink-950/60">
              <span className="text-xs text-foam/60">
                Seçili: <strong className="text-brass">
                  {mediaPickerMode === 'hero' 
                    ? `${settings.heroSlides.length} slayt` 
                    : `${settings.fleet.find(y => y.id === activeFleetForUpload)?.images.length || 0} araç`} görseli
                </strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handlePublishSlideshow();
                    setShowMediaPickerModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-brass text-ink-950 text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg"
                >
                  {mediaPickerMode === 'hero' ? 'Slaytı Yayına Al ve Kapat' : 'Değişiklikleri Uygula ve Kapat'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaPickerModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-foam text-xs font-semibold transition-all cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
