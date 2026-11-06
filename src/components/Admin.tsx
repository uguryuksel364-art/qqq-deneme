import { useState, useEffect } from 'react';
import {
  LogOut,
  Car,
  ArrowLeft,
  Settings,
  Euro,
  Film,
} from 'lucide-react';
import { DatabaseVideoManager } from './DatabaseVideoManager';
import { PageEditor } from './PageEditor';
import TransferPriceManager from './TransferPriceManager';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('mert_vip_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'media' | 'settings' | 'pricing'>('media');

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '99999') {
      setIsAuthenticated(true);
      sessionStorage.setItem('mert_vip_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    window.location.hash = '';
    window.location.reload();
  };

  useEffect(() => {
    const root = document.documentElement;
    const hadLight = root.classList.contains('light');
    if (hadLight) root.classList.remove('light');
    return () => {
      if (hadLight) root.classList.add('light');
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07131F] text-[#F5F7F6] flex items-center justify-center p-4 admin-scope">
        <div className="w-full max-w-md bg-ink-800/80 border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl text-center relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brass/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brass/50 text-brass mx-auto mb-6 bg-brass/10 shadow-lg shadow-brass/20">
            <Car className="h-7 w-7" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Merhaba Mert Bey</h2>
          <p className="text-xs sm:text-sm text-foam/60 mb-8 font-light">Lütfen yönetim paneline erişmek için şifrenizi girin.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder="Şifre"
                className="w-full rounded-2xl bg-ink-950/80 border border-brass/40 px-4 py-3.5 text-center text-lg tracking-widest text-brass placeholder:text-foam/30 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass/50 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-medium animate-shake">
                Hatalı şifre! Lütfen tekrar deneyin.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-brass hover:bg-brass-light text-ink-950 font-bold text-sm transition-all shadow-[0_4px_20px_rgba(201,161,90,0.4)] cursor-pointer"
            >
              Paneli Aç
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <a
              href="#/"
              className="inline-flex items-center gap-2 text-xs text-foam/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Siteye Geri Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07131F] text-[#F5F7F6] w-full admin-scope relative overflow-visible">
      <header className="sticky top-0 z-[100] border-b border-white/10 bg-[#0B1D2E]/95 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-8 gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/40 text-brass shrink-0">
              <Car className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div>
              <h1 className="font-serif text-base sm:text-lg text-foam leading-tight">Yönetici Paneli</h1>
              <p className="text-[11px] sm:text-xs text-foam/50">Mert VIP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-light text-foam/60 transition-colors hover:border-white/25 hover:text-foam"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Siteye Dön
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-xs font-light text-red-300 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Çıkış
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="mx-auto flex max-w-6xl gap-1 sm:gap-2 px-4 sm:px-8 overflow-x-auto border-t border-white/5 scrollbar-none bg-[#0B1D2E]/50">
          <button
            onClick={() => handleTabChange('media')}
            className={`shrink-0 flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
              activeTab === 'media'
                ? 'border-brass text-brass bg-white/5 font-semibold'
                : 'border-transparent text-foam-400 hover:text-foam'
            }`}
          >
            <Film className="w-4 h-4 text-brass" />
            <span>Video & Medya (Cloudinary)</span>
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            className={`shrink-0 flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
              activeTab === 'settings'
                ? 'border-brass text-brass bg-white/5'
                : 'border-transparent text-foam-400 hover:text-foam'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Karşılama Yazıları & Filo</span>
          </button>

          <button
            onClick={() => handleTabChange('pricing')}
            className={`shrink-0 flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
              activeTab === 'pricing'
                ? 'border-brass text-brass bg-white/5'
                : 'border-transparent text-foam-400 hover:text-foam'
            }`}
          >
            <Euro className="w-4 h-4" />
            <span>Transfer Fiyat Tarifesi</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        {activeTab === 'pricing' ? (
          <TransferPriceManager />
        ) : activeTab === 'media' ? (
          <DatabaseVideoManager />
        ) : (
          <PageEditor />
        )}
      </main>
    </div>
  );
}




