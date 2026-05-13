import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Headphones, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

export default function Support() {
  const navigate = useNavigate();
  const { t, lang, dir } = useLanguage();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error(lang === 'ar' ? 'الرجاء كتابة موضوع الرسالة' : 'Please write the message subject');
      return;
    }
    if (!message.trim()) {
      toast.error(lang === 'ar' ? 'الرجاء كتابة تفاصيل رسالتك' : 'Please write your message details');
      return;
    }

    setIsSubmitting(true);

    // ⏳ محاكاة عملية إرسال
    setTimeout(() => {
      setIsSubmitting(false);
      setSubject('');
      setMessage('');
      toast.success(
        lang === 'ar' 
          ? 'تم استلام رسالتك! سنتواصل معك قريباً 🎧' 
          : 'Message received! We will contact you soon 🎧'
      );
      setTimeout(() => navigate('/'), 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir={dir}>
      <main className="p-6 max-w-md mx-auto pt-12 space-y-8">
        
        {/* الهيدر وزر العودة */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 hover:bg-white/10 active:scale-90 transition-all shadow-xl">
            <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <div className={dir === 'ltr' ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-[1000] italic uppercase leading-none tracking-tighter flex items-center gap-2">
              <Headphones className="text-purple-400" size={28} />
              {t('support_title' as any) || (lang === 'ar' ? 'الدعم الفني' : 'SUPPORT')}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {lang === 'ar' ? 'نحن هنا لمساعدتك' : 'We are here to help'}
            </p>
          </div>
        </div>

        {/* 🛡️ الشارات العلوية (مطابقة للتصميم بالصورة) */}
        <div className="flex gap-4">
          <div className="flex-1 bg-[#131b4d]/50 border border-white/5 rounded-full py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg">
            <span className="text-xs font-bold text-gray-300">
              {lang === 'ar' ? 'رد خلال 24 ساعة' : 'Reply in 24 hrs'}
            </span>
            <MessageCircle size={16} className="text-cyan-400" />
          </div>
          <div className="flex-1 bg-[#131b4d]/50 border border-white/5 rounded-full py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg">
            <span className="text-xs font-bold text-gray-300">
              {lang === 'ar' ? 'دعم آمن 100%' : '100% Secure'}
            </span>
            <ShieldCheck size={16} className="text-purple-400" />
          </div>
        </div>

        {/* 📝 نموذج المراسلة (مطابق للتصميم بالصورة) */}
        <form onSubmit={handleSubmit} className="bg-[#0a0f3c] border border-white/5 rounded-[40px] p-6 shadow-2xl relative">
          
          <div className="space-y-6 relative z-10">
            
            {/* حقل موضوع الرسالة */}
            <div className={`space-y-3 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
              <label className="text-sm font-bold text-gray-400 px-2">
                {lang === 'ar' ? 'موضوع الرسالة' : 'Message Subject'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={lang === 'ar' ? 'مثلاً: مشكلة في الحجز...' : 'e.g., Booking issue...'}
                className="w-full bg-transparent border border-cyan-500 rounded-full py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
              />
            </div>

            {/* حقل رسالتك بالتفصيل */}
            <div className={`space-y-3 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
              <label className="text-sm font-bold text-gray-400 px-2">
                {lang === 'ar' ? 'رسالتك بالتفصيل' : 'Message Details'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب هنا ما يواجهك...' : 'Write your issue here...'}
                rows={5}
                className="w-full bg-transparent border border-white/10 rounded-[28px] py-4 px-6 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-medium"
              />
            </div>

            {/* زر إرسال البريد */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 bg-cyan-500 hover:bg-cyan-400 text-[#05081d] rounded-full font-[1000] text-lg transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-[#05081d]" size={24} />
              ) : (
                <>
                  <Send size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  {lang === 'ar' ? 'إرسال البريد' : 'Send Email'}
                </>
              )}
            </button>
            
          </div>
        </form>

      </main>
    </div>
  );
}