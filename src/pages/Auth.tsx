import { useState } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, User, Phone, ChevronLeft, Send, LogIn } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone_number: phoneNumber,
            }
          }
        });
        if (error) throw error;
        toast.success("افحص بريدك الإلكتروني لتأكيد الحساب!");
      } 
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
      else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("تم إرسال رابط استعادة كلمة المرور لبريدك!");
        setMode('signin');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center px-6 text-white font-sans" dir="rtl">
      
      <div className="max-w-md mx-auto w-full bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Back Button */}
        <button 
          onClick={() => mode === 'reset' ? setMode('signin') : navigate('/')} 
          className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all"
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
              <div className="flex gap-4">
                <div className="relative w-1/2">
                  <User className="absolute right-4 top-4 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="الاسم"
                    className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="relative w-1/2">
                  <User className="absolute right-4 top-4 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="العائلة"
                    className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Phone className="absolute right-4 top-4 text-gray-500" size={18} />
                <input 
                  type="tel" 
                  placeholder="رقم الجوال"
                  className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute right-4 top-4 text-gray-500" size={18} />
            <input 
              type="email" 
              placeholder="البريد الإلكتروني"
              className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-500 uppercase mr-2">كلمة المرور</label>
                
                {/* Forgot Password logic - Only in signin mode */}
                {mode === 'signin' && (
                  <button 
                    type="button" 
                    onClick={() => setMode('reset')}
                    className="text-[10px] font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-tighter"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 text-gray-500" size={18} />
                <input 
                  type="password" 
                  placeholder="كلمة المرور"
                  className="w-full bg-black/20 border border-white/10 p-4 pr-12 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <div className="w-6 h-6 border-2 border-[#0a0f3c] border-t-transparent animate-spin rounded-full" /> : (
              <>
                {mode === 'signin' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء حساب' : 'إرسال الرابط'}
                {mode === 'reset' ? <Send size={20} /> : <LogIn size={20} />}
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <button 
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-xs font-black text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest"
          >
            {mode === 'signup' ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ سجل الآن'}
          </button>
        </div>
      </div>
    </div>
  );
}