import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Mail, Phone, Trophy, Zap, Loader2, ShieldCheck, Medal, Star, Flame, Crown, Swords, Sparkles, Lock, CheckCircle2, Save, Edit2, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', phone: '' });
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

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (data) {
      // دمج بيانات Auth مع بيانات الجدول عشان نضمن ظهور الإيميل والجنس وتاريخ الميلاد
      setProfile({
        ...data,
        email: user.email,
        gender: data.gender || user.user_metadata?.gender,
        birth_date: data.birth_date || user.user_metadata?.birth_date
      });
      setFormData({ first_name: data.first_name || '', phone: data.phone || '' });
    }
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({
      first_name: formData.first_name,
      phone: formData.phone
    }).eq('id', user?.id);

    if (!error) {
      toast.success("تم التحديث بنجاح 🔥");
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } else {
      toast.error("حدث خطأ أثناء التحديث");
    }
    setUpdating(false);
  };

  const matches = profile?.total_matches || 0;
  const currentRank = RANKS_LADDER.find(r => matches >= r.min && matches <= r.max) || RANKS_LADDER[0];
  const CurrentIcon = currentRank.Icon;
  const isMaxLevel = matches >= 300;
  const progress = isMaxLevel ? 100 : Math.min(100, ((matches - currentRank.min) / (currentRank.max - currentRank.min + 1)) * 100);
  const matchesToNext = isMaxLevel ? 0 : (currentRank.max + 1) - matches;

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        
        {/* هيدر الشخصية */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-[35px] p-1 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              {/* 🔥 اللمسة السحرية: الأفاتار صار يتغير لونه وشكله مع الرانك 🔥 */}
              <div className="w-full h-full bg-[#0a0f3c] rounded-[32px] flex items-center justify-center overflow-hidden">
                <CurrentIcon size={50} className={currentRank.color} />
              </div>
            </div>
          </div>
          <div className="w-full">
            {isEditing ? (
              <input 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="bg-white/5 border border-cyan-500/50 rounded-xl px-4 py-2 text-center text-2xl font-[1000] italic w-full outline-none"
                placeholder="الاسم المستعار"
              />
            ) : (
              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">{profile?.first_name}</h1>
            )}
            <p className="text-cyan-400 font-bold text-xs mt-1 uppercase tracking-widest">{currentRank.name} PLAYER</p>
          </div>
        </div>

        {/* كرت الرانك الحالي وشريط التقدم */}
        <div className="bg-[#0a0f3c] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <CurrentIcon size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-[20px] ${currentRank.bg} border border-white/10 flex items-center justify-center`}>
                  <CurrentIcon size={28} className={currentRank.color} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">الرانك الحالي</span>
                  <h2 className={`text-3xl font-[1000] italic uppercase leading-none ${currentRank.color}`}>
                    {currentRank.name}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-[1000] italic leading-none">{matches}</span>
                <span className="text-[8px] font-black text-gray-500 uppercase">مباراة</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className={currentRank.color}>التقدم للمستوى القادم</span>
                <span className="text-gray-400">{isMaxLevel ? 'MAX LEVEL' : `باقي ${matchesToNext} مباريات`}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full bg-gradient-to-l from-cyan-500 to-purple-500 transition-all duration-1000`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 قسم مسار الرانكات (Ladder) 🔥 */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pr-4 flex items-center gap-2">
            <Trophy size={14} className="text-cyan-400" /> مسار التصنيف المعتمد
          </h3>
          
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
                  <div className="absolute top-3 right-3">
                    {isCompleted && <CheckCircle2 size={14} className="text-green-400" />}
                    {isLocked && <Lock size={14} className="text-gray-600" />}
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>

                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isLocked ? 'bg-gray-800' : rank.bg}`}>
                    <RankIcon size={24} className={isLocked ? 'text-gray-500' : rank.color} />
                  </div>

                  <h4 className={`text-lg font-[1000] italic uppercase leading-none mb-1 ${isLocked ? 'text-gray-500' : rank.color}`}>
                    {rank.name}
                  </h4>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
                    {rank.min} مباراة
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📋 البيانات الشخصية (مع التعديل) */}
        <div className="bg-white/5 rounded-[40px] border border-white/5 p-8 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">البيانات الشخصية</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-cyan-400 text-[10px] font-black uppercase underline">
              {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
            </button>
          </div>

          <div className="space-y-0 divide-y divide-white/5">
            {/* الإيميل (للقراءة فقط) */}
            <div className="flex items-center gap-4 py-4 first:pt-0">
              <div className="p-3 bg-white/5 rounded-2xl text-gray-400"><Mail size={18} /></div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-500 font-black uppercase">البريد الإلكتروني</p>
                <p className="font-bold text-sm text-gray-300">{profile?.email || 'غير متوفر'}</p>
              </div>
            </div>

            {/* الجوال (قابل للتعديل) */}
            <div className="flex items-center gap-4 py-4">
              <div className="p-3 bg-white/5 rounded-2xl text-cyan-400"><Phone size={18} /></div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-500 font-black uppercase">رقم الجوال</p>
                {isEditing ? (
                  <input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-transparent border-b border-cyan-500/50 text-white font-bold w-full outline-none py-1"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                ) : (
                  <p className="font-bold text-sm">{profile?.phone || 'غير مسجل'}</p>
                )}
              </div>
            </div>

            {/* الجنس (للقراءة فقط) */}
            <div className="flex items-center gap-4 py-4">
              <div className="p-3 bg-white/5 rounded-2xl text-purple-400"><Users size={18} /></div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-500 font-black uppercase">الجنس</p>
                <p className="font-bold text-sm text-gray-300">{profile?.gender || 'غير محدد'}</p>
              </div>
            </div>

            {/* تاريخ الميلاد (للقراءة فقط) */}
            <div className="flex items-center gap-4 py-4">
              <div className="p-3 bg-white/5 rounded-2xl text-emerald-400"><Calendar size={18} /></div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-500 font-black uppercase">تاريخ الميلاد</p>
                <p className="font-bold text-sm text-gray-300">{profile?.birth_date || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          {/* زر الحفظ يظهر فقط وقت التعديل */}
          {isEditing && (
            <button onClick={handleUpdateProfile} disabled={updating} className="w-full py-4 mt-2 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black uppercase italic shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
              {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          )}
        </div>

        <button 
          onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))} 
          className="w-full py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[25px] font-black italic flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          تسجيل الخروج
        </button>
      </main>
    </div>
  );
}