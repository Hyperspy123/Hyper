import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { User, Trophy, Calendar, Star, LogIn, Mail, Phone, Zap, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      } else {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) setUser(currentUser);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  // تعريف قائمة المنيو مع إضافة "شخصي"
  const menuItems = [
    { label: 'شخصي', icon: User, path: '/personal', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: t('myBookings'), icon: Calendar, path: '/my-bookings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: t('myTournaments'), icon: Trophy, path: '/tournaments', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: t('myRewards'), icon: Star, path: '/rewards', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: t('contactUs'), icon: Mail, path: '/contact', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Zap className="text-cyan-400 animate-pulse" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6" dir={dir}>
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
            <User className="text-cyan-400" size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-white italic tracking-tighter uppercase">{t('loginRequiredTitle')}</h2>
          <p className="text-gray-400 text-sm mb-8 font-bold opacity-70">{t('loginRequiredDesc')}</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            <span>{t('login')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir={dir}>
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        {/* Header with Settings Icon */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            حسابي <span className="text-cyan-400">Account</span>
          </h1>
          <button 
            onClick={() => navigate('/settings')}
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-cyan-400 transition-all active:scale-90"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <User size={36} className="text-[#0a0f3c]" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t('welcomeBack')}</h2>
              <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t('hyperMember')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-black/20 border border-white/5">
              <Mail size={18} className="text-gray-500" />
              <span className="text-gray-300 font-bold text-sm">{user.email || t('emailNotSet')}</span>
            </div>
            {user.user_metadata?.phone_number && (
              <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-black/20 border border-white/5">
                <Phone size={18} className="text-gray-500" />
                <span className="text-gray-300 font-bold text-sm">{user.user_metadata.phone_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Rankings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6 shadow-xl">
          <h3 className="text-xs font-black text-gray-400 mb-5 flex items-center gap-2 uppercase tracking-widest">
            <Trophy size={16} className="text-yellow-400" />
            {t('tournamentRanking')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-2xl p-4 text-center border border-white/5">
              <div className="text-2xl font-black text-cyan-400">0</div>
              <div className="text-[8px] text-gray-500 font-black uppercase mt-1 tracking-tighter">{t('tournamentsCount')}</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 text-center border border-white/5">
              <div className="text-2xl font-black text-yellow-400">-</div>
              <div className="text-[8px] text-gray-500 font-black uppercase mt-1 tracking-tighter">{t('ranking')}</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 text-center border border-white/5">
              <div className="text-2xl font-black text-green-400">0</div>
              <div className="text-[8px] text-gray-500 font-black uppercase mt-1 tracking-tighter">{t('wins')}</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-3">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-5 py-5 rounded-[24px] bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <span className="text-white text-sm font-black uppercase tracking-tight">{item.label}</span>
              </div>
              <Arrow size={18} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-5 py-5 mt-4 rounded-[24px] bg-red-500/10 border border-red-500/20 text-red-400 font-black text-sm uppercase hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}