import React, { useState } from 'react';
import {
  TransferZone,
  getTransferZones,
  saveTransferZones,
  resetTransferZones,
  AIRPORT_BASE,
  KmTariff,
  getKmTariff,
  saveKmTariff,
  resetKmTariff,
} from '@/lib/transferPricing';
import {
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Euro,
  Gauge,
  Percent,
  Info,
  Check,
  Calculator,
  Sparkles,
} from 'lucide-react';

import { useEffect } from 'react';

export default function TransferPriceManager({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const [zones, setZones] = useState<TransferZone[]>(getTransferZones);
  const [kmTariff, setKmTariff] = useState<KmTariff>(getKmTariff);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  // Initial values for dirty check
  const [initialZones] = useState(() => JSON.stringify(getTransferZones()));
  const [initialKmTariff] = useState(() => JSON.stringify(getKmTariff()));

  useEffect(() => {
    if (!onDirtyChange) return;

    const isDirty = 
      JSON.stringify(zones) !== initialZones ||
      JSON.stringify(kmTariff) !== initialKmTariff;

    onDirtyChange(isDirty);
  }, [zones, kmTariff, initialZones, initialKmTariff, onDirtyChange]);

  // New Zone State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneOneWay, setNewZoneOneWay] = useState(60);
  const [newZoneRoundTrip, setNewZoneRoundTrip] = useState(110);
  const [newZoneKm, setNewZoneKm] = useState(40);
  const [newZoneMins, setNewZoneMins] = useState(35);

  const handlePriceChange = (
    id: string,
    field: 'oneWayPriceEur' | 'roundTripPriceEur' | 'distanceKm' | 'durationMins',
    value: number
  ) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );
  };

  const handleSave = () => {
    saveTransferZones(zones);
    saveKmTariff(kmTariff);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    const def = resetTransferZones();
    const defTariff = resetKmTariff();
    setZones(def);
    setKmTariff(defTariff);
    setResetModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddNewZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const id = newZoneName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newZone: TransferZone = {
      id: `custom-${id}-${Date.now()}`,
      name: newZoneName.trim(),
      fullName: `${newZoneName.trim()} Bölgesi`,
      lat: 37.05,
      lng: 27.35,
      oneWayPriceEur: Number(newZoneOneWay),
      roundTripPriceEur: Number(newZoneRoundTrip),
      distanceKm: Number(newZoneKm),
      durationMins: Number(newZoneMins),
      description: 'Yönetici tarafından eklenen özel transfer bölgesi.',
    };

    const updated = [...zones, newZone];
    setZones(updated);
    saveTransferZones(updated);
    setNewZoneName('');
    setShowAddForm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteZone = (id: string) => {
    const updated = zones.filter((z) => z.id !== id);
    setZones(updated);
    saveTransferZones(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions - Sticky for easy access */}
      <div className="sticky top-[116px] sm:top-[128px] z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-800/95 p-5 rounded-2xl border border-brass/30 backdrop-blur-xl shadow-xl transition-all duration-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brass/20 text-brass">
              <Euro className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-white font-medium">
              Bodrum Transfer Fiyat Listesi & Kilometre Tarifesi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-foam/70 mt-1">
            Kalkış noktası <strong className="text-white">Milas-Bodrum Havalimanı (BJV)</strong> olan transfer bölgelerinin sabit paket fiyatlarını ve açık adres/özel güzergahlarda OSRM ile otomatik uygulanan kilometre başına tarifeyi buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setResetModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-foam hover:text-white text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-foam/60" />
            <span>Varsayılana Sıfırla</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brass hover:bg-brass-light text-ink-950 font-bold text-xs tracking-wide shadow-lg shadow-brass/20 transition-all hover:scale-105 cursor-pointer min-h-[42px]"
          >
            <Save className="w-4 h-4" />
            <span>Fiyatları & Tarifeyi Kaydet</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Fiyat ve kilometre tarifesi başarıyla kaydedildi! Canlı harita ve rezervasyon motorunda anında güncellendi.</span>
        </div>
      )}

      {/* KM-BASED TARIFF SETTINGS CARD */}
      <div className={`p-5 sm:p-6 rounded-2xl bg-ink-900/90 border transition-all duration-300 shadow-xl space-y-5 ${
        kmTariff.enabled ? 'border-brass/50 ring-1 ring-brass/20' : 'border-white/10 opacity-95'
      }`}>
        {/* Header with Title and Luxury Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-3">
            <span className={`p-2 rounded-xl transition-colors ${
              kmTariff.enabled ? 'bg-brass/20 text-brass' : 'bg-white/10 text-foam/50'
            }`}>
              <Gauge className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-base">
                  Kilometre Başına Ücret Tarifesi (OSRM Otomatik Hesaplama)
                </h3>
                {kmTariff.enabled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SİSTEMDE AKTİF
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    DEVRE DIŞI
                  </span>
                )}
              </div>
              <p className="text-xs text-foam/60 mt-0.5">
                Açık adres girildiğinde veya ara güzergâhlarda gerçek yol kilometresine göre otomatik fiyatlandırma yapar.
              </p>
            </div>
          </div>

          {/* Luxury Switch Button */}
          <div className="flex items-center gap-3 bg-ink-950/80 px-4 py-2.5 rounded-xl border border-white/10 self-start sm:self-center shrink-0">
            <span className="text-xs font-medium text-foam/80">
              Tarife Durumu:
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={kmTariff.enabled}
              onClick={() => setKmTariff(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                kmTariff.enabled ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-white/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  kmTariff.enabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold tracking-wider ${
              kmTariff.enabled ? 'text-emerald-400' : 'text-foam/50'
            }`}>
              {kmTariff.enabled ? 'AÇIK' : 'KAPALI'}
            </span>
          </div>
        </div>

        {/* Informational Banner */}
        {kmTariff.enabled ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-200/90 leading-relaxed">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">Kilometre tarifesi devrede:</span> Havalimanı dışındaki ara güzergâhlarda veya özel açık adreslerde OSRM ile hesaplanan yol mesafesi (km) × belirlenen birim fiyat ile şeffaf ve otomatik hesaplanır. Sabit havalimanı paketleri bu ayardan etkilenmez, her zaman sabit fiyatla sunulur.
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Kilometre tarifesi kapatıldı:</span> Müşteriler açık adres veya özel güzergâh seçtiğinde kilometreye göre otomatik ücret eklenmez; sistem en yakın sabit bölge paket fiyatını uygular. İstediğiniz zaman yukarıdaki anahtarı açarak kilometre tarifesini tekrar aktif edebilirsiniz.
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className={`grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1 transition-opacity ${
          kmTariff.enabled ? 'opacity-100' : 'opacity-75'
        }`}>
          <div className="bg-ink-950 p-3.5 rounded-xl border border-white/10">
            <label className="text-[11px] uppercase tracking-wider text-foam/60 block mb-1 font-medium">
              Açılış / Baz Ücret (€)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={kmTariff.baseOpeningFeeEur}
                onChange={(e) =>
                  setKmTariff({ ...kmTariff, baseOpeningFeeEur: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-ink-900 border border-white/15 text-foam font-mono text-sm focus:border-brass"
              />
              <span className="text-brass font-bold">€</span>
            </div>
          </div>

          <div className="bg-ink-950 p-3.5 rounded-xl border border-brass/30">
            <label className="text-[11px] uppercase tracking-wider text-brass block mb-1 font-medium">
              Km Başına Ücret (€/km)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                min={0.1}
                value={kmTariff.perKmRateEur}
                onChange={(e) =>
                  setKmTariff({ ...kmTariff, perKmRateEur: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-ink-900 border border-brass/50 text-brass font-mono text-sm focus:border-brass font-bold"
              />
              <span className="text-brass font-bold">€/km</span>
            </div>
          </div>

          <div className="bg-ink-950 p-3.5 rounded-xl border border-white/10">
            <label className="text-[11px] uppercase tracking-wider text-foam/60 block mb-1 font-medium">
              Minimum Transfer Ücreti (€)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                value={kmTariff.minimumFeeEur}
                onChange={(e) =>
                  setKmTariff({ ...kmTariff, minimumFeeEur: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-ink-900 border border-white/15 text-foam font-mono text-sm focus:border-brass"
              />
              <span className="text-foam/60 font-bold">€</span>
            </div>
          </div>

          <div className="bg-ink-950 p-3.5 rounded-xl border border-white/10">
            <label className="text-[11px] uppercase tracking-wider text-amber-300 block mb-1 font-medium flex items-center gap-1">
              <Percent className="w-3 h-3 text-amber-300" />
              Gidiş-Dönüş İndirim Oranı
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={50}
                value={kmTariff.roundTripDiscountPercent}
                onChange={(e) =>
                  setKmTariff({ ...kmTariff, roundTripDiscountPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-ink-900 border border-amber-400/40 text-amber-300 font-mono text-sm focus:border-amber-400"
              />
              <span className="text-amber-300 font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Live Calculation Preview / Simulator */}
        <div className="p-4 rounded-xl bg-ink-950/90 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-brass/15 text-brass shrink-0">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <span className="text-white font-semibold flex items-center gap-1.5">
                Canlı Tarife Simülatörü (40 km Rota Örneği)
                <Sparkles className="w-3 h-3 text-brass" />
              </span>
              <p className="text-[11px] text-foam/60 mt-0.5">
                {kmTariff.enabled ? (
                  <>
                    Formül: {kmTariff.baseOpeningFeeEur} € (Açılış) + (40 km × {kmTariff.perKmRateEur} €) = {' '}
                    <strong className="text-brass">
                      {Math.max(kmTariff.minimumFeeEur, Math.round(kmTariff.baseOpeningFeeEur + 40 * kmTariff.perKmRateEur))} €
                    </strong>
                    {kmTariff.roundTripDiscountPercent > 0 && (
                      <span className="text-amber-300 ml-2">
                        (Gidiş-Dönüş %{kmTariff.roundTripDiscountPercent} indirimle: {Math.round(Math.max(kmTariff.minimumFeeEur, Math.round(kmTariff.baseOpeningFeeEur + 40 * kmTariff.perKmRateEur)) * 2 * (1 - kmTariff.roundTripDiscountPercent / 100))} €)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-amber-400/90">
                    Tarife kapalı olduğu için 40 km'lik ara güzergahlarda sistem en yakın sabit bölge paketini sunar.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <span className="text-[11px] text-foam/50">Müşteriye Sunulan:</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              kmTariff.enabled
                ? 'bg-brass/20 text-brass border border-brass/30'
                : 'bg-white/10 text-white border border-white/15'
            }`}>
              {kmTariff.enabled
                ? `${Math.max(kmTariff.minimumFeeEur, Math.round(kmTariff.baseOpeningFeeEur + 40 * kmTariff.perKmRateEur))} € (KM Hesabı)`
                : 'Sabit Bölge Paketi'}
            </span>
          </div>
        </div>
      </div>

      {/* Airport Base Info */}
      <div className="p-4 rounded-xl bg-ink-950/80 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <span className="text-foam/50 text-[11px] block">Sabit Havalimanı Karşılama Merkezi:</span>
            <span className="text-white font-semibold">{AIRPORT_BASE.fullName}</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-brass/10 border border-brass/30 text-brass font-mono text-[11px]">
          Para Birimi: Euro (€)
        </span>
      </div>

      {/* Price Table for Predefined Zones */}
      <div className="space-y-2">
        <div className="sm:hidden flex items-center justify-between text-[11px] text-foam/60 px-1">
          <span>👉 Tabloyu sağa-sola kaydırarak tüm fiyat ve süreleri görebilirsiniz</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800/40 backdrop-blur-md">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-ink-950/90 text-foam/60 text-[11px] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Transfer Bölgesi</th>
                <th className="py-3.5 px-4">Mesafe (km)</th>
                <th className="py-3.5 px-4">Süre (dk)</th>
                <th className="py-3.5 px-4 text-brass font-bold">Tek Yön Fiyat (€)</th>
                <th className="py-3.5 px-4 text-amber-300 font-bold">Gidiş - Dönüş Fiyat (€)</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brass" />
                      <span>{zone.name}</span>
                    </div>
                    {zone.description && (
                      <p className="text-[11px] text-foam/50 max-w-xs truncate mt-0.5">
                        {zone.description}
                      </p>
                    )}
                  </td>

                  {/* Distance */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={zone.distanceKm}
                        onChange={(e) =>
                          handlePriceChange(zone.id, 'distanceKm', Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-ink-950 border border-white/15 text-foam text-xs font-mono"
                      />
                      <span className="text-foam/40 text-[11px]">km</span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={zone.durationMins}
                        onChange={(e) =>
                          handlePriceChange(zone.id, 'durationMins', Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-ink-950 border border-white/15 text-foam text-xs font-mono"
                      />
                      <span className="text-foam/40 text-[11px]">dk</span>
                    </div>
                  </td>

                  {/* One-way Price */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={zone.oneWayPriceEur}
                        onChange={(e) =>
                          handlePriceChange(zone.id, 'oneWayPriceEur', Number(e.target.value))
                        }
                        className="w-20 px-2.5 py-1.5 rounded-lg bg-ink-950 border border-brass/50 text-brass font-bold text-sm font-mono focus:ring-1 focus:ring-brass"
                      />
                      <span className="text-brass font-bold">€</span>
                    </div>
                  </td>

                  {/* Round-trip Price */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={zone.roundTripPriceEur}
                        onChange={(e) =>
                          handlePriceChange(zone.id, 'roundTripPriceEur', Number(e.target.value))
                        }
                        className="w-20 px-2.5 py-1.5 rounded-lg bg-ink-950 border border-amber-400/50 text-amber-300 font-bold text-sm font-mono focus:ring-1 focus:ring-amber-400"
                      />
                      <span className="text-amber-300 font-bold">€</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {zone.id.startsWith('custom-') && (
                      <button
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Bölgeyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Add New Custom Zone Form */}
      <div className="pt-2">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-brass/50 bg-white/5 hover:bg-white/10 text-foam hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brass" />
            <span>Yeni Transfer Bölgesi Ekle</span>
          </button>
        ) : (
          <form
            onSubmit={handleAddNewZone}
            className="p-5 rounded-2xl border border-brass/30 bg-ink-800/80 space-y-4 animate-in fade-in"
          >
            <h3 className="font-semibold text-sm text-white">Yeni Bodrum Transfer Bölgesi Ekle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-foam/60 block mb-1">Bölge Adı</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Örn: Torba Koyu / Cennet Koyu"
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-brass block mb-1">Tek Yön (€)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newZoneOneWay}
                  onChange={(e) => setNewZoneOneWay(Number(e.target.value))}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-amber-300 block mb-1">Gidiş - Dönüş (€)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newZoneRoundTrip}
                  onChange={(e) => setNewZoneRoundTrip(Number(e.target.value))}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-foam/60 block mb-1">Mesafe (km)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newZoneKm}
                  onChange={(e) => setNewZoneKm(Number(e.target.value))}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-foam/60 block mb-1">Süre (dk)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newZoneMins}
                  onChange={(e) => setNewZoneMins(Number(e.target.value))}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-foam/60 hover:text-white"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brass hover:bg-brass-light text-ink-950 font-bold text-xs"
              >
                Bölgeyi Listeye Ekle
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirmation Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-ink-900 p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">
              Tüm Fiyatları & Tarifeyi Varsayılana Sıfırla?
            </h3>
            <p className="text-xs text-foam/70">
              Bu işlem Bodrum havalimanı transfer bölgelerinin orijinal fiyatlarını ve standart kilometre tarifesini geri yükleyecektir. Onaylıyor musunuz?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-foam/60 hover:text-white border border-white/10"
              >
                Vazgeç
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
