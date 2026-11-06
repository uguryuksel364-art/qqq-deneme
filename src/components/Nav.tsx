import { useEffect, useState, useRef } from 'react';
import { Menu, X, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTACT, waLink } from '@/lib/contact';
import { useLanguage, Language } from '@/lib/translations';
import { getPageSettings } from '@/lib/pageSettings';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Info, CheckCircle2 } from 'lucide-react';

export default function Nav() {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const logoUrl = '/images/logo.jpeg';
  const secretClicksRef = useRef<number[]>([]);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  const handleSecretAdminClick = (e?: React.MouseEvent) => {
    const now = Date.now();
    secretClicksRef.current = secretClicksRef.current.filter((t) => now - t < 3000);
    secretClicksRef.current.push(now);

    if (secretClicksRef.current.length >= 5) {
      e?.preventDefault();
      secretClicksRef.current = [];
      window.location.hash = '#admin';
    }
  };

  const [showExperience, setShowExperience] = useState(() => getPageSettings().showExperience === true);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      const s = getPageSettings();
      setShowExperience(s.showExperience === true);
    };
    window.addEventListener('pageSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', handleSettingsUpdate);
  }, []);

  const cycleLanguage = () => {
    const LANGS: Language[] = ['tr', 'en', 'ru', 'de', 'ar'];
    const currentIndex = LANGS.indexOf(lang);
    const nextLang = LANGS[(currentIndex + 1) % LANGS.length];
    setLang(nextLang);
  };

  const NAV_LINKS = [
    { label: t.reservation, href: '/#rezervasyon-motoru' },
    { label: t.fleet, href: '/#filo' },
    ...(showExperience ? [{ label: t.experiences, href: '/#deneyim' }] : []),
    { label: t.vipPrivileges || 'VIP Ayrıcalıklar', href: '/#gemide' },
    { label: t.faq || 'FAQ', href: '/#faq' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${
          open
            ? 'bg-ink-900 py-3 border-b border-foam/5'
            : scrolled
            ? 'bg-ink-800/90 backdrop-blur-md border-b border-foam/10 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="#"
            onClick={handleSecretAdminClick}
            className="flex items-center gap-2.5 group select-none relative z-[60]"
            aria-label="Mert VIP Transfer"
          >
            <span className="flex h-10 w-10 items-center justify-center transition-colors shrink-0 rounded-lg overflow-hidden">
              <img
                src={logoUrl || '/images/logo.jpeg'}
                alt="Bodrum Luxury Transfer - VIP Transfer Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/logo.jpeg';
                }}
              />
            </span>
            <span className="flex flex-col text-left leading-none">
              <span className="font-serif text-foam text-lg tracking-wide capitalize">
                Mert VIP
              </span>
              <span className="text-[10px] uppercase tracking-eyebrow text-brass/80">
                Bodrum · TÜRSAB 6550
              </span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-light text-foam/70 transition-colors hover:text-foam"
              >
                {l.label}
              </a>
            ))}

            {/* Desktop Language Selector */}
            <div className="flex items-center gap-1 border-l border-foam/15 pl-5 h-5 ml-1">
              {(['tr', 'en', 'ru', 'de', 'ar'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all active:scale-95 ${
                    lang === l
                      ? 'bg-brass text-ink'
                      : 'text-foam/60 hover:text-foam hover:bg-white/5'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <a
              href={waLink(t.whatsappReserve)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-medium text-ink transition-all hover:bg-brass-400 hover:shadow-[0_0_24px_-4px_rgba(201,161,90,0.5)]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t.whatsapp}
            </a>
          </div>

          {/* Mobile Nav Actions (Language + Theme + Hamburger side-by-side) */}
          <div className="flex items-center gap-2 md:hidden relative z-[60]">
            {/* Language Selector Button */}
            <button
              onClick={cycleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-foam/10 bg-ink-800/50 backdrop-blur-md text-foam/80 hover:text-foam hover:bg-ink-700/50 transition-colors text-xs font-bold uppercase active:scale-95"
              aria-label="Dil değiştir"
              title="Dil Değiştir"
            >
              <Globe className="h-3.5 w-3.5 text-brass" />
              <span>{lang}</span>
            </button>

            {/* Hamburger Menu Toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-foam/80 p-1.5 bg-ink-800/50 rounded-full border border-foam/10 backdrop-blur-md transition-colors hover:text-foam hover:bg-ink-700/50 active:scale-95"
              aria-label="Menü"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Full Screen Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col bg-[#050F19]/80 backdrop-blur-[32px] backdrop-saturate-[180%] px-5 pt-28 pb-8 md:hidden overflow-y-auto border-b border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-3xl font-serif text-foam transition-colors active:text-brass"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 mb-8 border-t border-foam/10 pt-8"
            >
              <div className="flex flex-col gap-4">
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 text-foam/70 text-sm hover:text-brass transition-colors">
                  <Mail className="h-4 w-4 text-brass" />
                  {CONTACT.email}
                </a>
                <a href={`tel:${CONTACT.phoneE164}`} className="flex items-center gap-3 text-foam/70 text-sm hover:text-brass transition-colors">
                  <Phone className="h-4 w-4 text-brass" />
                  {CONTACT.phoneDisplay}
                </a>
                <div className="flex items-center gap-3 text-foam/70 text-sm">
                  <MapPin className="h-4 w-4 text-brass" />
                  {CONTACT.location}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto space-y-4"
            >
              {/* PWA Install Button */}
              {!isInstalled && (
                <div className="flex flex-col gap-3">
                  {isInstallable && (
                    <button
                      onClick={async () => {
                        await install();
                        setOpen(false);
                      }}
                      className="flex items-center justify-center gap-2.5 rounded-xl bg-brass px-5 py-3 text-base font-semibold text-ink-950 active:scale-95 w-full shadow-lg shadow-brass/20 transition-all"
                    >
                      <Download className="h-5 w-5" />
                      {t.installApp || 'Uygulamayı İndir'}
                    </button>
                  )}
                  
                  {isIOS && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowPwaGuide(!showPwaGuide)}
                        className="flex items-center justify-center gap-2.5 rounded-xl border border-brass/30 bg-brass/10 px-5 py-3 text-base font-semibold text-brass active:scale-95 w-full transition-all"
                      >
                        <Info className="h-5 w-5" />
                        {t.howToInstall || 'Nasıl İndirilir?'}
                      </button>
                      
                      <AnimatePresence>
                        {showPwaGuide && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white/5 rounded-xl p-4 text-xs space-y-3 text-foam/80 border border-white/10"
                          >
                            <p className="flex items-start gap-2">
                              <span className="bg-brass/20 text-brass px-1.5 rounded font-bold">1</span>
                              {t.iosStep1 || 'Safari tarayıcısında "Paylaş" butonuna basın.'}
                            </p>
                            <p className="flex items-start gap-2">
                              <span className="bg-brass/20 text-brass px-1.5 rounded font-bold">2</span>
                              {t.iosStep2 || 'Listeyi aşağı kaydırıp "Ana Ekrana Ekle" seçeneğini seçin.'}
                            </p>
                            <p className="flex items-start gap-2 font-medium text-teal">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t.iosStep3 || 'Uygulama ana ekranınıza yüklenecektir.'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Styled WhatsApp Reservation Button */}
              <a
                href={waLink(t.whatsappReserve)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-5 py-4 text-base font-semibold text-white active:scale-95 w-full shadow-lg shadow-[#25D366]/20 transition-all"
              >
                <WhatsAppIcon className="h-5 w-5 fill-white text-white" />
                {t.whatsappReserve}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
