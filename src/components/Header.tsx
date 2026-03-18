import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Menu, X, User, Settings, Headphones, ChevronLeft } from 'lucide-react';

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
    <header 
      className="p-5 flex items-center justify-between bg-[#0a0f3c] border-b border-white/5 sticky top-0 z-[100] backdrop-blur-xl h-20"
      dir="rtl" // Forces the container to flow Right-to-Left
    >
      
      {/* 1. RIGHT SIDE: Logo (First item in RTL code = Right) */}
      <div 
        className="flex items-center gap-2 cursor-pointer select-none" 
        onClick={() => navigate('/')}
      >
        <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          هايب <span className="text-cyan-400 uppercase">Padel</span>
        </h1>
      </div>

      {/* 2. LEFT SIDE: Menu Button + Dropdown (Second item in RTL code = Left) */}
      <div className="relative" dir="ltr"> {/* dir="ltr" keeps the dropdown alignment logic consistent */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-90 ${
            isMenuOpen 
            ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-[0_0_20px_rgba(34,211,238,0.4)]' 
            : 'bg-white/5 border-white/10 text-cyan-400 hover:border-cyan-400/50'
          }`}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Dropdown - Anchored to the LEFT */}
        <div 
          className={`absolute top-14 left-0 w-[260px] bg-[#14224d] border border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[110] overflow-hidden ${
            isMenuOpen 
            ? 'opacity-100 scale-100 translate-y-0 visible' 
            : 'opacity-0 scale-95 -translate-y-4 invisible pointer-events-none'
          }`}
          style={{ transformOrigin: 'top left' }}
        >
          <div className="p-3 space-y-1" dir="rtl">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0f3c] transition-colors">
                    <item.icon size={18} />
                  </div>
                  <span className="font-bold text-sm text-gray-200">{item.label}</span>
                </div>
                <ChevronLeft size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}

            <div className="pt-2 mt-2 border-t border-white/5">
              {user ? (
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-400/10 font-black text-sm transition-all"
                >
                  <LogOut size={18} /> 
                  <span>تسجيل الخروج</span>
                </button>
              ) : (
                <button 
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} 
                  className="w-full p-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dark Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}
    </header>
  );
}