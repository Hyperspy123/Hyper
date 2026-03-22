import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { User, Trophy, Calendar, Star, LogIn, Mail, Zap, ChevronLeft, ChevronRight, LogOut, Settings, Award, Bell, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null); // إضافة حالة للبروفايل
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  useEffect(() => {
    async function getProfileData() {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
        // جلب البيانات الديناميكية (الرانك والمباريات) من جدول profiles
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('total_matches, current_rank')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!error && profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    }
    getProfileData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const menuItems = [
    { label: 'بياناتي الشخصية', icon: User, path: '/personal', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: t('myBookings'), icon: Calendar, path: '/my-bookings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: t('myTournaments'), icon: Trophy, path: '/tournaments', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: t('myRewards'), icon: Star, path: '/rewards', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: t('contactUs'), icon: Mail, path: '/contact', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05081d] flex items-center justify-center">
        <Zap className="text-cyan-400 animate-pulse" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05081d] flex items-center justify-center p-6" dir={dir}>
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
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">
            حسابي <span className="text-cyan-400">Account</span>
          </h1>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-yellow-400 transition-all active:scale-90 relative"
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#05081d]"></span>
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-cyan-400 transition-all active:scale-90"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Profile Card with Dynamic Rank */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full -ml-16 -mt-16 group-hover:bg-cyan-500/20 transition-all" />
          
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <User size={36} className="text-[#0a0f3c]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-xl border-2 border-[#14224d]">
                    <ShieldCheck size={14} className="fill-black" />
                </div>
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">{t('welcomeBack')}</h2>
              {/* عرض الرانك الحقيقي القادم من قاعدة البيانات */}
              <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-cyan-500/30">
                {profile?.current_rank || 'ROOKIE'}
              </span>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
              <Mail size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-300 font-bold text-xs truncate">{user.email}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 group/stat hover:border-cyan-500/30 transition-all">
                    <Award size={20} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                    <div>
                        <span className="block text-[7px] font-black text-gray-500 uppercase tracking-tighter">المباريات</span>
                        <span className="text-xl font-[1000] text-white leading-none italic">{profile?.total_matches || 0}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 group/stat hover:border-purple-500/30 transition-all">
                    <Star size={20} className="text-purple-400" />
                    <div>
                        <span className="block text-[7px] font-black text-gray-500 uppercase tracking-tighter">النقاط</span>
                        <span className="text-xl font-[1000] text-white leading-none italic">{(profile?.total_matches || 0) * 50}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
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