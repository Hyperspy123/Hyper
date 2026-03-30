import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { User, Trophy, Calendar, Star, LogIn, Mail, Zap, ChevronLeft, ChevronRight, LogOut, Settings, Award, Bell, ShieldCheck, Target, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

const RANKS_GUIDE = [
  { title: 'مبتدئ (Rookie)', icon: '🥚', color: 'text-gray-400', min: 0 },
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
        if (!error && profileData) setProfile(profileData);
      }
      setLoading(false);
    }
    getProfileData();
  }, []);

  const matchesPlayed = profile?.total_matches || 0;
  const currentPoints = matchesPlayed * 50; // الحسبة: كل مباراة بـ 50 نقطة
  const currentRankData = [...RANKS_GUIDE].reverse().find(r => matchesPlayed >= r.min) || RANKS_GUIDE[0];
  const nextRankData = RANKS_GUIDE[RANKS_GUIDE.indexOf(currentRankData) + 1];
  const matchesLeft = nextRankData ? nextRankData.min - matchesPlayed : 0;

  const calculateProgress = () => {
    if (!nextRankData) return 100;
    const rangeSize = nextRankData.min - currentRankData.min;
    const progressInRange = matchesPlayed - currentRankData.min;
    return Math.min(Math.max((progressInRange / rangeSize) * 100, 5), 100);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success("تم تسجيل الخروج بنجاح");
  };

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Zap className="text-cyan-400 animate-pulse" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir="rtl">
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">حسابي <span className="text-cyan-400">Account</span></h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/notifications')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 relative"><Bell size={20} /></button>
            <button onClick={() => navigate('/settings')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400"><Settings size={20} /></button>
          </div>
        </div>

        {/* بطاقة البروفايل */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <User size={36} className="text-[#0a0f3c]" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase leading-none mb-1">يا هلا بطل!</h2>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentRankData.color}`}>
                {profile?.current_rank || currentRankData.title} {currentRankData.icon}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                <Award size={20} className="text-cyan-500" />
                <div><span className="block text-[7px] font-black text-gray-500 uppercase">المباريات</span><span className="text-xl font-[1000] text-white italic">{matchesPlayed}</span></div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-purple-500/30 transition-all">
                <Star size={20} className="text-purple-400" />
                <div><span className="block text-[7px] font-black text-gray-500 uppercase">النقاط</span><span className="text-xl font-[1000] text-white italic">{currentPoints}</span></div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
             <div className="flex justify-between items-end mb-4 text-right">
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 justify-end">
                      اللقب القادم <Target size={12} className="text-yellow-500" />
                   </span>
                   <h4 className="text-lg font-black italic text-white uppercase leading-none">{nextRankData?.title || 'أقصى تصنيف'}</h4>
                </div>
                <span className="text-[10px] font-black text-cyan-400">{Math.floor(calculateProgress())}%</span>
             </div>
             <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000" style={{ width: `${calculateProgress()}%` }} />
             </div>
          </div>
        </div>

        {/* 🔥 قسم مهارة اللعب والنقاط الجديد */}
        <div className="bg-white/5 border border-white/10 rounded-[35px] p-8 space-y-5 backdrop-blur-3xl relative overflow-hidden">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-right">
              <h3 className="text-xl font-[1000] italic text-white uppercase leading-none">مهارة اللعب</h3>
              <p className="text-[9px] font-black text-cyan-500/60 uppercase mt-2 tracking-widest italic">طريقك نحو الاحتراف</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
              <Zap size={22} fill="currentColor" />
            </div>
          </div>

          <div className="bg-[#0a0f3c]/50 p-5 rounded-[24px] border border-white/5 space-y-4 text-right">
            <p className="text-xs font-bold text-gray-300 leading-relaxed">
              نظام التصنيف يعتمد على نقاطك. مع كل <span className="text-white font-[1000]">1,000 نقطة</span> تكتسبها، سيتم ترقية مستواك:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'مبتدئ', p: '0', active: currentPoints < 1000 },
                { label: 'متوسط', p: '1000', active: currentPoints >= 1000 && currentPoints < 2000 },
                { label: 'محترف', p: '2000', active: currentPoints >= 2000 }
              ].map((lvl, i) => (
                <div key={i} className={`p-3 rounded-2xl border text-center transition-all ${lvl.active ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-white/5 border-white/5 text-gray-600'}`}>
                  <span className="block text-[8px] font-black uppercase mb-1">{lvl.label}</span>
                  <span className="text-[10px] font-[1000] italic">{lvl.p}pt</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 justify-end">
              <span className="text-[9px] font-black text-cyan-400/80 italic">اجمع النقاط من خلال الفوز في الفزعات وتقييم اللاعبين لك!</span>
              <ArrowUpRight size={14} className="text-cyan-400" />
            </div>
          </div>
        </div>

        {/* القائمة السفلية */}
        <div className="space-y-3 pb-10">
          <button onClick={() => navigate('/personal')} className="w-full flex items-center justify-between px-6 py-5 rounded-[24px] bg-white/5 border border-white/10 active:scale-95 transition-all group">
            <ChevronLeft size={18} className="text-gray-600" />
            <div className="flex items-center gap-4">
               <span className="text-white text-sm font-black uppercase">بياناتي الشخصية</span>
               <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><User size={18} /></div>
            </div>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-5 py-5 rounded-[24px] bg-red-500/10 border border-red-500/20 text-red-400 font-black text-sm uppercase active:scale-95 transition-all">
            <LogOut size={18} /><span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}