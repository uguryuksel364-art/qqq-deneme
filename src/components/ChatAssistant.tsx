import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatAssistant({ isOpen, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = (customMessage || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: textToSend }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!customMessage) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            parts: [
              {
                text: 'Mert VIP Transfer asistanınız olarak sorularınıza yardımcı olmaya hazırım. Fiyatlar, filomuz ve rezervasyon için lütfen tekrar deneyin veya +90 539 440 78 23 WhatsApp hattımızdan ulaşın.',
              },
            ],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [
            {
              text: 'Bodrum Havalimanı transfer ücretleri ve rezervasyon için ana sayfamızdaki rezervasyon formunu kullanabilir veya +90 539 440 78 23 numaralı WhatsApp hattımızdan 7/24 direkt bilgi alabilirsiniz.',
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 right-4 sm:bottom-28 sm:right-8 z-[120] w-[calc(100vw-32px)] sm:w-[540px] h-[620px] max-h-[82vh] bg-slate-950/60 border border-white/20 rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-3xl ring-1 ring-white/10 text-foam"
        >
          {/* Apple VisionOS Frosted Glass Header */}
          <div className="p-4 sm:p-5 border-b border-white/15 bg-white/10 backdrop-blur-2xl flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/40 to-amber-600/40 border border-amber-300/50 flex items-center justify-center shadow-lg backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Mert VIP Asistan
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wide">
                    7/24 Akıllı AI
                  </span>
                </h3>
                <p className="text-xs text-foam/70 font-light">Bodrum Transfer & Lüks Filo Rehberi</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90 text-foam/80 hover:text-white backdrop-blur-md"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
            {messages.length === 0 && (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-2 px-1 text-xs font-semibold text-amber-300 uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Hızlı Sorular
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Havalimanı transfer ücreti ne kadar?',
                    'Hangi VIP araçlarınız var?',
                    'Nasıl rezervasyon yaparım?',
                    'İletişim ve konum bilgileri',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-white/15 hover:border-amber-400/50 text-xs sm:text-sm text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-between group backdrop-blur-xl shadow-sm"
                    >
                      <span className="leading-snug">{q}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-300 text-base font-bold ml-2">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-semibold rounded-br-xs shadow-lg'
                      : 'bg-white/15 text-white rounded-bl-xs border border-white/20 backdrop-blur-2xl shadow-md'
                  }`}
                >
                  {msg.parts[0].text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/15 p-4 rounded-2xl rounded-bl-xs border border-white/20 backdrop-blur-2xl flex items-center gap-2.5 shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span className="text-xs text-white/80 font-light">Yanıt hazırlanıyor...</span>
                </div>
              </div>
            )}
          </div>

          {/* Apple VisionOS Frosted Glass Input Footer */}
          <div className="p-4 border-t border-white/15 bg-white/10 backdrop-blur-2xl shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Mesajınızı yazın..."
                className="w-full bg-white/15 border border-white/20 rounded-2xl py-3.5 pl-4 pr-12 text-xs sm:text-sm text-white placeholder:text-foam/50 focus:outline-none focus:border-amber-400/80 focus:bg-white/20 transition-all shadow-inner backdrop-blur-md"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-lg"
                aria-label="Gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-foam/50 text-center mt-2.5 tracking-widest uppercase font-medium">
              Mert VIP Bodrum • TÜRSAB 6550
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
