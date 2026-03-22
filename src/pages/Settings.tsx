import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { Globe, Shield, UserX, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  
  // نستخدم any هنا لتجاوز قيود TypeScript مؤقتاً وحل مشكلة المسميات
  const i18n = useI18n() as any;
  const { t, dir } = i18n;

  // محرك ذكي لاكتشاف مسمى اللغة وتغييرها (سواء كان locale أو language)
  const currentLang = i18n.locale || i18n.language || 'ar';
  const setLang = i18n.setLocale || i18n.setLanguage || i18n.changeLanguage;

  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_public, current_rank')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setIsPublic(data.is_public);
          setProfile(data);
        }
      }
    }
    fetchSettings();
  }, []);

  const togglePrivacy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newStatus = !isPublic;
    const { error } = await supabase.from('profiles').update({ is_public: newStatus }).eq('id', user.id);
    if (!error) {
      setIsPublic(newStatus);
      toast.success(newStatus ? "ملفك الشخصي الآن عام للجميع 🌍" : "ملفك الشخصي الآن خاص 🔒");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("تحذير نهائي: هل أنت متأكد من حذف الحساب؟");
    if (!confirmDelete) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
        toast.error("تم حذف الحساب");
        navigate('/auth');
      }
    } catch (e) {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                    <ChevronRight size={22} className={dir === 'rtl' ? '' : 'rotate-180'} />
                </button>
                <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">الإعدادات</h1>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] italic">
                   {profile?.current_rank || 'Member'}
                </span>
            </div>
        </div>

        <div className="space-y-4">
          {/* قسم اللغة */}
          <button 
            onClick={() => setLang(currentLang === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center justify-between px-6 py-6 rounded-[32px] bg-white/5 border border-white/10 group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Globe size={22} className="text-purple-400" />
              </div>
              <div className="text-right">
                 <span className="block text-sm font-black uppercase tracking-tight">اللغة • Language</span>
                 <span className="text-[10px] text-gray-500 font-bold uppercase">{currentLang === 'ar' ? 'English' : 'العربية'}</span>
              </div>
            </div>
            <span className="text-cyan-400 text-xs font-black border border-cyan-400/30 px-5 py-2.5 rounded-xl bg-cyan-400/5 uppercase">
                {currentLang === 'ar' ? 'العربية' : 'English'}
            </span>
          </button>

          {/* قسم الخصوصية */}
          <div className="w-full flex items-center justify-between px-6 py-6 rounded-[32px] bg-white/5 border border-white/10 mt-2">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Shield size={22} className="text-green-400" />
              </div>
              <div className="text-right">
                 <span className="block text-sm font-black uppercase tracking-tight">ملف شخصي عام</span>
              </div>
            </div>
            <button 
                onClick={togglePrivacy}
                className={`w-14 h-7 rounded-full relative transition-all duration-500 p-1 ${isPublic ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-gray-800'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-500 transform ${isPublic ? (dir === 'rtl' ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'}`} />
            </button>
          </div>

          {/* منطقة الخطر */}
          <div className="pt-12 mt-4 space-y-4 text-right">
            <div className="flex items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-widest px-2 text-red-500">
               <AlertCircle size={12} /> منطقة الخطر
            </div>
            <button 
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full flex items-center justify-between px-6 py-6 rounded-[32px] bg-red-500/5 border border-red-500/10 group hover:bg-red-500 transition-all duration-300 shadow-lg shadow-red-500/5"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <UserX size={22} className="text-red-400 group-hover:text-white" />
                </div>
                <div className="text-right">
                   <span className="block text-red-400 group-hover:text-white text-sm font-black uppercase tracking-widest">حذف الحساب نهائياً</span>
                </div>
              </div>
              {loading && <Loader2 size={20} className="animate-spin text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}