import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Star,
  Tv,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getPageSettings } from '@/lib/pageSettings';
import { ImageCarousel } from './ImageCarousel';
import ReservationForm from './ReservationForm';
import { useLanguage, localizeVehicle } from '@/lib/translations';

export default function Fleet() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(() => getPageSettings());
  const [formOpen, setFormOpen] = useState(false);
  const [selectedYacht] = useState<string>('');

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getPageSettings());
    };
    window.addEventListener('pageSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', handleSettingsUpdate);
  }, []);

  return (
    <section id="filo" className="relative bg-ink-950 py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        
        {/* ---------------- FLEET CARDS GRID ---------------- */}
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl sm:text-5xl text-foam mb-4">
            {t.fleetTitle || 'Lüks VIP Filomuz'}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {settings.fleet.map((yacht) => {
            const v = localizeVehicle(yacht, t);
            const text = `${yacht.id || ''} ${yacht.name || ''}`.toLowerCase();
            let vehicleKey = 'maybach-design';
            if (text.includes('maybach')) vehicleKey = 'maybach-design';
            else if (text.includes('premium') || text.includes('vito')) vehicleKey = 'premium-van';
            else if (text.includes('ultra')) vehicleKey = 'ultra-vip-sprinter';
            else if (text.includes('sprinter')) vehicleKey = 'vip-sprinter';

            return (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                key={v.id}
                id={`fleet-card-${v.id}`}
                data-vehicle-key={vehicleKey}
                data-fleet-vehicle-key={vehicleKey}
                data-fleet-id={v.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-foam/10 bg-ink-900/60 transition-all duration-300 hover:border-brass/40 hover:bg-ink-900 shadow-xl scroll-mt-24"
              >
                <span id={`fleet-card-${vehicleKey}`} className="sr-only" />
                <div>
                  {/* Photo Gallery Carousel */}
                  <div className="relative overflow-hidden bg-ink-950">
                    <ImageCarousel
                      images={v.images}
                      alt={`${v.name} - Bodrum Luxury VIP Transfer`}
                      className="w-full"
                      aspectRatioClassName="aspect-[4/3] sm:aspect-video lg:aspect-[4/3]"
                      hideCounter={true}
                    />
                  </div>

                  {/* Body Details */}
                  <div className="p-6 pb-4">
                    <h3 className="font-serif text-2xl text-foam mb-3 group-hover:text-brass transition-colors">
                      {v.name}
                    </h3>

                    {/* Specs Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-light bg-ink-800 text-foam/85 border border-foam/10 px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3 text-teal-400" />
                        {v.capacityLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-light bg-ink-800 text-foam/85 border border-foam/10 px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 text-brass" />
                        {v.feature1Label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-light bg-ink-800 text-foam/85 border border-foam/10 px-2.5 py-1 rounded-full">
                        <Tv className="w-3 h-3 text-teal-400" />
                        {v.feature2Label}
                      </span>
                    </div>

                    <p className="text-sm font-light leading-relaxed text-foam/70">
                      {v.description}
                    </p>
                  </div>
                </div>

                {/* Actions: Rezervasyon & Aracı Gör */}
                <div className="p-6 pt-0 border-t border-foam/10 mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `${yacht.id || ''} ${yacht.name || ''}`.toLowerCase();
                      let vehicleKey = 'maybach-design';
                      if (text.includes('maybach')) vehicleKey = 'maybach-design';
                      else if (text.includes('premium') || text.includes('vito')) vehicleKey = 'premium-van';
                      else if (text.includes('ultra')) vehicleKey = 'ultra-vip-sprinter';
                      else if (text.includes('sprinter')) vehicleKey = 'vip-sprinter';

                      // 1. Select vehicle in booking engine
                      window.dispatchEvent(new CustomEvent('selectVehicle', { detail: { vehicleKey } }));

                      // 2. Smoothly scroll directly to the top of the booking form
                      const target = document.getElementById('rezervasyon-motoru') || document.getElementById('booking-engine');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3.5 text-sm font-bold text-ink transition-all hover:bg-teal-400 hover:shadow-[0_0_20px_-4px_rgba(79,169,168,0.4)] active:scale-95 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{t.requestReservation || 'Rezervasyon Talebi'}</span>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <ReservationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialNotes={selectedYacht ? `${selectedYacht} için VIP transfer rezervasyonu yapmak istiyorum.` : ''}
      />
    </section>
  );
}
