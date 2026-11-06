// Central Bodrum VIP Transfer Pricing & Region Management
// Base departure point: Milas-Bodrum Havalimanı (BJV)
import { supabase, isSupabaseConfigured } from './supabase';

export interface TransferZone {
  id: string;
  name: string; // Exact user label, e.g. "Güvercinlik"
  fullName: string; // e.g. "Güvercinlik Koyu & Oteller Bölgesi"
  lat: number;
  lng: number;
  oneWayPriceEur: number;
  roundTripPriceEur: number;
  distanceKm: number;
  durationMins: number;
  description?: string;
  popularSpots?: string[];
  isAirport?: boolean;
}

export const AIRPORT_BASE = {
  id: 'bjv-airport',
  name: 'Milas-Bodrum Havalimanı (BJV)',
  fullName: 'Milas-Bodrum Uluslararası Havalimanı (BJV)',
  lat: 37.2506,
  lng: 27.6643,
  isAirport: true,
};

export const DEFAULT_TRANSFER_ZONES: TransferZone[] = [
  {
    id: 'guvercinlik',
    name: 'Güvercinlik',
    fullName: 'Güvercinlik Koyu & Lüks Oteller Bölgesi (Titanic, Lujo vb.)',
    lat: 37.1325,
    lng: 27.5750,
    oneWayPriceEur: 45,
    roundTripPriceEur: 85,
    distanceKm: 18,
    durationMins: 18,
    description: 'Bodrum girişindeki ilk koy; Titanic Luxury Collection, Lujo Hotel ve güzergâh tesisleri.',
    popularSpots: ['Titanic Deluxe Bodrum', 'Lujo Hotel Bodrum', 'Güvercinlik Sahil'],
  },
  {
    id: 'torba',
    name: 'Torba',
    fullName: 'Torba Koyu & Marina Yolu (The Bodrum EDITION, Vogue)',
    lat: 37.0811,
    lng: 27.4589,
    oneWayPriceEur: 50,
    roundTripPriceEur: 95,
    distanceKm: 32,
    durationMins: 30,
    description: 'Bodrum yarımadasının kuzey giriş kapısı; çam ormanları ile çevrili butik koylar.',
    popularSpots: ['The Bodrum EDITION', 'Vogue Hotel Supreme', 'Torba Koyu'],
  },
  {
    id: 'bitez',
    name: 'Bitez',
    fullName: 'Bitez Koyu & Marina Sahili',
    lat: 37.0278,
    lng: 27.3828,
    oneWayPriceEur: 55,
    roundTripPriceEur: 100,
    distanceKm: 41,
    durationMins: 40,
    description: 'Bodrum merkezine komşu sakin mandalina bahçeleri ve sörf koyu.',
    popularSpots: ['Bitez Yalısı', 'Ramada Resort Bodrum', 'Bitez Liman'],
  },
  {
    id: 'gumbet',
    name: 'Gümbet',
    fullName: 'Gümbet & Asarlık Mevkii',
    lat: 37.0315,
    lng: 27.4042,
    oneWayPriceEur: 55,
    roundTripPriceEur: 100,
    distanceKm: 39,
    durationMins: 38,
    description: 'Hareketli sahil şeridi ve Asarlık tepesindeki beş yıldızlı resortlar.',
    popularSpots: ['Caresse Luxury Resort', 'Gümbet Barlar Sokağı', 'Asarlık Koyu'],
  },
  {
    id: 'bodrum-merkez',
    name: 'Bodrum Merkez',
    fullName: 'Bodrum Merkez, Kale & Milta Marina',
    lat: 37.0344,
    lng: 27.4305,
    oneWayPriceEur: 55,
    roundTripPriceEur: 100,
    distanceKm: 36,
    durationMins: 35,
    description: 'Bodrum Kalesi, Milta Marina ve çarşı merkezine 7/24 konforlu doğrudan ulaşım.',
    popularSpots: ['Bodrum Milta Marina', 'Bodrum Kalesi', 'Kumbahçe Sahili'],
  },
  {
    id: 'yalikavak',
    name: 'Yalıkavak',
    fullName: 'Yalıkavak Marina & Tilkicik Koyu',
    lat: 37.1042,
    lng: 27.2958,
    oneWayPriceEur: 60,
    roundTripPriceEur: 110,
    distanceKm: 52,
    durationMins: 50,
    description: 'Dünya markaları, süperyat marinası, Tilkicik ve Kudür koylarına VIP seyahat.',
    popularSpots: ['Yalıkavak Marina', 'Tilkicik Koyu', 'Sirene Luxury Hotel'],
  },
  {
    id: 'turkbuku',
    name: 'Türkbükü',
    fullName: 'Türkbükü & Göltürkbükü (Mandarin Oriental, Maçakızı)',
    lat: 37.1264,
    lng: 27.3892,
    oneWayPriceEur: 60,
    roundTripPriceEur: 110,
    distanceKm: 45,
    durationMins: 42,
    description: 'Bodrum sosyetesinin ve dünya jet-setinin gözdesi beach ve oteller bölgesi.',
    popularSpots: ['Mandarin Oriental', 'Maçakızı Hotel', 'Türkbükü Kordon'],
  },
  {
    id: 'gundogan',
    name: 'Gündoğan',
    fullName: 'Gündoğan & Küçükbük Koyu',
    lat: 37.1333,
    lng: 27.3417,
    oneWayPriceEur: 60,
    roundTripPriceEur: 110,
    distanceKm: 48,
    durationMins: 45,
    description: 'Serin esintisi ve berrak deniziyle tanınan prestijli villalar ve oteller bölgesi.',
    popularSpots: ['Küçükbük Koyu', 'Mivara Luxury Resort', 'Gündoğan Sahil'],
  },
  {
    id: 'gumusluk',
    name: 'Gümüşlük',
    fullName: 'Gümüşlük Koyu & Tavşan Adası',
    lat: 37.0544,
    lng: 27.2344,
    oneWayPriceEur: 65,
    roundTripPriceEur: 120,
    distanceKm: 58,
    durationMins: 55,
    description: 'Tarihi Myndos antik kenti kalıntıları, gün batımı ve sahil balık restoranları.',
    popularSpots: ['Gümüşlük Sahil Balıkçıları', 'Tavşan Adası', 'Karakaya Köyü'],
  },
  {
    id: 'turgutreis',
    name: 'Turgutreis',
    fullName: 'Turgutreis & D-Marin Marina',
    lat: 37.0017,
    lng: 27.2592,
    oneWayPriceEur: 65,
    roundTripPriceEur: 120,
    distanceKm: 55,
    durationMins: 55,
    description: 'Geniş sahil kordonu, D-Marin marinası ve Yunan adaları feribot kalkış noktası.',
    popularSpots: ['D-Marin Turgutreis', 'Swissôtel Resort Bodrum Beach', 'Kadirga Koyu'],
  },
  {
    id: 'didim',
    name: 'Didim',
    fullName: 'Didim & Altınkum Sahili / Akbük',
    lat: 37.3833,
    lng: 27.2667,
    oneWayPriceEur: 100,
    roundTripPriceEur: 190,
    distanceKm: 85,
    durationMins: 75,
    description: 'Apollon Tapınağı, Altınkum ve Akbük koylarına havalimanı gidiş ve dönüş transferi.',
    popularSpots: ['Altınkum Plajı', 'Didim D-Marin', 'Apollon Tapınağı'],
  },
];


