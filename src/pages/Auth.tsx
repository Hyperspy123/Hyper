import { useState, useEffect, useRef } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, UserPlus, LogIn, Calendar, Loader2, Phone, ChevronLeft, ChevronRight, Activity, Hand, ShieldCheck, CheckCircle2, AlertTriangle, ScrollText } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup' | 'reset' | 'update_password';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // بيانات المستخدم
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [birthDate, setBirthDate] = useState('');
  const [playLevel, setPlayLevel] = useState('مبتدئ');
  const [preferredSide, setPreferredSide] = useState('كلاهما');

  // 🔥 حالات نافذة الشروط القانونية
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
        setPassword(''); 
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // دالة فحص التمرير لآخر الشروط
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!firstName || !lastName || !phone || !birthDate)) {
      toast.error("يرجى تعبئة جميع البيانات الشخصية");
      return;
    }
    setStep(2);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !agreedToTerms) {
      toast.error("يجب الموافقة على الشروط والأحكام أولاً 🛡️");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, password,
          options: { data: { first_name: firstName, phone, birth_date: birthDate, play_level: playLevel, preferred_side: preferredSide } }
        });
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('profiles').insert([{ 
            id: data.user.id, 
            first_name: firstName, 
            last_name: lastName,
            phone, 
            birth_date: birthDate, 
            gender,
            play_level: playLevel,
            preferred_side: preferredSide,
            current_rank: 'ROOKIE', 
            is_public: true 
          }]);
        }
        toast.success("تم إنشاء حسابك يا بطل! افحص بريدك للتفعيل 🔥");
        setMode('signin');
        setStep(1);
        setAgreedToTerms(false); // تصفير الموافقة
      } 
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
      else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, 
        });
        if (error) throw error;
        toast.success("تم إرسال رابط استعادة كلمة المرور لبريدك 📧");
        setMode('signin');
        setEmail('');
      }
      else if (mode === 'update_password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("تم تغيير كلمة المرور بنجاح! 🎊");
        setMode('signin');
        setPassword('');
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
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md mx-auto w-full bg-[#0a0f3c]/60 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* اللوجو والعنوان */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 bg-gradient-to-tr from-cyan-500 to-cyan-300 rounded-3xl mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Zap size={32} className="text-[#0a0f3c] fill-[#0a0f3c]" />
          </div>
          <h1 className="text-3xl font-[1000] italic uppercase leading-none tracking-tighter">هايب PADEL</h1>
          <p className="text-gray-400 mt-2 text-[10px] font-black uppercase italic tracking-[0.2em]">
            {mode === 'reset' ? 'استعادة الوصول لحسابك' : mode === 'update_password' ? 'تعيين كلمة مرور جديدة 🔐' : mode === 'signup' ? 'سجل بياناتك وانضم للملعب' : 'سجل دخولك يا بطل'}
          </p>
        </div>

        {/* مؤشر الخطوات */}
        {mode === 'signup' && (
          <div className="flex justify-center gap-2 mb-8">
            <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 1 ? 'bg-cyan-400' : 'bg-white/10'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 2 ? 'bg-cyan-400' : 'bg-white/10'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 3 ? 'bg-cyan-400' : 'bg-white/10'}`} />
          </div>
        )}

        <form onSubmit={(e) => { if(mode !== 'signup' || step === 3) handleAuth(e); else e.preventDefault(); }} className="space-y-4">
          
          {(mode === 'signin' || mode === 'reset') && (
            <div className="relative animate-in fade-in duration-300">
              <Mail className="absolute right-4 top-4 text-gray-500" size={18} />
              <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}

          {mode === 'signin' && (
            <div className="relative animate-in fade-in duration-300">
              <Lock className="absolute right-4 top-4 text-gray-500" size={18} />
              <input type="password" placeholder="كلمة المرور" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}

          {mode === 'update_password' && (
            <div className="relative animate-in zoom-in duration-300">
              <Lock className="absolute right-4 top-4 text-cyan-400" size={18} />
              <input type="password" placeholder="اكتب كلمة المرور الجديدة" className="w-full bg-[#0a0f3c] border border-cyan-500 p-4 pr-12 rounded-2xl text-xs font-bold outline-none ring-1 ring-cyan-500/50 transition-all placeholder:text-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}

          {/* الخطوة 1 و 2 (بدون تعديل جوهري، مخفية للاختصار في الشرح لكنها كاملة) */}
          {mode === 'signup' && step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="flex gap-3">
                <input type="text" placeholder="الاسم الأول" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <input type="text" placeholder="اسم العائلة" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="relative">
                <Phone className="absolute right-4 top-4 text-gray-500" size={18} />
                <input type="tel" placeholder="رقم الجوال (05xxxxxxxx)" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setGender('ذكر')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] border transition-all ${gender === 'ذكر' ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c] shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>ذكر ♂</button>
                <button type="button" onClick={() => setGender('أنثى')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] border transition-all ${gender === 'أنثى' ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>أنثى ♀</button>
              </div>
              <div className="space-y-2 text-right">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">تاريخ الميلاد</label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-4 text-gray-500 pointer-events-none" size={18} />
                  <input type="date" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
                </div>
              </div>
              <button type="button" onClick={handleNextStep} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] text-sm uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-6">التالي <ChevronLeft size={20} /></button>
            </div>
          )}

          {mode === 'signup' && step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="space-y-3 text-right">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14} className="text-cyan-400"/> مستواك في البادل</label>
                <div className="grid grid-cols-2 gap-2">
                  {['مبتدئ', 'متوسط', 'متقدم', 'محترف'].map((level) => (
                    <button key={level} type="button" onClick={() => setPlayLevel(level)} className={`py-3 rounded-xl font-bold text-xs transition-all border ${playLevel === level ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}>{level}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 text-right">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Hand size={14} className="text-purple-400"/> الجهة المفضلة للعب</label>
                <div className="grid grid-cols-3 gap-2">
                  {['يمين', 'كلاهما', 'يسار'].map((side) => (
                    <button key={side} type="button" onClick={() => setPreferredSide(side)} className={`py-3 rounded-xl font-bold text-xs transition-all border ${preferredSide === side ? 'bg-purple-500/10 border-purple-400 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}>{side}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="p-5 bg-white/5 text-white rounded-[24px] font-[1000] border border-white/10 active:scale-95 transition-all"><ChevronRight size={20} /></button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] text-sm uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">التالي <ChevronLeft size={20} /></button>
              </div>
            </div>
          )}

          {/* 🔥 الخطوة 3: الإيميل والباسورد وإجبار اللاعب على قراءة الشروط 🔥 */}
          {mode === 'signup' && step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="relative">
                <Mail className="absolute right-4 top-4 text-gray-500" size={18} />
                <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 text-gray-500" size={18} />
                <input type="password" placeholder="كلمة المرور (6 أحرف أو أكثر)" className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}/>
              </div>

              {/* زر فتح الشروط القانونية */}
              <div className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${agreedToTerms ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-black uppercase flex items-center gap-1 ${agreedToTerms ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {agreedToTerms ? <><CheckCircle2 size={12}/> تمت الموافقة</> : <><AlertTriangle size={12}/> إلزامي لإتمام التسجيل</>}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">يجب قراءة الشروط بالكامل</span>
                </div>
                <button type="button" onClick={() => setIsTermsModalOpen(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${agreedToTerms ? 'bg-emerald-500 text-[#0a0f3c]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {agreedToTerms ? 'مراجعة الشروط' : 'قراءة الشروط'} <ScrollText size={14} />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(2)} className="p-5 bg-white/5 text-white rounded-[24px] font-[1000] border border-white/10 active:scale-95 transition-all"><ChevronRight size={20} /></button>
                <button type="submit" disabled={loading || !agreedToTerms} className={`flex-1 py-5 rounded-[24px] font-[1000] text-sm uppercase flex items-center justify-center gap-2 transition-all ${agreedToTerms ? 'bg-cyan-500 text-[#0a0f3c] shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95' : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> إنهاء التسجيل</>}
                </button>
              </div>
            </div>
          )}

          {mode !== 'signup' && (
            <button type="submit" disabled={loading} className={`w-full py-5 rounded-[24px] font-[1000] text-sm uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 ${mode === 'update_password' ? 'bg-purple-500 text-white' : 'bg-cyan-500 text-[#0a0f3c]'}`}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{mode === 'signin' ? 'تسجيل الدخول' : mode === 'reset' ? 'إرسال رابط الاستعادة' : 'حفظ كلمة المرور'}</span>
                  {mode === 'signin' && <LogIn size={20} />}
                </>
              )}
            </button>
          )}
        </form>

        <div className="text-center mt-8 space-y-4">
          {mode === 'signin' && (
            <button onClick={() => setMode('reset')} className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mx-auto underline">نسيت كلمة المرور؟</button>
          )}
          {(mode === 'signin' || mode === 'signup') && (
             <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setStep(1); }} className="text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em] italic block mx-auto bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
               {mode === 'signup' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'لاعب جديد؟ أنشئ حسابك الآن'}
             </button>
          )}
          {(mode === 'reset' || mode === 'update_password') && (
            <button onClick={() => setMode('signin')} className="text-[10px] font-black text-white uppercase underline">الرجوع لتسجيل الدخول</button>
          )}
        </div>
      </div>

      {/* 🔥 النافذة المنبثقة للشروط القانونية (Modal) 🔥 */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05081d]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0f3c] border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] rounded-[32px] w-full max-w-md h-[80vh] flex flex-col overflow-hidden relative">
            
            <div className="p-6 border-b border-white/10 text-center bg-[#0a0f3c] relative z-10 shrink-0">
              <h2 className="text-xl font-[1000] text-cyan-400 italic uppercase flex justify-center items-center gap-2">
                <ShieldCheck /> سياسة الخصوصية والشروط
              </h2>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                مرر للأسفل لقراءة الشروط بالكامل والموافقة
              </p>
            </div>

            <div 
              ref={scrollRef} 
              onScroll={handleScroll} 
              className="p-6 overflow-y-auto space-y-6 text-xs leading-loose text-gray-300 font-medium pb-10"
            >
              <h3 className="font-black text-white text-sm">1. جمع البيانات الشخصية</h3>
              <p>نحن نجمع بياناتك الأساسية مثل (الاسم، رقم الجوال، وتفاصيل الحجوزات) لغرض تنظيم وتأكيد عمليات حجز الملاعب، وتسهيل نظام التحديات والمجتمع الرياضي داخل التطبيق. نتعهد بحماية هذه البيانات وعدم مشاركتها مع أي جهة ثالثة خارج نطاق تشغيل التطبيق.</p>

              <h3 className="font-black text-white text-sm">2. سياسة الدفع والمحفظة</h3>
              <ul className="list-disc pr-5 space-y-2">
                <li>يتم معالجة جميع عمليات الدفع عبر بوابات دفع آمنة ومشفرة بالكامل.</li>
                <li>لا يتم تخزين أي بيانات لبطاقاتك الائتمانية داخل قواعد البيانات الخاصة بنا.</li>
                <li>المبالغ المستردة يتم إعادتها تلقائياً إلى "محفظتك الرقمية" داخل التطبيق لاستخدامها في الحجوزات القادمة.</li>
              </ul>

              <h3 className="font-black text-red-400 text-sm flex items-center gap-2"><AlertTriangle size={16}/> 3. شروط إلغاء الحجوزات والاسترجاع</h3>
              <ul className="list-disc pr-5 space-y-2">
                <li>يحق للاعب إلغاء الحجز واسترداد كامل القيمة إلى محفظته في حال كان الوقت المتبقي على موعد المباراة <strong>أكثر من 5 ساعات</strong>.</li>
                <li className="text-red-300 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  في حال كان الوقت المتبقي على موعد المباراة (5 ساعات أو أقل)، فإن النظام لن يسمح بإلغاء الحجز نهائياً، ولا يحق للاعب المطالبة باسترداد القيمة ماليًا أو عبر المحفظة؛ وذلك لحفظ حقوق أصحاب الملاعب وضمان عدم ضياع الفترة المحجوزة.
                </li>
              </ul>
              
              <div className="h-4"></div> {/* مساحة إضافية للتمرير */}
            </div>

            <div className="p-6 border-t border-white/10 bg-[#05081d] shrink-0">
              <button 
                type="button" 
                disabled={!hasScrolledToBottom && !agreedToTerms} 
                onClick={() => { setAgreedToTerms(true); setIsTermsModalOpen(false); }}
                className={`w-full py-5 rounded-[24px] font-[1000] text-sm uppercase flex items-center justify-center gap-2 transition-all ${hasScrolledToBottom || agreedToTerms ? 'bg-emerald-500 text-[#0a0f3c] shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95' : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}
              >
                {hasScrolledToBottom || agreedToTerms ? <><CheckCircle2 size={20} /> أقر وأوافق على الشروط بالكامل</> : 'يرجى قراءة الشروط للنهاية'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}