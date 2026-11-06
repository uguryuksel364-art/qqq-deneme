import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import { useLanguage } from '@/lib/translations';

const testimonials = [
  {
    name: 'Ahmet Yılmaz',
    role: 'İş İnsanı',
    text: 'Milas-Bodrum Havalimanı inişimizde şoförümüz isim tabelası ile bizi kapıda karşıladı. Maybach aracın konforu, yıldız tavanı ve dakikliği tek kelimeyle kusursuzdu.',
    rating: 5,
    date: 'Eylül 2024'
  },
  {
    name: 'Elena Sokolova',
    role: 'Executive Misafir',
    text: 'Yalıkavak Marina ve otelimiz arasındaki tüm transferlerimizde Mert VIP ile çalıştık. Araç içi Nespresso ikramı, yüksek hızlı internet ve şoförlerin nezaketi harikaydı.',
    rating: 5,
    date: 'Ağustos 2024'
  },
  {
    name: 'Marcus Weber',
    role: 'Aile Tatili',
    text: 'Bodrum tatilimiz boyunca 4 günlük şoförlü Vito Lounge tahsisi aldık. Güvenlik, bebek koltuğu ve temizlik konusundaki titizlikleri bizi çok etkiledi. Kesinlikle tavsiye ediyorum.',
    rating: 5,
    date: 'Temmuz 2024'
  }
];

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="relative py-24 px-6 overflow-hidden bg-ink-900">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brass/20 bg-brass/5 text-brass text-xs uppercase tracking-widest mb-6"
          >
            <Star className="w-3 h-3 fill-brass" />
            <span>{t.testimonialsTitle}</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-foam mb-6"
          >
            {t.testimonialsTitle}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-foam/60 max-w-2xl mx-auto text-lg font-light leading-relaxed"
          >
            {t.testimonialsSubtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="relative p-8 rounded-2xl border border-foam/5 bg-ink-800/50 backdrop-blur-sm group hover:border-brass/20 transition-all duration-500"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-brass/10 group-hover:text-brass/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brass text-brass" />
                ))}
              </div>

              <p className="text-foam/80 italic mb-8 relative z-10 leading-relaxed">
                "{item.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-foam font-medium">{item.name}</h4>
                  <p className="text-xs text-brass/70 uppercase tracking-widest">{item.role}</p>
                </div>
                <div className="text-[10px] text-foam/30 uppercase tracking-tighter">
                  {item.date}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brass/10 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brass/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brass/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
