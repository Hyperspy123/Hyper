import { Home, Calendar, Trophy, User, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      icon: Home, 
      label: 'الرئيسية', 
      path: '/' 
    },
    { 
      icon: Calendar, 
      label: 'حجوزاتي', 
      path: '/my-bookings' 
    },
    { 
      icon: Zap, // Added Faz3a Icon
      label: 'فزعة', 
      path: '/faz3a' 
    },
    { 
      icon: Trophy, 
      label: 'البطولات', 
      path: '/tournaments' 
    },
    { 
      icon: User, 
      label: 'حسابي', 
      path: '/account' 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#14224d]/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 z-50 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
              isActive ? 'text-cyan-400 scale-110' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon 
              size={22} 
              strokeWidth={isActive ? 3 : 2} 
              className={isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}
            />
            <span className={`text-[9px] font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            
            {/* Active Indicator Dot */}
            {isActive && (
              <div className="absolute -bottom-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}