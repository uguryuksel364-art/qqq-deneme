// Page settings manager for Bodrum Blue Yacht Tours
// Persists to localStorage to ensure instant updates in the client and admin views.
import { supabase, isSupabaseConfigured } from './supabase';

export interface FleetYacht {
  id: string;
  name: string;
  description: string;
  images: string[]; // List of image URLs
  specs: string; // e.g., "12 Kişi • 22 Metre • 3 Kabin"
}

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  images: string[]; // Supports multiple images as a slider
  iconName?: string; // Key for lucide icon
  badge?: string; // e.g. "VIP Standart", "7/24 Karşılama"
  feature?: string; // e.g. "7/24 Kesintisiz Hizmet"
  buttonText?: string; // e.g. "Rezervasyon Yap →"
  hidden?: boolean; // Toggle visibility per card
}

export interface PageSettings {
  heroSlides: string[];
  fleet: FleetYacht[];
  experience: ExperienceItem[];
  showExperience?: boolean; // Controls whether this entire section is shown on public site
  theme?: 'dark' | 'light';
  logoUrl?: string;
  videoUrl?: string;
  showVideoButton?: boolean;
  heroBackgroundMode?: 'video' | 'image'; // 'video' for background video, 'image' for slideshow
  videoTitle?: string;
  videoFormat?: 'vertical' | 'horizontal'; // 'vertical' = Instagram Reels 9:16
  videoAutoPlay?: boolean;
  videoMuted?: boolean;
  navTheme?: 'default' | 'vibrant' | 'classic-white';
  // Hero text settings
  heroBadge?: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroTitleLine3?: string;
  heroDescription?: string;
  heroButtonText?: string;
  // Experience / Hizmet Deneyimleri text settings
  experienceBadge?: string;
  experienceTitle?: string;
  experienceDesc?: string;
}

const STORAGE_KEY = 'mert_vip_page_settings_v26';
const DEFAULT_LOGO_URL = '/images/logo.jpeg';
export const DEFAULT_VIDEO_URL = 'https://res.cloudinary.com/oyzz6k3g/video/upload/v1793226716/mert_vip/videos/ojgvbtlrkm1offtylflz.mov';
export const DEFAULT_VIDEO_THUMBNAIL = '/images/fleet_vito_lounge.jpg';

// Homepage Hero: The complete 12 high-resolution executive images from Cloudinary
const DEFAULT_HERO_SLIDES = [
  '/assets/permanent/bqdd2uzpkplmd5ahfnry.jpg',
  '/assets/permanent/daecw0xxpwujwz8we6tt.jpg',
  '/assets/permanent/udimlcgbdgcqo0dlb6hx.jpg',
  '/assets/permanent/rcp67e2ctlpcgv2mvjow.jpg',
  '/assets/permanent/jbofk2yz21dm0fosjqw0.jpg',
  '/assets/permanent/pg9qtoihjlz7v8pdzuxv.jpg',
  '/assets/permanent/xmqbxn7creslgzrpkint.jpg',
  '/assets/permanent/vg6ylvkhncpwrxcjs7bi.jpg',
  '/assets/permanent/cxinsszpn1z4wmd25rk2.jpg',
  '/assets/permanent/pkzdttuegfoxmo8mxx4r.jpg',
  '/assets/permanent/borsckaa4raexte3dlxm.jpg',
  '/assets/permanent/wifogqrrhrc2ij3rvsk8.jpg',
];