const STORAGE_KEY = 'mert_vip_transfer_rates_v2';

export function getTransferZones(): TransferZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSFER_ZONES));
      return DEFAULT_TRANSFER_ZONES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const fallbackDef: TransferZone = DEFAULT_TRANSFER_ZONES[0] || {
        id: 'default-zone',
        name: 'Bodrum Merkez',
        fullName: 'Bodrum Merkez & Marina',
        lat: 37.0344,
        lng: 27.4305,
        oneWayPriceEur: 50,
        roundTripPriceEur: 95,
        distanceKm: 35,
        durationMins: 35,
        description: 'Bodrum Merkez',
        popularSpots: ['Bodrum Marina', 'Bodrum Kalesi'],
      };

      return parsed
        .filter((item): item is Partial<TransferZone> => Boolean(item && typeof item === 'object'))
        .map((item, index) => {
          const matchedDef = DEFAULT_TRANSFER_ZONES.find((d) => d && d.id === item.id);
          const indexDef = DEFAULT_TRANSFER_ZONES[index];
          const def = matchedDef || indexDef || fallbackDef;

          return {
            id: String(item.id || def.id || `zone-${index}`),
            name: String(item.name || def.name || 'Transfer Bölgesi'),
            fullName: String(item.fullName || def.fullName || item.name || def.name || 'Transfer Bölgesi'),
            lat: typeof item.lat === 'number' && !isNaN(item.lat) ? item.lat : (def.lat || 37.0344),
            lng: typeof item.lng === 'number' && !isNaN(item.lng) ? item.lng : (def.lng || 27.4305),
            oneWayPriceEur: typeof item.oneWayPriceEur === 'number' && !isNaN(item.oneWayPriceEur) ? item.oneWayPriceEur : (def.oneWayPriceEur || 50),
            roundTripPriceEur: typeof item.roundTripPriceEur === 'number' && !isNaN(item.roundTripPriceEur) ? item.roundTripPriceEur : (def.roundTripPriceEur || 95),
            distanceKm: typeof item.distanceKm === 'number' && !isNaN(item.distanceKm) ? item.distanceKm : (def.distanceKm || 30),
            durationMins: typeof item.durationMins === 'number' && !isNaN(item.durationMins) ? item.durationMins : (def.durationMins || 30),
            description: item.description || def.description || '',
            popularSpots: Array.isArray(item.popularSpots) ? item.popularSpots : (def.popularSpots || []),
          };
        });
    }
    return DEFAULT_TRANSFER_ZONES;
  } catch {
    return DEFAULT_TRANSFER_ZONES;
  }
}

