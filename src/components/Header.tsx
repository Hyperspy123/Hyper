import { useState } from 'react';
import { createPortal } from 'react-dom'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Wallet, Bell, LogOut, ChevronLeft, ChevronRight, Globe, Headphones, Zap } from 'lucide-react';
import { supabase } from '../LLL';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang, t, dir } = useLanguage();

  const toggleMenu = () => setIsOpen(!isOpen);

  // 🔥 تحديد الصفحات الرئيسية التي يظهر فيها "المنيو" بدلاً من "الرجوع"
  const mainTabs = ['/', '/bookings', '/community', '/wallet', '/profile'];
  const isMainPage = mainTabs.includes(location.pathname);

  const menuItems = [
    { icon: User, label: t('profile'), path: '/profile' },
    { icon: Wallet, label: t('payment'), path: '/payment' },
  ];

  const sidebarContent = (
    <div className={`fixed inset-0 z-[99999] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} dir={dir}>
      <div 
        className={`absolute inset-0 bg-[#05081d]/90 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={toggleMenu} 
      />
      
      <aside 
        className={`absolute top-0 bottom-0 w-80 bg-[#0a0f3c] border-white/10 shadow-2xl transition-transform duration-500 flex flex-col
          ${dir === 'rtl' ? (isOpen ? 'right-0' : 'translate-x-full right-0 border-l') : (isOpen ? 'left-0' : '-translate-x-full left-0 border-r')}`}
      >
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <span className="font-black text-2xl italic text-white uppercase tracking-tighter">HYPER</span>
          <button onClick={toggleMenu} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setIsOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={20} />
              <span className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{item.label}</span>
              {dir === 'rtl' ? <ChevronLeft size={16} opacity={0.5} /> : <ChevronRight size={16} opacity={0.5} />}
            </button>
          ))}

          <button
            onClick={() => { navigate('/support'); setIsOpen(false); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === '/support' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400 hover:bg-white/5 hover:text-purple-400'}`}
          >
            <Headphones size={20} />
            <span className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              {lang === 'ar' ? 'الدعم الفني' : 'Tech Support'}
            </span>
            {dir === 'rtl' ? <ChevronLeft size={16} opacity={0.5} /> : <ChevronRight size={16} opacity={0.5} />}
          </button>

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={toggleLang}
              className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Globe size={20} className="text-purple-400" />
              <span className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('change_lang')}</span>
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md border border-white/10 uppercase font-black">
                {lang === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))}
            className="w-full flex items-center gap-4 p-4 rounded-2xl font-black text-red-400 hover:bg-red-500/10 transition-all uppercase italic"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[40] px-6 py-4 flex justify-between items-center bg-[#05081d]/80 backdrop-blur-xl border-b border-white/5">
        
        {/* القسم الأيسر: يظهر المنيو في الصفحات الرئيسية، والرجوع في الصفحات الفرعية */}
        <div className="flex items-center z-10">
          {isMainPage ? (
            <button onClick={toggleMenu} className="p-2 hover:bg-white/5 rounded-xl transition-all">
              <Menu size={24} className="text-white" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
              <ChevronLeft size={24} className={`text-white ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        {/* القسم الأوسط: الشعار ثابت */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer z-0" onClick={() => navigate('/')}>
          <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <Zap size={14} className="text-[#0a0f3c] fill-[#0a0f3c]" />
          </div>
          <span className="font-[1000] text-lg tracking-tighter italic uppercase text-white">HYPER</span>
        </div>

        {/* القسم الأيمن: زر التنبيهات فقط */}
        <div className="flex items-center z-10">
          <button onClick={() => navigate('/notifications')} className="p-2 hover:bg-white/5 rounded-xl relative transition-all">
            <Bell size={22} className="text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#05081d]"></span>
          </button>
        </div>
      </header>

      {/* البوابة السحرية للسايد بار */}
      {typeof document !== 'undefined' && createPortal(sidebarContent, document.body)}
    </>
  );
}