const DEFAULT_FLEET: FleetYacht[] = [
  {
    id: 'fleet-maybach',
    name: 'Mercedes-Benz Maybach Design',
    specs: '5 Kişi • Starlight Tavan • Apple TV',
    description: "Özel Starlight yıldız tavan, Apple TV, Nespresso kahve barı ve elektrikli masajlı kaptan koltuklarıyla Bodrum'un zirvesinde lüks VIP transfer.",
    images: [
      '/assets/permanent/sndx76xaeqprreqvj97r.jpg',
      '/assets/permanent/ckwjgjo4nupvxvgcymbr.jpg',
      '/assets/permanent/pjlazh32wgdwqxfhiajz.jpg',
      '/assets/permanent/unxetowpdqyoviqrr1no.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224019/mert_vip/fleet/jwkhnwmhcqfbgmqgxq41.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224024/mert_vip/fleet/ijvycx58fllrhqwbjmar.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224027/mert_vip/fleet/xxxey6jaep7sd7taozs9.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224029/mert_vip/fleet/tvjka459tvcmgwgshutb.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224031/mert_vip/fleet/wbcdm7bnnkncdi5xiajt.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224033/mert_vip/fleet/njfy51lco4kxvhs9ytxc.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224035/mert_vip/fleet/en29vfot10vs16paxnhl.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224037/mert_vip/fleet/yq8cyxtytqxbf1e94pn.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224040/mert_vip/fleet/mwv8yka84rxyyorxsggg.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224042/mert_vip/fleet/gsxpg3efcd5lme3ztqnl.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224160/mert_vip/fleet/epc7im3cjcy5ce6acyar.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224162/mert_vip/fleet/mll5lzhztcn52xcktzl3.jpg',
    ],
  },
  {
    id: 'fleet-sprinter',
    name: 'Mercedes-Vito Premimum van',
    specs: '1-6 yolcu Tv wifi minibar led aydınlatma elektrikli koltuklar',
    description: 'Lüks ve konforu bir arada sunan VIP Mercedes-Benz Vito aracımız; elektrikli konfor koltukları, TV, Wi-Fi, özel minibar ve ambiyans LED aydınlatması ile seyahatlerinizi eşsiz bir premium deneyime dönüştürüyor.\n',
    images: [
      '/assets/permanent/zczhsbe4xksapljfz6jz.jpg',
      '/assets/permanent/zdtykyezjjzq4zwhfs6v.jpg',
      '/assets/permanent/daecw0xxpwujwz8we6tt.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1792924183/mert_vip/fleet/d2gddzoelht9u6zmndk0.jpg',
      '/assets/permanent/bqdd2uzpkplmd5ahfnry.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1792924188/mert_vip/fleet/bzf4nf7roxpgdngrhunt.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1792924190/mert_vip/fleet/gwtgbjjojxpenvxxkhmq.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1792924193/mert_vip/fleet/pkznf4yaanhulvsb2a3m.jpg',
    ],
  },
  {
    id: 'yacht-1792931027003',
    name: 'Mercedes-Benz Sprinter vip',
    specs: '1-16 Kişi •Mini bar Deri koltuk Tv wifi',
    description: 'Bodrum içi ve havalimanı transferleri için son model özel donanımlı konforlu geniş ailelerin tercihi',
    images: [
      '/assets/permanent/muwmluy7el0rlwi3ozlg.jpg',
      '/assets/permanent/zl41vgnsztus32adcphr.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224823/mert_vip/fleet/mr2fqheoof5rfwdkr2bl.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224825/mert_vip/fleet/ytyfamjuukxnqdyrmbqp.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224827/mert_vip/fleet/jhgjox30dmjszf1mz5rr.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224830/mert_vip/fleet/zfyifsypfkzwfib8iqot.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224835/mert_vip/fleet/a8ytytk7v1rn9bbvhc4k.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224837/mert_vip/fleet/edg4ymf7jodexxxympk0.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224839/mert_vip/fleet/bb0th6aysu9h1nddzfei.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224841/mert_vip/fleet/dvbtglswws58k1grnoai.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224846/mert_vip/fleet/z1ms7cw57pttb6to2c5e.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224848/mert_vip/fleet/skgfqcq7xuphjis5r6il.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224855/mert_vip/fleet/usbgfmqz0n6fgn33f256.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224857/mert_vip/fleet/z6krc63b8n7rdblyvuiy.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224863/mert_vip/fleet/cj5qcch4nczn3lkdjovz.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224868/mert_vip/fleet/esrxodu1fr0imn6dbpyb.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224874/mert_vip/fleet/ltqdgkmveceyikxu3u12.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224877/mert_vip/fleet/ljyehva93wbssjctydnu.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793224899/mert_vip/fleet/vof7dwycey5ywenundou.jpg',
    ],
  },
  {
    id: 'yacht-1793165954400',
    name: 'Mercedes-Benz Sprinter Ultra VIP',
    specs: '1-9 Kişi •Elektrikli masajlı koltuk • Wi-Fi Tv Minibar Koltuk ısıtma-soğutma Kahve makinesi ',
    description: 'Üst düzey konfor ve prestij arayanlar için özel olarak tasarlanan Ultra VIP Mercedes Sprinter araçlarımız Bodrum başta olmak üzere Fethiye Antalya Didim bölgelerinde seyahatlerinizi ayrıcalıklı bir yaşam alanına dönüştürüyor. Sadece bir ulaşım aracı değil, ultra lüks bir süit olan bu özel tasarım araç, iş ve tatil seyahatlerinizde size maksimum rahatlık sunmak için hazırlandı',
    images: [
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225425/mert_vip/fleet/bx9unpxiboc0dyrfl3it.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225389/mert_vip/fleet/jdvseug5xt8yywvydkj9.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225392/mert_vip/fleet/tty9hrm8t4sr3s9afnin.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225394/mert_vip/fleet/yezicipam1pm36xzu10h.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225396/mert_vip/fleet/uyaoknveawfp7wmcl51k.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225398/mert_vip/fleet/xvraij9tm06ccah6ak8j.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225400/mert_vip/fleet/lqprmksrjpif74cxpklm.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225403/mert_vip/fleet/zcdomy87rdn5kzqiuqgs.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225404/mert_vip/fleet/ypo0av4cykx63aw4lmtl.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225406/mert_vip/fleet/c9ypsykxodgrc8xmpz6n.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225409/mert_vip/fleet/ikpufkzc7pyh5rwjmhb8.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225415/mert_vip/fleet/g8poemu5pokr0zwvekxh.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225421/mert_vip/fleet/bqzfmp6szrk2vo4qd2y1.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225429/mert_vip/fleet/brcpjeq9cbbkjkfvlvjl.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225430/mert_vip/fleet/vv2hz4ku9qkz7vrauth5.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225434/mert_vip/fleet/ae8pg8czuwnblwjix7xw.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225436/mert_vip/fleet/d1jaoigoef0kbbmrld4u.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225438/mert_vip/fleet/mi1mbgbmrsvixivoddkq.jpg',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225440/mert_vip/fleet/ijz9wlk9nhcjq3ailngt.png',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225443/mert_vip/fleet/ksoudczn4i3sim49gmul.png',
      'https://res.cloudinary.com/oyzz6k3g/image/upload/v1793225449/mert_vip/fleet/inopkoa9cfkbi2dpz001.png',
    ],
  },
];

