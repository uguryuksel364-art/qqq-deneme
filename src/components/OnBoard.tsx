import { motion } from 'motion/react';
import { ShieldCheck, UtensilsCrossed, Clock, Crown } from 'lucide-react';
import { useLanguage } from '@/lib/translations';

export default function OnBoard() {
  const { t } = useLanguage();

  const ITEMS = [
    {
      numeral: 'I',
      icon: ShieldCheck,
      title: t.onBoard1Title,
      desc: t.onBoard1Desc,
    },
    {
      numeral: 'II',
      icon: UtensilsCrossed,
      title: t.onBoard2Title,
      desc: t.onBoard2Desc,
    },
    {
      numeral: 'III',
      icon: Clock,
      title: t.onBoard3Title,
      desc: t.onBoard3Desc,
    },
    {
      numeral: 'IV',
      icon: Crown,
      title: t.onBoard4Title,
      desc: t.onBoard4Desc,
    },
  ];

  return (
    <section id="gemide" className="relative bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-4 text-[11px] uppercase tracking-eyebrow text-brass">
            {t.onBoardTitle ? t.onBoardTitle.split(' ')[0] : 'Gemide'}
          </p>
          <h2 className="font-serif text-4xl leading-tight text-foam sm:text-5xl text-balance">
            {t.onBoardTitle}
          </h2>
          <p className="mt-5 text-base font-light leading-relaxed text-foam/65">
            {t.onBoardDesc}
          </p>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-foam/10 bg-foam/5 sm:grid-cols-2">
          {ITEMS.map((it) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              key={it.numeral}
              className="group relative bg-ink-800 p-8 transition-colors duration-500 hover:bg-ink-700/70 sm:p-10"
            >
              <div className="flex items-start gap-5">
                <span className="font-serif text-3xl italic text-brass/70 transition-colors group-hover:text-brass">
                  {it.numeral}
                </span>
                <div className="flex-1">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-teal-500/30 text-teal-400 transition-colors group-hover:border-teal-500/60 group-hover:bg-teal-500/10">
                    <it.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl text-foam">{it.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-foam/65">
                    {it.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
