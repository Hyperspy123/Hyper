import { useState } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, User, LogIn, Calendar, Loader2, Phone, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, password,
          options: { data: { first_name: firstName, phone, birth_date: birthDate } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, first_name: firstName, phone, birth_date: birthDate, current_rank: 'ROOKIE', is_public: true }]);
        }
        toast.success("تم إنشاء الحساب! افحص بريدك لتفعيله 🔥");
        setMode('signin');
      } 
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
      else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile`, // سيوجهه لملفه الشخصي ليغيرها هناك
        });
        if (error) throw error;
        toast.success("تم إرسال رابط استعادة كلمة المرور لبريدك 📧");
        setMode('signin');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] flex flex-col justify-center px-6 text-white font-sans py-12 relative overflow-hidden" dir="rtl">
      <div className="max-w-md mx-auto w-full bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative z-10">
        
        <div className="mb-10 text-center">
          <div className="inline-block p-4 bg-cyan-500 rounded-3xl mb-4 shadow-lg shadow-cyan-500/20"><Zap size={32} className="text-[#0a0f3c] fill-[#0a0f3c]" /></div>
          <h1 className="text-3xl font-[1000] italic uppercase leading-none">هايب PADEL</h1>
          <p className="text-gray-400 mt-3 text-[10px] font-black uppercase italic tracking-widest">
            {mode === 'reset' ? 'استعادة الوصول لحسابك' : mode === 'signup' ? 'سجل بياناتك وانضم للمجرة' : 'سجل دخولك يا بطل'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <input type="text" placeholder="الاسم المستعار" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <input type="tel" placeholder="رقم الجوال" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <input type="date" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all text-white" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
            </>
          )}

          <div className="relative">
            <Mail className="absolute right-4 top-4 text-gray-500" size={18} />
            <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 placeholder:text-gray-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {mode !== 'reset' && (
            <div className="relative">
              <Lock className="absolute right-4 top-4 text-gray-500" size={18} />
              <input type="password" placeholder="كلمة المرور" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 placeholder:text-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] text-sm uppercase shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <><span>{mode === 'signin' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء حساب' : 'إرسال رابط الاستعادة'}</span><LogIn size={20} /></>
            )}
          </button>
        </form>

        <div className="text-center mt-6 space-y-4">
          {mode === 'signin' && (
            <button onClick={() => setMode('reset')} className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mx-auto underline">نسيت كلمة المرور؟</button>
          )}
          <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic block mx-auto">
            {mode === 'signup' ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ سجل الآن'}
          </button>
          {mode === 'reset' && (
            <button onClick={() => setMode('signin')} className="text-[10px] font-black text-white uppercase underline">رجوع لتسجيل الدخول</button>
          )}
        </div>
      </div>
    </div> 
  );
}