const DEFAULT_EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-1',
    title: 'Havalimanı VIP Karşılama',
    description: 'Milas-Bodrum Havalimanı (BJV) kapısında isminizle karşılama, uçuş rötar takibi ve bagaj asistanlığı.',
    images: ['/images/fleet_vito_lounge.jpg'],
    iconName: 'Plane',
    badge: 'VIP STANDART',
    feature: '7/24 Kesintisiz Hizmet',
    buttonText: 'Rezervasyon Yap →',
    hidden: false,
  },
  {
    id: 'exp-2',
    title: 'Şehir İçi & Şehir Dışı Transfer',
    description: 'Bodrum yarımadası, Yalıkavak Marina, Türkbükü ve tüm şehirlerarası noktalara 7/24 lüks konforlu ulaşım.',
    images: ['/images/hero_vip_transfer.jpg'],
    iconName: 'Waves',
    badge: 'VIP STANDART',
    feature: '7/24 Kesintisiz Hizmet',
    buttonText: 'Rezervasyon Yap →',
    hidden: false,
  },
  {
    id: 'exp-3',
    title: 'Şoförlü Saatlik Tahsis',
    description: 'Özel takım elbiseli şoförünüzle plajlar, restoranlar ve gece kulüpleri arasında sınırsız bekleme ve seyahat.',
    images: ['/images/fleet_maybach_interior.jpg'],
    iconName: 'Sparkles',
    badge: 'VIP STANDART',
    feature: '7/24 Kesintisiz Hizmet',
    buttonText: 'Rezervasyon Yap →',
    hidden: false,
  },
  {
    id: 'exp-4',
    title: 'TÜRSAB & D2 Güvencesi',
    description: '6550 TÜRSAB tescili ve D2 Yetki Belgesi ile %100 yasal, ferdi kaza sigortalı ve güvenli yolculuk.',
    images: ['/images/fleet_sprinter_vip.jpg'],
    iconName: 'Heart',
    badge: 'VIP STANDART',
    feature: '7/24 Kesintisiz Hizmet',
    buttonText: 'Rezervasyon Yap →',
    hidden: false,
  },
];

