import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Headphones, Mail, Loader2, MessageSquareText, HelpCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

export default function Support() {
  const navigate = useNavigate();
  // 🔥 جلبنا دالة t لترجمة الكلمات الرئيسية
  const { t, lang, dir } = useLanguage();
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(lang === 'ar' ? 'الرجاء كتابة رسالة أولاً' : 'Please write a message first');
      return;
    }

    setIsSubmitting(true);

    // ⏳ محاكاة عملية إرسال للإيميل
    setTimeout(() => {
      setIsSubmitting(false);
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
              {/* 🔥 ترجمة العنوان */}
              {t('support_title' as any) || (lang === 'ar' ? 'الدعم الفني' : 'SUPPORT')}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {lang === 'ar' ? 'نحن هنا لمساعدتك' : 'We are here to help'}
            </p>
          </div>
        </div>

        {/* 🔥 الخيارات السريعة المترجمة (الأسئلة الشائعة والمحادثة المباشرة) */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => toast.info(lang === 'ar' ? 'المحادثة المباشرة ستتوفر قريباً 💬' : 'Live Chat coming soon 💬')}
            className="bg-[#0a0f3c] p-5 rounded-3xl border border-white/10 flex flex-col items-center gap-3 hover:border-cyan-500/50 transition-all shadow-lg group"
          >
            <div className="p-3 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500/20 transition-all">
              <MessageCircle className="text-cyan-400" size={28} />
            </div>
            <span className="text-sm font-[1000] uppercase tracking-wider text-center leading-tight">
              {t('support_chat' as any) || (lang === 'ar' ? 'محادثة مباشرة' : 'Live Chat')}
            </span>
          </button>

          <button 
            onClick={() => toast.info(lang === 'ar' ? 'صفحة الأسئلة الشائعة ستتوفر قريباً ❓' : 'FAQs coming soon ❓')}
            className="bg-[#0a0f3c] p-5 rounded-3xl border border-white/10 flex flex-col items-center gap-3 hover:border-purple-500/50 transition-all shadow-lg group"
          >
            <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-all">
              <HelpCircle className="text-purple-400" size={28} />
            </div>
            <span className="text-sm font-[1000] uppercase tracking-wider text-center leading-tight">
              {t('support_faq' as any) || (lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQs')}
            </span>
          </button>
        </div>

        {/* فاصل مرئي لراسلنا عبر البريد */}
        <div className="flex items-center gap-4 my-6 opacity-70">
          <div className="h-px flex-1 bg-white/10"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('support_email' as any) || (lang === 'ar' ? 'راسلنا عبر البريد' : 'Email Us')}
          </span>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        {/* بطاقة الإيميل الوهمي */}
        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-[24px] p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-[#0a0f3c] rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
            <Mail className="text-cyan-400" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 mb-1">
              {lang === 'ar' ? 'الإيميل المخصص للشكاوى:' : 'Dedicated Support Email:'}
            </p>
            <p className="text-lg font-black text-white tracking-wider">
              support@hype.com
            </p>
          </div>
        </div>

        {/* نموذج الإرسال */}
        <form onSubmit={handleSubmit} className="bg-[#0a0f3c] border border-white/10 rounded-[30px] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-50" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <MessageSquareText size={16} className="text-purple-400" />
                {lang === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب شكواك أو استفسارك هنا بالتفصيل...' : 'Write your complaint or inquiry here in detail...'}
                rows={6}
                className="w-full bg-[#05081d] border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-[1000] text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  {lang === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                </>
              )}
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}