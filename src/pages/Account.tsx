import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { User, Trophy, Calendar, Star, LogIn, Mail, Zap, ChevronLeft, ChevronRight, LogOut, Settings, Award, Bell, ShieldCheck, Target } from 'lucide-react';
import { toast } from 'sonner';

// --- دليل التصنيفات الموحد (نفس الموجود في Personal) ---
const RANKS_GUIDE = [
  { title: 'مستجد (Rookie)', icon: '🥚', color: 'text-gray-400', min: 0 },
  { title: 'هايب (Hype)', icon: '⚡', color: 'text-cyan-400', min: 11 },
  { title: 'برنس (Prince)', icon: '👑', color: 'text-purple-400', min: 51 },
  { title: 'كينج (King)', icon: '🦁', color: 'text-yellow-500', min: 151 },
  { title: 'أسطورة (Legend)', icon: '🌌', color: 'text-indigo-400', min: 301 },
  { title: 'هايبر (HYPER)', icon: '💫', color: 'text-pink-500', min: 500 },
];

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  useEffect(() => {
    async function getProfileData() {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
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

  // --- منطق الحسبة الموحد بناءً على Hype Guide ---
  const matchesPlayed = profile?.total_matches || 0;

  // تحديد الرانك الحالي والقادم بناءً على مصفوفة الرانكات
  const currentRankData = [...RANKS_GUIDE].reverse().find(r => matchesPlayed >= r.min) || RANKS_GUIDE[0];
  const nextRankData = RANKS_GUIDE[RANKS_GUIDE.indexOf(currentRankData) + 1];

  // حساب عدد المباريات المتبقية
  const matchesLeft = nextRankData ? nextRankData.min - matchesPlayed : 0;

  // حساب نسبة التقدم للشريط (بناءً على المسافة بين الرانك الحالي والقادم)
  const calculateProgress = () => {
    if (!nextRankData) return 100;
    const rangeSize = nextRankData.min - currentRankData.min;
    const progressInRange = matchesPlayed - currentRankData.min;
    const percentage = (progressInRange / rangeSize) * 100;
    return Math.min(Math.max(percentage, 5), 100); // 5% كحد أدنى للشكل الجمالي
  };

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
          <h2 className="text-2xl font-black mb-2 text-white italic uppercase tracking-tighter">{t('loginRequiredTitle')}</h2>
          <button onClick={() => navigate('/auth')} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black">
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">حسابي <span className="text-cyan-400">Account</span></h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/notifications')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 relative">
              <Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#05081d]"></span>
            </button>
            <button onClick={() => navigate('/settings')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400"><Settings size={20} /></button>
          </div>
        </div>

        {/* Profile Card & Rank Engine */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <User size={36} className="text-[#0a0f3c]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-xl border-2 border-[#14224d]"><ShieldCheck size={14} className="fill-black" /></div>
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase leading-none mb-1">{t('welcomeBack')}</h2>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentRankData.color}`}>
                {profile?.current_rank || currentRankData.title} {currentRankData.icon}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                <Award size={20} className="text-cyan-500" />
                <div><span className="block text-[7px] font-black text-gray-500 uppercase">المباريات</span><span className="text-xl font-[1000] text-white italic">{matchesPlayed}</span></div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-purple-500/30 transition-all">
                <Star size={20} className="text-purple-400" />
                <div><span className="block text-[7px] font-black text-gray-500 uppercase">النقاط</span><span className="text-xl font-[1000] text-white italic">{matchesPlayed * 50}</span></div>
            </div>
          </div>

          {/* Dynamic Progress Engine - Hype Guide Version */}
          <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
             <div className="flex justify-between items-end mb-4">
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Target size={12} className="text-yellow-500" /> اللقب القادم
                   </span>
                   <h4 className="text-lg font-black italic text-white uppercase leading-none">
                     {nextRankData ? nextRankData.title : 'أقصى تصنيف (HYPER) 💫'}
                   </h4>
                </div>
                <span className="text-[10px] font-black text-cyan-400">{Math.floor(calculateProgress())}%</span>
             </div>
             
             {/* Progress Bar */}
             <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-1000 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
             </div>
             
             {nextRankData ? (
               <p className="text-[10px] font-bold text-gray-500 text-center mt-4 tracking-tighter uppercase">
                  تبقى <span className="text-white">{matchesLeft}</span> مباريات للوصول لـ <span className={nextRankData.color}>{nextRankData.title}</span>
               </p>
             ) : (
               <p className="text-[10px] font-bold text-yellow-500 text-center mt-4 tracking-tighter uppercase">
                  لقد وصلت لقمة الهرم في هايب بادل! 🦁🔥
               </p>
             )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between px-5 py-5 rounded-[24px] bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all group active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}><item.icon size={20} className={item.color} /></div>
                <span className="text-white text-sm font-black uppercase tracking-tight">{item.label}</span>
              </div>
              <Arrow size={18} className="text-gray-600" />
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-5 py-5 mt-4 rounded-[24px] bg-red-500/10 border border-red-500/20 text-red-400 font-black text-sm uppercase transition-all active:scale-[0.98]">
            <LogOut size={18} /><span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}