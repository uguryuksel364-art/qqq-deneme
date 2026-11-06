import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/translations';
import { CONTACT, waLink } from '@/lib/contact';

export default function ContactForm() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="relative py-24 px-4 overflow-hidden bg-ink">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/images/luxury_contact_bg_1793643883478.jpg" 
          alt="Luxury background" 
          className="w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="text-brass font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
                {t.contactUpper || "İLETİŞİM"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-foam leading-tight">
                {t.contactTitle || "Hizmetlerimiz Hakkında Bilgi Alın"}
              </h2>
              <p className="mt-6 text-foam/60 leading-relaxed max-w-md font-light">
                {t.contactDesc || "Bodrum'daki tüm VIP transfer ve özel şoförlü araç ihtiyaçlarınız için bize 7/24 ulaşabilirsiniz. Profesyonel ekibimiz size yardımcı olmaktan mutluluk duyacaktır."}
              </p>
            </div>

            <div className="space-y-6">
              <ContactLink 
                icon={Phone} 
                title={t.phone || "Telefon"} 
                value={CONTACT.phoneDisplay} 
                href={`tel:${CONTACT.phoneE164}`} 
              />
              <ContactLink 
                icon={Mail} 
                title={t.email || "E-posta"} 
                value={CONTACT.email} 
                href={`mailto:${CONTACT.email}`} 
              />
              <ContactLink 
                icon={MapPin} 
                title={t.location || "Konum"} 
                value={CONTACT.location} 
                href="https://maps.google.com/?q=Yalıkavak+Marina+Bodrum" 
              />
            </div>

            <div className="pt-4">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20"
              >
                <Phone className="w-5 h-5 fill-current" />
                {t.whatsappSupport || "WhatsApp Destek Hattı"}
              </a>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-brass/30 to-teal/30 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-ink-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
              {isSuccess ? (
                <div className="py-12 text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal/10 border border-teal/20 text-teal">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif text-foam">{t.messageSent || "Mesajınız Gönderildi"}</h3>
                  <p className="text-foam/60 font-light">{t.messageSentDesc || "En kısa sürede tarafınıza dönüş yapılacaktır. İlginiz için teşekkür ederiz."}</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-brass hover:text-brass-light transition-colors text-sm font-medium"
                  >
                    {t.backToForm || "Forma Geri Dön"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormInput 
                      label={t.fullName || "Ad Soyad"} 
                      placeholder="John Doe" 
                      required 
                      autoComplete="name"
                    />
                    <FormInput 
                      label={t.email || "E-posta"} 
                      placeholder="john@example.com" 
                      type="email" 
                      required 
                      autoComplete="email"
                    />
                  </div>
                  <FormInput 
                    label={t.phone || "Telefon"} 
                    placeholder="+90 5XX XXX XX XX" 
                    type="tel" 
                    required 
                    autoComplete="tel"
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-foam/40 font-bold ml-1">
                      {t.message || "MESAJINIZ"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-ink-950/50 border border-white/10 rounded-2xl px-5 py-4 text-foam placeholder:text-foam/20 focus:outline-none focus:border-brass/50 transition-colors resize-none font-light"
                      placeholder={t.messagePlaceholder || "Size nasıl yardımcı olabiliriz?"}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 bg-brass text-ink-950 font-bold py-5 rounded-full hover:bg-brass-light transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t.sendMessage || "Mesaj Gönder"}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function ContactLink({ icon: Icon, title, value, href }: { icon: React.ElementType, title: string, value: string, href: string }) {
  return (
    <a 
      href={href}
      target={href.startsWith('http') ? "_blank" : undefined}
      rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brass/20 transition-all"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass/10 text-brass group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-foam/40 font-bold mb-1">{title}</div>
        <div className="text-foam font-medium">{value}</div>
      </div>
    </a>
  );
}

function FormInput({ label, placeholder, type = "text", required = false, autoComplete }: { label: string, placeholder: string, type?: string, required?: boolean, autoComplete?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-foam/40 font-bold ml-1">
        {label}
        {required && <span className="text-brass ml-1">*</span>}
      </label>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-ink-950/50 border border-white/10 rounded-2xl px-5 py-4 text-foam placeholder:text-foam/20 focus:outline-none focus:border-brass/50 transition-colors font-light"
        placeholder={placeholder}
      />
    </div>
  );
}