// Helper to normalize any stale asset paths
function sanitizeImageUrl(url: string): string {
  if (!url) return '/images/hero_extra.png';

  // 1. Map AI Studio temporary artifact paths to local permanent /uploads/ path
  if (url.includes('.tempmediaStorage/')) {
    const filename = url.split('/').pop();
    if (filename) return `/uploads/${filename}`;
  }

  // 2. Map known default Cloudinary URLs to local /assets/permanent/ path
  if (url.startsWith('https://res.cloudinary.com/') && url.includes('/mert_vip/')) {
    const filename = url.split('/').pop();
    if (filename) return `/assets/permanent/${filename}`;
  }

  // Never modify or sanitize remote URLs (Supabase, external CDN, etc.)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.includes('hero_vip_transfer')) return '/images/hero_vip_transfer.jpg';
  if (url.includes('hero_extra')) return '/images/hero_extra.png';
  if (url.includes('fleet_maybach_interior')) return '/images/fleet_maybach_interior.jpg';
  if (url.includes('fleet_vito_lounge')) return '/images/fleet_vito_lounge.jpg';
  if (url.includes('fleet_sprinter_vip')) return '/images/fleet_sprinter_vip.jpg';
  return url;
}

export function sanitizeVideoUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '/assets/permanent/ojgvbtlrkm1offtylflz.mov';
  const trimmed = url.trim();
  if (trimmed === 'https://res.cloudinary.com/oyzz6k3g/video/upload/v1793226716/mert_vip/videos/ojgvbtlrkm1offtylflz.mov') {
    return '/assets/permanent/ojgvbtlrkm1offtylflz.mov';
  }
  return trimmed;
}

