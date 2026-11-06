import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Clock,
  Users,
  Compass,
  ArrowRight,
  Loader2,
  ShieldCheck,
  X,
  ChevronDown,
} from 'lucide-react';
import { WhatsAppIcon } from './Nav';
import { waLink, COUNTRY_CODES } from '@/lib/contact';
import { getPageSettings } from '@/lib/pageSettings';
import { scrollToVehicle } from '@/lib/scrollHelper';
import {
  getTransferZones,
  calculateRoutePrice,
  getRoutePolylineAndPoints,
  resolveLocationCoords,
  formatShortLocation,
  TransferZone,
  AIRPORT_BASE,
  RoutePriceResult,
  getKmTariff,
} from '@/lib/transferPricing';
import { fetchOsrmDrivingRoute, OsrmRouteResult } from '@/lib/osrmRouting';
import BookingRouteMap, { VehicleCardItem } from './BookingRouteMap';
import PlaceAutocompleteInput, { VerifiedPlace } from './PlaceAutocompleteInput';
import { supabase } from '@/lib/supabase';
import { useLanguage, localizeVehicle } from '@/lib/translations';

const VEHICLES: VehicleCardItem[] = [
  {
    key: 'maybach-design',
    name: 'Mercedes-Benz Maybach Design',
    subTitle: 'Ultra Lüks Tasarım (1-4 Kişi)',
    capacity: '1-4 Yolcu',
    luggage: '3-4 Valiz',
    multiplier: 1.4,
    image: '/images/fleet_maybach_interior.jpg',
    features: ['Starlight Yıldız Tavan', 'Apple TV & 4K Ekran', 'Masajlı Kaptan Koltuk', 'Nespresso Kahve Barı'],
  },
  {
    key: 'premium-van',
    name: 'Mercedes-Vito Premimum van',
    subTitle: 'Executive VIP Lounge (1-6 Kişi)',
    capacity: '1-6 Yolcu',
    luggage: '5-6 Valiz',
    multiplier: 1.15,
    image: 'https://files.catbox.moe/67nc8m.jpeg',
    features: ['VIP Lounge Oturma Düzeni', 'Nespresso Kahve & Wi-Fi', 'Multimedya Eğlence', 'Genişletilmiş Bagaj'],
  },
  {
    key: 'vip-sprinter',
    name: 'Mercedes-Benz Sprinter vip',
    subTitle: 'Özel VIP Lounge Sprinter (6-13 Kişi)',
    capacity: '6-13 Yolcu',
    luggage: '10-14 Valiz',
    multiplier: 1.7,
    image: 'https://files.catbox.moe/nzqk36.jpeg',
    features: ['VIP Lounge Koltuk Düzeni', '4K Multimedya Ekran TV', 'Mini Buzdolabı & İkram', 'Ekstra Geniş Diz Mesafesi'],
  },
  {
    key: 'ultra-vip-sprinter',
    name: 'Mercedes-Benz Sprinter Ultra VIP',
    subTitle: 'Mobil Toplantı & Boardroom (6-16 Kişi)',
    capacity: '6-16 Yolcu',
    luggage: '14-18 Valiz',
    multiplier: 1.9,
    image: 'https://files.catbox.moe/j7mbxr.jpeg',
    features: ['Toplantı Masası & Konferans', 'Özel Minibar & Bar', 'Fiber Optik Starlight Tavan', 'VIP Hostes / Asistanlık Desteği'],
  },
];

