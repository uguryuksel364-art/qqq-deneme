import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, Crosshair, X, Loader2, Search, Building2, Plane, Anchor } from 'lucide-react';

export interface VerifiedPlace {
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface PlaceAutocompleteInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: VerifiedPlace) => void;
  required?: boolean;
  className?: string;
  isPickup?: boolean;
  defaultSuggestions?: string[];
  hideLabel?: boolean;
}

// Pre-defined VIP transfer hubs for instant (0ms) high-precision suggestions
const VIP_PREDEFINED_LOCATIONS = [
  // Havalimanları
  { name: 'Milas-Bodrum Havalimanı (BJV)', secondary: 'Ekinanbarı, Milas/Muğla, Türkiye', lat: 37.2506, lng: 27.6643, type: 'airport' },
  { name: 'Dalaman Havalimanı (DLM)', secondary: 'Ege Bölgesi, Dalaman/Muğla', lat: 36.7133, lng: 28.7925, type: 'airport' },
  { name: 'İzmir Adnan Menderes Havalimanı (ADB)', secondary: 'Gaziemir, İzmir', lat: 38.2924, lng: 27.1570, type: 'airport' },
  { name: 'Antalya Havalimanı (AYT)', secondary: 'Muratpaşa, Antalya', lat: 36.8969, lng: 30.7133, type: 'airport' },
  
  // Marinalar & Lüks Merkezler
  { name: 'Yalıkavak Marina', secondary: 'Çökertme Cd. No:6 D:6, Yalıkavak, Bodrum', lat: 37.1042, lng: 27.2958, type: 'marina' },
  { name: 'D-Marin Turgutreis Marina', secondary: 'Gazi Mustafa Kemal Bulvarı, Turgutreis, Bodrum', lat: 37.0017, lng: 27.2592, type: 'marina' },
  { name: 'Bodrum Milta Marina', secondary: 'Neyzen Tevfik Cd. No:5, Bodrum Merkez', lat: 37.0344, lng: 27.4250, type: 'marina' },
  { name: 'Didim D-Marin Marina', secondary: 'Çamlık Mah., Didim, Aydın', lat: 37.3480, lng: 27.2600, type: 'marina' },

  // Lüks 5 Yıldızlı Oteller & Tatil Köyleri
  { name: 'Mandarin Oriental Bodrum', secondary: 'Cennet Koyu, Göltürkbükü, Bodrum', lat: 37.1264, lng: 27.3892, type: 'hotel' },
  { name: 'The Bodrum EDITION', secondary: 'Dirmil Mah., Balyek Cd. No:5A, Yalıkavak', lat: 37.0950, lng: 27.3200, type: 'hotel' },
  { name: 'Lujo Hotel Bodrum', secondary: 'Meşelik Mah. Çomça Mevkii No:60, Güvercinlik', lat: 37.1350, lng: 27.5650, type: 'hotel' },
  { name: 'Titanic Deluxe Bodrum', secondary: 'Meşelik Mah. Çomça Mevkii No:8, Güvercinlik', lat: 37.1325, lng: 27.5750, type: 'hotel' },
  { name: 'Caresse Luxury Resort & Spa', secondary: 'Asarlık Mevkii Adnan Menderes Cd. No:89, Gümbet', lat: 37.0250, lng: 27.3980, type: 'hotel' },
  { name: 'Maçakızı Hotel Türkbükü', secondary: 'Göltürkbükü Mah. Keleşharim Cad., Bodrum', lat: 37.1280, lng: 27.3870, type: 'hotel' },
  { name: 'Vogue Hotel Supreme Bodrum', secondary: 'Torba Mah. Usuluk Koyu No:10, Torba', lat: 37.0811, lng: 27.4589, type: 'hotel' },
  { name: 'Sirene Luxury Hotel Bodrum', secondary: 'Geriş Mah. Erdemil Cad. No:80, Yalıkavak', lat: 37.0880, lng: 27.2850, type: 'hotel' },
  { name: 'Kempinski Hotel Barbaros Bay', secondary: 'Kızılağaç Köyü, Gerenu Mevkii, Bodrum', lat: 36.9850, lng: 27.4850, type: 'hotel' },
  { name: 'Swissôtel Resort Bodrum Beach', secondary: 'Gazi Mustafa Kemal Bulvarı No:42, Turgutreis', lat: 37.0050, lng: 27.2550, type: 'hotel' },
  { name: 'Rixos Premium Bodrum', secondary: 'Zeytinlikahve Mevkii, Torba, Bodrum', lat: 37.0850, lng: 27.4700, type: 'hotel' },
  { name: 'Amanruya Bodrum', secondary: 'Demir Koyu, Göltürkbükü, Bodrum', lat: 37.1150, lng: 27.4100, type: 'hotel' },
  { name: 'Susona Bodrum LXR', secondary: 'Torba Mah. Kaynar Cad. No:15, Torba', lat: 37.0780, lng: 27.4850, type: 'hotel' },
  { name: 'Six Senses Kaplankaya', secondary: 'Bozbük Mah., Milas/Muğla', lat: 37.3300, lng: 27.4200, type: 'hotel' },

  // Bodrum Yarımadası Bölgeleri & Didim
  { name: 'Bodrum Merkez (Kumbahçe / Çarşı / Kale)', secondary: 'Bodrum/Muğla', lat: 37.0344, lng: 27.4305, type: 'region' },
  { name: 'Yalıkavak', secondary: 'Bodrum/Muğla', lat: 37.1042, lng: 27.2958, type: 'region' },
  { name: 'Türkbükü (Göltürkbükü)', secondary: 'Bodrum/Muğla', lat: 37.1264, lng: 27.3892, type: 'region' },
  { name: 'Gündoğan Koyu', secondary: 'Bodrum/Muğla', lat: 37.1333, lng: 27.3417, type: 'region' },
  { name: 'Gümüşlük & Tavşan Adası', secondary: 'Bodrum/Muğla', lat: 37.0544, lng: 27.2344, type: 'region' },
  { name: 'Turgutreis Sahil', secondary: 'Bodrum/Muğla', lat: 37.0017, lng: 27.2592, type: 'region' },
  { name: 'Gümbet', secondary: 'Bodrum/Muğla', lat: 37.0315, lng: 27.4042, type: 'region' },
  { name: 'Bitez Sahili & Köyü', secondary: 'Bodrum/Muğla', lat: 37.0278, lng: 27.3828, type: 'region' },
  { name: 'Ortakent & Yahşi Yalısı', secondary: 'Bodrum/Muğla', lat: 37.0512, lng: 27.3524, type: 'region' },
  { name: 'Torba Koyu', secondary: 'Bodrum/Muğla', lat: 37.0811, lng: 27.4589, type: 'region' },
  { name: 'Güvercinlik Koyu', secondary: 'Bodrum/Muğla', lat: 37.1325, lng: 27.5750, type: 'region' },
  { name: 'Akyarlar & Karaincir Koyu', secondary: 'Bodrum/Muğla', lat: 36.9667, lng: 27.2833, type: 'region' },
  { name: 'Yalıçiftlik & Kızılağaç', secondary: 'Bodrum/Muğla', lat: 36.9850, lng: 27.5300, type: 'region' },
  { name: 'Didim & Altınkum Sahili', secondary: 'Didim/Aydın', lat: 37.3833, lng: 27.2667, type: 'region' },
  { name: 'Kuşadası Merkez & Marina', secondary: 'Kuşadası/Aydın', lat: 37.8600, lng: 27.2600, type: 'region' },
  { name: 'Marmaris Marina & Merkez', secondary: 'Marmaris/Muğla', lat: 36.8550, lng: 28.2740, type: 'region' },
  { name: 'Fethiye & Göcek Marina', secondary: 'Fethiye/Muğla', lat: 36.7530, lng: 28.9400, type: 'region' },
];

