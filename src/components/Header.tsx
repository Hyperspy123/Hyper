import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Zap, 
  Menu, 
  X, 
  User, 
  Settings, 
  Headphones, 
  ChevronRight 
} from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate('/auth');
  };

  const menuItems = [
    { icon: User, label: 'ملفي الشخصي', path: '/account' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
    { icon: Headphones, label: 'الدعم الفني', path: '/contact' },
  ];

  return (
    <header className="p-5 flex justify-between items-center bg-[#0a0f3c] border-b border-white/5 sticky top-0 z-[100] backdrop-blur-xl" dir="rtl">
      
      {/* 1. Menu Button & Dropdown (Left Side) */}
      <div className="relative inline-block" dir="ltr"> {/* Force LTR container to fix positioning */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2.5 rounded-xl border transition-all duration-300 z-[120] relative ${
            isMenuOpen 
            ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' 
            : 'bg-white/5 border-white/10 text-cyan-400'
          }`}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Fancy Dropdown - Anchored Left */}
        <div 
          dir="rtl" // Return to RTL for Arabic text inside
          className={`absolute top-14 left-0 w-[240px] bg-[#14224d] border border-white/10 rounded-[32px] shadow-[0_25px_50px_rgba(0,0,0,0.8)] transition-all duration-300 z-[110] ${
            isMenuOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 -translate-y-4 pointer-events-none'
          }`}
          style={{ transformOrigin: 'top left' }}
        >
          <div className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-cyan-500/10 transition-all group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyan-500/20">
                    <item.icon size={18} className="text-cyan-400" />
                  </div>
                  <span className="font-bold text-sm text-gray-200">{item.label}</span>
                </div>
                <ChevronRight size={14} className="text-gray-600 rotate-180" />
              </button>
            ))}

            <div className="pt-2 mt-2 border-t border-white/5">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black text-sm"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>تسجيل الخروج</span>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                  className="w-full p-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-sm"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Logo Section (Right Side) */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          هايب <span className="text-cyan-400 uppercase">Padel</span>
        </h1>
        <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
        </div>
      </div>

      {/* Click-away Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}