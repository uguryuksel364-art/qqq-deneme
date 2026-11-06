import React, { useState, useEffect } from 'react';
import { CarFront, ShieldCheck, Sparkles } from 'lucide-react';
import { getPageSettings, type ExperienceItem } from '@/lib/pageSettings';
import { ImageCarousel } from './ImageCarousel';
import { useLanguage } from '@/lib/translations';

const DEFAULT_SERVICES: ExperienceItem[] = [
  {
    id: 'exp-1',
    title: 'Havalimanı VIP Karşılama',
    description: 'Milas-Bodrum (BJV) Havalimanı kapısında isminizle karşılama, uçuş rötar takibi ve bagaj asistanlığı.',
    badge: 'VIP STANDART',
    images: [],
    hidden: false,
  },
  {
    id: 'exp-2',
    title: 'Şehir İçi & Şehir Dışı Transfer',
    description: 'Yalıkavak Marina, Türkbükü, Göltürkbükü ve tüm lüks koylara 7/24 konforlu doğrudan VIP ulaşım.',
    badge: 'VIP STANDART',
    images: [],
    hidden: false,
  },
  {
    id: 'exp-3',
    title: 'Şoförlü Saatlik Tahsis',
    description: 'Takım elbiseli, protokol eğitimli profesyonel şoförlerimizle saatlik veya günlük özel VIP tahsis.',
    badge: 'VIP STANDART',
    images: [],
    hidden: false,
  },
];

export default function Experience() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(() => getPageSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getPageSettings());
    };
    window.addEventListener('pageSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', handleSettingsUpdate);
  }, []);

  // If the admin has hidden the section, do not display it on the website
  if (settings.showExperience === false) {
    return null;
  }

  // Use admin settings if configured, otherwise fall back to clean executive cards
  const allServices = settings.experience && settings.experience.length > 0
    ? settings.experience
    : DEFAULT_SERVICES;

  // Filter out any individually hidden items
  const services = allServices.filter((item) => !item.hidden);

  if (services.length === 0) {
    return null;
  }

  return (
    <section id="deneyim" className="relative bg-[#07131F] py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs uppercase tracking-[4px] text-[#d4af63] font-semibold mb-2">
            {settings.experienceBadge || t.executiveServicesBadge || 'EXECUTIVE SERVICES'}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-white">
            {settings.experienceTitle || t.experienceTitle || 'Bodrum VIP Transfer Deneyimi'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            {settings.experienceDesc || t.experienceDesc || "Bodrum'da havalimanı transferi, özel şoförlü VIP ulaşım ve kişiye özel lüks yolculuk hizmetleri."}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, index) => {
            const hasImages = item.images && item.images.length > 0 && Boolean(item.images[0]);
            return (
              <div
                key={item.id || index}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#081724] p-6 hover:border-[#d4af63]/50 hover:bg-[#0c2033] transition-all duration-300 shadow-xl"
              >
                <div>
                  {hasImages && (
                    <div className="relative mb-5 h-44 w-full overflow-hidden rounded-xl bg-ink-950">
                      <ImageCarousel
                        images={item.images}
                        alt={`${item.title} - Bodrum VIP Transfer`}
                        className="h-full w-full"
                        aspectRatioClassName="h-full w-full"
                        hideCounter={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081724] via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af63]/10 text-[#d4af63] border border-[#d4af63]/25 group-hover:scale-110 group-hover:bg-[#d4af63] group-hover:text-[#0b1e2d] transition-all">
                      <CarFront className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#d4af63] font-semibold bg-[#d4af63]/10 border border-[#d4af63]/20 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-[#d4af63]" />
                      {item.badge || t.vipStandard || 'VIP STANDART'}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#d4af63] transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-white/65 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1.5 text-[#d4af63]/80">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af63]" />
                    {item.feature || t.service247 || '7/24 Kesintisiz Hizmet'}
                  </span>
                  <a
                    href="#rezervasyon-motoru"
                    className="text-[#d4af63] hover:text-[#e5c47e] font-semibold hover:underline cursor-pointer"
                  >
                    {item.buttonText || t.bookNowBtn || 'Rezervasyon Yap →'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* TÜRSAB & Güvence Banner */}
        <div className="mt-12 rounded-2xl border border-[#d4af63]/30 bg-[#0b1e2d]/80 p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4af63]/15 text-[#d4af63] shrink-0 border border-[#d4af63]/30">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h4 className="font-serif text-base sm:text-lg text-white font-bold">
                {t.officialLicenseBadge || 'TÜRSAB 6550 & D2 Yetki Belgeli Resmi VIP Taşımacılık'}
              </h4>
              <p className="text-xs text-white/60 mt-0.5">
                {t.officialLicenseDesc || 'Tüm transferlerimiz ferdi kaza koltuk sigortalı, yetki belgeli ve yasal güvencelidir.'}
              </p>
            </div>
          </div>
          <a
            href="#rezervasyon-motoru"
            className="shrink-0 px-6 py-2.5 rounded-full bg-[#d4af63] hover:bg-[#e0be75] text-[#0b1e2d] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            {t.calcPriceBtn || 'Fiyat Hesapla'}
          </a>
        </div>

      </div>
    </section>
  );
}
