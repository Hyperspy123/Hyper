import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, User, Phone, ChevronLeft, Send, LogIn, CheckCircle2, ShieldCheck, Target } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate'); // افتراضي: متوسط
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  const isRecoveryMode = window.location.hash.includes('type=recovery');

  useEffect(() => {
    if (isRecoveryMode) {
      setMode('reset');
      toast.success("أهلاً بك مجدداً! أدخل كلمة المرور الجديدة الآن", {
        icon: <ShieldCheck className="text-cyan-400" size={18} />
      });
    }
  }, [isRecoveryMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // تأكد من إرسال كل البيانات في الـ options لتفعيل الـ Trigger في SQL
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone_number: phoneNumber,
              skill_level: skillLevel, // سيرسل للقاعدة تلقائياً
            }
          }
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! افحص بريدك الإلكتروني لتأكيده");
        setMode('signin');
      } 
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
      else if (mode === 'reset') {
        if (isRecoveryMode) {
          if (password !== confirmPassword) throw new Error("كلمات المرور غير متطابقة");
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
          toast.success("تم التحديث بنجاح! يمكنك الدخول الآن");
          window.location.hash = ""; 
          setMode('signin');
        } else {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth`,
          });
          if (error) throw error;
          toast.success("تم إرسال الرابط لبريدك الإلكتروني");
          setMode('signin');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center px-6 text-white font-sans py-12" dir="rtl">
      <div className="max-w-md mx-auto w-full bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
        
        <button 
          type="button"
          onClick={() => {
            if (isRecoveryMode || mode === 'reset' || mode === 'signup') {
              setMode('signin');
              window.location.hash = "";
            } else {
              navigate('/');
            }
          }} 
          className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all z-20"
        >
          <ChevronLeft size={20} className="rotate-180" />
        </button>

        <div className="mb-10 text-center pt-4">
          <div className="inline-block p-4 bg-cyan-500 rounded-3xl mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Zap size={32} className="text-[#0a0f3c] fill-[#0a0f3c]" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">هايب PADEL</h1>
          <p className="text-gray-400 mt-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            {mode === 'signup' ? 'إنشاء حساب لاعب جديد' : mode === 'signin' ? 'أهلاً بك يا بطل' : 'استعادة الحساب'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="flex gap-3">
                <div className="relative w-1/2">
                  <User className="absolute right-4 top-4 text-gray-500" size={16} />
                  <input type="text" placeholder="الاسم" className="w-full bg-black/20 border border-white/10 p-4 pr-11 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="relative w-1/2">
                  <User className="absolute right-4 top-4 text-gray-500" size={16} />
                  <input type="text" placeholder="العائلة" className="w-full bg-black/20 border border-white/10 p-4 pr-11 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="relative">
                <Phone className="absolute right-4 top-4 text-gray-500" size={18} />
                <input type="tel" placeholder="رقم الجوال" className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </div>
              
              {/* اختيار المستوى المبدئي عند التسجيل */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase px-2 tracking-widest flex items-center gap-1">
                   <Target size={12} className="text-cyan-400" /> مستوى اللعب
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'pro'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSkillLevel(lvl)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                        skillLevel === lvl ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'
                      }`}
                    >
                      {lvl === 'beginner' ? 'مبتدئ' : lvl === 'intermediate' ? 'متوسط' : 'محترف'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!isRecoveryMode && (
            <div className="relative">
              <Mail className="absolute right-4 top-4 text-gray-500" size={18} />
              <input type="email" autoComplete="username" placeholder="البريد الإلكتروني" className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}

          {(mode !== 'reset' || isRecoveryMode) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase mr-2">كلمة المرور</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => setMode('reset')} className="text-[10px] font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-tighter">نسيت كلمة المرور؟</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-4 top-4 text-gray-500" size={18} />
                  <input type="password" autoComplete={mode === 'signup' ? "new-password" : "current-password"} placeholder="••••••••" className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              {isRecoveryMode && (
                <div className="relative mt-4">
                  <ShieldCheck className="absolute right-4 top-4 text-gray-500" size={18} />
                  <input type="password" placeholder="تأكيد كلمة المرور" className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6">
            {loading ? <div className="w-6 h-6 border-2 border-[#0a0f3c] border-t-transparent animate-spin rounded-full" /> : (
              <>
                <span>{mode === 'signin' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء حساب' : isRecoveryMode ? 'تحديث كلمة المرور' : 'إرسال الرابط'}</span>
                {isRecoveryMode ? <CheckCircle2 size={20} /> : mode === 'reset' ? <Send size={20} /> : <LogIn size={20} />}
              </>
            )}
          </button>
        </form>

        {!isRecoveryMode && (
          <div className="text-center mt-8">
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-[10px] font-black text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">
              {mode === 'signup' ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ سجل الآن'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}