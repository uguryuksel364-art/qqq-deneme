import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  Map as MapIcon,
  Moon,
  Globe,
} from 'lucide-react';
import {
  TransferZone,
  AIRPORT_BASE,
  getTransferZones,
} from '@/lib/transferPricing';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FREE_TILE_SERVERS, FREE_MAP_ATTRIBUTION } from '@/lib/cartoBasemap';

// Road network waypoints for Bodrum Peninsula (D330 Highway backbone)
const ROAD_NODES = {
  airport: [37.2506, 27.6643] as [number, number],
  dorttepe: [37.1850, 27.6050] as [number, number],
  guvercinlik: [37.1325, 27.5750] as [number, number],
  torbaJunction: [37.0811, 27.4589] as [number, number],
  bodrumMerkez: [37.0344, 27.4305] as [number, number],
  gumbet: [37.0315, 27.4042] as [number, number],
  bitez: [37.0278, 27.3828] as [number, number],
  ortakentJunction: [37.0512, 27.3524] as [number, number],
  yalikavak: [37.1042, 27.2958] as [number, number],
  turkbuku: [37.1264, 27.3892] as [number, number],
  gundogan: [37.1333, 27.3417] as [number, number],
  gumusluk: [37.0544, 27.2344] as [number, number],
  turgutreis: [37.0017, 27.2592] as [number, number],
  didimViaMilas: [37.3120, 27.7840] as [number, number],
  didimSokeJunction: [37.4500, 27.4100] as [number, number],
  didim: [37.3833, 27.2667] as [number, number],
};

function getDrivingPolyline(destId: string): [number, number][] {
  const airport = ROAD_NODES.airport;
  const dort = ROAD_NODES.dorttepe;
  const guv = ROAD_NODES.guvercinlik;
  const torba = ROAD_NODES.torbaJunction;
  const bCenter = ROAD_NODES.bodrumMerkez;
  const ortakent = ROAD_NODES.ortakentJunction;

  switch (destId) {
    case 'guvercinlik':
      return [airport, dort, guv];
    case 'torba':
      return [airport, dort, guv, torba];
    case 'bodrum-merkez':
      return [airport, dort, guv, torba, bCenter];
    case 'gumbet':
      return [airport, dort, guv, torba, bCenter, ROAD_NODES.gumbet];
    case 'bitez':
      return [airport, dort, guv, torba, bCenter, ROAD_NODES.gumbet, ROAD_NODES.bitez];
    case 'turkbuku':
      return [airport, dort, guv, torba, ROAD_NODES.turkbuku];
    case 'gundogan':
      return [airport, dort, guv, torba, ROAD_NODES.turkbuku, ROAD_NODES.gundogan];
    case 'yalikavak':
      return [airport, dort, guv, torba, ortakent, [37.0850, 27.3200], ROAD_NODES.yalikavak];
    case 'gumusluk':
      return [airport, dort, guv, torba, ortakent, [37.0600, 27.2800], ROAD_NODES.gumusluk];
    case 'turgutreis':
      return [airport, dort, guv, torba, ortakent, [37.0200, 27.3000], ROAD_NODES.turgutreis];
    case 'didim':
      return [airport, ROAD_NODES.didimViaMilas, ROAD_NODES.didimSokeJunction, ROAD_NODES.didim];
    default:
      return [airport, dort, guv, torba, bCenter];
  }
}

interface TransferLiveMapProps {
  onSelectZone?: (zone: TransferZone) => void;
}

