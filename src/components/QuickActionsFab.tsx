import React, { useState, useEffect } from 'react';
import { CalendarCheck, Car, Sparkles, HelpCircle } from 'lucide-react';

export default function QuickActionsFab() {
  const [hideFab, setHideFab] = useState(false);

  useEffect(() => {
    const handleState = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setHideFab(!!customEvent.detail.showMobileBar);
      }
    };
    window.addEventListener('bookingStateChanged', handleState);
    return () => window.removeEventListener('bookingStateChanged', handleState);
  }, []);

  const scrollTo = (id: string) => {
    let el = document.getElementById(id);
    if (!el && id === 'deneyim') {
      el = document.getElementById('gemide') || document.getElementById('filo');
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (hideFab) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[95] w-auto max-w-[96vw] pointer-events-auto">
      {/* Tek Bir Oval Buton İçerisinde Yan Yana Seçenekler */}
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-ink-950/95 backdrop-blur-xl border border-brass/50 shadow-[0_12px_40px_rgba(0,0,0,0.75)] ring-1 ring-white/10 select-none">
        
        {/* 1. Rezervasyon Butonu */}
        <button
          type="button"
          onClick={() => scrollTo('rezervasyon-motoru')}
          className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-brass hover:bg-brass-light text-ink-950 font-bold px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-md shadow-brass/30 shrink-0"
        >
          <CalendarCheck className="w-4 h-4 text-ink-950 shrink-0" strokeWidth={2.2} />
          <span className="whitespace-nowrap">Rezervasyon</span>
        </button>

        {/* İnce Ayırıcı Çizgi */}
        <div className="h-4 sm:h-5 w-px bg-white/15 shrink-0" />

        {/* 2. VIP Filo Butonu */}
        <button
          type="button"
          onClick={() => scrollTo('filo')}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-foam/90 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 shrink-0"
        >
          <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brass shrink-0" strokeWidth={2} />
          <span className="whitespace-nowrap">VIP Filo</span>
        </button>

        {/* İnce Ayırıcı Çizgi */}
        <div className="h-4 sm:h-5 w-px bg-white/15 shrink-0" />

        {/* 3. Ayrıcalıklar / Deneyim */}
        <button
          type="button"
          onClick={() => scrollTo('deneyim')}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-foam/90 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" strokeWidth={2} />
          <span className="whitespace-nowrap">Ayrıcalıklar</span>
        </button>

        {/* İnce Ayırıcı Çizgi */}
        <div className="h-4 sm:h-5 w-px bg-white/15 shrink-0" />

        {/* 4. S.S.S. */}
        <button
          type="button"
          onClick={() => scrollTo('faq')}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-foam/90 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" strokeWidth={2} />
          <span className="whitespace-nowrap">S.S.S.</span>
        </button>

      </div>
    </div>
  );
}