export async function fetchTransferZonesFromDb(): Promise<TransferZone[] | null> {
  // 1. Fetch from server API
  try {
    const res = await fetch('/api/settings/transfer_zones');
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as TransferZone[];
      }
    }
  } catch {
    // network or parse error, fallback safely
  }

  // 2. Supabase fallback ONLY if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'transfer_zones')
        .single();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        return data.value as TransferZone[];
      }
    } catch {
      // silently ignore
    }
  }
  return null;
}

export function saveTransferZones(zones: TransferZone[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));

    // 1. Sync with server API
    fetch('/api/settings/transfer_zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zones),
    }).catch((e) => console.warn('Could not persist zones to server API:', e));

    // 2. Sync with Supabase
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase
          .from('settings')
          .upsert({ key: 'transfer_zones', value: zones })
      )
        .then(({ error }) => {
          if (error) console.warn('Could not persist zones to Supabase:', error);
        })
        .catch(() => {});
    }

    window.dispatchEvent(new Event('transferRatesUpdated'));
  } catch (err) {
    console.error('Failed to save transfer zones:', err);
  }
}

export function resetTransferZones(): TransferZone[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSFER_ZONES));
    window.dispatchEvent(new Event('transferRatesUpdated'));
    return DEFAULT_TRANSFER_ZONES;
  } catch {
    return DEFAULT_TRANSFER_ZONES;
  }
}

export interface KmTariff {
  enabled: boolean;              // Kilometre tarifesi açık/kapalı seçeneği
  baseOpeningFeeEur: number;     // Açılış ücreti (€)
  perKmRateEur: number;          // Km başına transfer ücreti (€/km)
  minimumFeeEur: number;         // Minimum transfer ücreti (€)
  roundTripDiscountPercent: number; // Gidiş-dönüş indirim oranı (%)
}

export const DEFAULT_KM_TARIFF: KmTariff = {
  enabled: true,
  baseOpeningFeeEur: 20,
  perKmRateEur: 1.25,
  minimumFeeEur: 45,
  roundTripDiscountPercent: 10,
};

export const KM_TARIFF_STORAGE_KEY = 'mert_vip_km_tariff_v1';

export function getKmTariff(): KmTariff {
  try {
    const raw = localStorage.getItem(KM_TARIFF_STORAGE_KEY);
    if (!raw) return DEFAULT_KM_TARIFF;
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_KM_TARIFF.enabled,
      baseOpeningFeeEur: typeof parsed.baseOpeningFeeEur === 'number' ? parsed.baseOpeningFeeEur : DEFAULT_KM_TARIFF.baseOpeningFeeEur,
      perKmRateEur: typeof parsed.perKmRateEur === 'number' ? parsed.perKmRateEur : DEFAULT_KM_TARIFF.perKmRateEur,
      minimumFeeEur: typeof parsed.minimumFeeEur === 'number' ? parsed.minimumFeeEur : DEFAULT_KM_TARIFF.minimumFeeEur,
      roundTripDiscountPercent: typeof parsed.roundTripDiscountPercent === 'number' ? parsed.roundTripDiscountPercent : DEFAULT_KM_TARIFF.roundTripDiscountPercent,
    };
  } catch {
    return DEFAULT_KM_TARIFF;
  }
}

