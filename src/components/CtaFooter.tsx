import { motion } from 'motion/react';
import { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, CalendarCheck } from 'lucide-react';
import { CONTACT, telLink } from '@/lib/contact';
import ReservationForm from './ReservationForm';
import { useLanguage } from '@/lib/translations';

export default function CtaFooter() {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <footer id="rezervasyon" className="relative overflow-hidden bg-ink-800">
      <div className="absolute inset-0 bg-grain opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="py-24 text-center sm:py-32"
        >
          <p className="mb-5 text-[11px] uppercase tracking-eyebrow text-brass">
            {t.reservation}
          </p>
          <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-foam sm:text-6xl text-balance">
            {t.ctaTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-foam/70">
            {t.ctaDesc}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#rezervasyon-motoru"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-teal px-8 py-4 text-sm font-medium text-ink transition-all hover:bg-teal-400 hover:shadow-[0_0_30px_-6px_rgba(79,169,168,0.6)]"
            >
              <CalendarCheck className="h-4 w-4" />
              {t.ctaBtn}
            </a>

            <a
              href={telLink}
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-foam/20 px-8 py-4 text-sm font-light text-foam transition-colors hover:border-foam/50 hover:bg-foam/5"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-foam/20 px-8 py-4 text-sm font-light text-foam transition-colors hover:border-foam/50 hover:bg-foam/5"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
              Instagram
            </a>
          </div>
        </motion.div>

        {/* Regional SEO Transfer Directory & Internal Links */}
        <div className="border-t border-foam/10 pt-12 pb-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-eyebrow text-brass">
                {t.transferDestinationsTitle || 'BODRUM VIP TRANSFER BÖLGELERİ'}
              </p>
              <h3 className="font-serif text-lg text-foam mt-1">
                {t.transferDestinationsSubtitle || 'Havalimanı ve Yarımada Lüks Transfer Noktaları'}
              </h3>
            </div>
            <span className="text-xs text-foam/50">
              {t.transfer247Available || '7/24 Özel Şoförlü VIP Ulaşım'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {[
              { slug: 'bodrum-vip-transfer', name: 'Bodrum VIP Transfer' },
              { slug: 'milas-bodrum-havalimani-transfer', name: 'Milas Bodrum Havalimanı' },
              { slug: 'yalikavak-vip-transfer', name: 'Yalıkavak VIP Transfer' },
              { slug: 'turkbuku-vip-transfer', name: 'Türkbükü VIP Transfer' },
              { slug: 'turgutreis-vip-transfer', name: 'Turgutreis VIP Transfer' },
              { slug: 'bitez-vip-transfer', name: 'Bitez VIP Transfer' },
              { slug: 'gumusluk-vip-transfer', name: 'Gümüşlük VIP Transfer' },
              { slug: 'gumbet-vip-transfer', name: 'Gümbet VIP Transfer' },
              { slug: 'torba-vip-transfer', name: 'Torba VIP Transfer' },
              { slug: 'gundogan-vip-transfer', name: 'Gündoğan VIP Transfer' },
            ].map((reg) => (
              <a
                key={reg.slug}
                href={`/bolgeler/${reg.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', `/bolgeler/${reg.slug}`);
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="group rounded-xl border border-foam/10 bg-ink-900/40 p-2.5 text-xs text-foam/75 transition-all hover:border-brass/40 hover:text-brass hover:bg-ink-900/80"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="truncate">{reg.name}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="border-t border-foam/10 py-8">
          <div className="flex flex-col items-center justify-between gap-6 text-sm font-light text-foam/60 md:flex-row">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/logo.jpeg"
                alt="Bodrum Luxury Transfer Logo"
                className="w-7 h-7 object-contain rounded-lg shrink-0"
              />
              <p>© {new Date().getFullYear()} {t.footerText}</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400" strokeWidth={1.5} />
                {CONTACT.location}
              </span>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foam"
              >
                <Mail className="h-3.5 w-3.5 text-teal-400" strokeWidth={1.5} />
                {CONTACT.email}
              </a>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-foam"
              >
                <Instagram className="h-3.5 w-3.5 text-teal-400" strokeWidth={1.5} />
                @{CONTACT.instagram}
              </a>
            </div>
          </div>
        </div>
      </div>
      <ReservationForm open={formOpen} onClose={() => setFormOpen(false)} />
    </footer>
  );
}