export default function SmartBookingEngine() {
  const { t } = useLanguage();
  const [pageSettings, setPageSettings] = useState(() => getPageSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setPageSettings(getPageSettings());
    };
    window.addEventListener('pageSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', handleSettingsUpdate);
  }, []);

  const dynamicVehicles = useMemo(() => {
    return VEHICLES.map((v) => {
      const match = pageSettings.fleet?.find((f) => {
        const fid = f.id.toLowerCase();
        const fname = f.name.toLowerCase();
        const vkey = v.key.toLowerCase();
        if (fid.includes(vkey) || fname.includes(vkey)) return true;
        if (v.key === 'premium-van' && fname.includes('premium van')) return true;
        if (v.key === 'maybach-design' && fname.includes('maybach')) return true;
        if (v.key === 'vip-sprinter' && fname.includes('vip sprinter') && !fname.includes('ultra')) return true;
        if (v.key === 'ultra-vip-sprinter' && fname.includes('ultra vip')) return true;
        return false;
      });
      
      const baseVehicle = match ? {
        ...v,
        name: v.name,
        image: match.images?.[0] || v.image, // Use the cover image from pageSettings fleet
        specs: match.specs || v.features.join(' • '),
      } : v;

      return localizeVehicle(baseVehicle, t);
    });
  }, [pageSettings.fleet, t]);

  const [zones, setZones] = useState<TransferZone[]>(getTransferZones);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip' | 'hourly'>('oneway');

  const [pickup, setPickup] = useState(AIRPORT_BASE.name);
  const [dropoff, setDropoff] = useState('Bodrum Merkez');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>({
    lat: AIRPORT_BASE.lat,
    lng: AIRPORT_BASE.lng,
  });
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 37.0344,
    lng: 27.4305,
  });
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [hourlyDuration, setHourlyDuration] = useState('4');
  const [passengers, setPassengers] = useState('1-4 Kişi (Lüks VIP)');

  // Client contact info (clean state, supports browser & mobile autofill)
  const [clientName, setClientName] = useState(() => {
    try {
      const saved = localStorage.getItem('mert_vip_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !parsed.name.includes('Mert Yılmaz')) return parsed.name;
        // Purge legacy dummy default
        localStorage.removeItem('mert_vip_guest_info');
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [clientPhoneInit] = useState(() => {
    let savedPhone = '';
    try {
      const saved = localStorage.getItem('mert_vip_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone && !parsed.phone.includes('539 440 78 23')) savedPhone = parsed.phone;
      }
    } catch {
      // ignore
    }

    let cc = '+90';
    let body = '';
    const full = savedPhone || '+905';

    const match = COUNTRY_CODES.find((c) => full.startsWith(c.code));
    if (match) {
      cc = match.code;
      body = full.slice(match.code.length);
    } else {
      body = full;
    }

    if (!savedPhone) {
      body = '5';
    }

    return { full, cc, body };
  });

  const [clientPhoneCC, setClientPhoneCC] = useState(clientPhoneInit.cc);
  const [clientPhoneBody, setClientPhoneBody] = useState(clientPhoneInit.body);
  const [clientPhone, setClientPhone] = useState(clientPhoneInit.full);

  // Sync combined clientPhone when parts change
  useEffect(() => {
    const combined = `${clientPhoneCC}${clientPhoneBody}`;
    if (clientPhone !== combined) {
      setClientPhone(combined);
    }
  }, [clientPhoneCC, clientPhoneBody, clientPhone]);

  const [clientEmail, setClientEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('mert_vip_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && !parsed.email.includes('bugunjest')) return parsed.email;
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [specialRequests, setSpecialRequests] = useState('');

  // Sync real guest info to localStorage when entered
  useEffect(() => {
    try {
      if (clientName.trim() || clientPhone.trim() || clientEmail.trim()) {
        if (!clientName.includes('Mert Yılmaz') && !clientPhone.includes('539 440 78 23')) {
          localStorage.setItem(
            'mert_vip_guest_info',
            JSON.stringify({ name: clientName.trim(), phone: clientPhone.trim(), email: clientEmail.trim() })
          );
        }
      }
    } catch {
      // ignore
    }
  }, [clientName, clientPhone, clientEmail]);

  // OSRM Routing and Real-time road distance state
  const [osrmRoute, setOsrmRoute] = useState<OsrmRouteResult | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Calculation Results & Vehicle Display Control
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [isFloatingBarOpen, setIsFloatingBarOpen] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [calculationResult, setCalculationResult] = useState<RoutePriceResult>(() =>
    calculateRoutePrice(AIRPORT_BASE.name, 'Bodrum Merkez', 'oneway', getTransferZones(), { lat: AIRPORT_BASE.lat, lng: AIRPORT_BASE.lng }, { lat: 37.0344, lng: 27.4305 })
  );
  const [selectedVehicle, setSelectedVehicle] = useState<string>('maybach-design');

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize default dates and times
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    const dateStr = localIso.slice(0, 10);
    const timeStr = localIso.slice(11, 16);
    setPickupDate(dateStr);
    setPickupTime(timeStr);

    const ret = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const retIso = new Date(ret.getTime() - ret.getTimezoneOffset() * 60000).toISOString();
    const retDateStr = retIso.slice(0, 10);
    const retTimeStr = retIso.slice(11, 16);
    setReturnDate(retDateStr);
    setReturnTime(retTimeStr);
  }, []);

  // Compute OSRM Driving Route and Per-Kilometer Price whenever pickup or dropoff changes
  useEffect(() => {
    let active = true;

    const pCoords: [number, number] = pickupCoords
      ? [pickupCoords.lat, pickupCoords.lng]
      : resolveLocationCoords(pickup, zones, [37.2506, 27.6643]);

    const dCoords: [number, number] = dropoffCoords
      ? [dropoffCoords.lat, dropoffCoords.lng]
      : resolveLocationCoords(dropoff, zones, [37.1042, 27.2958]);

    setIsRoutingLoading(true);

    fetchOsrmDrivingRoute(pCoords, dCoords)
      .then((routeRes) => {
        if (!active) return;
        setOsrmRoute(routeRes);
        setIsRoutingLoading(false);

        const priceResult = calculateRoutePrice(
          pickup,
          dropoff,
          tripType,
          zones,
          { lat: pCoords[0], lng: pCoords[1] },
          { lat: dCoords[0], lng: dCoords[1] },
          routeRes.distanceKm,
          routeRes.durationMins
        );
        setCalculationResult(priceResult);
      })
      .catch(() => {
        if (!active) return;
        setIsRoutingLoading(false);
        const fallbackPrice = calculateRoutePrice(
          pickup,
          dropoff,
          tripType,
          zones,
          { lat: pCoords[0], lng: pCoords[1] },
          { lat: dCoords[0], lng: dCoords[1] }
        );
        setCalculationResult(fallbackPrice);
      });

    return () => {
      active = false;
    };
  }, [pickup, dropoff, tripType, zones, pickupCoords, dropoffCoords]);

  // Sync zones and recalculate prices when admin updates them or km tariff
  useEffect(() => {
    const handleUpdate = () => {
      const updatedZones = getTransferZones();
      setZones(updatedZones);

      const pCoords: [number, number] = pickupCoords
        ? [pickupCoords.lat, pickupCoords.lng]
        : resolveLocationCoords(pickup, updatedZones, [37.2506, 27.6643]);

      const dCoords: [number, number] = dropoffCoords
        ? [dropoffCoords.lat, dropoffCoords.lng]
        : resolveLocationCoords(dropoff, updatedZones, [37.1042, 27.2958]);

      const priceResult = calculateRoutePrice(
        pickup,
        dropoff,
        tripType,
        updatedZones,
        { lat: pCoords[0], lng: pCoords[1] },
        { lat: dCoords[0], lng: dCoords[1] },
        osrmRoute?.distanceKm,
        osrmRoute?.durationMins
      );
      setCalculationResult(priceResult);
    };

    window.addEventListener('transferRatesUpdated', handleUpdate);
    return () => window.removeEventListener('transferRatesUpdated', handleUpdate);
  }, [pickup, dropoff, tripType, pickupCoords, dropoffCoords, osrmRoute]);

  // Listen for Live Map selection events
  useEffect(() => {
    const handleMapSelection = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { pickup: mapPickup, dropoff: mapDropoff, zone } = customEvent.detail;
        if (mapPickup) setPickup(mapPickup);
        if (mapDropoff) setDropoff(mapDropoff);
        if (zone) {
          setDropoffCoords({ lat: zone.lat, lng: zone.lng });
        }
        setCalculated(false);
      }
    };
    window.addEventListener('selectTransferRegion', handleMapSelection);
    return () => window.removeEventListener('selectTransferRegion', handleMapSelection);
  }, []);

  // Listen for Auto-Select Vehicle event
  useEffect(() => {
    const handleVehicleSelection = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.vehicleKey) {
        setSelectedVehicle(customEvent.detail.vehicleKey);
      }
    };
    window.addEventListener('selectVehicle', handleVehicleSelection);
    return () => window.removeEventListener('selectVehicle', handleVehicleSelection);
  }, []);

  const handleCalculate = React.useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    setCalculated(false);

    setTimeout(() => {
      setIsCalculating(false);
      setCalculated(true);
      setShowVehicles(true);
      setIsFloatingBarOpen(true);
      setTimeout(() => {
        scrollToVehicle(selectedVehicle, 'booking');
      }, 150);
    }, 250);
  }, [selectedVehicle]);

  // Listen for Trigger Calculation event
  useEffect(() => {
    const handleTriggerCalc = () => {
      handleCalculate();
    };
    window.addEventListener('triggerCalculation', handleTriggerCalc);
    return () => window.removeEventListener('triggerCalculation', handleTriggerCalc);
  }, [handleCalculate]);

  // Calculate Euro price for a vehicle
  const getVehiclePriceEur = (vehicleKey: string): number | null => {
    // If no destination address, return 0
    if (!dropoff || dropoff.trim() === '') return 0;
    
    const foundVehicle = dynamicVehicles.find((v) => v.key === vehicleKey) || dynamicVehicles[0];
    const multiplier = foundVehicle?.multiplier ?? 1.0;
    
    if (tripType === 'hourly') {
      const hrs = parseInt(hourlyDuration, 10) || 4;
      // Hourly rate: Base 70 €/hr scaled by vehicle multiplier
      const hourlyBase = Math.round(70 * multiplier);
      return hrs * hourlyBase;
    }

    if (!calculationResult.isPredefined || calculationResult.activePriceEur === null) {
      return null;
    }

    const baseEuro = calculationResult.activePriceEur;
    return Math.round(baseEuro * multiplier);
  };

  const selectedVehicleObj = dynamicVehicles.find((v) => v.key === selectedVehicle) || dynamicVehicles[0] || VEHICLES[0];
  const finalPriceEur = getVehiclePriceEur(selectedVehicle);

  const safeOriginCoords: [number, number] = pickupCoords
    ? [pickupCoords.lat, pickupCoords.lng]
    : resolveLocationCoords(pickup, zones, [37.2506, 27.6643]);

  const safeDestCoords: [number, number] = dropoffCoords
    ? [dropoffCoords.lat, dropoffCoords.lng]
    : resolveLocationCoords(dropoff, zones, [37.1042, 27.2958]);

  const routeData = {
    pointA: { name: pickup, coords: safeOriginCoords },
    pointB: { name: dropoff, coords: safeDestCoords },
    path: osrmRoute?.path || getRoutePolylineAndPoints(pickup, dropoff, zones).path,
  };

  // WhatsApp Reservation Direct Handler
  const handleBookViaWhatsApp = () => {
    const cleanName = clientName.trim();
    const cleanPhone = clientPhoneBody.trim();

    if (!cleanName) {
      alert('Lütfen adınızı ve soyadınızı giriniz.');
      document.getElementById('smart-client-name')?.focus();
      return;
    }
    if (!cleanPhone || cleanPhone.length < 6) {
      alert('Lütfen geçerli bir telefon numarası giriniz.');
      document.getElementById('smart-client-phone')?.focus();
      return;
    }

    let tripTypeName = 'Tek Yön VIP Transfer';
    if (tripType === 'roundtrip') tripTypeName = 'Gidiş - Dönüş Transfer (İndirimli)';
    if (tripType === 'hourly') tripTypeName = `${hourlyDuration} Saatlik Şoförlü VIP Tahsis`;

    const dropoffText = tripType === 'hourly' ? `${hourlyDuration} Saatlik Özel Tahsis` : dropoff;
    const nameText = clientName.trim() || 'Değerli Misafir';
    const pickupDatetime = `${pickupDate} ${pickupTime}`.trim();
    const returnDatetime = `${returnDate} ${returnTime}`.trim();

    const priceText = finalPriceEur !== null ? `${finalPriceEur} €` : 'Özel Rota Teklifi';

    const pickupFull = pickupAddress && pickupAddress !== pickup ? `${pickup} (${pickupAddress})` : pickup;
    const dropoffFull = dropoffAddress && dropoffAddress !== dropoffText ? `${dropoffText} (${dropoffAddress})` : dropoffText;

    // Google Haritalar canlı rota linki her zaman rezervasyon mesajına eklenir
    const gmapsRouteLink = `https://www.google.com/maps/dir/?api=1&origin=${safeOriginCoords[0]},${safeOriginCoords[1]}&destination=${safeDestCoords[0]},${safeDestCoords[1]}`;
    const locationLinksSection = `\n🗺️ *Google Haritalar Canlı Rota:*\n${gmapsRouteLink}`;

    // Save to Supabase & localStorage for Admin Panel
    try {
      const bookingId = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newBooking = {
        id: bookingId,
        clientName: nameText,
        phone: clientPhone || 'WhatsApp üzerinden',
        email: clientEmail || '',
        pickup: pickupFull,
        dropoff: dropoffFull,
        datetime: pickupDatetime,
        vehicle: selectedVehicleObj.name,
        tripType: tripTypeName,
        passengers,
        priceEur: finalPriceEur,
        status: 'pending',
        notes: specialRequests,
        distanceKm: calculationResult.distanceKm,
        durationMins: calculationResult.durationMins,
        createdAt: new Date().toISOString(),
      };
      
      // 1. LocalStorage fallback
      const existing = localStorage.getItem('mert_vip_reservations');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newBooking);
      localStorage.setItem('mert_vip_reservations', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));

      // 2. Real Supabase Persistence
      supabase.from('reservations').insert({
        name: nameText,
        phone: clientPhone || 'WhatsApp',
        email: clientEmail,
        tour_date: pickupDate, // Map pickup date
        tour_type: tripType === 'hourly' ? 'hourly' : 'transfer',
        guests: parseInt(passengers) || 1,
        notes: `Rota: ${pickupFull} -> ${dropoffFull}\nZaman: ${pickupTime}\nAraç: ${selectedVehicleObj.name}\nÖzel İstek: ${specialRequests}`,
        status: 'pending'
      }).then(({ error }) => {
        if (error) console.error('Supabase reservation error:', error);
      });

    } catch (err) {
      console.warn('Booking persistence error:', err);
    }

    const message = `✨ *MERT VIP INTERNATIONAL TRANSPORT - TRANSFER REZERVASYONU* ✨
-----------------------------------------
👤 *Misafir:* ${nameText}
📞 *Telefon:* ${clientPhone || 'WhatsApp İletişim'}
${clientEmail ? `📧 *Gmail / E-posta:* ${clientEmail}\n` : ''}📍 *Alış Noktası:* ${pickupFull}
🏁 *Varış / Rota:* ${dropoffFull}
📏 *Yol Mesafesi:* ~${calculationResult.distanceKm} km (Tahmini ~${calculationResult.durationMins} dk)${locationLinksSection}
📅 *Transfer Tarihi:* ${pickupDatetime}
${tripType === 'roundtrip' ? `🔁 *Dönüş Tarihi:* ${returnDatetime}\n` : ''}🚘 *Seçilen VIP Araç:* ${selectedVehicleObj.name}
👥 *Yolcu:* ${passengers}
🔁 *Transfer Tipi:* ${tripTypeName}
💶 *Resmi Fiyat:* ${priceText}
${specialRequests ? `📝 *Özel İstek:* ${specialRequests}\n` : ''}-----------------------------------------
Sayın Yetkili, yukarıdaki güzergah için transferimi rezerve etmek ve VIP karşılama detaylarını teyit etmek istiyorum.`;

    const url = waLink(message);
    window.open(url, '_blank');
  };

  const tariff = getKmTariff();

  return (
    <section id="booking-engine" className="relative bg-ink-950 py-20 px-4 sm:px-6 lg:px-8 border-y border-foam/5">
      <span id="rezervasyon-motoru" className="absolute -top-24" />
      <div ref={containerRef} className="mx-auto max-w-6xl">
        {/* Main Booking Card */}
        <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl">
          {/* Trip Type Selector - Sleek Low-Profile Animated Segmented Control */}
          <div className="flex justify-center mb-7 pt-1">
            <div className="relative inline-flex items-center p-1 rounded-xl bg-ink-950/90 border border-white/10 backdrop-blur-md max-w-lg w-full shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setTripType('oneway');
                  setCalculated(false);
                }}
                className={`relative flex-1 py-1.5 px-1.5 sm:px-3 text-[11px] sm:text-xs md:text-[13px] font-medium transition-colors duration-200 text-center z-10 select-none cursor-pointer flex items-center justify-center ${
                  tripType === 'oneway' ? 'text-ink-950 font-bold' : 'text-foam/70 hover:text-white'
                }`}
              >
                {tripType === 'oneway' && (
                  <motion.div
                    layoutId="tripTypeActivePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brass via-[#E5C98F] to-brass shadow-md shadow-brass/25"
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{t.oneWay}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTripType('roundtrip');
                  setCalculated(false);
                }}
                className={`relative flex-1 py-1.5 px-1.5 sm:px-3 text-[11px] sm:text-xs md:text-[13px] font-medium transition-colors duration-200 text-center z-10 select-none cursor-pointer flex items-center justify-center ${
                  tripType === 'roundtrip' ? 'text-ink-950 font-bold' : 'text-foam/70 hover:text-white'
                }`}
              >
                {tripType === 'roundtrip' && (
                  <motion.div
                    layoutId="tripTypeActivePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brass via-[#E5C98F] to-brass shadow-md shadow-brass/25"
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{t.roundTrip}</span>
                <span
                  className={`absolute -top-2.5 right-1 sm:right-2 z-20 text-[8px] sm:text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full transition-all shadow-md leading-none whitespace-nowrap tracking-tight ${
                    tripType === 'roundtrip'
                      ? 'bg-ink-950 text-brass ring-1 ring-brass/50 shadow-black/40'
                      : 'bg-amber-400 text-ink-950 ring-1 ring-amber-300 shadow-amber-400/25'
                  }`}
                >
                  <span className="sm:hidden">-%{tariff.roundTripDiscountPercent}</span>
                  <span className="hidden sm:inline">{t.roundTripDiscount ? t.roundTripDiscount.replace('{discount}', String(tariff.roundTripDiscountPercent)) : `-${tariff.roundTripDiscountPercent}%`}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTripType('hourly');
                  setCalculated(false);
                }}
                className={`relative flex-1 py-1.5 px-1.5 sm:px-3 text-[11px] sm:text-xs md:text-[13px] font-medium transition-colors duration-200 text-center z-10 select-none cursor-pointer flex items-center justify-center ${
                  tripType === 'hourly' ? 'text-ink-950 font-bold' : 'text-foam/70 hover:text-white'
                }`}
              >
                {tripType === 'hourly' && (
                  <motion.div
                    layoutId="tripTypeActivePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brass via-[#E5C98F] to-brass shadow-md shadow-brass/25"
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{t.hourlyHire}</span>
              </button>
            </div>
          </div>

          {/* Booking Inputs */}
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pickup Location with Free OpenStreetMap & Curated Autocomplete */}
              <PlaceAutocompleteInput
                id="pickup-location"
                label={t.pickupLocation}
                placeholder={t.pickupPlaceholder}
                value={pickup}
                onChange={(val) => {
                  setPickup(val);
                  setCalculated(false);
                  if (val.trim()) {
                    const resolved = resolveLocationCoords(val, zones);
                    setPickupCoords({ lat: resolved[0], lng: resolved[1] });
                  } else {
                    setPickupCoords(null);
                  }
                }}
                onPlaceSelect={(place: VerifiedPlace) => {
                  setPickup(place.name);
                  setPickupCoords({ lat: place.lat, lng: place.lng });
                  setPickupAddress(place.formattedAddress);
                  setCalculated(false);
                }}
                required
                isPickup={true}
                defaultSuggestions={zones.map((z) => z.name)}
              />

              {/* Dropoff Location with Free OpenStreetMap & Curated Autocomplete (Hidden in Hourly Mode) */}
              {tripType !== 'hourly' ? (
                <div className="space-y-1.5">
                  <PlaceAutocompleteInput
                    id="dropoff-location"
                    label={t.dropoffLocation}
                    placeholder={t.dropoffPlaceholder}
                    value={dropoff}
                    onChange={(val) => {
                      setDropoff(val);
                      setCalculated(false);
                      if (val.trim()) {
                        const resolved = resolveLocationCoords(val, zones);
                        setDropoffCoords({ lat: resolved[0], lng: resolved[1] });
                      } else {
                        setDropoffCoords(null);
                      }
                    }}
                    onPlaceSelect={(place: VerifiedPlace) => {
                      setDropoff(place.name);
                      setDropoffCoords({ lat: place.lat, lng: place.lng });
                      setDropoffAddress(place.formattedAddress);
                      setCalculated(false);
                    }}
                    required
                    isPickup={false}
                    defaultSuggestions={zones.map((z) => z.name)}
                  />

                  {/* Minik Hızlı Rota Seçim Butonları */}
                  <div className="flex items-center gap-1.5 pt-1.5 px-0.5 flex-nowrap overflow-x-auto no-scrollbar">
                    <span className="text-[10px] uppercase font-bold text-brass tracking-wider shrink-0 flex items-center gap-1">
                      <span>✈️ Havalimanı ➔</span>
                    </span>
                    {[
                      { label: 'Göltürkbükü', dropoffVal: 'Göltürkbükü' },
                      { label: 'Yalıkavak Marina', dropoffVal: 'Yalıkavak' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setPickup('Milas-Bodrum Havalimanı');
                          const resPickup = resolveLocationCoords('Milas-Bodrum Havalimanı', zones);
                          setPickupCoords({ lat: resPickup[0], lng: resPickup[1] });

                          setDropoff(item.dropoffVal);
                          const resDrop = resolveLocationCoords(item.dropoffVal, zones);
                          setDropoffCoords({ lat: resDrop[0], lng: resDrop[1] });

                          setCalculated(false);
                        }}
                        className="shrink-0 text-[10px] sm:text-[10.5px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-brass/20 border border-white/10 hover:border-brass/50 text-foam/80 hover:text-white transition-all duration-150 cursor-pointer active:scale-95 font-medium leading-normal flex items-center gap-1 whitespace-nowrap"
                      >
                        <span className="text-brass text-[9px]">📍</span>
                        <span className="whitespace-nowrap">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider text-foam/60 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {t.hourlyDurationLabel}
                    </label>
                  </div>
                  <select
                    value={hourlyDuration}
                    onChange={(e) => {
                      setHourlyDuration(e.target.value);
                      setCalculated(false);
                    }}
                    className="input cursor-pointer"
                  >
                    <option value="2">{t.hourlyOption2}</option>
                    <option value="4">{t.hourlyOption4}</option>
                    <option value="8">{t.hourlyOption8}</option>
                    <option value="12">{t.hourlyOption12}</option>
                  </select>
                </div>
              )}
            </div>


            {/* Transfer Date, Transfer Time & Passengers */}
            <div className={`grid grid-cols-1 ${tripType === 'roundtrip' ? 'lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-5 pt-2`}>
              {/* Pickup Date & Time side by side */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-foam/60 font-medium flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-brass" /> {t.transferTimeUpper}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-foam/50 block mb-1">{t.transferDate}</label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        setCalculated(false);
                      }}
                      className="input py-2.5 px-3 text-xs sm:text-sm font-light"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-foam/50 block mb-1">{t.transferHour}</label>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => {
                        setPickupTime(e.target.value);
                        setCalculated(false);
                      }}
                      className="input py-2.5 px-3 text-xs sm:text-sm font-light"
                    />
                  </div>
                </div>
              </div>

              {/* Return Date & Time (Shown if Round-trip) */}
              {tripType === 'roundtrip' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="text-xs uppercase tracking-wider text-foam/60 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {t.returnTimeUpper}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-foam/50 block mb-1">{t.returnDate}</label>
                      <input
                        type="date"
                        required
                        value={returnDate}
                        onChange={(e) => {
                          setReturnDate(e.target.value);
                          setCalculated(false);
                        }}
                        className="input py-2.5 px-3 text-xs sm:text-sm font-light"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-foam/50 block mb-1">{t.returnHour}</label>
                      <input
                        type="time"
                        required
                        value={returnTime}
                        onChange={(e) => {
                          setReturnTime(e.target.value);
                          setCalculated(false);
                        }}
                        className="input py-2.5 px-3 text-xs sm:text-sm font-light"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Passenger selection */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-foam/60 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brass" /> {t.passengerCountUpper}
                </span>
                <div>
                  <label className="text-[11px] text-foam/50 block mb-1">{t.personCount}</label>
                  <select
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(e.target.value);
                      setCalculated(false);
                    }}
                    className="input py-2.5 px-3 text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="1-2 Kişi">{t.pax1_2}</option>
                    <option value="3-4 Kişi">{t.pax3_4}</option>
                    <option value="5-6 Kişi">{t.pax5_6}</option>
                    <option value="7-16 Kişi">{t.pax7_16}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Information (Auto-filled with Ad Soyad, Telefon, Gmail) */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wider text-foam/80 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brass" />
                  {t.guestAndContactUpper}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-foam/70 font-medium block mb-1.5">
                    {t.nameAndSurnameUpper} <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    id="smart-client-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="input text-xs sm:text-sm py-2.5 !bg-[#0b1e2d] !text-white font-medium"
                    style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  />
                </div>
                <div>
                  <label htmlFor="smart-client-phone" className="text-[11px] uppercase tracking-wider text-foam/70 font-medium block mb-1.5">
                    {t.phoneNumberUpper} <span className="text-red-400 font-bold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative min-w-[90px]">
                      <select
                        value={clientPhoneCC}
                        onChange={(e) => {
                          const newCC = e.target.value;
                          setClientPhoneCC(newCC);
                          if (newCC === '+90' && !clientPhoneBody) {
                            setClientPhoneBody('5');
                          } else if (newCC !== '+90' && clientPhoneBody === '5') {
                            setClientPhoneBody('');
                          }
                        }}
                        className="input text-xs sm:text-sm py-2.5 !bg-[#0b1e2d] !text-white font-medium pr-7 cursor-pointer appearance-none"
                        style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-foam/40">
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </div>
                    <input
                      id="smart-client-phone"
                      name="tel"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={clientPhoneBody}
                      onChange={(e) => setClientPhoneBody(e.target.value)}
                      placeholder="5XX XXX XX XX"
                      className="input flex-1 text-xs sm:text-sm py-2.5 !bg-[#0b1e2d] !text-white font-medium"
                      style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="smart-client-email" className="text-[11px] uppercase tracking-wider text-foam/70 font-medium block mb-1.5">
                    {t.emailOptionalUpper}
                  </label>
                  <input
                    id="smart-client-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="input text-xs sm:text-sm py-2.5 !bg-[#0b1e2d] !text-white font-medium"
                    style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  />
                </div>
              </div>
            </div>

            {/* Special Request or Flight No */}
            <div>
              <label className="text-xs uppercase tracking-wider text-foam/70 font-medium block mb-2">
                {t.flightOrSpecial}
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={t.flightPlaceholder}
                className="input text-xs sm:text-sm py-2.5 !bg-[#0b1e2d] !text-white"
                style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              />
            </div>

            {/* Submit / Calculate Button */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                disabled={isCalculating}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-brass px-9 py-4 text-sm font-bold text-ink-950 transition-all hover:bg-brass-light hover:shadow-[0_0_24px_-4px_rgba(201,161,90,0.5)] disabled:opacity-60 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-ink-950" />
                    <span>{t.calculatingRoute}</span>
                  </>
                ) : (
                  <>
                    <span>{t.btnSeePrices}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Area with VIP Vehicle Cards */}
          <div ref={resultsRef}>
            {calculated && (
              <div
                key="booking-engine-results"
                className="mt-8 pt-8 border-t border-white/10 space-y-6 animate-in fade-in duration-300"
              >
                {/* Compact Route Summary Bar */}
                <div className="p-3 sm:p-4 rounded-xl bg-ink-950/80 border border-brass/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brass/10 text-brass shrink-0 border border-brass/20">
                      <Compass className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-brass font-bold whitespace-nowrap">{t.selectedRouteUpper}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {calculationResult.tariffApplied === 'km_tariff' ? t.kmTariff : t.fixedRate}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm sm:text-base font-serif text-white font-semibold truncate">
                        <span className="truncate">{formatShortLocation(pickup)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brass shrink-0" />
                        <span className="truncate">
                          {tripType === 'hourly'
                            ? `${hourlyDuration}s ${t.hourlyHire}`
                            : formatShortLocation(dropoff)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full md:w-auto justify-end border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
                    <div className="text-right">
                      <div className="text-[9px] uppercase text-foam/40 tracking-wider">{t.distanceLabel || 'Mesafe'}</div>
                      <div className="text-sm font-bold text-brass tabular-nums">~{calculationResult.distanceKm} km</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase text-foam/40 tracking-wider">{t.durationLabel || 'Süre'}</div>
                      <div className="text-sm font-bold text-brass tabular-nums">~{calculationResult.durationMins} {t.minuteUnit || 'dk'}</div>
                    </div>
                    {isRoutingLoading && (
                      <div className="flex items-center text-amber-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Leaflet + OpenStreetMap Route Map with Harita/Uydu toggles and VIP ARAÇLARI GÖR CTA */}
                <BookingRouteMap
                  routeData={routeData}
                  distanceKm={calculationResult.distanceKm}
                  durationMins={calculationResult.durationMins}
                  basePriceEur={calculationResult.activePriceEur}
                  tripType={tripType}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={setSelectedVehicle}
                  vehicles={dynamicVehicles}
                  showVehicles={showVehicles}
                  onToggleVehicles={setShowVehicles}
                />

                {/* Final Booking Summary & WhatsApp Button - Apple Frosted Glass Style */}
                {showVehicles && (
                  <div
                    className="mt-6 rounded-3xl border border-white/20 bg-black/60 sm:bg-black/50 backdrop-blur-2xl backdrop-saturate-180 p-6 sm:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] ring-1 ring-white/10 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    {/* Apple frosted glass ambient specular glow */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-foam/60 font-semibold">
                          {t.selectedVehicleFare}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>

                      <div className="flex flex-wrap items-baseline justify-between md:justify-start gap-x-5 gap-y-1 mt-2">
                        <span className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {selectedVehicleObj.name}
                        </span>
                        <span className="font-serif text-3xl sm:text-4xl font-extrabold text-brass tabular-nums drop-shadow-sm">
                          {finalPriceEur !== null ? `${finalPriceEur} €` : t.customQuote}
                        </span>
                      </div>

                      <p className="text-xs text-foam/70 mt-2.5 flex items-center gap-2 font-normal">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{t.includedInFare}</span>
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-stretch md:items-end justify-center shrink-0">
                      <button
                        type="button"
                        onClick={handleBookViaWhatsApp}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] px-8 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(37,211,102,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-emerald-300/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <WhatsAppIcon className="h-5 w-5 fill-white text-white shrink-0" />
                        <span className="tracking-wide">{t.bookInstantlyWhatsapp}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sabit VIP Araç Seçim & Hızlı Rezervasyon Barı (Floating Fixed Sleek Horizontal Dock) */}
      {calculated && (
        <div className="fixed bottom-[calc(82px+env(safe-area-inset-bottom))] sm:bottom-[calc(88px+env(safe-area-inset-bottom))] inset-x-0 z-[95] px-3 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-300">
          {isFloatingBarOpen ? (
            <div className="mx-auto max-w-lg bg-black/55 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-row items-center justify-between gap-2.5 sm:gap-4 ring-1 ring-white/10 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Sol: Kapatma Butonu */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsFloatingBarOpen(false);
                    setShowVehicles(false);
                  }}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full shrink-0 transition-all duration-200 cursor-pointer active:scale-90 bg-red-500/80 hover:bg-red-500 text-white border border-white/20 backdrop-blur-md shadow-sm"
                  title={t.closeBar || "Bu alanı kapat"}
                  aria-label={t.closeBar || "Bu alanı kapat"}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.8]" />
                </button>
                {/* Araç İsmi Üstte, Fiyat Altta (Güzergah ve Havalimanı kaldırıldı) */}
                <div
                  onClick={() => {
                    if (!showVehicles) setShowVehicles(true);
                    setTimeout(() => {
                      scrollToVehicle(selectedVehicle, 'booking');
                    }, 100);
                  }}
                  className="min-w-0 flex flex-col justify-center flex-1 cursor-pointer select-none group/info py-0.5"
                  title="Seçili Araca Git"
                >
                  <span className="text-[11px] sm:text-xs font-semibold text-white/95 truncate group-hover/info:text-brass transition-colors leading-tight">
                    {selectedVehicleObj.name}
                  </span>
                  <span className="font-serif text-xs sm:text-sm font-extrabold text-brass tabular-nums leading-tight mt-0.5">
                    {finalPriceEur !== null ? `${finalPriceEur} €` : t.customPrice}
                  </span>
                </div>
              </div>

              {/* Sağ: WhatsApp Rezervasyon Butonu */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBookViaWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366]/90 hover:bg-[#25D366] px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-white shadow-[0_4px_16px_rgba(37,211,102,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <WhatsAppIcon className="h-3 w-3 sm:h-3.5 sm:h-3.5 fill-white text-white shrink-0" />
                  <span>
                    {t.bookNow}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Kapalı olduğunda Apple buzlu cam buton */
            <div className="mx-auto max-w-lg flex justify-start pl-1 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsFloatingBarOpen(true)}
                className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/25 text-brass shadow-[0_8px_25px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                title="VIP Transfer Barını Aç"
                aria-label="VIP Transfer Barını Aç"
              >
                <div className="relative">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brass text-[9px] font-bold text-ink-950 shadow">
                    ✓
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
