import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteMapPoints, formatShortLocation } from '@/lib/transferPricing';
import { FREE_TILE_SERVERS, FREE_MAP_ATTRIBUTION } from '@/lib/cartoBasemap';
import { CheckCircle2, ShieldCheck, Sparkles, Users, ArrowDown, Car, Map as MapIcon, Moon, Globe, X, CalendarDays } from 'lucide-react';
import { useLanguage } from '@/lib/translations';
import { ImageCarousel } from './ImageCarousel';
import { scrollToVehicle } from '@/lib/scrollHelper';

export interface VehicleCardItem {
  key: string;
  name: string;
  subTitle: string;
  capacity: string;
  luggage: string;
  multiplier: number;
  image: string;
  images?: string[];
  features: string[];
}

interface BookingRouteMapProps {
  routeData: RouteMapPoints;
  distanceKm: number;
  durationMins: number;
  basePriceEur?: number | null;
  tripType: 'oneway' | 'roundtrip' | 'hourly';
  selectedVehicle: string;
  onSelectVehicle: (key: string) => void;
  vehicles: VehicleCardItem[];
  onBookNow?: () => void;
  showVehicles?: boolean;
  onToggleVehicles?: (show: boolean) => void;
}

export default function BookingRouteMap({
  routeData,
  distanceKm,
  durationMins,
  basePriceEur,
  tripType,
  selectedVehicle,
  onSelectVehicle,
  vehicles,
  onBookNow,
  showVehicles,
  onToggleVehicles,
}: BookingRouteMapProps) {
  const { t } = useLanguage();
  const [mapType, setMapType] = useState<'street' | 'dark' | 'satellite'>('street');
  const [internalShowVehicles, setInternalShowVehicles] = useState(false);
  const isVehiclesVisible = showVehicles !== undefined ? showVehicles : internalShowVehicles;
  const vehiclesRef = useRef<HTMLDivElement>(null);

  // Leaflet Map Refs
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletTileRef = useRef<L.TileLayer | null>(null);
  const leafletLabelsRef = useRef<L.TileLayer | null>(null);
  const leafletPolylineRef = useRef<L.Polyline | null>(null);
  const leafletPolylineGlowRef = useRef<L.Polyline | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);

  // Calculate Euro price for vehicle
  const calculateVehiclePrice = (multiplier: number): number | null => {
    if (basePriceEur === null || basePriceEur === undefined) return null;
    return Math.round(basePriceEur * multiplier);
  };

  // Scroll smoothly to the vehicle card in the Fleet section
  const scrollToFleetVehicle = (vehicleKey: string) => {
    scrollToVehicle(vehicleKey, 'fleet');
  };

  // SVG Pin Generator matching classic luxury red/amber markers A and B
  const createPinIcon = (letter: 'A' | 'B', color: string, borderColor: string) => {
    const html = `
      <div style="position: relative; width: 36px; height: 48px; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
        <svg viewBox="0 0 34 46" width="36" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${color}" stroke="${borderColor}" stroke-width="1.2"/>
          <circle cx="17" cy="16" r="10.5" fill="#FFFFFF"/>
          <text x="17" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="13" fill="${color}" text-anchor="middle">${letter}</text>
        </svg>
      </div>
    `;
    return L.divIcon({
      className: 'custom-vip-pin',
      html,
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -44],
    });
  };

  const safePointA = useMemo<[number, number]>(() => [
    Number.isFinite(routeData?.pointA?.coords?.[0]) ? routeData.pointA.coords[0] : 37.2506,
    Number.isFinite(routeData?.pointA?.coords?.[1]) ? routeData.pointA.coords[1] : 27.6643,
  ], [routeData?.pointA?.coords]);

  const safePointB = useMemo<[number, number]>(() => [
    Number.isFinite(routeData?.pointB?.coords?.[0]) ? routeData.pointB.coords[0] : 37.1042,
    Number.isFinite(routeData?.pointB?.coords?.[1]) ? routeData.pointB.coords[1] : 27.2958,
  ], [routeData?.pointB?.coords]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!leafletContainerRef.current) return;

    if (!leafletMapRef.current) {
      if ((leafletContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
        delete (leafletContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
      }
      const map = L.map(leafletContainerRef.current, {
        center: safePointA,
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Remove old tile layers cleanly
    if (leafletTileRef.current) {
      map.removeLayer(leafletTileRef.current);
      leafletTileRef.current = null;
    }
    if (leafletLabelsRef.current) {
      map.removeLayer(leafletLabelsRef.current);
      leafletLabelsRef.current = null;
    }

    // Apply selected free tile layer
    if (mapType === 'satellite') {
      leafletTileRef.current = L.tileLayer(FREE_TILE_SERVERS.satellite, {
        maxZoom: 19,
        attribution: FREE_MAP_ATTRIBUTION,
      }).addTo(map);
      leafletLabelsRef.current = L.tileLayer(FREE_TILE_SERVERS.satelliteLabels, {
        maxZoom: 19,
        opacity: 0.85,
      }).addTo(map);
    } else if (mapType === 'dark') {
      leafletTileRef.current = L.tileLayer(FREE_TILE_SERVERS.dark, {
        maxZoom: 19,
        attribution: FREE_MAP_ATTRIBUTION,
      }).addTo(map);
      leafletLabelsRef.current = L.tileLayer(FREE_TILE_SERVERS.darkLabels, {
        maxZoom: 19,
        opacity: 0.9,
      }).addTo(map);
    } else {
      // Clean free navigation street map
      leafletTileRef.current = L.tileLayer(FREE_TILE_SERVERS.street, {
        maxZoom: 19,
        attribution: FREE_MAP_ATTRIBUTION,
      }).addTo(map);
    }

    // Clear old markers
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    // Clear old polylines
    if (leafletPolylineGlowRef.current) {
      leafletPolylineGlowRef.current.remove();
      leafletPolylineGlowRef.current = null;
    }
    if (leafletPolylineRef.current) {
      leafletPolylineRef.current.remove();
      leafletPolylineRef.current = null;
    }

    const pointAName = routeData?.pointA?.name || 'Alış Noktası';
    const pointBName = routeData?.pointB?.name || 'Varış Bölgesi';

    // Add Marker A (Alış Noktası)
    const markerA = L.marker(safePointA, {
      icon: createPinIcon('A', '#EA4335', '#C5221F'),
      title: `Alış Noktası: ${pointAName}`,
    }).addTo(map);
    markerA.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #111;">
        <strong style="color: #EA4335;">Alış Noktası (A)</strong><br/>
        ${pointAName}
      </div>
    `);
    leafletMarkersRef.current.push(markerA);

    // Add Marker B (Varış Bölgesi)
    const markerB = L.marker(safePointB, {
      icon: createPinIcon('B', '#F59E0B', '#D97706'),
      title: `Varış Bölgesi: ${pointBName}`,
    }).addTo(map);
    markerB.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #111;">
        <strong style="color: #D97706;">Varış Bölgesi (B)</strong><br/>
        ${pointBName}
      </div>
    `);
    leafletMarkersRef.current.push(markerB);

    // Draw route polyline from OSRM path points
    const validPath = (routeData.path || []).filter(
      (pt) => Array.isArray(pt) && Number.isFinite(pt[0]) && Number.isFinite(pt[1])
    );

    if (validPath.length > 1) {
      const isDark = mapType === 'dark';
      const isSat = mapType === 'satellite';

      // Glow background casing (styled for contrast in dark/light/satellite modes)
      const glowColor = isDark ? '#D97706' : isSat ? '#1e3a8a' : '#1d4ed8';
      const mainColor = isDark ? '#F59E0B' : isSat ? '#FBBF24' : '#2563eb';

      const polylineGlow = L.polyline(validPath, {
        color: glowColor,
        weight: 8,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      leafletPolylineGlowRef.current = polylineGlow;

      // Foreground main path
      const polyline = L.polyline(validPath, {
        color: mainColor,
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      leafletPolylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 13,
        animate: true,
      });
    } else {
      const bounds = L.latLngBounds([safePointA, safePointB]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }

    const timer = setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [routeData, mapType, safePointA, safePointB]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Interactive Map Box */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-ink-950 overflow-hidden shadow-2xl">
        {/* Map Header Switcher: "Harita", "VIP Koyu", "Uydu" free multi-layer toggle */}
        <div className="absolute top-3.5 left-3.5 z-[500] flex bg-ink-950/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-1 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMapType('street')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mapType === 'street'
                ? 'bg-gradient-to-r from-brass to-amber-500 text-ink-950 font-bold shadow-md'
                : 'text-foam/80 hover:text-white hover:bg-white/10'
            }`}
            title="Açık sokak ve otoyol haritası"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Harita</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mapType === 'dark'
                ? 'bg-gradient-to-r from-brass to-amber-500 text-ink-950 font-bold shadow-md'
                : 'text-foam/80 hover:text-white hover:bg-white/10'
            }`}
            title="Lüks koyu gece modu haritası"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>VIP Koyu</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-gradient-to-r from-brass to-amber-500 text-ink-950 font-bold shadow-md'
                : 'text-foam/80 hover:text-white hover:bg-white/10'
            }`}
            title="Gerçek dünya uydu görüntüsü"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Uydu</span>
          </button>
        </div>

        {/* Floating Route Distance & Estimated Time Chip on top-right */}
        <div className="absolute top-3.5 right-3.5 z-[500] bg-ink-950/90 backdrop-blur-md border border-brass/40 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-foam">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{distanceKm} km</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="text-amber-400 font-bold">~{durationMins} dk</div>
        </div>

        {/* 100% Free OpenStreetMap & Esri World Leaflet Map Engine (Zero Watermarks) */}
        <div className="w-full h-[280px] sm:h-[380px] relative">
          <div ref={leafletContainerRef} className="w-full h-full" />
        </div>

        {/* Simplified Map Bottom Bar */}
        <div className="bg-ink-900/95 border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-foam/60 gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-red-400">● A:</span>
            <span className="text-white">{formatShortLocation(routeData.pointA.name)}</span>
            <span className="text-brass mx-0.5">➔</span>
            <span className="text-amber-400">● B:</span>
            <span className="text-white">{formatShortLocation(routeData.pointB.name)}</span>
          </div>

          <div className="flex items-center gap-1.5 opacity-80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.liveRouteTracking || 'Canlı Rota Takibi'}</span>
          </div>
        </div>
      </div>

      {/* Luxury "Lütfen Araç Seçiniz" Interactive Bar */}
      <div className="pt-2 pb-2 text-center flex justify-center">
        <button
          type="button"
          onClick={() => {
            const next = !isVehiclesVisible;
            setInternalShowVehicles(next);
            if (onToggleVehicles) onToggleVehicles(next);
            if (next) {
              setTimeout(() => {
                scrollToVehicle(selectedVehicle, 'booking');
              }, 100);
            }
          }}
          className="group relative inline-flex items-center justify-between gap-4 sm:gap-6 rounded-2xl bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 border border-brass/50 p-2.5 sm:px-6 sm:py-3.5 shadow-[0_4px_30px_rgba(201,161,90,0.3)] transition-all duration-300 hover:border-brass hover:shadow-[0_8px_35px_rgba(201,161,90,0.5)] active:scale-98 cursor-pointer max-w-xl w-full"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brass/15 text-brass border border-brass/30 group-hover:bg-brass group-hover:text-ink-950 transition-all shrink-0">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-widest text-brass font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.vipFleetOptions || 'VIP FİLO SEÇENEKLERİ'}</span>
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
                <span>{t.selectVehiclePrompt || 'Lütfen Araç Seçiniz'}</span>
              </div>
              <div className="text-[11px] text-foam/60 font-light hidden sm:block">
                {t.vehicleModelsSubtitle || 'Mercedes-Benz Vito, Maybach veya Sprinter Ultra VIP'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-brass text-ink-950 text-xs font-black uppercase tracking-wider shadow-md">
              {isVehiclesVisible ? t.hideList : t.viewVehicles}
            </span>
            <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-brass group-hover:bg-brass group-hover:text-ink-950 transition-all">
              <ArrowDown
                className={`w-4 h-4 stroke-[2.6] transition-transform duration-300 ${
                  isVehiclesVisible ? 'rotate-180' : 'group-hover:translate-y-1'
                }`}
              />
            </span>
          </div>
        </button>
      </div>

      {/* Vehicle Cards with Price & Details */}
      {isVehiclesVisible && (
        <div ref={vehiclesRef} id="vip-vehicles-selection" className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="sticky top-2 sm:top-4 z-20 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-ink-950/95 backdrop-blur-xl border border-brass/40 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brass/20 text-brass flex items-center justify-center border border-brass/40 shadow-inner">
                <Car className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brass tracking-widest block">
                  {t.step2SelectVehicle}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-tight">
                  {t.pleaseSelectVehicle}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-brass font-bold bg-brass/10 border border-brass/30 px-3 py-1.5 rounded-xl">
                {tripType === 'roundtrip' ? t.roundTripFare : t.oneWayNetFare}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onToggleVehicles) onToggleVehicles(false);
                  setInternalShowVehicles(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-all cursor-pointer active:scale-90"
                title={t.closeBar || "Kapat"}
                aria-label={t.closeBar || "Kapat"}
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => {
              const isSelected = selectedVehicle === v.key;
              const price = calculateVehiclePrice(v.multiplier);

              return (
                <div
                  key={v.key}
                  id={`booking-vehicle-${v.key}`}
                  data-vehicle-key={v.key}
                  onClick={() => onSelectVehicle(v.key)}
                  className={`group relative rounded-3xl overflow-hidden border p-5 sm:p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between scroll-mt-28 ${
                    isSelected
                      ? 'border-[#2dd4bf] bg-ink-900 shadow-[0_0_35px_rgba(45,212,191,0.25)] ring-2 ring-[#2dd4bf]/80'
                      : 'border-white/10 bg-ink-900/60 hover:border-[#2dd4bf]/40 hover:bg-ink-900'
                  }`}
                >
                  <div>
                    {/* Vehicle Photo Carousel with Swipe / Slide Left-Right */}
                    <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-ink-950 border border-white/5">
                      <ImageCarousel
                        images={v.images && v.images.length > 0 ? v.images : [v.image]}
                        alt={v.name}
                        className="w-full h-full"
                        aspectRatioClassName="aspect-[4/3] sm:aspect-video lg:aspect-[4/3]"
                        hideCounter={false}
                        onEyeClick={() => scrollToFleetVehicle(v.key)}
                      />
                    </div>

                    {/* Vehicle Title */}
                    <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-[#2dd4bf] transition-colors leading-tight">
                      {v.name}
                    </h4>

                    {/* Translucent Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-foam flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#2dd4bf]" />
                        <span>{v.capacity}</span>
                      </span>
                      {v.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-foam flex items-center gap-1.5 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-foam/70 mb-5 leading-relaxed font-light">
                      {v.subTitle || 'Lüksün zirvesi. Yıldız tavan, masajlı koltuklar ve özel tasarımıyla benzersiz bir VIP deneyimi.'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div>
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-white/10">
                      <span className="text-[11px] uppercase tracking-wider text-foam/50 font-medium">
                        {tripType === 'roundtrip' ? t.roundTripTotal : t.oneWayFixed}
                      </span>
                      <div className="font-serif text-2xl sm:text-3xl font-extrabold text-brass tabular-nums">
                        {price !== null ? `${price} €` : t.getQuote}
                      </div>
                    </div>

                    {/* Button Area matching IMG_4497_7b78ff56.png */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      {/* Round Checkmark Badge on Left */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 transition-all duration-300 ${
                        isSelected
                          ? 'bg-ink-950 border-2 border-[#2dd4bf] text-[#2dd4bf] shadow-[0_0_18px_rgba(45,212,191,0.5)]'
                          : 'bg-white/5 border border-white/20 text-white/40'
                      }`}>
                        <CheckCircle2 className="w-6 h-6 stroke-[2.8]" />
                      </div>

                      {/* Turquoise Selected Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(v.key);
                          if (onBookNow) onBookNow();
                        }}
                        className={`flex-1 py-3.5 px-3 sm:px-5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                          isSelected
                            ? 'bg-[#2dd4bf] hover:bg-[#22d3ee] text-ink-950 shadow-[#2dd4bf]/30 ring-1 ring-[#2dd4bf] scale-[1.01]'
                            : 'bg-white/10 hover:bg-[#2dd4bf] hover:text-ink-950 text-white hover:shadow-[#2dd4bf]/20'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : <CalendarDays className="w-4 h-4" />}
                        <span>{isSelected ? 'Aracınız Seçildi' : 'Aracı Seç'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
