import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Users, Zap, Award, ChevronLeft, Target, TrendingUp, Trophy } from 'lucide-react';

// تعريف المستويات
const LEVELS = [
  { id: 'beginner', label: 'مبتدئ', desc: 'أبدأ رحلتك', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' },
  { id: 'intermediate', label: 'متوسط', desc: 'أثبت مهاراتك', color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' },
  { id: 'pro', label: 'محترف', desc: 'نافس الأفضل', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5' },
];

// دليل التصنيفات الكامل
const RANKS_GUIDE = [
  { range: '0 - 10', title: 'مستجد (Rookie)', icon: '🥚', color: 'text-gray-400', min: 0 },
  { range: '11 - 50', title: 'هايب (Hype)', icon: '⚡', color: 'text-cyan-400', min: 11 },
  { range: '51 - 150', title: 'برنس (Prince)', icon: '👑', color: 'text-purple-400', min: 51 },
  { range: '151 - 300', title: 'كينج (King)', icon: '🦁', color: 'text-yellow-500', min: 151 },
  { range: '301 - 499', title: 'أسطورة (Legend)', icon: '🌌', color: 'text-indigo-400', min: 301 },
  { range: '500+', title: 'هايبر (HYPER)', icon: '💫', color: 'text-pink-500', min: 500 },
];

export default function Personal() {
  const navigate = useNavigate();
  
  // Player Stats (محاكاة)
  const [matchesPlayed] = useState(24); 
  const [skillLevel, setSkillLevel] = useState('intermediate');

  // حساب اللقب الحالي بناءً على عدد المباريات
  const currentRank = [...RANKS_GUIDE].reverse().find(r => matchesPlayed >= r.min) || RANKS_GUIDE[0];
  const nextRank = RANKS_GUIDE[RANKS_GUIDE.indexOf(currentRank) + 1];
  
  // حساب النسبة المئوية للتقدم للقب القادم
  const calculateProgress = () => {
    if (!nextRank) return 100;
    const currentRangeMin = currentRank.min;
    const nextRangeMin = nextRank.min;
    const progress = ((matchesPlayed - currentRangeMin) / (nextRangeMin - currentRangeMin)) * 100;
    return Math.min(Math.max(progress, 5), 100); // بحد أدنى 5% للشكل الجمالي
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir="rtl">
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-cyan-400">شخصي <span className='text-white'>Profile</span></h1>
        </div>

        {/* 1. نظام المستوى (3 خانات) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full -ml-16 -mt-16" />
          <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
            <Target size={14} className="text-cyan-400" /> مستوى اللعب الحالي
          </h3>
          <div className="grid grid-cols-1 gap-3 relative z-10">
            {LEVELS.map((level) => (
                <button 
                    key={level.id}
                    onClick={() => setSkillLevel(level.id)}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 active:scale-[0.98] ${
                        skillLevel === level.id 
                        ? `${level.color} shadow-lg shadow-black/30` 
                        : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                >
                    <div>
                        <span className={`block text-xl font-black ${skillLevel === level.id ? '' : 'text-gray-400'}`}>{level.label}</span>
                        <span className="block text-xs font-bold opacity-60 mt-1">{level.desc}</span>
                    </div>
                    {skillLevel === level.id && <Zap size={24} className="fill-current" />}
                </button>
            ))}
          </div>
        </div>

        {/* 2. نظام التصنيف (البطاقة الحالية) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 mb-6 relative overflow-hidden shadow-xl">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full -mr-16 -mb-16" />
            <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] relative z-10">
                <Award size={14} className="text-yellow-400" /> لقبك الحالي • Active Rank
            </h3>
            <div className="flex items-center gap-5 mb-6 relative z-10">
                <div className="text-6xl drop-shadow-2xl">{currentRank.icon}</div>
                <div className='flex-1'>
                    <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">التصنيف الحالي</span>
                    <span className={`text-2xl font-black tracking-tight italic ${currentRank.color}`}>{currentRank.title}</span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-yellow-400 font-bold">
                        <TrendingUp size={14} /> {matchesPlayed} مباراة ملعوبة
                    </div>
                </div>
            </div>
            <div className="relative z-10 bg-black/30 rounded-full h-3 border border-white/5 p-0.5 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: `${calculateProgress()}%` }}
                />
            </div>
            {nextRank && (
                <p className="text-center mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider relative z-10">
                    تبقي {nextRank.min - matchesPlayed} مباريات للوصول لـ {nextRank.title}
                </p>
            )}
        </div>

        {/* 3. جدول التصنيفات الشامل */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6 shadow-xl relative overflow-hidden">
            <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Trophy size={14} className="text-cyan-400" /> دليل الألقاب • Ranks Guide
            </h3>
            <div className="space-y-2">
                <div className="flex items-center px-4 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5">
                    <span className="w-10">الرمز</span>
                    <span className="flex-1">اللقب</span>
                    <span className="w-20 text-left">المباريات</span>
                </div>
                {RANKS_GUIDE.map((rank, index) => {
                    const isUnlocked = matchesPlayed >= rank.min;
                    return (
                        <div 
                            key={index} 
                            className={`flex items-center px-4 py-4 rounded-2xl transition-all duration-500 ${
                                isUnlocked ? 'bg-white/5 border border-white/10' : 'opacity-20 grayscale'
                            }`}
                        >
                            <span className="w-10 text-xl">{rank.icon}</span>
                            <span className={`flex-1 text-xs font-black italic ${isUnlocked ? rank.color : 'text-gray-500'}`}>
                                {rank.title}
                            </span>
                            <span className="w-20 text-left text-[10px] font-black text-gray-400">
                                {rank.range}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <p className="text-center mt-8 text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Hype Padel Community ID</p>
      </div>
    </div>
  );
}