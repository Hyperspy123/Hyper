import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { User, Trophy, Calendar, Star, LogIn, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

const client = createClient();

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
        <Header />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-[#14224d] border border-white/5 rounded-2xl p-10 text-center max-w-md">
            <User size={48} className="text-cyan-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t('loginRequiredTitle')}</h2>
            <p className="text-gray-400 mb-6">{t('loginRequiredDesc')}</p>
            <button
              onClick={() => client.auth.toLogin()}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-all mx-auto"
            >
              <LogIn size={18} />
              <span>{t('login')}</span>
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const menuItems = [
    { label: t('myBookings'), icon: Calendar, path: '/my-bookings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: t('myTournaments'), icon: Trophy, path: '/tournaments', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: t('myRewards'), icon: Star, path: '/rewards', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: t('contactUs'), icon: Mail, path: '/contact', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
      <Header />

      <div className="pt-18 max-w-lg mx-auto px-4" style={{ paddingTop: '4.5rem' }}>
        {/* Profile Card */}
        <div className="bg-[#14224d] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t('welcomeBack')}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{t('hyperMember')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-300 text-sm">{user.email || t('emailNotSet')}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-300 text-sm">{user.phone || t('phoneNotSet')}</span>
            </div>
          </div>
        </div>

        {/* Tournament Rankings */}
        <div className="bg-[#14224d] border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            {t('tournamentRanking')}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">0</div>
              <div className="text-xs text-gray-400 mt-1">{t('tournamentsCount')}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">-</div>
              <div className="text-xs text-gray-400 mt-1">{t('ranking')}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-xs text-gray-400 mt-1">{t('wins')}</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-[#14224d] border border-white/5 hover:border-cyan-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <span className="text-white text-sm font-medium">{item.label}</span>
              </div>
              <Arrow size={16} className="text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}