export async function fetchKmTariffFromDb(): Promise<KmTariff | null> {
  // 1. Fetch from server API
  try {
    const res = await fetch('/api/settings/km_tariff');
    if (res.ok) {
      const json = await res.json();
      if (json?.data && typeof json.data === 'object') {
        const d = json.data;
        return {
          enabled: typeof d.enabled === 'boolean' ? d.enabled : DEFAULT_KM_TARIFF.enabled,
          baseOpeningFeeEur: typeof d.baseOpeningFeeEur === 'number' ? d.baseOpeningFeeEur : DEFAULT_KM_TARIFF.baseOpeningFeeEur,
          perKmRateEur: typeof d.perKmRateEur === 'number' ? d.perKmRateEur : DEFAULT_KM_TARIFF.perKmRateEur,
          minimumFeeEur: typeof d.minimumFeeEur === 'number' ? d.minimumFeeEur : DEFAULT_KM_TARIFF.minimumFeeEur,
          roundTripDiscountPercent: typeof d.roundTripDiscountPercent === 'number' ? d.roundTripDiscountPercent : DEFAULT_KM_TARIFF.roundTripDiscountPercent,
        };
      }
    }
  } catch {
    // fallback
  }

  // 2. Supabase fallback
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'km_tariff')
        .single();

      if (!error && data?.value && typeof data.value === 'object') {
        const d = data.value;
        return {
          enabled: typeof d.enabled === 'boolean' ? d.enabled : DEFAULT_KM_TARIFF.enabled,
          baseOpeningFeeEur: typeof d.baseOpeningFeeEur === 'number' ? d.baseOpeningFeeEur : DEFAULT_KM_TARIFF.baseOpeningFeeEur,
          perKmRateEur: typeof d.perKmRateEur === 'number' ? d.perKmRateEur : DEFAULT_KM_TARIFF.perKmRateEur,
          minimumFeeEur: typeof d.minimumFeeEur === 'number' ? d.minimumFeeEur : DEFAULT_KM_TARIFF.minimumFeeEur,
          roundTripDiscountPercent: typeof d.roundTripDiscountPercent === 'number' ? d.roundTripDiscountPercent : DEFAULT_KM_TARIFF.roundTripDiscountPercent,
        };
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function saveKmTariff(tariff: KmTariff): void {
  try {
    localStorage.setItem(KM_TARIFF_STORAGE_KEY, JSON.stringify(tariff));

    // 1. Sync with server API
    fetch('/api/settings/km_tariff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tariff),
    }).catch((e) => console.warn('Could not persist km_tariff to server API:', e));

    // 2. Sync with Supabase
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase
          .from('settings')
          .upsert({ key: 'km_tariff', value: tariff })
      )
        .then(({ error }) => {
          if (error) console.warn('Could not persist km_tariff to Supabase:', error);
        })
        .catch(() => {});
    }

    window.dispatchEvent(new Event('transferRatesUpdated'));
  } catch (err) {
    console.error('Failed to save km tariff:', err);
  }
}

export function resetKmTariff(): KmTariff {
  try {
    localStorage.setItem(KM_TARIFF_STORAGE_KEY, JSON.stringify(DEFAULT_KM_TARIFF));
    window.dispatchEvent(new Event('transferRatesUpdated'));
    return DEFAULT_KM_TARIFF;
  } catch {
    return DEFAULT_KM_TARIFF;
  }
}

export interface RoutePriceResult {
  isPredefined: boolean;
  zone: TransferZone | null;
  oneWayPriceEur: number | null;
  roundTripPriceEur: number | null;
  activePriceEur: number | null;
  distanceKm: number;
  durationMins: number;
  routeLabel: string;
  notes?: string;
  tariffApplied?: 'fixed_zone' | 'km_tariff';
}

