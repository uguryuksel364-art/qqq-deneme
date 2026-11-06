import { useState, useEffect } from 'react';
import { X, CalendarDays, Users, Clock, Loader2, CheckCircle2, AlertCircle, MapPin, ChevronDown, type LucideIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured, type NewReservation, type TourType } from '@/lib/supabase';
import { useLanguage } from '@/lib/translations';
import { getTransferZones, type TransferZone } from '@/lib/transferPricing';
import { waLink, COUNTRY_CODES } from '@/lib/contact';
import PlaceAutocompleteInput, { VerifiedPlace } from './PlaceAutocompleteInput';

interface Props {
  open: boolean;
  onClose: () => void;
  initialNotes?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function ReservationForm({ open, onClose, initialNotes }: Props) {
  const { t } = useLanguage();
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [zones] = useState<TransferZone[]>(getTransferZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('yalikavak');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [customPlaceCoords, setCustomPlaceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [initialData] = useState(() => {
    let name = '';
    let savedPhone = '';
    let email = '';
    try {
      const saved = localStorage.getItem('mert_vip_guest_info');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.name) name = p.name;
        if (p.phone && !p.phone.includes('539 440 78 23')) savedPhone = p.phone;
        if (p.email) email = p.email;
      }
    } catch {
      // ignore
    }

    let cc = '+90';
    let body = '';

    if (savedPhone) {
      const match = COUNTRY_CODES.find((c) => savedPhone.startsWith(c.code));
      if (match) {
        cc = match.code;
        body = savedPhone.slice(match.code.length);
      } else {
        body = savedPhone;
      }
    } else {
      // For new guests, default to TR + empty body (but we can pre-fill 5 for TR)
      body = '5';
    }

    return { name, email, cc, body, fullPhone: savedPhone || '+905' };
  });

  const [countryCode, setCountryCode] = useState(initialData.cc);
  const [phoneBody, setPhoneBody] = useState(initialData.body);

  const [form, setForm] = useState<NewReservation>(() => ({
    name: initialData.name,
    phone: initialData.fullPhone,
    email: initialData.email,
    tour_date: '',
    tour_type: 'full_day',
    guests: 2,
    notes: '',
  }));

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        ...(initialNotes ? { notes: initialNotes } : {}),
      }));
    }
  }, [open, initialNotes]);

  // Combined phone sync
  useEffect(() => {
    const combined = `${countryCode}${phoneBody}`;
    if (form.phone !== combined) {
      setForm(f => ({ ...f, phone: combined }));
    }
  }, [countryCode, phoneBody, form.phone]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = (field: keyof NewReservation, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Lütfen adınızı ve soyadınızı giriniz.');
      document.getElementById('res-client-name')?.focus();
      return;
    }
    if (!form.phone.trim() || phoneBody.length < 6) {
      alert('Lütfen geçerli bir telefon numarası giriniz.');
      document.getElementById('res-client-phone')?.focus();
      return;
    }
    if (!form.tour_date) {
      alert('Lütfen transfer tarihini seçiniz.');
      return;
    }
    setState('submitting');
    setErrorMsg('');

    const payload: NewReservation = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || undefined,
      tour_date: form.tour_date,
      tour_type: form.tour_type,
      guests: Number(form.guests),
      notes: form.notes?.trim() || undefined,
    };

    let supabaseSuccess = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('reservations').insert([payload]);
        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn('Supabase insertion error:', err);
      }
    }

    // Always mirror to localStorage so reservations persist reliably
    try {
      const existing = localStorage.getItem('mert_vip_reservations');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({
        ...payload,
        id: `res-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('mert_vip_reservations', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));

      // Remember customer profile locally for next bookings
      if (payload.name) {
        localStorage.setItem(
          'mert_vip_guest_info',
          JSON.stringify({ name: payload.name, phone: payload.phone, email: payload.email || '' })
        );
      }
    } catch (storageErr) {
      console.warn('Failed saving reservation to localStorage:', storageErr);
      if (!supabaseSuccess && !isSupabaseConfigured) {
        setState('error');
        setErrorMsg(t.close === 'Kapat' || t.close === 'إغلاق' ? 'Rezervasyon gönderilemedi. Lütfen tekrar deneyin.' : 'Could not submit reservation. Please try again.');
        return;
      }
    }

    setState('success');
    setForm({
      name: '',
      phone: '',
      email: '',
      tour_date: '',
      tour_type: 'full_day',
      guests: 2,
      notes: '',
    });
  };

  const handleClose = () => {
    setState('idle');
    setErrorMsg('');
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-foam/10 bg-ink-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-foam/10 bg-ink-700/95 px-6 py-4 backdrop-blur-md">
          <h3 className="font-serif text-2xl text-foam">{t.reservationFormTitle}</h3>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foam/60 transition-colors hover:bg-white/5 hover:text-foam"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {state === 'success' ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <CheckCircle2 className="h-14 w-14 text-teal-400" strokeWidth={1.5} />
            <h4 className="mt-5 font-serif text-2xl text-foam">
              {t.submitSuccess}
            </h4>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-foam/65">
              {t.submitSuccessDesc}
            </p>
            <button
              onClick={handleClose}
              className="mt-7 rounded-full bg-teal px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-teal-400"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5">
            <div className="space-y-4">
              <Field label={t.fullName} required>
                <input
                  id="res-client-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={t.fullName || "Adınız Soyadınız"}
                  className="input !bg-[#0b1e2d] !text-white font-medium"
                  style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.phone} required>
                  <div className="flex gap-2">
                    <div className="relative min-w-[100px]">
                      <select
                        value={countryCode}
                        onChange={(e) => {
                          const newCC = e.target.value;
                          setCountryCode(newCC);
                          // If switching to TR and body is empty, pre-fill with 5
                          if (newCC === '+90' && !phoneBody) {
                            setPhoneBody('5');
                          } else if (newCC !== '+90' && phoneBody === '5') {
                            setPhoneBody('');
                          }
                        }}
                        className="input !bg-[#0b1e2d] !text-white font-medium pr-8 cursor-pointer appearance-none"
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
                      id="res-client-phone"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      value={phoneBody}
                      onChange={(e) => setPhoneBody(e.target.value)}
                      placeholder="5XX XXX XX XX"
                      className="input flex-1 !bg-[#0b1e2d] !text-white font-medium"
                      style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    />
                  </div>
                </Field>
                <Field label={t.email}>
                  <input
                    id="res-client-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder={t.emailOptionalUpper ? t.emailOptionalUpper : "ornek@mail.com"}
                    className="input !bg-[#0b1e2d] !text-white font-medium"
                    style={{ backgroundColor: '#0b1e2d', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  />
                </Field>
              </div>

              {/* Bodrum VIP Transfer Route Selector */}
              <Field label={t.reservationRouteLabel || "Transfer Güzergâhı & Bölge"} required icon={MapPin}>
                <div className="space-y-2">
                  <select
                    value={selectedZoneId}
                    onChange={(e) => {
                      const zId = e.target.value;
                      setSelectedZoneId(zId);
                      const z = zones.find((item) => item.id === zId);
                      if (z) {
                        const noteText = `Transfer: Milas-Bodrum Havalimanı → ${z.name} (${z.oneWayPriceEur} €)`;
                        setForm((prev) => ({
                          ...prev,
                          notes: prev.notes ? `${prev.notes}\n${noteText}` : noteText,
                        }));
                      }
                    }}
                    className="input cursor-pointer"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {z.oneWayPriceEur} €
                      </option>
                    ))}
                  </select>

                  {/* Price Banner */}
                  {(() => {
                    const activeZone = zones.find((z) => z.id === selectedZoneId);
                    return activeZone ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-brass/10 border border-brass/30 text-xs">
                        <span className="text-foam/80">
                          {t.officialTariffLabel || 'Resmi Tarife (Tek Yön):'} <strong className="text-brass font-bold text-sm">{activeZone.oneWayPriceEur} €</strong>
                        </span>
                        <span className="text-foam/60">
                          {t.roundTripLabel || 'Gidiş-Dönüş:'} <strong className="text-amber-300 font-bold">{activeZone.roundTripPriceEur} €</strong>
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </Field>

              {/* Exact Address / Hotel Autocomplete with Google Maps Validation */}
              <div className="pt-1">
                <PlaceAutocompleteInput
                  id="reservation-custom-address"
                  label={t.exactAddressLabel || "Varış / Alış Adresi (Otel, Marina veya Sokak)"}
                  placeholder={t.addressPlaceholder || "Örn: The Bodrum EDITION, Yalıkavak Marina..."}
                  value={customAddress}
                  onChange={(val) => {
                    setCustomAddress(val);
                  }}
                  onPlaceSelect={(place: VerifiedPlace) => {
                    setCustomAddress(place.name);
                    setCustomPlaceCoords({ lat: place.lat, lng: place.lng });
                    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
                    const addrNote = `Doğrulanmış Adres: ${place.name} (${place.formattedAddress})\nKonum Linki: ${mapsLink}`;
                    setForm((prev) => ({
                      ...prev,
                      notes: prev.notes ? `${prev.notes}\n${addrNote}` : addrNote,
                    }));
                  }}
                  defaultSuggestions={zones.map((z) => z.name)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.tourDate} required icon={CalendarDays}>
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.tour_date}
                    onChange={(e) => update('tour_date', e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label={t.guestCount} icon={Users}>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.guests}
                    onChange={(e) => update('guests', Number(e.target.value))}
                    className="input"
                  />
                </Field>
              </div>

              <Field label={t.tourDuration} icon={Clock}>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: 'full_day', label: t.fullDay },
                      { value: 'half_day', label: t.halfDay },
                    ] as { value: TourType; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('tour_type', opt.value)}
                      className={`rounded-xl border px-4 py-3 text-sm font-light transition-all ${
                        form.tour_type === opt.value
                          ? 'border-teal-500 bg-teal-500/15 text-foam'
                          : 'border-white/10 text-foam/60 hover:border-white/25'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t.notes}>
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder={t.notes}
                  rows={3}
                  className="input resize-none"
                />
              </Field>
            </div>

            {state === 'error' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={state === 'submitting'}
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-teal px-7 py-3.5 text-sm font-medium text-ink transition-all hover:bg-teal-400 disabled:opacity-60"
              >
                {state === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  t.sendRequest
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const activeZone = zones.find((z) => z.id === selectedZoneId);
                  const zoneName = activeZone ? activeZone.name : selectedZoneId;
                  const addressStr = customAddress || zoneName;
                  const mapsLink = customPlaceCoords
                    ? `https://www.google.com/maps/search/?api=1&query=${customPlaceCoords.lat},${customPlaceCoords.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`;

                  const msg = `✨ *${t.reservationFormTitle.toUpperCase()}* ✨
👤 *${t.fullName}:* ${form.name || '-'}
📞 *${t.phone}:* ${form.phone || '-'}
📍 *${t.reservationRouteLabel || 'Bölge / Adres'}:* ${addressStr}
🔗 *Google Haritalar:* ${mapsLink}
📅 *${t.tourDate}:* ${form.tour_date || '-'}
👥 *${t.guestCount}:* ${form.guests}
📝 *${t.notes}:* ${form.notes || '-'}`;

                  window.open(waLink(msg), '_blank');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] px-7 py-3 text-sm font-semibold text-white transition-all shadow-md shadow-[#25D366]/20"
              >
                <span>{t.sendWhatsappWithLocation || 'WhatsApp ile Gönder'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-foam/50">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
        {label}
        {required && <span className="text-teal">*</span>}
      </span>
      {children}
    </label>
  );
}
