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
  ChevronLeft 
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
    <header className="p-5 flex justify-between items-center bg-[#0a0f3c]/80 border-b border-white/5 sticky top-0 z-[100] backdrop-blur-xl" dir="rtl">
      
      {/* Menu & Dropdown Container (Left Side) */}
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2.5 rounded-xl border transition-all duration-300 ${
            isMenuOpen 
            ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] scale-90' 
            : 'bg-white/5 border-white/10 text-cyan-400'
          }`}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Fancy Dropdown Menu */}
        <div className={`absolute top-14 left-0 w-[240px] bg-[#14224d] border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-top-left z-[110] ${
          isMenuOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }`}>
          <div className="p-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-cyan-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-gray-200 group-hover:text-white">{item.label}</span>
                </div>
                <ChevronLeft size={14} className="text-gray-600 rotate-180" />
              </button>
            ))}

            <div className="pt-2 mt-2 border-t border-white/5">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-black text-xs"
                >
                  <LogOut size={18} />
                  <span>تسجيل الخروج</span>
                </button>
              ) : (
                <button 
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                  className="w-full p-4 bg-cyan-500 text-[#0a0f3c] rounded-xl font-black text-xs shadow-lg shadow-cyan-500/20"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logo Section (Right Side) */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          هايب <span className="text-cyan-400 uppercase">Padel</span>
        </h1>
        <div className="bg-cyan-500 p-1.5 rounded-lg">
          <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
        </div>
      </div>

      {/* Invisible Click-away listener */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}
    </header>
  );
}