export function calculateRoutePrice(
  pickup: string,
  dropoff: string,
  tripType: 'oneway' | 'roundtrip' | 'hourly',
  zones: TransferZone[] = getTransferZones(),
  coordsA?: { lat: number; lng: number } | null,
  coordsB?: { lat: number; lng: number } | null,
  realRoadKm?: number | null,
  realDurationMins?: number | null
): RoutePriceResult {
  const p = pickup.toLowerCase();
  const d = dropoff.toLowerCase();
  const tariff = getKmTariff();

  const isPickupBJV = p.includes('milas') || p.includes('havaliman') || p.includes('bjv') || p.includes('airport') || p.includes('ekinanbarı');
  const isDropoffBJV = d.includes('milas') || d.includes('havaliman') || d.includes('bjv') || d.includes('airport') || d.includes('ekinanbarı');

  // Helper to normalize strings for robust matching
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Better Zone Matching Logic (Matches most specific name first)
  const findBestZoneMatch = (text: string) => {
    const t = text.toLowerCase();
    const nt = norm(t);
    
    // Sort zones by length descending to match more specific names first (e.g. "Göltürkbükü" before "Bodrum")
    const sortedZones = [...zones].sort((a, b) => b.name.length - a.name.length);
    
    // Try exact or starts-with match (normalized)
    for (const z of sortedZones) {
      const nz = norm(z.name);
      // Check if text starts with zone name or is an exact match
      // We also check for the full name match
      if (nt === nz || nt.startsWith(nz) || t.includes(z.name.toLowerCase())) {
        // If it matches "Bodrum", ensure it's not actually a more specific zone like "Yalıkavak, Bodrum"
        // This is handled by the sorting (most specific first)
        return z;
      }
    }
    
    // Fallback: Popular spots
    for (const z of sortedZones) {
      if ((z.popularSpots || []).some((spot) => t.includes(spot.toLowerCase()))) {
        return z;
      }
    }
    return null;
  };

  const matchedZone = findBestZoneMatch(p) || findBestZoneMatch(d);

  // Calculate distance if custom coordinates are provided
  let calculatedKm: number | null = realRoadKm || null;
  let calculatedMins: number | null = realDurationMins || null;

  if (calculatedKm === null && coordsA && coordsB) {
    const R = 6371;
    const dLat = ((coordsB.lat - coordsA.lat) * Math.PI) / 180;
    const dLon = ((coordsB.lng - coordsA.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coordsA.lat * Math.PI) / 180) *
        Math.cos((coordsB.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    calculatedKm = Math.max(3, Math.round(straightKm * 1.36 * 10) / 10);
    calculatedMins = Math.max(8, Math.round(calculatedKm * 1.15));
  }

  // Helper to compute price based on km tariff (Round to 1 EUR for better precision)
  const computeByKm = (distKm: number): { oneWay: number; roundTrip: number } => {
    const rawOneWay = tariff.baseOpeningFeeEur + distKm * tariff.perKmRateEur;
    const oneWay = Math.max(tariff.minimumFeeEur, Math.round(rawOneWay));
    const discountMultiplier = (200 - tariff.roundTripDiscountPercent) / 100;
    const roundTrip = Math.round(oneWay * discountMultiplier);
    return { oneWay, roundTrip };
  };

  // 1. Didim specific: Didim <-> Milas-Bodrum Havalimanı (Fixed Premium Route)
  if ((p.includes('didim') && isDropoffBJV) || (isPickupBJV && d.includes('didim'))) {
    const didimZone = zones.find((z) => z.id === 'didim') || DEFAULT_TRANSFER_ZONES.find((z) => z.id === 'didim')!;
    const dist = calculatedKm || didimZone.distanceKm;
    const duration = calculatedMins || didimZone.durationMins;
    const oneWay = didimZone.oneWayPriceEur;
    const roundTrip = didimZone.roundTripPriceEur;
    return {
      isPredefined: true,
      zone: didimZone,
      oneWayPriceEur: oneWay,
      roundTripPriceEur: roundTrip,
      activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
      distanceKm: dist,
      durationMins: duration,
      routeLabel: isPickupBJV ? `Milas-Bodrum Havalimanı → Didim` : `Didim → Milas-Bodrum Havalimanı`,
      tariffApplied: 'fixed_zone',
    };
  }

  // 2. Predefined route between Airport and one of our Bodrum zones
  if ((isPickupBJV || isDropoffBJV) && matchedZone) {
    const dist = calculatedKm || matchedZone.distanceKm;
    const duration = calculatedMins || matchedZone.durationMins;

    // Logic: If Km Tariff is enabled AND it looks like a specific address (not just a broad zone request), 
    // we use KM calculation for precision.
    const nonAirportText = isPickupBJV ? d : p;
    const isSpecificPoint = nonAirportText.includes(',') || nonAirportText.split(' ').length > 2;
    
    if (tariff.enabled && isSpecificPoint) {
      const { oneWay, roundTrip } = computeByKm(dist);
      return {
        isPredefined: true,
        zone: matchedZone,
        oneWayPriceEur: oneWay,
        roundTripPriceEur: roundTrip,
        activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
        distanceKm: dist,
        durationMins: duration,
        routeLabel: isPickupBJV
          ? `Milas-Bodrum Havalimanı → ${formatShortLocation(nonAirportText)}`
          : `${formatShortLocation(nonAirportText)} → Milas-Bodrum Havalimanı`,
        notes: `${dist} km özel adres mesafesi üzerinden km başına ${tariff.perKmRateEur} € tarife ile hesaplandı.`,
        tariffApplied: 'km_tariff',
      };
    } else {
      // Standard fixed zone price for broad selection
      const oneWay = matchedZone.oneWayPriceEur;
      const roundTrip = matchedZone.roundTripPriceEur;
      return {
        isPredefined: true,
        zone: matchedZone,
        oneWayPriceEur: oneWay,
        roundTripPriceEur: roundTrip,
        activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
        distanceKm: dist,
        durationMins: duration,
        routeLabel: isPickupBJV
          ? `Milas-Bodrum Havalimanı → ${matchedZone.name}`
          : `${matchedZone.name} → Milas-Bodrum Havalimanı`,
        tariffApplied: 'fixed_zone',
      };
    }
  }

  // 3. Known zones inter-district peninsula transfer (e.g. Yalıkavak ↔ Türkbükü)
  const zone1 = findBestZoneMatch(p);
  const zone2 = findBestZoneMatch(d);
  if (zone1 && zone2 && zone1.id !== zone2.id) {
    const dist = calculatedKm || 22;
    const duration = calculatedMins || Math.round(dist * 1.15);

    if (tariff.enabled) {
      const { oneWay, roundTrip } = computeByKm(dist);
      return {
        isPredefined: true,
        zone: zone2,
        oneWayPriceEur: oneWay,
        roundTripPriceEur: roundTrip,
        activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
        distanceKm: dist,
        durationMins: duration,
        routeLabel: `${zone1.name} ↔ ${zone2.name}`,
        notes: `${dist} km ara güzergâh mesafesi üzerinden km başına ${tariff.perKmRateEur} € tarife hesaplandı.`,
        tariffApplied: 'km_tariff',
      };
    } else {
      const oneWay = Math.max(zone1.oneWayPriceEur, zone2.oneWayPriceEur);
      const roundTrip = Math.max(zone1.roundTripPriceEur, zone2.roundTripPriceEur);
      return {
        isPredefined: true,
        zone: zone2,
        oneWayPriceEur: oneWay,
        roundTripPriceEur: roundTrip,
        activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
        distanceKm: dist,
        durationMins: duration,
        routeLabel: `${zone1.name} ↔ ${zone2.name}`,
        notes: `Sabit bölge paket tarifesi uygulandı (km tarifesi kapalı).`,
        tariffApplied: 'fixed_zone',
      };
    }
  }

  // 4. Dynamic calculation for custom address routes based on actual Km Tariff
  const dist = calculatedKm || 38;
  const duration = calculatedMins || Math.max(10, Math.round(dist * 1.15));

  if (tariff.enabled) {
    const { oneWay, roundTrip } = computeByKm(dist);
    return {
      isPredefined: true,
      zone: matchedZone || null,
      oneWayPriceEur: oneWay,
      roundTripPriceEur: roundTrip,
      activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
      distanceKm: dist,
      durationMins: duration,
      routeLabel: `${formatShortLocation(pickup)} → ${formatShortLocation(dropoff)}`,
      notes: `${dist} km yol mesafesi üzerinden km başına ${tariff.perKmRateEur} € tarife ile hesaplandı.`,
      tariffApplied: 'km_tariff',
    };
  } else {
    const fallbackZone = matchedZone || zones.find((z) => z.id === 'bodrum-merkez') || zones[0];
    const oneWay = fallbackZone ? fallbackZone.oneWayPriceEur : 55;
    const roundTrip = fallbackZone ? fallbackZone.roundTripPriceEur : 100;
    return {
      isPredefined: true,
      zone: fallbackZone || null,
      oneWayPriceEur: oneWay,
      roundTripPriceEur: roundTrip,
      activePriceEur: tripType === 'roundtrip' ? roundTrip : oneWay,
      distanceKm: dist,
      durationMins: duration,
      routeLabel: `${formatShortLocation(pickup)} → ${formatShortLocation(dropoff)}`,
      notes: fallbackZone
        ? `${fallbackZone.name} sabit bölge paket tarifesi uygulandı (km tarifesi kapalı).`
        : `Standart sabit VIP transfer tarifesi uygulandı (km tarifesi kapalı).`,
      tariffApplied: 'fixed_zone',
    };
  }
}

export interface RouteMapPoints {
  pointA: { name: string; coords: [number, number] };
  pointB: { name: string; coords: [number, number] };
  path: [number, number][];
}

export const WAYPOINTS: Record<string, [number, number]> = {
  airport: [37.2506, 27.6643],
  dorttepe: [37.1850, 27.6050],
  guvercinlik: [37.1325, 27.5750],
  torba: [37.0811, 27.4589],
  yalikavak: [37.1042, 27.2958],
  bodrum: [37.0344, 27.4305],
  turkbuku: [37.1264, 27.3892],
  gundogan: [37.1333, 27.3417],
  gumusluk: [37.0544, 27.2344],
  turgutreis: [37.0017, 27.2592],
  bitez: [37.0278, 27.3828],
};

export const KNOWN_LOCATION_COORDS: Record<string, [number, number]> = {
  // Havalimanları
  'milas': [37.2506, 27.6643],
  'havaliman': [37.2506, 27.6643],
  'bjv': [37.2506, 27.6643],
  'airport': [37.2506, 27.6643],
  'ekinanbarı': [37.2506, 27.6643],
  'dalaman': [36.7133, 28.7925],
  'dlm': [36.7133, 28.7925],
  'izmir': [38.2924, 27.1570],
  'adnan menderes': [38.2924, 27.1570],
  'antalya': [36.8969, 30.7133],

  // Bodrum Bölgeleri & Marinalar
  'yalikavak': [37.1042, 27.2958],
  'yalıkavak': [37.1042, 27.2958],
  'marina': [37.1042, 27.2958],
  'bodrum': [37.0344, 27.4305],
  'bodrum merkez': [37.0344, 27.4305],
  'kale': [37.0317, 27.4297],
  'milta': [37.0344, 27.4250],
  'torba': [37.0811, 27.4589],
  'turkbuku': [37.1264, 27.3892],
  'türkbükü': [37.1264, 27.3892],
  'golturkbuku': [37.1264, 27.3892],
  'göltürkbükü': [37.1264, 27.3892],
  'cennet koyu': [37.1350, 27.3950],
  'gundogan': [37.1333, 27.3417],
  'gündoğan': [37.1333, 27.3417],
  'gumusluk': [37.0544, 27.2344],
  'gümüşlük': [37.0544, 27.2344],
  'turgutreis': [37.0017, 27.2592],
  'd-marin': [37.0017, 27.2592],
  'ortakent': [37.0512, 27.3524],
  'yahsi': [37.0333, 27.3417],
  'yahşi': [37.0333, 27.3417],
  'bitez': [37.0278, 27.3828],
  'gumbet': [37.0315, 27.4042],
  'gümbet': [37.0315, 27.4042],
  'guvercinlik': [37.1325, 27.5750],
  'güvercinlik': [37.1325, 27.5750],
  'meselik': [37.1400, 27.5800],
  'meşelik': [37.1400, 27.5800],
  'dorttepe': [37.1850, 27.6050],
  'dörttepe': [37.1850, 27.6050],
  'didim': [37.3833, 27.2667],
  'altinkum': [37.3620, 27.2850],
  'altınkum': [37.3620, 27.2850],
  'akbuk': [37.3970, 27.4240],
  'akbük': [37.3970, 27.4240],
  'marmaris': [36.8550, 28.2742],
  'fethiye': [36.6500, 29.1167],
  'kusadasi': [37.8579, 27.2610],
  'kuşadası': [37.8579, 27.2610],

  // Popüler Oteller
  'mandarin': [37.1264, 27.3892],
  'edition': [37.0950, 27.3200],
  'lujo': [37.1350, 27.5650],
  'titanic': [37.1325, 27.5750],
  'caresse': [37.0250, 27.3980],
  'vogue': [37.0811, 27.4589],
  'rixos': [37.0850, 27.4600],
  'kempinski': [36.9850, 27.4400],
  'amanruya': [37.1100, 27.4050],
  'macakizi': [37.1300, 27.3900],
  'maçakızı': [37.1300, 27.3900],
  'susona': [37.0890, 27.4650],
  'mivara': [37.1340, 27.3450],
  'swissotel': [37.0017, 27.2592],
  'ramada': [37.0300, 27.3900],

  // Koylar, Mahalleler & Plajlar
  'tilkicik': [37.1042, 27.2958],
  'kudur': [37.1120, 27.2850],
  'küdür': [37.1120, 27.2850],
  'geris': [37.0880, 27.2850],
  'geriş': [37.0880, 27.2850],
  'akyarlar': [36.9667, 27.2833],
  'karaincir': [36.9650, 27.2900],
  'koyunbaba': [37.0720, 27.2500],
  'gumuskaya': [37.0800, 27.2450],
  'gümüşkaya': [37.0800, 27.2450],
  'kucukbuk': [37.1350, 27.3550],
  'küçükbük': [37.1350, 27.3550],
  'hebil': [37.1310, 27.3750],
  'usuluk': [37.0811, 27.4589],
  'kumbahce': [37.0344, 27.4350],
  'kumbahçe': [37.0344, 27.4350],
  'eskicesme': [37.0350, 27.4200],
  'eskiçeşme': [37.0350, 27.4200],
  'carsi': [37.0344, 27.4305],
  'çarşı': [37.0344, 27.4305],
  'yokusbasi': [37.0420, 27.4420],
  'yokuşbaşı': [37.0420, 27.4420],
  'konacik': [37.0450, 27.3950],
  'konacık': [37.0450, 27.3950],
  'asarlik': [37.0250, 27.3980],
  'asarlık': [37.0250, 27.3980],
  'aktur': [37.0180, 27.3750],
  'aktür': [37.0180, 27.3750],
  'kizilagac': [36.9950, 27.4700],
  'kızılağaç': [36.9950, 27.4700],
  'yali': [36.9850, 27.5300],
  'yalı': [36.9850, 27.5300],
  'yaliciftlik': [36.9850, 27.5300],
  'yalıçiftlik': [36.9850, 27.5300],
  'mumcular': [37.0780, 27.6850],
  'oren': [37.0350, 27.9700],
  'ören': [37.0350, 27.9700],
};

function normalizeLocText(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function resolveLocationCoords(
  text: string,
  zones: TransferZone[] = getTransferZones(),
  fallback: [number, number] = [37.0344, 27.4305]
): [number, number] {
  if (!text || !text.trim()) return fallback;
  const rawLower = text.toLowerCase().trim();
  const norm = normalizeLocText(text);

  // 1. Direct match in KNOWN_LOCATION_COORDS
  for (const [key, coords] of Object.entries(KNOWN_LOCATION_COORDS)) {
    const normKey = normalizeLocText(key);
    if (rawLower.includes(key) || norm.includes(normKey)) {
      return coords;
    }
  }

  // 2. Match in transfer zones
  const matchedZone = zones.find((z) => {
    const zName = z.name.toLowerCase();
    const zFull = (z.fullName || '').toLowerCase();
    const normZName = normalizeLocText(z.name);
    const hasSpot = (z.popularSpots || []).some((s) => {
      const normSpot = normalizeLocText(s);
      return rawLower.includes(s.toLowerCase()) || norm.includes(normSpot);
    });
    return (
      rawLower.includes(zName) ||
      rawLower.includes(zFull) ||
      norm.includes(normZName) ||
      hasSpot
    );
  });
  if (matchedZone) {
    return [matchedZone.lat, matchedZone.lng];
  }

  return fallback;
}

export function getRoutePolylineAndPoints(
  pickup: string,
  dropoff: string,
  zones: TransferZone[] = getTransferZones(),
  customCoordsA?: [number, number] | null,
  customCoordsB?: [number, number] | null
): RouteMapPoints {
  const p = pickup.trim();
  const d = dropoff.trim();

  const coordsA: [number, number] = customCoordsA || resolveLocationCoords(p, zones, WAYPOINTS.airport);
  const coordsB: [number, number] = customCoordsB || resolveLocationCoords(d, zones, WAYPOINTS.yalikavak);

  const nameA = p || 'Kalkış Noktası';
  const nameB = d || 'Varış Bölgesi';

  // Backbone route segments if routing from airport to zones or across peninsula
  const isA_Airport = p.toLowerCase().includes('milas') || p.toLowerCase().includes('havaliman') || p.toLowerCase().includes('bjv') || p.toLowerCase().includes('airport');
  const isB_Airport = d.toLowerCase().includes('milas') || d.toLowerCase().includes('havaliman') || d.toLowerCase().includes('bjv') || d.toLowerCase().includes('airport');

  let path: [number, number][] = [coordsA, coordsB];

  if (isA_Airport && !isB_Airport) {
    path = [coordsA, WAYPOINTS.dorttepe, WAYPOINTS.guvercinlik, WAYPOINTS.torba, coordsB];
  } else if (!isA_Airport && isB_Airport) {
    path = [coordsA, WAYPOINTS.torba, WAYPOINTS.guvercinlik, WAYPOINTS.dorttepe, coordsB];
  } else {
    // Both on peninsula or custom
    path = [coordsA, coordsB];
  }

  return {
    pointA: { name: nameA, coords: coordsA },
    pointB: { name: nameB, coords: coordsB },
    path,
  };
}

/**
 * Shortens a full verbose address into a clean, recognizable location label
 * e.g. "Gümbet, Adnan Menderes Cd. No: 8/D, 48400 Bodrum/Muğla, Türkiye" -> "Gümbet"
 */
export function formatShortLocation(raw: string): string {
  if (!raw || !raw.trim()) return 'Belirtilmedi';
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // Known airports
  if (lower.includes('milas') || lower.includes('bjv') || (lower.includes('havaliman') && !lower.includes('dalaman') && !lower.includes('izmir'))) {
    return 'Milas-Bodrum Havalimanı (BJV)';
  }
  if (lower.includes('dalaman') || lower.includes('dlm')) {
    return 'Dalaman Havalimanı (DLM)';
  }
  if (lower.includes('izmir') || lower.includes('adnan menderes')) {
    return 'İzmir Havalimanı (ADB)';
  }
  if (lower.includes('antalya')) {
    return 'Antalya Havalimanı (AYT)';
  }

  // Strip redundant country, province, postal codes
  const clean = trimmed
    .replace(/,?\s*\b\d{5}\b/g, '')
    .replace(/,?\s*Bodrum\s*\/?\s*Muğla/gi, '')
    .replace(/,?\s*Muğla/gi, '')
    .replace(/,?\s*Türkiye/gi, '')
    .replace(/,?\s*Turkey/gi, '')
    .trim();

  // Split by comma
  const parts = clean.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return trimmed.slice(0, 30);
  
  // Return the main district or place name, e.g. "Gümbet" or "Yalıkavak Marina"
  return parts[0];
}

