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
    <header className="p-5 flex items-center justify-between bg-[#0a0f3c] border-b border-white/5 sticky top-0 z-[100] backdrop-blur-xl h-20">
      
      {/* 1. LEFT SIDE: Menu Button + Fancy Dropdown */}
      <div className="relative" style={{ direction: 'ltr' }}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2.5 rounded-xl border transition-all duration-300 ${
            isMenuOpen 
            ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' 
            : 'bg-white/5 border-white/10 text-cyan-400'
          }`}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Dropdown - Anchored Left */}
        <div 
          className={`absolute top-14 left-0 w-[240px] bg-[#14224d] border border-white/10 rounded-[32px] shadow-2xl transition-all duration-300 z-[110] ${
            isMenuOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 -translate-y-4 pointer-events-none'
          }`}
          style={{ transformOrigin: 'top left', direction: 'rtl' }}
        >
          <div className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-cyan-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-cyan-400" />
                  <span className="font-bold text-sm text-gray-200">{item.label}</span>
                </div>
                <ChevronLeft size={14} className="text-gray-600 rotate-180" />
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-white/5">
              {user ? (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 font-black text-sm">
                  <LogOut size={18} /> <span>تسجيل الخروج</span>
                </button>
              ) : (
                <button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} className="w-full p-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-sm">
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE: Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
        style={{ direction: 'rtl' }}
      >
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          هايب <span className="text-cyan-400 uppercase">Padel</span>
        </h1>
        <div className="bg-cyan-500 p-1.5 rounded-lg">
          <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 z-[90] bg-black/20" onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
}