import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/translations';

export default function Faq() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
    { q: t.faq5Q, a: t.faq5A },
  ];

  return (
    <section id="faq" className="relative bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-[11px] uppercase tracking-eyebrow text-brass">
            FAQ
          </p>
          <h2 className="font-serif text-4xl leading-tight text-foam sm:text-5xl text-balance">
            {t.faqTitle || 'Sıkça Sorulan Sorular'}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            if (!faq.q) return null; // Fallback just in case
            const isOpen = openIndex === index;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                key={index}
                className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isOpen ? 'border-teal-500/50 bg-ink-800' : 'border-foam/10 bg-ink-800/50 hover:border-foam/20'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className={`font-serif text-xl sm:text-2xl transition-colors ${isOpen ? 'text-teal-400' : 'text-foam'}`}>
                    {faq.q}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-teal-500/50 bg-teal-500/10' : 'border-foam/20'}`}>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-400' : 'text-foam/60'}`}
                    />
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 text-base font-light leading-relaxed text-foam/70">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
