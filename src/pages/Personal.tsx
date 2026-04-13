import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Mail, Phone, Trophy, Zap, Loader2, Settings, ShieldCheck, Medal, Star, Flame, Crown, Swords, Sparkles, Lock, CheckCircle2, Save, X, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 🔥 تعريف مسار الرانكات
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

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFormData({ 
        first_name: data.first_name || '', 
        phone: data.phone || '' 
      });
    }
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: formData.first_name,
        phone: formData.phone
      })
      .eq('id', user?.id);

    if (!error) {
      toast.success("تم تحديث الملف الشخصي بنجاح 🔥");
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
          <div className="w-full">
            {isEditing ? (
              <input 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="bg-white/5 border border-cyan-500/50 rounded-xl px-4 py-2 text-center text-2xl font-[1000] italic uppercase w-full outline-none focus:bg-white/10 transition-all"
                placeholder="الاسم المستعار"
              />
            ) : (
              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">{profile?.first_name}</h1>
            )}
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{profile?.email}</p>
          </div>
        </div>

        {/* كرت الرانك الحالي */}
        <div className={`bg-[#0a0f3c] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <CurrentIcon size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-[20px] ${currentRank.bg} border border-white/10 flex items-center justify-center`}>
                  <CurrentIcon size={28} className={currentRank.color} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-0.5">المستوى الحالي</span>
                  <h2 className={`text-3xl font-[1000] italic uppercase leading-none ${currentRank.color}`}>
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
                  className={`h-full ${currentRank.bg.replace('/10', '')} transition-all duration-1000`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* معلومات التواصل والتعديل */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">المعلومات الشخصية</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
            >
              {isEditing ? <><X size={12}/> إلغاء</> : <><Edit2 size={12}/> تعديل</>}
            </button>
          </div>
          
          <div className="bg-white/5 rounded-[30px] border border-white/5 overflow-hidden">
            <div className="p-5 flex items-center gap-4 border-b border-white/5 opacity-60">
              <div className="p-3 bg-white/5 rounded-2xl text-gray-500"><Mail size={18} /></div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-black uppercase">البريد الإلكتروني (لا يتغير)</p>
                <p className="font-bold text-sm">{profile?.email}</p>
              </div>
            </div>
            <div className={`p-5 flex items-center gap-4 transition-all ${isEditing ? 'bg-white/5' : ''}`}>
              <div className={`p-3 rounded-2xl transition-all ${isEditing ? 'bg-cyan-500 text-[#0a0f3c]' : 'bg-white/5 text-cyan-400'}`}>
                <Phone size={18} />
              </div>
              <div className="text-right flex-1">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">رقم الجوال</p>
                {isEditing ? (
                  <input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-transparent border-none text-white font-bold text-sm w-full outline-none mt-1"
                    placeholder="05xxxxxxxx"
                    autoFocus
                  />
                ) : (
                  <p className="font-bold text-sm tracking-widest">{profile?.phone || 'غير مسجل'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="space-y-4">
          {isEditing ? (
            <button 
              onClick={handleUpdateProfile}
              disabled={updating}
              className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] italic uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
            >
              {updating ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> حفظ التعديلات</>}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsEditing(true)}
                className="p-6 bg-white/5 rounded-[30px] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group hover:bg-white/10"
              >
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-[#0a0f3c] transition-all">
                  <Edit2 size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">تعديل البيانات</span>
              </button>
              <button 
                onClick={() => navigate('/support')}
                className="p-6 bg-white/5 rounded-[30px] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all group hover:bg-white/10"
              >
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Zap size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">الدعم الفني</span>
              </button>
            </div>
          )}
          
          <button 
            onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))}
            className="w-full py-5 bg-red-500/5 text-red-500 border border-red-500/10 rounded-[30px] font-black italic flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            تسجيل الخروج
          </button>
        </div>

      </main>
    </div>
  );
}