interface SuggestionItem {
  id: string;
  primaryText: string;
  secondaryText: string;
  lat: number;
  lng: number;
  type?: 'airport' | 'marina' | 'hotel' | 'region' | 'address';
}

function normalizeSearch(str: string): string {
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

export default function PlaceAutocompleteInput({
  id,
  label,
  placeholder = 'Adres, otel, marina veya havalimanı arayın...',
  value,
  onChange,
  onPlaceSelect,
  required = false,
  className = '',
  isPickup = false,
  defaultSuggestions = [],
  hideLabel = false,
}: PlaceAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserTypingRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        isUserTypingRef.current = false;
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic: Local Instant Match + Free OpenStreetMap Nominatim Geocoding
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setIsOpen(false);
      return;
    }

    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const normQuery = normalizeSearch(query);

    // 1. Instant local match
    const localMatches: SuggestionItem[] = VIP_PREDEFINED_LOCATIONS.filter((item) => {
      const normName = normalizeSearch(item.name);
      const normSec = normalizeSearch(item.secondary);
      return normName.includes(normQuery) || normSec.includes(normQuery);
    }).map((item, idx) => ({
      id: `vip-${idx}-${item.name}`,
      primaryText: item.name,
      secondaryText: item.secondary,
      lat: item.lat,
      lng: item.lng,
      type: item.type as SuggestionItem['type'],
    }));

    // Merge default suggestions if provided
    defaultSuggestions.forEach((s, idx) => {
      const normS = normalizeSearch(s);
      if (normS.includes(normQuery) && !localMatches.some((m) => normalizeSearch(m.primaryText) === normS)) {
        localMatches.push({
          id: `def-${idx}-${s}`,
          primaryText: s,
          secondaryText: 'VIP Transfer Bölgesi',
          lat: 37.05,
          lng: 27.35,
          type: s.toLowerCase().includes('havaliman') ? 'airport' : 'region',
        });
      }
    });

    if (localMatches.length > 0) {
      setSuggestions(localMatches.slice(0, 8));
      setIsOpen(true);
      setIsLoading(false);
    }

    // 2. OpenStreetMap Nominatim search for custom street addresses / specific places in Turkey
    const timer = setTimeout(async () => {
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=tr&addressdetails=1&limit=6`;

        const response = await fetch(nominatimUrl, {
          headers: {
            'Accept-Language': 'tr,en',
          },
        });

        if (!response.ok) throw new Error('OSM error');

        const osmData = await response.json();

        if (active && Array.isArray(osmData) && osmData.length > 0) {
          const osmResults: SuggestionItem[] = osmData.map((item, idx) => {
            const displayName = item.display_name || query;
            const parts = displayName.split(',').map((p: string) => p.trim());
            const primary = parts[0] || query;
            const secondary = parts.slice(1, 4).join(', ');

            return {
              id: `osm-${item.place_id || idx}`,
              primaryText: primary,
              secondaryText: secondary || 'Türkiye',
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              type: 'address',
            };
          });

          // Merge local matches and OSM results without duplicates
          const combined = [...localMatches];
          osmResults.forEach((osmItem) => {
            if (!combined.some((c) => normalizeSearch(c.primaryText) === normalizeSearch(osmItem.primaryText))) {
              combined.push(osmItem);
            }
          });

          setSuggestions(combined.slice(0, 8));
          setIsOpen(combined.length > 0);
        }
      } catch {
        // Photon fallback if Nominatim has rate limits
        try {
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=tr&limit=6`;
          const pRes = await fetch(photonUrl);
          if (pRes.ok) {
            const pData = await pRes.json();
            if (active && pData?.features?.length > 0) {
              const photonResults: SuggestionItem[] = pData.features.map((feat: { properties?: { name?: string; street?: string; city?: string; state?: string; country?: string }; geometry?: { coordinates?: [number, number] } }, idx: number) => {
                const props = feat.properties || {};
                const primary = props.name || props.street || query;
                const secondary = [props.street, props.city, props.state, props.country].filter(Boolean).join(', ');
                const coords = feat.geometry?.coordinates || [27.35, 37.05];

                return {
                  id: `photon-${idx}`,
                  primaryText: primary,
                  secondaryText: secondary || 'Türkiye',
                  lat: coords[1],
                  lng: coords[0],
                  type: 'address',
                };
              });

              const combined = [...localMatches];
              photonResults.forEach((pItem) => {
                if (!combined.some((c) => normalizeSearch(c.primaryText) === normalizeSearch(pItem.primaryText))) {
                  combined.push(pItem);
                }
              });

              setSuggestions(combined.slice(0, 8));
              setIsOpen(combined.length > 0);
            }
          }
        } catch {
          // If offline, keep local matches
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value, defaultSuggestions]);

  // Handle suggestion selection
  const handleSelectSuggestion = (item: SuggestionItem) => {
    isUserTypingRef.current = false;
    onChange(item.primaryText);
    setIsVerified(true);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    if (onPlaceSelect) {
      onPlaceSelect({
        name: item.primaryText,
        formattedAddress: item.secondaryText ? `${item.primaryText}, ${item.secondaryText}` : item.primaryText,
        lat: item.lat,
        lng: item.lng,
        placeId: item.id,
      });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // User input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserTypingRef.current = true;
    setIsVerified(false);
    setSelectedIndex(-1);
    onChange(e.target.value);
  };

  const handleClear = () => {
    isUserTypingRef.current = false;
    onChange('');
    setIsVerified(false);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Render icon based on location type
  const renderItemIcon = (type?: SuggestionItem['type']) => {
    switch (type) {
      case 'airport':
        return <Plane className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />;
      case 'marina':
        return <Anchor className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-brass shrink-0 mt-0.5" />;
      case 'region':
        return <Crosshair className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <MapPin className="w-4 h-4 text-foam/60 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-foam/80 mb-2 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className={`w-3.5 h-3.5 ${isPickup ? 'text-red-400' : 'text-amber-400'}`} />
            {label}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.trim().length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full rounded-xl border border-white/10 bg-ink-900/90 px-4 py-3.5 pl-10 pr-20 text-sm text-foam placeholder-foam/30 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass transition-all backdrop-blur-sm"
        />

        {/* Left search icon */}
        <div className="absolute left-3.5 text-foam/40 pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-brass/70" />
        </div>

        {/* Right action icons */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && <Loader2 className="w-4 h-4 text-brass animate-spin" />}

          {isVerified && !isLoading && (
            <span title="Konum doğrulandı" className="text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-foam/40 hover:text-foam hover:bg-white/10 transition-colors"
              title="Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-ink-950/98 shadow-2xl backdrop-blur-xl divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-foam/40 bg-white/[0.02] flex items-center justify-between">
            <span>Önerilen VIP Konumlar & Adresler</span>
            <span className="text-brass">Seçmek için tıklayın</span>
          </div>

          {suggestions.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(item);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-3.5 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brass/20 text-white border-l-2 border-brass'
                    : 'hover:bg-white/5 text-foam/90'
                }`}
              >
                {renderItemIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-white truncate flex items-center gap-2">
                    <span>{item.primaryText}</span>
                    {item.type === 'airport' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                        Havalimanı
                      </span>
                    )}
                    {item.type === 'marina' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        Marina
                      </span>
                    )}
                    {item.type === 'hotel' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Lüks Otel
                      </span>
                    )}
                  </div>
                  {item.secondaryText && (
                    <div className="text-[11px] text-foam/60 truncate mt-0.5">
                      {item.secondaryText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
