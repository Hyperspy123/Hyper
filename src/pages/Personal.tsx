import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Mail, Phone, Trophy, Zap, Loader2, Settings, ShieldCheck, Medal, Star, Flame, Crown, Swords, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🔥 تعريف مسار الرانكات بالكامل
const RANKS_LADDER = [
  { id: 1, name: 'ROOKIE', Icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', min: 0, max: 49 },
  { id: 2, name: 'PRO', Icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', min: 50, max: 99 },
  { id: 3, name: 'ELITE', Icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', min: 100, max: 149 },
  { id: 4, name: 'PRINCE', Icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', min: 150, max: 199 },
  { id: 5, name: 'KING', Icon: Swords, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', min: 200, max: 249 },
  { id: 6, name: 'LEGEND', Icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', min: 250, max: 299 },
  { id: 7, name: 'HYPE', Icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', min: 300, max: 9999 },
];

export default function Personal() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) setProfile(data);
    setLoading(false);
  };

  const matches = profile?.total_matches || 0;
  
  // تحديد الرانك الحالي بناءً على عدد المباريات
  const currentRank = RANKS_LADDER.find(r => matches >= r.min && matches <= r.max) || RANKS_LADDER[0];
  const CurrentIcon = currentRank.Icon;
  
  // حساب التقدم للرانك القادم
  const isMaxLevel = matches >= 300;
  const progress = isMaxLevel ? 100 : Math.min(100, ((matches - currentRank.min) / (currentRank.max - currentRank.min + 1)) * 100);
  const matchesToNext = isMaxLevel ? 0 : (currentRank.max + 1) - matches;

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        
        {/* هيدر الملف الشخصي */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-[35px] p-1 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <div className="w-full h-full bg-[#0a0f3c] rounded-[32px] flex items-center justify-center">
                <User size={50} className="text-gray-500" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-cyan-500 p-2 rounded-xl border-4 border-[#05081d] text-[#0a0f3c]">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">{profile?.first_name}</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{profile?.email}</p>
          </div>
        </div>

        {/* كرت الرانك الحالي (الرئيسي) */}
        <div className={`bg-[#0a0f3c] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group shadow-lg drop-shadow-[0_0_15px_${currentRank.color.replace('text-', '')}]`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <CurrentIcon size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-[20px] ${currentRank.bg} border border-white/10 flex items-center justify-center relative overflow-hidden`}>
                  <div className={`absolute inset-0 blur-xl opacity-40 ${currentRank.bg.replace('/10', '')}`} />
                  <CurrentIcon size={28} className={`${currentRank.color} relative z-10 drop-shadow-[0_0_8px_currentColor]`} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-0.5">المستوى الحالي</span>
                  <h2 className={`text-3xl font-[1000] italic uppercase leading-none ${currentRank.color} drop-shadow-[0_0_10px_currentColor]`}>
                    {currentRank.name}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-[1000] italic leading-none">{matches}</span>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">مباراة ملعوبة</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className={currentRank.color}>التقدم للرانك التالي</span>
                <span className="text-gray-400">{isMaxLevel ? 'MAX LEVEL' : `باقي ${matchesToNext} مباريات`}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className={`h-full ${currentRank.bg.replace('/10', '')} transition-all duration-1000 relative`}
                  style={{ width: `${progress}%` }}
                >
                  {!isMaxLevel && <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 مسار التقدم (الرانكات كلها) 🔥 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pr-4 pl-2">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Trophy size={14} className="text-cyan-400" /> مسار التصنيف
            </h3>
            <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg uppercase">أعلى رانك: HYPE</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide px-2">
            {RANKS_LADDER.map((rank) => {
              const RankIcon = rank.Icon;
              const isCompleted = matches > rank.max;
              const isCurrent = matches >= rank.min && matches <= rank.max;
              const isLocked = matches < rank.min;

              return (
                <div 
                  key={rank.id} 
                  className={`min-w-[140px] rounded-[30px] p-5 flex flex-col items-center text-center relative border transition-all duration-500
                    ${isCurrent ? `bg-[#0a0f3c] ${rank.border} scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.5)]` : 
                      isCompleted ? 'bg-white/5 border-white/10 opacity-70' : 
                      'bg-[#05081d] border-white/5 opacity-50 grayscale'
                    }`}
                >
                  {/* شارة الحالة (مكتمل / مقفل) */}
                  <div className="absolute top-3 right-3">
                    {isCompleted && <CheckCircle2 size={14} className="text-green-400" />}
                    {isLocked && <Lock size={14} className="text-gray-600" />}
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>

                  {/* أيقونة الرانك */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isLocked ? 'bg-gray-800' : rank.bg}`}>
                    <RankIcon size={24} className={isLocked ? 'text-gray-500' : rank.color} />
                  </div>

                  {/* تفاصيل الرانك */}
                  <h4 className={`text-lg font-[1000] italic uppercase leading-none mb-1 ${isLocked ? 'text-gray-500' : rank.color}`}>
                    {rank.name}
                  </h4>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
                    {rank.min === 300 ? '+300 مباراة' : `${rank.min} مباراة`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* معلومات التواصل */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pr-4">المعلومات الشخصية</h3>
          <div className="bg-white/5 rounded-[30px] border border-white/5 overflow-hidden">
            <div className="p-5 flex items-center gap-4 border-b border-white/5">
              <div className="p-3 bg-white/5 rounded-2xl text-cyan-400"><Mail size={18} /></div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-black uppercase">البريد الإلكتروني</p>
                <p className="font-bold text-sm">{profile?.email}</p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-cyan-400"><Phone size={18} /></div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-black uppercase">رقم الجوال</p>
                <p className="font-bold text-sm">{profile?.phone_number || 'غير مسجل'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإعدادات */}
        <div className="grid grid-cols-2 gap-4">
          <button className="p-6 bg-white/5 rounded-[30px] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group hover:bg-white/10">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-[#0a0f3c] transition-all">
              <Settings size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">تعديل الحساب</span>
          </button>
          <button onClick={() => navigate('/support')} className="p-6 bg-white/5 rounded-[30px] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group hover:bg-white/10">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Zap size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">الدعم الفني</span>
          </button>
        </div>

      </main>
    </div>
  );
}