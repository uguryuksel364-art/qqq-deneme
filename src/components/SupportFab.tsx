import { useState } from 'react';
import { MessageCircle, Phone, Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsAppIcon } from './Nav';
import { waLink, telLink } from '@/lib/contact';
import ChatAssistant from './ChatAssistant';

export default function SupportFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions = [
    {
      id: 'whatsapp',
      icon: <WhatsAppIcon className="w-5 h-5 fill-white text-white" />,
      label: 'WhatsApp',
      href: waLink('Merhaba, VIP transfer hakkında bilgi almak istiyorum.'),
      color: 'bg-[#25D366]',
    },
    {
      id: 'chatbot',
      icon: <Bot className="w-5 h-5 text-ink" />,
      label: 'Asistan',
      href: '#',
      color: 'bg-brass',
      onClick: () => {
        setIsAssistantOpen(true);
        setIsOpen(false);
      }
    },
    {
      id: 'call',
      icon: <Phone className="w-5 h-5 text-white" />,
      label: 'Ara',
      href: telLink,
      color: 'bg-teal',
    },
  ];

  return (
    <div className="fixed bottom-[calc(132px+env(safe-area-inset-bottom))] right-4 sm:bottom-24 sm:right-8 z-[105] flex flex-col items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col items-center gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.1 } 
                }}
                className="group relative flex items-center"
              >
                <span className="absolute right-full mr-3 px-2 py-1 rounded bg-ink-900 border border-white/10 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {action.label}
                </span>
                {action.href !== '#' ? (
                  <a
                    href={action.href}
                    target={action.id === 'chatbot' ? undefined : "_blank"}
                    rel={action.id === 'chatbot' ? undefined : "noopener noreferrer"}
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${action.color} shadow-lg shadow-black/40 hover:scale-110 active:scale-95 transition-transform`}
                  >
                    {action.icon}
                  </a>
                ) : (
                  <button
                    onClick={action.onClick}
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${action.color} shadow-lg shadow-black/40 hover:scale-110 active:scale-95 transition-transform`}
                  >
                    {action.icon}
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleOpen}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-ink-950 border border-brass/50 text-brass shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:bg-ink-900 transition-all active:scale-90 ${isOpen ? 'rotate-90' : ''}`}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brass"></span>
          </span>
        )}
      </button>

      <ChatAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
      />
    </div>
  );
}
