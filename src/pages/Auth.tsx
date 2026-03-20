import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
// أضفنا Loader2 هنا في قائمة الاستيراد
import { Mail, Lock, Zap, User, ChevronLeft, Send, LogIn, CheckCircle2, ShieldCheck, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [birthDate, setBirthDate] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!birthDate) throw new Error("يرجى تحديد تاريخ الميلاد");
        
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              gender: gender,
              birth_date: birthDate,
            }
          }
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! افحص بريدك لتفعيله 🔥");
        setMode('signin');
      } 
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] flex flex-col justify-center px-6 text-white font-sans py-12 relative overflow-hidden" dir="rtl">
      {/* خلفية جمالية */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[300px] h-[300px] bg-pink-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-md mx-auto w-full bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative z-10">
        
        <div className="mb-10 text-center">
          <div className="inline-block p-4 bg-cyan-500 rounded-3xl mb-4 shadow-lg shadow-cyan-500/20">
            <Zap size={32} className="text-[#0a0f3c] fill-[#0a0f3c]" />
          </div>
          <h1 className="text-3xl font-[1000] italic tracking-tighter uppercase leading-none">هايب PADEL</h1>
          <p className="text-gray-400 mt-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">
            {mode === 'signup' ? 'سجل بياناتك وانضم للملعب' : 'سجل دخولك يا بطل'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="flex gap-3">
                <input type="text" placeholder="الاسم" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <input type="text" placeholder="العائلة" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>

              {/* اختيار الجنس */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender('ذكر')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] border transition-all ${gender === 'ذكر' ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  ذكر ♂
                </button>
                <button
                  type="button"
                  onClick={() => setGender('أنثى')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] border transition-all ${gender === 'أنثى' ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  أنثى ♀
                </button>
              </div>

              {/* تاريخ الميلاد */}
              <div className="relative">
                <Calendar className="absolute right-4 top-4 text-gray-500" size={16} />
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all text-white" 
                  value={birthDate} 
                  onChange={(e) => setBirthDate(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute right-4 top-4 text-gray-500" size={18} />
            <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-4 text-gray-500" size={18} />
            <input type="password" placeholder="كلمة المرور" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] text-sm uppercase shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>{mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</span>
                <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <button 
            type="button" 
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} 
            className="text-[10px] font-black text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] italic"
          >
            {mode === 'signup' ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ سجل الآن'}
          </button>
        </div>
      </div>
    </div>
  );
}