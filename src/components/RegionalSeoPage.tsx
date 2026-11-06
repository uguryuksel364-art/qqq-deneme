import React, { useEffect } from 'react';
import {
  MapPin,
  Clock,
  Navigation,
  Phone,
  MessageCircle,
  CalendarCheck,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { RegionalSeoInfo, REGIONAL_SEO_PAGES } from '@/lib/seoData';
import { CONTACT, telLink, waLink } from '@/lib/contact';
import { useLanguage } from '@/lib/translations';

interface RegionalSeoPageProps {
  region: RegionalSeoInfo;
  onBackToHome: () => void;
  onSelectRegion: (slug: string) => void;
}

export const RegionalSeoPage: React.FC<RegionalSeoPageProps> = ({
  region,
  onBackToHome,
  onSelectRegion,
}) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const name = isEn ? region.nameEn : region.nameTr;
  const h1 = isEn ? region.h1En : region.h1Tr;
  const title = isEn ? region.titleEn : region.titleTr;
  const metaDesc = isEn ? region.metaDescEn : region.metaDescTr;
  const description = isEn ? region.descriptionEn : region.descriptionTr;
  const highlights = isEn ? region.highlightsEn : region.highlightsTr;
  const popularHotels = isEn ? region.popularHotelsEn : region.popularHotelsTr;

  // Dynamic SEO Update on Mount & Region Change
  useEffect(() => {
    document.title = title;

    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', metaDesc);

    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) ogTitleTag.setAttribute('content', title);

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) ogDescTag.setAttribute('content', metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://bodrumluxurytransfer.com.tr/bolgeler/${region.slug}`);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      // Revert to main title on unmount
      document.title = isEn
        ? 'Bodrum Luxury Transfer | Bodrum VIP & Airport Transfer'
        : 'Bodrum Luxury Transfer | Bodrum VIP & Airport Transfer';
      if (canonical) {
        canonical.setAttribute('href', 'https://bodrumluxurytransfer.com.tr/');
      }
    };
  }, [title, metaDesc, region.slug, isEn]);

  const waPrefilled = isEn
    ? `Hello, I would like to book a VIP transfer for ${name}. Could you please provide details?`
    : `Merhaba, ${name} VIP transfer hizmeti için bilgi ve rezervasyon almak istiyorum.`;

  const otherRegions = REGIONAL_SEO_PAGES.filter((p) => p.slug !== region.slug);

  return (
    <article className="min-h-screen bg-ink text-foam pt-28 pb-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-foam/60 flex-wrap">
          <button
            type="button"
            onClick={onBackToHome}
            className="hover:text-brass transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Home' : 'Ana Sayfa'}</span>
          </button>
          <span>/</span>
          <span className="text-foam/40">{isEn ? 'Destinations' : 'Transfer Bölgeleri'}</span>
          <span>/</span>
          <span className="text-brass font-medium">{name}</span>
        </nav>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-foam/10 bg-ink-950 p-6 sm:p-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />

          {/* Background image overlay */}
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src={region.image}
              alt={region.imageAlt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-ink-900/80 px-3.5 py-1.5 text-xs text-brass mb-4 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{name} VIP Transfer Hizmeti</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-5">
              {h1}
            </h1>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-foam/80 mb-6 border-y border-foam/10 py-3.5">
              <span className="inline-flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-teal-400" />
                <strong>{isEn ? 'BJV Distance:' : 'BJV Havalimanı Mesafe:'}</strong> {region.distanceKm}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brass" />
                <strong>{isEn ? 'Est. Travel Time:' : 'Tahmini Süre:'}</strong> {region.durationMin}
              </span>
              <span className="inline-flex items-center gap-1.5 text-teal-300">
                <ShieldCheck className="w-4 h-4" />
                <span>{isEn ? '24/7 Dedicated Chauffeur' : '7/24 Özel Şoför & Karşılama'}</span>
              </span>
            </div>

            <p className="text-base sm:text-lg font-light leading-relaxed text-foam/85 mb-8">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={waLink(waPrefilled)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#10A37F] hover:bg-[#0e8a6c] px-7 py-3.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isEn ? 'WhatsApp Reservation' : 'WhatsApp ile Hızlı Rezerve Et'}</span>
              </a>

              <a
                href={telLink}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-brass/50 bg-ink-900/60 hover:bg-brass hover:text-ink-950 px-6 py-3.5 text-sm font-medium text-brass transition-all hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>{CONTACT.phoneDisplay}</span>
              </a>

              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-foam/20 bg-foam/5 hover:bg-foam/10 px-6 py-3.5 text-sm font-light text-foam transition-colors"
              >
                <CalendarCheck className="w-4 h-4 text-teal-400" />
                <span>{isEn ? 'Online Price & Booking' : 'Online Fiyat Hesapla'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights & Hotel Grid */}
        <div className="grid gap-8 md:grid-cols-2 mt-12">
          {/* Highlights */}
          <div className="rounded-3xl border border-foam/10 bg-ink-900/60 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="font-serif text-2xl text-foam mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <span>{isEn ? 'Service Highlights' : 'Bölgesel VIP Hizmet Ayricaliklari'}</span>
            </h2>
            <ul className="space-y-4">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foam/80">
                  <span className="h-2 w-2 rounded-full bg-brass mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Hotels / Locations */}
          <div className="rounded-3xl border border-foam/10 bg-ink-900/60 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="font-serif text-2xl text-foam mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brass" />
              <span>{isEn ? 'Popular Resorts & Destinations' : 'Popüler Oteller & Varış Noktaları'}</span>
            </h2>
            <p className="text-xs text-foam/60 mb-4">
              {isEn
                ? 'Direct VIP door-to-door transfer service to all villas, private residences, and resorts:'
                : 'Bölgedeki tüm villa, site, rezidans ve resort otellere kapıda karşılama ve teslim transferi:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {popularHotels.map((hotel, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-foam/10 bg-ink-950/60 px-3.5 py-2.5 text-xs text-foam/85 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{hotel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Showcase in Region */}
        <div className="mt-12 rounded-3xl border border-foam/10 bg-ink-950/70 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-foam">
                {name} VIP Araç Filosu
              </h2>
              <p className="text-xs text-foam/60 mt-1">
                {isEn
                  ? 'Specially designed luxury Mercedes-Benz Maybach, Vito and Sprinter vehicles'
                  : 'Tüm transferlerinizde özel tasarım Mercedes Maybach, Vito Lounge ve Ultra VIP Sprinter araçlar'}
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs text-teal-400 hover:text-teal-300 underline font-medium"
            >
              {isEn ? 'View All Vehicles' : 'Tüm Filoyu İncele →'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-foam/10 bg-ink-900/50 p-4">
              <img
                src="/images/fleet_maybach_interior.jpg"
                alt="Bodrum Luxury Transfer Mercedes Maybach VIP Araç"
                className="w-full h-36 object-cover rounded-xl mb-3"
                loading="lazy"
              />
              <h3 className="font-serif text-base text-brass">Mercedes-Benz Maybach</h3>
              <p className="text-[11px] text-foam/60 mt-1">4 Yolcu · Hakiki Deri · Masajlı Koltuk</p>
            </div>

            <div className="rounded-2xl border border-foam/10 bg-ink-900/50 p-4">
              <img
                src="/images/fleet_vito_lounge.jpg"
                alt="Bodrum Luxury Transfer Mercedes Vito Lounge VIP"
                className="w-full h-36 object-cover rounded-xl mb-3"
                loading="lazy"
              />
              <h3 className="font-serif text-base text-brass">Mercedes-Benz Vito VIP</h3>
              <p className="text-[11px] text-foam/60 mt-1">6 Yolcu · Starlight Tavan · Apple TV</p>
            </div>

            <div className="rounded-2xl border border-foam/10 bg-ink-900/50 p-4">
              <img
                src="/images/fleet_sprinter_vip.jpg"
                alt="Bodrum Luxury Transfer Mercedes Sprinter Ultra VIP"
                className="w-full h-36 object-cover rounded-xl mb-3"
                loading="lazy"
              />
              <h3 className="font-serif text-base text-brass">Mercedes Ultra VIP Sprinter</h3>
              <p className="text-[11px] text-foam/60 mt-1">10-16 Yolcu · Toplantı Masası · Minibar</p>
            </div>
          </div>
        </div>

        {/* Internal Cross-Linking: Other Transfer Destinations */}
        <div className="mt-16">
          <div className="border-t border-foam/10 pt-10 mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-foam mb-2">
              {isEn ? 'Other Transfer Destinations in Bodrum' : 'Diğer Bodrum VIP Transfer Bölgelerimiz'}
            </h2>
            <p className="text-xs sm:text-sm text-foam/60">
              {isEn
                ? 'Explore our executive private chauffeur routes across the Bodrum peninsula:'
                : 'Yarımada genelindeki diğer transfer rotalarımızı ve bölgesel rehberlerimizi inceleyin:'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherRegions.map((other) => (
              <button
                key={other.slug}
                type="button"
                onClick={() => onSelectRegion(other.slug)}
                className="group rounded-2xl border border-foam/10 bg-ink-900/40 p-4 text-left transition-all hover:border-brass/50 hover:bg-ink-900 active:scale-98 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-medium text-foam group-hover:text-brass transition-colors">
                    {isEn ? other.nameEn : other.nameTr} VIP Transfer
                  </h3>
                  <span className="text-[11px] text-foam/50 flex items-center gap-2 mt-1">
                    <span>{other.distanceKm}</span>
                    <span>•</span>
                    <span>{other.durationMin}</span>
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-foam/40 group-hover:text-brass group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 rounded-full border border-foam/20 bg-ink-900/80 px-8 py-3.5 text-sm font-medium text-foam transition-colors hover:border-foam/50 hover:bg-foam/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? 'Return to Bodrum Luxury Transfer Home' : 'Ana Sayfaya Geri Dön'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
export default RegionalSeoPage;
