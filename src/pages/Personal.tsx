import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Mail, Phone, Trophy, Zap, ChevronRight, Loader2, Settings, ShieldCheck, Medal, Star, Flame, Crown, Swords, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
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

  // 🔥 نظام الرانك مع أيقونات فخمة وتأثيرات متوهجة
  const getRankInfo = (matches: number) => {
    if (matches < 50) return { name: 'ROOKIE', Icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/30', next: 50 };
    if (matches < 100) return { name: 'PRO', Icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/30', next: 100 };
    if (matches < 150) return { name: 'ELITE', Icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/30', next: 150 };
    if (matches < 200) return { name: 'PRINCE', Icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/30', next: 200 };
    if (matches < 250) return { name: 'KING', Icon: Swords, color: 'text-yellow-400', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/30', next: 250 };
    if (matches < 300) return { name: 'LEGEND', Icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/30', next: 300 };
    return { name: 'HYPE', Icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/40', next: 300 };
  };

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  const rank = getRankInfo(profile?.total_matches || 0);
  const RankIcon = rank.Icon;
  const progress = Math.min(100, ((profile?.total_matches || 0) % 50 / 50) * 100);
  const matchesToNext = rank.next - (profile?.total_matches || 0);

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

        {/* كرت الرانك المطور بالأيقونات المتوهجة */}
        <div className={`bg-[#0a0f3c] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group shadow-lg ${rank.glow}`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <RankIcon size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                {/* صندوق الأيقونة الفخم */}
                <div className={`w-14 h-14 rounded-[20px] ${rank.bg} border border-white/10 flex items-center justify-center relative overflow-hidden`}>
                  <div className={`absolute inset-0 blur-xl opacity-40 ${rank.bg.replace('/10', '')}`} />
                  <RankIcon size={28} className={`${rank.color} relative z-10 drop-shadow-[0_0_8px_currentColor]`} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-0.5">المستوى الحالي</span>
                  <h2 className={`text-3xl font-[1000] italic uppercase leading-none ${rank.color} drop-shadow-[0_0_10px_currentColor]`}>
                    {rank.name}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-[1000] italic leading-none">{profile?.total_matches || 0}</span>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">مباراة ملعوبة</span>
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className={rank.color}>التقدم للرانك التالي</span>
                <span className="text-gray-400">{profile?.total_matches >= 300 ? 'MAX LEVEL' : `باقي ${matchesToNext} مباريات`}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className={`h-full ${rank.bg.replace('/10', '')} transition-all duration-1000 relative`}
                  style={{ width: `${profile?.total_matches >= 300 ? 100 : progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                </div>
              </div>
            </div>
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