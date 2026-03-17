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
    <>
      <header className="p-5 flex justify-between items-center bg-[#0a0f3c] border-b border-white/5 sticky top-0 z-50 backdrop-blur-lg" dir="rtl">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            هايب <span className="text-cyan-400 uppercase">Padel</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Side Menu Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu - Slides from Right to Left */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-[#0d1435] z-[70] shadow-2xl transition-transform duration-300 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} dir="rtl">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <span className="font-black text-cyan-400 italic text-xl uppercase">Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-lg text-gray-400">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-3 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-cyan-500/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className="text-cyan-400" />
                  <span className="font-bold text-sm text-gray-200">{item.label}</span>
                </div>
                <ChevronLeft size={16} className="text-gray-600 group-hover:text-cyan-400" />
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black text-sm"
              >
                <span>تسجيل الخروج</span>
                <LogOut size={18} />
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
    </>
  );
}