export function getPageSettings(): PageSettings {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // If not found in current storage key, check previous versions
    if (!raw) {
      const prevKeys = ['mert_vip_page_settings_v16', 'mert_vip_page_settings_v15', 'mert_vip_page_settings_v14'];
      for (const k of prevKeys) {
        const prev = localStorage.getItem(k);
        if (prev) {
          raw = prev;
          break;
        }
      }
    }

    if (!raw) {
      const defaultSettings: PageSettings = {
        heroSlides: DEFAULT_HERO_SLIDES,
        fleet: DEFAULT_FLEET,
        experience: DEFAULT_EXPERIENCE,
        showExperience: false, // Default hidden per user request: "Bunları kaldır panelde göster bide gizle butonuna koy"
        theme: 'dark',
        logoUrl: DEFAULT_LOGO_URL,
        videoUrl: DEFAULT_VIDEO_URL,
        showVideoButton: false,
        heroBackgroundMode: 'image', // 'image' slideshow with 12 Cloudinary photos
        videoTitle: 'copy_D63CFE4B-A918-4897-A150-4446EACAA30E.mov',
        videoFormat: 'horizontal',
        videoAutoPlay: true,
        videoMuted: true,
        navTheme: 'default',
        heroBadge: 'YALIKAVAK MARİNA & BJV, BODRUM',
        heroTitleLine1: 'Lüksü Yaşa.',
        heroTitleLine2: 'Yolculuğunuz bizim',
        heroTitleLine3: 'en büyük tutkumuz.',
        heroDescription: 'Bodrum Havalimanı (BJV) ve Yalıkavak Marina başta olmak üzere, tüm yarımadada VIP şoförlü transfer ve özel tahsis hizmeti.',
        heroButtonText: 'Online Rezervasyon',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    const parsed = JSON.parse(raw);
    
    const heroSlides = parsed.heroSlides && parsed.heroSlides.length > 0 
      ? parsed.heroSlides.map(sanitizeImageUrl) 
      : DEFAULT_HERO_SLIDES;

    const sanitizedFleet = (parsed.fleet && parsed.fleet.length > 0 ? parsed.fleet : DEFAULT_FLEET).map((f: FleetYacht) => ({
      ...f,
      images: (f.images || []).map(sanitizeImageUrl),
    }));

    const sanitizedExp = (parsed.experience && parsed.experience.length > 0 ? parsed.experience : DEFAULT_EXPERIENCE).map((e: ExperienceItem) => ({
      ...e,
      images: (e.images || []).map(sanitizeImageUrl),
      badge: e.badge || 'VIP STANDART',
      feature: e.feature || '7/24 Kesintisiz Hizmet',
      buttonText: e.buttonText || 'Rezervasyon Yap →',
      hidden: e.hidden === true,
    }));

    // Guaranteed default video url
    const finalVideoUrl = sanitizeVideoUrl(parsed.videoUrl) || DEFAULT_VIDEO_URL;
    const heroBackgroundMode = parsed.heroBackgroundMode === 'image' ? 'image' : 'video';
    const isVideoMode = heroBackgroundMode === 'video';
    const showExperience = parsed.showExperience === true;

    const validatedSettings: PageSettings = {
      heroSlides,
      fleet: sanitizedFleet,
      experience: sanitizedExp,
      showExperience,
      theme: 'dark',
      logoUrl: parsed.logoUrl || DEFAULT_LOGO_URL,
      videoUrl: finalVideoUrl,
      heroBackgroundMode,
      showVideoButton: isVideoMode,
      videoTitle: parsed.videoTitle || 'Mert VIP Transfer Tanıtım Filmi',
      videoFormat: parsed.videoFormat || 'vertical',
      videoAutoPlay: parsed.videoAutoPlay !== undefined ? parsed.videoAutoPlay : true,
      videoMuted: parsed.videoMuted !== undefined ? parsed.videoMuted : true,
      navTheme: 'default',
      heroBadge: parsed.heroBadge,
      heroTitleLine1: parsed.heroTitleLine1,
      heroTitleLine2: parsed.heroTitleLine2,
      heroTitleLine3: parsed.heroTitleLine3,
      heroDescription: parsed.heroDescription,
      heroButtonText: parsed.heroButtonText,
      experienceBadge: parsed.experienceBadge,
      experienceTitle: parsed.experienceTitle,
      experienceDesc: parsed.experienceDesc,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedSettings));
    return validatedSettings;
  } catch {
    return {
      heroSlides: DEFAULT_HERO_SLIDES,
      fleet: DEFAULT_FLEET,
      experience: DEFAULT_EXPERIENCE,
      showExperience: false,
      theme: 'dark',
      logoUrl: DEFAULT_LOGO_URL,
      videoUrl: DEFAULT_VIDEO_URL,
      showVideoButton: false,
      heroBackgroundMode: 'image',
      videoTitle: 'copy_D63CFE4B-A918-4897-A150-4446EACAA30E.mov',
      videoFormat: 'horizontal',
      videoAutoPlay: true,
      videoMuted: true,
      navTheme: 'default',
      heroBadge: 'YALIKAVAK MARİNA & BJV, BODRUM',
      heroTitleLine1: 'Lüksü Yaşa.',
      heroTitleLine2: 'Yolculuğunuz bizim',
      heroTitleLine3: 'en büyük tutkumuz.',
      heroDescription: 'Bodrum Havalimanı (BJV) ve Yalıkavak Marina başta olmak üzere, tüm yarımadada VIP şoförlü transfer ve özel tahsis hizmeti.',
      heroButtonText: 'Online Rezervasyon',
    };
  }
}

