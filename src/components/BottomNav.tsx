import { useState, useEffect } from 'react';
import { CalendarDays, Phone, Car, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/translations';
import { telLink } from '@/lib/contact';
import { motion } from 'motion/react';
import { getPageSettings } from '@/lib/pageSettings';

const SnakeBorder = ({ radius }: { radius: number }) => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
    <svg className="w-full h-full" fill="none">
      <rect 
        x="0.75" y="0.75" 
        width="calc(100% - 1.5px)" height="calc(100% - 1.5px)" 
        rx={radius} ry={radius} 
        className="stroke-teal-400/90 stroke-[2] snake-border-rect"
      />
    </svg>
  </div>
);

export default function BottomNav() {
  const { t } = useLanguage();
  const [navTheme, setNavTheme] = useState(() => getPageSettings().navTheme || 'default');

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setNavTheme(getPageSettings().navTheme || 'default');
    };
    window.addEventListener('pageSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('pageSettingsUpdated', handleSettingsUpdate);
  }, []);

  const navItems = [
    {
      label: t.reservation,
      icon: <CalendarDays className="w-5 h-5" />,
      href: '#rezervasyon-motoru',
      bgColor: 'bg-teal/90',
      textColor: 'text-white',
    },
    {
      label: t.call || 'Ara',
      icon: <Phone className="w-5 h-5" />,
      href: telLink,
      bgColor: 'bg-[#10A37F]',
      textColor: 'text-white',
    },
    {
      label: t.fleetShort || 'Filo',
      icon: <Car className="w-5 h-5" />,
      href: '#filo',
      bgColor: 'bg-brass',
      textColor: 'text-ink-950',
    },
    {
      label: t.faq || 'SSS',
      icon: <HelpCircle className="w-5 h-5" />,
      href: '#faq',
      bgColor: 'bg-ink-900',
      textColor: 'text-white',
    },
  ];

  if (navTheme === 'vibrant') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-[100] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="mx-auto max-w-lg bg-ink-950/85 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 pointer-events-auto p-2 relative">
          <SnakeBorder radius={32} />
          <div className="flex items-center justify-around relative z-10">
            {navItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -3 }}
                className="group flex flex-col items-center gap-1.5 flex-1 cursor-pointer"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.bgColor} ${item.textColor} shadow-lg transition-transform group-hover:scale-110`}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tight text-foam/80 group-hover:text-brass transition-colors">
                  {item.label}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (navTheme === 'classic-white') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-[100] px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 pointer-events-none">
        <div className="mx-auto max-w-lg bg-ink-950/90 backdrop-blur-md border border-brass/30 rounded-[28px] shadow-2xl overflow-hidden ring-1 ring-white/5 pointer-events-auto relative">
          <SnakeBorder radius={28} />
          <div className="flex items-center justify-around py-2 px-1 relative z-10">
            {navItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                whileTap={{ scale: 1.05 }}
                whileHover={{ scale: 1.1 }}
                className="group flex flex-col items-center gap-1 flex-1 py-1 text-brass transition-all"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.bgColor} ${item.textColor} shadow-md transition-transform group-hover:scale-110 group-active:scale-110`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-brass">
                  {item.label}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default Theme
  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 pointer-events-none">
      <div className="mx-auto max-w-lg bg-ink-950/90 backdrop-blur-md border border-brass/30 rounded-[28px] shadow-2xl overflow-hidden ring-1 ring-white/5 pointer-events-auto relative">
        <SnakeBorder radius={28} />
        <div className="flex items-center justify-around py-2 px-1 relative z-10">
          {navItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileTap={{ scale: 1.05 }}
              whileHover={{ scale: 1.1 }}
              className="group flex flex-col items-center gap-1 flex-1 py-1 text-brass/80 transition-all hover:text-brass"
            >
              <div className="transition-transform group-hover:scale-110 group-active:scale-110">
                {item.icon}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
