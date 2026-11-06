import { useState, useEffect, useRef } from 'react';
import { Phone, CalendarCheck } from 'lucide-react';
import { CONTACT, telLink } from '@/lib/contact';
import ReservationForm from './ReservationForm';
import { getPageSettings, sanitizeVideoUrl, DEFAULT_VIDEO_URL } from '@/lib/pageSettings';
import { ImageCarousel } from './ImageCarousel';
import { useLanguage } from '@/lib/translations';

export default function Hero() {
  const { t, lang } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [settings, setSettings] = useState(() => getPageSettings());
  const videoRef = useRef<HTMLVideoElement>(null);

  const isTr = lang === 'tr';

  // For non-Turkish languages, ALWAYS use the active language translations so they translate seamlessly.
  // For Turkish, allow custom admin overrides if provided, or default to translations.tr.
  const displayBadge = !isTr
    ? t.heroBadge || 'YALIKAVAK MARINA & BJV, BODRUM'
    : (settings.heroBadge || t.heroBadge || 'YALIKAVAK MARİNA & BJV, BODRUM');

  const displayTitle1 = !isTr
    ? t.liveTheBlue
    : (settings.heroTitleLine1 || t.liveTheBlue);

  const displayTitle2 = !isTr
    ? t.journey
    : (settings.heroTitleLine2 || t.journey);

  const displayTitle3 = !isTr
    ? t.passion
    : (settings.heroTitleLine3 || t.passion);

  const displayDescription = !isTr
    ? t.heroDesc
    : (settings.heroDescription || t.heroDesc);

  const displayButtonText = !isTr
    ? t.onlineReservation
    : (settings.heroButtonText || t.onlineReservation);

  // 1. Listen for local settings update event
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getPageSettings());
    };
    window.addEventListener('pageSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', handleSettingsUpdate);
  }, []);

  // 2. Direct sync of currently active video from server across all browsers
  useEffect(() => {
    let isMounted = true;
    const fetchActiveServerVideo = async () => {
      try {
        const res = await fetch('/api/videos/active');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.url && isMounted) {
            setSettings((prev) => {
              if (prev.videoUrl === json.data.url) return prev;
              return {
                ...prev,
                videoUrl: json.data.url,
                videoTitle: json.data.title || prev.videoTitle,
                videoFormat: json.data.format || prev.videoFormat,
                // Preserve user-selected heroBackgroundMode ('image' or 'video')
              };
            });
          }
        }
      } catch {
        // ignore
      }
    };

    fetchActiveServerVideo();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Audio & Autoplay management: Respects settings.videoMuted
  useEffect(() => {
    const video = videoRef.current;
    if (!video || settings.heroBackgroundMode === 'image') return;

    const isSoundEnabled = settings.videoMuted === false;

    if (!isSoundEnabled) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      // Try unmuted first, then fallback to muted if blocked
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [settings.videoUrl, settings.heroBackgroundMode, settings.videoMuted]);

  const isVideoMode = settings.heroBackgroundMode === 'image' ? false : true;
  const activeVideoUrl = sanitizeVideoUrl(settings.videoUrl) || DEFAULT_VIDEO_URL;
  const showVideo = Boolean(isVideoMode && activeVideoUrl);

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* Full-screen Background: Fullscreen HTML5 Video (Default) OR Image Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-ink-950">
        {showVideo ? (
          <video
            ref={videoRef}
            src={activeVideoUrl}
            autoPlay
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover z-0"
            onError={() => {
              if (videoRef.current) {
                videoRef.current.src = DEFAULT_VIDEO_URL;
                videoRef.current.play().catch(() => {});
              }
            }}
          >
            <source src={activeVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <ImageCarousel
            images={settings.heroSlides}
            alt="Bodrum Luxury Transfer - Milas Bodrum Havalimanı VIP Lüks Transfer"
            className="h-full w-full z-0"
            aspectRatioClassName="h-full w-full"
            autoPlayInterval={6000}
            hideArrows={true}
            hideCounter={true}
          />
        )}

        {/* Cinematic Luxury Dark Overlays: Ensures optimal contrast and pristine text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/60 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/45 to-transparent pointer-events-none z-10" />
      </div>

      {/* Main Hero Foreground Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pt-28 pb-20 sm:px-8">
        <div className="max-w-3xl animate-fadeUp">
          {/* Premium badge */}
          <div className="mb-5 inline-block rounded-full border border-[#d4af63]/50 bg-ink-950/60 px-4 py-2 text-xs tracking-[3px] text-[#e5c47e] backdrop-blur-md">
            {displayBadge}
          </div>

          {/* Heading */}
          <h1 className="max-w-2xl font-serif text-5xl leading-tight sm:text-7xl text-white tracking-tight">
            {displayTitle1}
            <span className="block text-[#d4af63]">
              {displayTitle2}
            </span>
            {displayTitle3}
          </h1>

          {/* Subtitle / Description */}
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            {displayDescription}
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
            <a
              href="#rezervasyon-motoru"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#4da8a8] hover:bg-[#63bbbb] px-7 py-4 text-sm font-semibold text-[#071c2b] transition-all hover:shadow-[0_0_24px_-4px_rgba(77,168,168,0.5)] active:scale-95"
            >
              <CalendarCheck className="h-5 w-5" />
              <span>{displayButtonText}</span>
            </a>

            <a
              href={telLink}
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-foam/20 bg-ink-900/40 px-6 py-4 text-sm font-light text-foam backdrop-blur-sm transition-colors hover:border-foam/50 hover:bg-foam/10 active:scale-95"
            >
              <Phone className="h-4 w-4 text-[#d4af63]" strokeWidth={1.5} />
              <span>{CONTACT.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>


      {/* Bounce scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-foam/20 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-foam/60" />
        </div>
      </div>

      <ReservationForm open={formOpen} onClose={() => setFormOpen(false)} />
    </section>
  );
}