export async function fetchPageSettingsFromDb(): Promise<PageSettings | null> {
  let serverSettings: Partial<PageSettings> | null = null;

  // 1. Fetch from server API (authoritative source across all browsers)
  try {
    const res = await fetch('/api/settings/page_settings');
    if (res.ok) {
      const json = await res.json();
      if (json?.data && typeof json.data === 'object') {
        serverSettings = json.data;
      }
    }
  } catch (err) {
    console.warn('API fetch page settings error:', err);
  }

  // 2. Check active video from /api/videos/active to ensure video URL metadata is synced without altering user background mode preference
  try {
    const res = await fetch('/api/videos/active');
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.url) {
        if (!serverSettings) serverSettings = {};
        if (json.data.url !== DEFAULT_VIDEO_URL || !serverSettings.videoUrl) {
          serverSettings.videoUrl = json.data.url;
          if (json.data.title) serverSettings.videoTitle = json.data.title;
          if (json.data.format) serverSettings.videoFormat = json.data.format;
        }
      }
    }
  } catch (err) {
    console.warn('API fetch active video error:', err);
  }

  // 3. Fallback to Supabase if configured
  if (!serverSettings && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'page_settings')
        .single();

      if (!error && data?.value) {
        serverSettings = data.value as PageSettings;
      }
    } catch {
      // ignore
    }
  }

  if (!serverSettings) return null;

  const current = getPageSettings();
  const heroBackgroundMode = serverSettings.heroBackgroundMode || current.heroBackgroundMode || 'video';
  const heroSlides = (serverSettings.heroSlides && serverSettings.heroSlides.length > 0)
    ? serverSettings.heroSlides
    : current.heroSlides;
  const fleet = (serverSettings.fleet && serverSettings.fleet.length > 0)
    ? serverSettings.fleet
    : current.fleet;
  const experience = (serverSettings.experience && serverSettings.experience.length > 0)
    ? serverSettings.experience
    : current.experience;
  const showExperience = serverSettings.showExperience !== undefined
    ? Boolean(serverSettings.showExperience)
    : (current.showExperience === true);

  const merged: PageSettings = {
    ...current,
    ...serverSettings,
    theme: 'dark',
    heroSlides,
    fleet,
    experience,
    showExperience,
    videoUrl: sanitizeVideoUrl(serverSettings.videoUrl) || current.videoUrl || DEFAULT_VIDEO_URL,
    heroBackgroundMode,
    showVideoButton: heroBackgroundMode === 'video',
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }

  return merged;
}

export function savePageSettings(settings: PageSettings): void {
  const safeSettings: PageSettings = {
    ...settings,
    theme: 'dark',
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSettings));
  } catch {
    // ignore
  }

  // 1. Persist to Express server so ANY OTHER BROWSER gets this immediately
  fetch('/api/settings/page_settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(safeSettings),
  }).catch((err) => console.warn('Could not persist settings to server API:', err));

  // 2. Sync with Supabase if configured
  if (isSupabaseConfigured) {
    Promise.resolve(
      supabase
        .from('settings')
        .upsert({ key: 'page_settings', value: settings })
    )
      .then(({ error }) => {
        if (error) console.warn('Could not persist settings to Supabase:', error);
      })
      .catch(() => {});
  }
}
