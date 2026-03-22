import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, Zap, Award, ChevronLeft, Target, TrendingUp, Trophy, Loader2 } from 'lucide-react';

// دليل التصنيفات الكامل (نفس مسمياتك وأرقامك)
const RANKS_GUIDE = [
  { range: '0 - 10', title: 'مستجد (Rookie)', icon: '🥚', color: 'text-gray-400', min: 0, max: 10 },
  { range: '11 - 50', title: 'هايب (Hype)', icon: '⚡', color: 'text-cyan-400', min: 11, max: 50 },
  { range: '51 - 150', title: 'برنس (Prince)', icon: '👑', color: 'text-purple-400', min: 51, max: 150 },
  { range: '151 - 300', title: 'كينج (King)', icon: '🦁', color: 'text-yellow-500', min: 151, max: 300 },
  { range: '301 - 499', title: 'أسطورة (Legend)', icon: '🌌', color: 'text-indigo-400', min: 301, max: 499 },
  { range: '500+', title: 'هايبر (HYPER)', icon: '💫', color: 'text-pink-500', min: 500, max: 9999 },
];

export default function Personal() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم الحقيقية
  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) setProfile(data);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const matchesPlayed = profile?.total_matches || 0;

  // حساب اللقب الحالي بناءً على عدد المباريات الحقيقي
  const currentRank = [...RANKS_GUIDE].reverse().find(r => matchesPlayed >= r.min) || RANKS_GUIDE[0];
  const nextRank = RANKS_GUIDE[RANKS_GUIDE.indexOf(currentRank) + 1];
  
  // حساب النسبة المئوية للتقدم للقب القادم
  const calculateProgress = () => {
    if (!nextRank) return 100;
    const rangeSize = nextRank.min - currentRank.min;
    const progressInRange = matchesPlayed - currentRank.min;
    const percentage = (progressInRange / rangeSize) * 100;
    return Math.min(Math.max(percentage, 5), 100); 
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05081d] flex items-center justify-center">
      <Loader2 className="text-cyan-400 animate-spin" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir="rtl">
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-3xl font-[1000] italic tracking-tighter uppercase leading-none text-cyan-400">شخصي <span className='text-white'>Profile</span></h1>
        </div>

        {/* 1. نظام المستوى (الخيارات الثلاثة) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full -ml-16 -mt-16" />
          <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
            <Target size={14} className="text-cyan-400" /> مهارة اللعب المحددة
          </h3>
          <div className="grid grid-cols-1 gap-3 relative z-10">
            {['beginner', 'intermediate', 'pro'].map((lvl) => (
                <div 
                    key={lvl}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                        profile?.skill_level === lvl 
                        ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-lg' 
                        : 'bg-black/20 border-white/5 text-gray-600'
                    }`}
                >
                    <span className="text-xl font-black uppercase">
                        {lvl === 'beginner' ? 'مبتدئ' : lvl === 'intermediate' ? 'متوسط' : 'محترف'}
                    </span>
                    {profile?.skill_level === lvl && <Zap size={20} className="fill-cyan-400" />}
                </div>
            ))}
          </div>
        </div>

        {/* 2. نظام التصنيف الديناميكي (البطاقة الحالية) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 mb-6 relative overflow-hidden shadow-xl border-b-yellow-500/20">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full -mr-16 -mb-16" />
            <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
                <Award size={14} className="text-yellow-400" /> لقبك الفعلي • Live Rank
            </h3>
            <div className="flex items-center gap-5 mb-6 relative z-10">
                <div className="text-6xl drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">{currentRank.icon}</div>
                <div className='flex-1'>
                    <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">التصنيف الحالي</span>
                    <span className={`text-2xl font-[1000] tracking-tight italic uppercase ${currentRank.color}`}>
                        {profile?.current_rank || currentRank.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-yellow-400 font-[1000] italic">
                        <TrendingUp size={14} /> {matchesPlayed} مباراة ملعوبة
                    </div>
                </div>
            </div>
            
            {/* الشريط الملون */}
            <div className="relative z-10 bg-black/40 rounded-full h-3 border border-white/5 p-0.5 overflow-hidden shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    style={{ width: `${calculateProgress()}%` }}
                />
            </div>
            
            {nextRank && (
                <p className="text-center mt-3 text-[10px] text-gray-400 font-black uppercase tracking-wider relative z-10">
                    تبقى <span className="text-white">{nextRank.min - matchesPlayed}</span> مباريات للوصول لـ <span className={nextRank.color}>{nextRank.title}</span>
                </p>
            )}
        </div>

        {/* 3. دليل التصنيفات الشامل */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6 shadow-xl relative overflow-hidden">
            <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Trophy size={14} className="text-cyan-400" /> دليل ترقيات هايب • Hype Guide
            </h3>
            <div className="space-y-2">
                <div className="flex items-center px-4 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5">
                    <span className="w-10">الرمز</span>
                    <span className="flex-1">اللقب</span>
                    <span className="w-20 text-left">النطاق</span>
                </div>
                {RANKS_GUIDE.map((rank, index) => {
                    const isUnlocked = matchesPlayed >= rank.min;
                    const isCurrent = currentRank.title === rank.title;
                    return (
                        <div 
                            key={index} 
                            className={`flex items-center px-4 py-4 rounded-2xl transition-all duration-500 border ${
                                isCurrent ? 'bg-cyan-500/10 border-cyan-500/30' : isUnlocked ? 'bg-white/5 border-white/5' : 'opacity-20 grayscale border-transparent'
                            }`}
                        >
                            <span className="w-10 text-xl">{rank.icon}</span>
                            <span className={`flex-1 text-xs font-black italic uppercase ${isUnlocked ? rank.color : 'text-gray-500'}`}>
                                {rank.title}
                                {isCurrent && <span className="mr-2 text-[8px] text-cyan-400 animate-pulse">(أنت هنا)</span>}
                            </span>
                            <span className="w-20 text-left text-[10px] font-black text-gray-400">
                                {rank.range}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <p className="text-center mt-8 text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Hype Padel Community ID • Verified</p>
      </div>
    </div>
  );
}