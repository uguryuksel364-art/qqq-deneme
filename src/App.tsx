import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import PartnerLogoSlider from '@/components/PartnerLogoSlider';
import HorizonDivider from '@/components/HorizonDivider';
import Experience from '@/components/Experience';
import Fleet from '@/components/Fleet';
import OnBoard from '@/components/OnBoard';
import Testimonials from '@/components/Testimonials';
import Faq from '@/components/Faq';
import ContactForm from '@/components/ContactForm';
import CtaFooter from '@/components/CtaFooter';
import SmartBookingEngine from '@/components/SmartBookingEngine';
import BottomNav from '@/components/BottomNav';
import SupportFab from '@/components/SupportFab';
import Admin from '@/components/Admin';
import RegionalSeoPage from '@/components/RegionalSeoPage';
import { getRegionalSeo } from '@/lib/seoData';
import { getPageSettings, fetchPageSettingsFromDb } from '@/lib/pageSettings';
import { fetchTransferZonesFromDb, fetchKmTariffFromDb } from '@/lib/transferPricing';

function useRoute() {
  const [route, setRoute] = useState({
    hash: window.location.hash,
    pathname: window.location.pathname,
  });

  useEffect(() => {
    const onChange = () => {
      setRoute({
        hash: window.location.hash,
        pathname: window.location.pathname,
      });
    };
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);
  return route;
}

function App() {
  const { hash, pathname } = useRoute();

  useEffect(() => {
    // 1. Initial local config check (dark theme by default)
    const settings = getPageSettings();
    if (settings.theme !== 'dark') {
      try {
        localStorage.setItem('mert_vip_page_settings_v26', JSON.stringify({ ...settings, theme: 'dark' }));
      } catch {
        // ignore
      }
    }

    // Clean up any legacy dummy guest info
    try {
      const rawGuest = localStorage.getItem('mert_vip_guest_info');
      if (rawGuest && (rawGuest.includes('Mert Yılmaz') || rawGuest.includes('539 440 78 23') || rawGuest.includes('bugunjest'))) {
        localStorage.removeItem('mert_vip_guest_info');
      }
    } catch {
      // ignore
    }

    // 2. Global Sync from Server / Storage
    const syncFromDb = async () => {
      try {
        const dbSettings = await fetchPageSettingsFromDb();
        if (dbSettings) {
          localStorage.setItem('mert_vip_page_settings_v26', JSON.stringify(dbSettings));
          window.dispatchEvent(new Event('pageSettingsUpdated'));
        }
      } catch (e) {
        console.warn('Page settings sync caught:', e);
      }

      try {
        const dbZones = await fetchTransferZonesFromDb();
        if (dbZones && Array.isArray(dbZones) && dbZones.length > 0) {
          localStorage.setItem('mert_vip_transfer_rates_v2', JSON.stringify(dbZones));
          window.dispatchEvent(new Event('transferRatesUpdated'));
        }
      } catch (e) {
        console.warn('Transfer zones sync caught:', e);
      }

      try {
        const dbTariff = await fetchKmTariffFromDb();
        if (dbTariff && typeof dbTariff === 'object') {
          localStorage.setItem('mert_vip_km_tariff_v1', JSON.stringify(dbTariff));
          window.dispatchEvent(new Event('transferRatesUpdated'));
        }
      } catch (e) {
        console.warn('Km tariff sync caught:', e);
      }
    };
    syncFromDb();

    // Periodic background polling every 8 seconds for real-time multi-browser/multi-tab updates
    const intervalId = setInterval(syncFromDb, 8000);

    // Cross-tab storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.includes('mert_vip_page_settings') || e.key.includes('transfer'))) {
        window.dispatchEvent(new Event('pageSettingsUpdated'));
        window.dispatchEvent(new Event('transferRatesUpdated'));
      }
    };
    window.addEventListener('storage', handleStorage);

    const applyTheme = () => {
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.backgroundColor = '#07131F';
      root.style.color = '#F5F7F6';
    };
    applyTheme();
    window.addEventListener('pageSettingsUpdated', applyTheme);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pageSettingsUpdated', applyTheme);
    };
  }, []);

  // 1. Admin Check
  if (hash === '#admin' || hash === '#/admin' || pathname === '/admin') {
    return <Admin />;
  }

  // 2. Regional SEO Check (Matches both /bolgeler/slug and #/bolgeler/slug)
  const regionalPathMatch = pathname.match(/^\/bolgeler\/([^/]+)/);
  const regionalHashMatch = hash.match(/^#\/?bolgeler\/([^/]+)/);
  const rawSlug = (regionalPathMatch && regionalPathMatch[1]) || (regionalHashMatch && regionalHashMatch[1]);

  if (rawSlug) {
    // 3. Normalization (Convert Turkish characters to ASCII for matching if needed)
    const slugify = (str: string) => {
      return str
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9-]/g, '-');
    };

    const cleanSlug = slugify(rawSlug);

    // If the raw slug is different from the clean slug, redirect to clean version
    if (rawSlug !== cleanSlug && !rawSlug.startsWith('#')) {
      window.history.replaceState({}, '', `/bolgeler/${cleanSlug}`);
      window.dispatchEvent(new Event('popstate'));
      return null;
    }

    const region = getRegionalSeo(cleanSlug);
    if (region) {
      return (
        <div className="min-h-screen bg-ink text-foam transition-colors duration-300 pb-48 md:pb-0">
          <Nav />
          <RegionalSeoPage
            region={region}
            onBackToHome={() => {
              window.history.pushState({}, '', '/');
              window.location.hash = '';
              // Force update since pushState doesn't trigger popstate automatically for current window
              window.dispatchEvent(new Event('popstate'));
            }}
            onSelectRegion={(slug) => {
              window.history.pushState({}, '', `/bolgeler/${slug}`);
              window.dispatchEvent(new Event('popstate'));
            }}
          />
          <BottomNav />
          <SupportFab />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-ink text-foam transition-colors duration-300 pb-48 md:pb-0">
      <Nav />
      <main>
        <Hero />
        <PartnerLogoSlider />
        <SmartBookingEngine />
        <HorizonDivider className="bg-ink-900" />
        <Fleet />
        <HorizonDivider className="bg-ink-900" />
        <Experience />
        <HorizonDivider className="bg-ink-800" />
        <OnBoard />
        <Testimonials />
        <Faq />
        <ContactForm />
        <CtaFooter />
      </main>
      <BottomNav />
      <SupportFab />
    </div>
  );
}

export default App;
