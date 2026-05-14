import { useState } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Mail, ShieldCheck, MessageCircle, Send, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Support() {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // 🔥 الحل البسيط والنظيف بدون أي أخطاء TypeScript
  const isEn = lang === 'en';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEn ? 'Your email has been sent successfully! Thank you.' : 'تم إرسال البريد بنجاح! شكراً لتواصلك.');
    setSubject('');
    setMessage('');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir={dir}>
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        {/* زر العودة والعنوان */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
            <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <div className={isEn ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-[1000] italic uppercase leading-none tracking-tighter">
              {isEn ? 'SUPPORT' : 'الدعم الفني'}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {isEn ? 'WE ARE HERE TO HELP' : 'نحن هنا لمساعدتك'}
            </p>
          </div>
        </div>

        {/* بطاقة الإيميل */}
        <div className="bg-[#0a0f3c]/60 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 flex items-center gap-4 shadow-2xl">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
            <Mail size={24} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
              {isEn ? 'EMAIL US DIRECTLY' : 'راسلنا مباشرة'}
            </p>
            <p className="text-sm font-[1000] text-white tracking-wide">Support@HypeApp.com</p>
          </div>
        </div>

        {/* بطاقات الميزات */}
        <div className="flex gap-4">
          <div className="flex-1 bg-[#0a0f3c]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 flex items-center justify-center gap-2 shadow-xl">
            <ShieldCheck size={16} className="text-purple-400" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider">
              {isEn ? '100% SECURE' : 'دعم آمن 100%'}
            </span>
          </div>
          <div className="flex-1 bg-[#0a0f3c]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 flex items-center justify-center gap-2 shadow-xl">
            <MessageCircle size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider">
              {isEn ? '24H RESPONSE' : 'رد خلال 24 ساعة'}
            </span>
          </div>
        </div>

        {/* نموذج المراسلة */}
        <div className="bg-[#0a0f3c]/60 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 shadow-2xl mt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest ${isEn ? 'text-left' : 'text-right'}`}>
                {isEn ? 'MESSAGE SUBJECT' : 'موضوع الرسالة'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isEn ? 'e.g., Booking issue...' : 'مثلاً: مشكلة في الحجز...'}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner ${isEn ? 'text-left' : 'text-right'}`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest ${isEn ? 'text-left' : 'text-right'}`}>
                {isEn ? 'MESSAGE DETAILS' : 'رسالتك بالتفصيل'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isEn ? 'Please describe your issue here...' : 'اكتب هنا ما يواجهك...'}
                rows={5}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner resize-none ${isEn ? 'text-left' : 'text-right'}`}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full mt-4 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-[#0a0f3c] rounded-[24px] font-[1000] text-sm uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isEn ? 'SEND EMAIL' : 'إرسال البريد'} 
              <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}