export default function TransferLiveMap({ onSelectZone }: TransferLiveMapProps) {
  const [zones, setZones] = useState<TransferZone[]>(getTransferZones);
  const [selectedZone, setSelectedZone] = useState<TransferZone | null>(null);
  const [tileType, setTileType] = useState<'street' | 'dark' | 'satellite'>('street');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const leafletRouteLineRef = useRef<L.Polyline | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);

  // Sync zones with localStorage updates from Admin panel
  useEffect(() => {
    const handleUpdate = () => {
      setZones(getTransferZones());
    };
    window.addEventListener('transferRatesUpdated', handleUpdate);
    return () => window.removeEventListener('transferRatesUpdated', handleUpdate);
  }, []);

  // Update Leaflet tile layers dynamically
  const applyTileLayers = (map: L.Map, type: 'street' | 'dark' | 'satellite') => {
    if (leafletTileLayerRef.current) {
      map.removeLayer(leafletTileLayerRef.current);
      leafletTileLayerRef.current = null;
    }
    if (leafletLabelsLayerRef.current) {
      map.removeLayer(leafletLabelsLayerRef.current);
      leafletLabelsLayerRef.current = null;
    }

    if (type === 'satellite') {
      leafletTileLayerRef.current = L.tileLayer(FREE_TILE_SERVERS.satellite, {
        maxZoom: 19,
        attribution: FREE_MAP_ATTRIBUTION,
      }).addTo(map);
      leafletLabelsLayerRef.current = L.tileLayer(FREE_TILE_SERVERS.satelliteLabels, {
        maxZoom: 19,
        opacity: 0.85,
      }).addTo(map);
    } else if (type === 'dark') {
      leafletTileLayerRef.current = L.tileLayer(FREE_TILE_SERVERS.dark, {
        maxZoom: 19,
        attribution: FREE_MAP_ATTRIBUTION,
      }).addTo(map);
      leafletLabelsLayerRef.current = L.tileLayer(FREE_TILE_SERVERS.darkLabels, {
        maxZoom: 19,
        opacity: 0.9,
      }).addTo(map);
    } else {
      leafletTileLayerRef.current = L.tileLayer(FREE_TILE_SERVERS.street, {
        maxZoom: 19,
        attribution: FREE_MAP_ATTRIBUTION,
      }).addTo(map);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Center around Milas-Bodrum Airport & Bodrum Peninsula
    const map = L.map(mapContainerRef.current, {
      center: [37.15, 27.45],
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    applyTileLayers(map, tileType);

    leafletMapRef.current = map;
    renderLeafletMarkers(map);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Leaflet tile layer dynamically when Harita / VIP Koyu / Uydu is toggled
  useEffect(() => {
    if (!leafletMapRef.current) return;
    applyTileLayers(leafletMapRef.current, tileType);
  }, [tileType]);

  // Render Leaflet markers & airport icon
  const renderLeafletMarkers = (map: L.Map) => {
    // Clear previous
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    // Airport Base Marker
    const airportIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brass to-amber-500 text-ink-950 font-bold text-xs shadow-xl border border-white/40 ring-4 ring-amber-500/20 transform hover:scale-110 transition-transform cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          <span>Milas-Bodrum (BJV)</span>
        </div>
      `,
      iconSize: [160, 36],
      iconAnchor: [80, 18],
    });

    const airportMarker = L.marker([AIRPORT_BASE.lat, AIRPORT_BASE.lng], { icon: airportIcon }).addTo(map);
    airportMarker.bindPopup(`
      <div class="p-3 bg-ink-900 text-foam rounded-xl border border-brass/40 shadow-2xl min-w-[220px]">
        <div class="text-[11px] font-semibold tracking-wider text-brass uppercase">Ana Kalkış Noktası</div>
        <div class="font-serif text-base font-bold text-white mt-0.5">Milas-Bodrum Havalimanı (BJV)</div>
        <p class="text-xs text-foam/70 mt-1">Tüm VIP transferlerin çıkış ve karşılama merkezidir.</p>
      </div>
    `);
    leafletMarkersRef.current.push(airportMarker);

    // Destination Zone Markers with Euro badges
    zones.forEach((zone) => {
      const isSelected = selectedZone?.id === zone.id;
      const markerHtml = `
        <div class="group flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
          isSelected
            ? 'bg-amber-400 text-ink-950 ring-4 ring-amber-400/40 font-bold scale-110 shadow-2xl'
            : 'bg-ink-900/90 hover:bg-ink-800 text-foam border border-brass/60 hover:border-amber-400 hover:scale-105 shadow-lg'
        } text-xs transition-all cursor-pointer backdrop-blur-md">
          <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-ink-950' : 'bg-brass'} animate-pulse"></span>
          <span class="font-medium whitespace-nowrap">${zone.name}</span>
          <span class="px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-ink-950 text-amber-300 font-extrabold' : 'bg-brass/20 text-brass font-bold'} text-[11px]">
            ${zone.oneWayPriceEur} €
          </span>
        </div>
      `;

      const zoneIcon = L.divIcon({
        className: 'custom-zone-marker',
        html: markerHtml,
        iconSize: [140, 32],
        iconAnchor: [70, 16],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: zoneIcon }).addTo(map);

      marker.on('click', () => {
        handleZoneSelect(zone);
      });

      leafletMarkersRef.current.push(marker);
    });
  };



  // Select Zone, Draw Highway Route, and notify booking engine
  const handleZoneSelect = (zone: TransferZone) => {
    setSelectedZone(zone);

    // Update Leaflet Route
    if (leafletMapRef.current) {
      if (leafletRouteLineRef.current) {
        leafletRouteLineRef.current.remove();
        leafletRouteLineRef.current = null;
      }

      const drivingPath = getDrivingPolyline(zone.id);
      const polyline = L.polyline(drivingPath, {
        color: '#eab308',
        weight: 4.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined,
      }).addTo(leafletMapRef.current);

      leafletRouteLineRef.current = polyline;

      // Fit bounds with comfortable padding
      leafletMapRef.current.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
      });

      renderLeafletMarkers(leafletMapRef.current);
    }
  };

  // Connect to Reservation form
  const handleBookSelectedZone = (zone: TransferZone) => {
    if (onSelectZone) {
      onSelectZone(zone);
    }

    // Broadcast event for SmartBookingEngine to auto-fill
    window.dispatchEvent(
      new CustomEvent('selectTransferRegion', {
        detail: {
          pickup: 'Milas-Bodrum Havalimanı (BJV)',
          dropoff: zone.name,
          zone,
          priceEur: zone.oneWayPriceEur,
        },
      })
    );

    // Smooth scroll to SmartBookingEngine
    const bookingEl = document.getElementById('booking-engine') || document.getElementById('rezervasyon');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openGoogleMapsDirections = (zone: TransferZone) => {
    const origin = encodeURIComponent('Milas-Bodrum Havalimanı (BJV)');
    const destination = encodeURIComponent(`${zone.name}, Bodrum`);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`, '_blank');
  };

  return (
    <section id="transfer-haritasi" className="relative py-20 bg-ink-950 text-foam overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brass/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brass/40 bg-brass/10 text-brass text-xs font-medium tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>CANLI BODRUM TRANSFER HARİTASI & RESMİ TARİFE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-tight">
            Bodrum VIP Transfer <span className="italic text-brass font-serif">Bölge & Fiyat</span> Haritası
          </h2>

          <p className="text-sm sm:text-base text-foam/75 font-light leading-relaxed">
            Kalkış noktası <strong className="text-white font-medium">Milas-Bodrum Uluslararası Havalimanı (BJV)</strong> olmak üzere,
            yarımadanın tüm popüler marina ve koylarına ait güncel Euro (€) VIP transfer tarifelerimizi harita üzerinden inceleyin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-foam/60 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sabit & Şeffaf Fiyat Garantisi
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brass" /> Gerçek Karayolu Sürüş Rotası
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Gidiş-Dönüş Özel İndirimli
            </span>
          </div>
        </div>

        {/* Live Interactive Map Box */}
        <div className="relative rounded-3xl border border-brass/30 bg-ink-900/80 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Map Top Bar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 border-b border-white/10 bg-ink-900/90 text-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-foam">
                {selectedZone ? (
                  <>
                    Seçili Rota: <strong className="text-brass">Milas-Bodrum Havalimanı → {selectedZone.name}</strong> ({selectedZone.oneWayPriceEur} €)
                  </>
                ) : (
                  'Haritada veya listede bir transfer bölgesi seçin'
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-[11px] text-foam/50 flex items-center gap-1">
                <Layers className="w-3 h-3 text-brass" />
                Bodrum VIP İnteraktif Harita
              </span>

              {selectedZone && (
                <button
                  onClick={() => openGoogleMapsDirections(selectedZone)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-foam hover:text-white text-[11px] transition-colors"
                  title="Google Haritalar uygulamasında canlı yol tarifini aç"
                >
                  <ExternalLink className="w-3 h-3 text-brass" />
                  <span>Google Haritalar'da Aç</span>
                </button>
              )}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative w-full h-[450px] sm:h-[540px]">
            {/* Map Mode Switcher: Harita / VIP Koyu / Uydu */}
            <div className="absolute top-4 left-4 z-20 flex bg-ink-950/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-1 gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTileType('street')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tileType === 'street'
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
                onClick={() => setTileType('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tileType === 'dark'
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
                onClick={() => setTileType('satellite')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tileType === 'satellite'
                    ? 'bg-gradient-to-r from-brass to-amber-500 text-ink-950 font-bold shadow-md'
                    : 'text-foam/80 hover:text-white hover:bg-white/10'
                }`}
                title="Gerçek dünya uydu görüntüsü"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Uydu</span>
              </button>
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Quick Zone Info Card when selected */}
            {selectedZone && (
              <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-20 bg-ink-950/95 border border-brass/50 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] tracking-wider font-semibold uppercase text-brass">
                      <Sparkles className="w-3 h-3" /> Vip Transfer Bölgesi
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {selectedZone.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-brass font-serif">
                      {selectedZone.oneWayPriceEur} €
                    </div>
                    <div className="text-[10px] text-foam/60">Tek Yön Net</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-white/10 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-[10px] text-foam/50">Kalkış</div>
                    <div className="text-xs font-semibold text-white">BJV Airport</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-[10px] text-foam/50">Mesafe / Süre</div>
                    <div className="text-xs font-semibold text-foam">{selectedZone.distanceKm} km • ~{selectedZone.durationMins} dk</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-[10px] text-foam/50">Gidiş - Dönüş</div>
                    <div className="text-xs font-bold text-amber-400">{selectedZone.roundTripPriceEur} €</div>
                  </div>
                </div>

                {selectedZone.description && (
                  <p className="text-xs text-foam/70 line-clamp-2 mb-3">
                    {selectedZone.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleBookSelectedZone(selectedZone)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brass to-amber-500 hover:from-amber-400 hover:to-amber-500 text-ink-950 font-bold text-xs tracking-wide shadow-lg shadow-brass/20 transition-all hover:scale-[1.02]"
                  >
                    <span>Bu Bölge İçin Rezervasyon Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openGoogleMapsDirections(selectedZone)}
                    className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-foam hover:text-white transition-colors"
                    title="Google Haritalar Canlı Navigasyon"
                  >
                    <ExternalLink className="w-4 h-4 text-brass" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
