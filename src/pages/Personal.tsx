import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
// 🔥 تأكد من وجود LogOut و Loader2 هنا 🔥
import { 
  User, Mail, Phone, Trophy, Zap, Loader2, ShieldCheck, 
  Medal, Star, Flame, Crown, Swords, Sparkles, Lock, 
  CheckCircle2, Calendar, Users, LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// 🔥 استيراد المترجم 🔥
import { useLanguage } from '../context/LanguageContext';

export default function Personal() {
  const { t, dir, lang } = useLanguage(); // ✅ جلب الدالات
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', phone: '' });
  const navigate = useNavigate();

  const RANKS_LADDER = [
    { id: 1, name: lang === 'ar' ? 'مبتدئ' : 'ROOKIE', Icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', min: 0, max: 49 },
    { id: 2, name: lang === 'ar' ? 'محترف' : 'PRO', Icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', min: 50, max: 99 },
    { id: 3, name: lang === 'ar' ? 'نخبة' : 'ELITE', Icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', min: 100, max: 149 },
    { id: 4, name: lang === 'ar' ? 'أمير' : 'PRINCE', Icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', min: 150, max: 199 },
    { id: 5, name: lang === 'ar' ? 'ملك' : 'KING', Icon: Swords, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', min: 200, max: 249 },
    { id: 6, name: lang === 'ar' ? 'أسطورة' : 'LEGEND', Icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', min: 250, max: 299 },
    { id: 7, name: lang === 'ar' ? 'هايب' : 'HYPE', Icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', min: 300, max: 9999 },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
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
      toast.success(lang === 'ar' ? "تم التحديث بنجاح 🔥" : "Updated successfully 🔥");
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
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
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        {/* هيدر الشخصية */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-[35px] p-1 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <div className="w-full h-full bg-[#0a0f3c] rounded-[32px] flex items-center justify-center overflow-hidden">
                <CurrentIcon size={50} className={currentRank.color} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-[1000] italic uppercase">{profile?.first_name}</h1>
          <p className="text-cyan-400 font-bold text-xs uppercase">{currentRank.name} {t('rank')}</p>
        </div>

        {/* كرت الرانك */}
        <div className="bg-[#0a0f3c] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-6 text-right">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-[20px] ${currentRank.bg} flex items-center justify-center`}>
                  <CurrentIcon size={28} className={currentRank.color} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">{lang === 'ar' ? 'الرانك الحالي' : 'CURRENT RANK'}</span>
                  <h2 className={`text-3xl font-[1000] italic uppercase ${currentRank.color}`}>{currentRank.name}</h2>
                </div>
              </div>
              <div>
                <span className="block text-2xl font-[1000] italic">{matches}</span>
                <span className="text-[8px] font-black text-gray-500 uppercase">{t('matches')}</span>
              </div>
            </div>
            {/* ProgressBar */}
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-l from-cyan-500 to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* 📋 البيانات الشخصية */}
        <div className="bg-white/5 rounded-[40px] p-8 space-y-6 text-right">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase">{lang === 'ar' ? 'البيانات الشخصية' : 'PERSONAL INFO'}</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-cyan-400 text-[10px] font-black underline">
              {isEditing ? (lang === 'ar' ? 'إلغاء' : 'CANCEL') : (lang === 'ar' ? 'تعديل' : 'EDIT')}
            </button>
          </div>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="flex items-center gap-4 py-4"><Mail className="text-gray-400" size={18} /><div className="flex-1"><p className="text-[9px] text-gray-500 uppercase">{t('email')}</p><p className="font-bold text-sm text-gray-300">{profile?.email || '---'}</p></div></div>
            <div className="flex items-center gap-4 py-4"><Phone className="text-cyan-400" size={18} /><div className="flex-1"><p className="text-[9px] text-gray-500 uppercase">{t('phone')}</p>{isEditing ? <input value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="bg-transparent border-b border-cyan-500/50 text-white w-full outline-none" dir="ltr" /> : <p className="font-bold text-sm">{profile?.phone || '---'}</p>}</div></div>
          </div>
          {isEditing && <button onClick={handleUpdateProfile} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black italic uppercase transition-all">{t('save_changes')}</button>}
        </div>

        {/* زر خروج */}
        <button 
          onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))} 
          className="w-full py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[25px] font-black italic flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </main>
    </div>
  );
}