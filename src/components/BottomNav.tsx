import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Gift, Trophy, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/my-bookings', label: t('myBookings'), icon: Calendar },
    { path: '/faz3a', label: t('faz3a'), icon: Users },
    { path: '/rewards', label: t('myRewards'), icon: Gift },
    { path: '/tournaments', label: t('myTournaments'), icon: Trophy },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f3c]/95 backdrop-blur-md border-t border-white/10 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all ${
              isActive(item.path)
                ? 'text-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 1.5} />
            <span className={`text-[10px] font-medium ${isActive(item.path) ? 'text-cyan-400' : ''}`}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="absolute top-0 w-8 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}