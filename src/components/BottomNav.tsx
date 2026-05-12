import { Home, Calendar, Trophy, Gift, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext'; // 🔥 استيراد المترجم

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir } = useLanguage(); // 🔥 جلب وظيفة الترجمة والاتجاه

  // مصفوفة العناصر مربوطة بالقاموس (الترجمة)
  const navItems = [
    { 
      icon: Home, 
      label: t('welcome').split(' ')[0], // لجلب كلمة 'الرئيسية' أو استخدم t('home') إذا أضفتها
      path: '/' 
    },
    { 
      icon: Calendar, 
      label: t('my_bookings'), 
      path: '/my-bookings' 
    },
    { 
      icon: Users, 
      label: t('community'), 
      path: '/community' 
    },
    { 
      icon: Trophy, 
      label: t('tournaments'), 
      path: '/tournaments' 
    },
    { 
      icon: Gift, 
      label: t('rewards'), 
      path: '/rewards' 
    },
  ];

  // ملاحظة: إذا لم تظهر كلمة 'الرئيسية' بشكل صحيح، تأكد أنك أضفت مفتاح 'home' في القاموس واستبدل t('welcome') بـ t('home')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#14224d]/95 backdrop-blur-xl border-t border-white/5 px-2 py-4 z-50 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]" dir={dir}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative min-w-[64px] ${
              isActive ? 'text-cyan-400 scale-110' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon 
              size={20} 
              strokeWidth={isActive ? 3 : 2} 
              className={isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}
            />
            <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            
            {/* مؤشر العنصر النشط */}
            {isActive && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}