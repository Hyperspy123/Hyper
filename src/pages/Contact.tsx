import { useState } from 'react';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { Mail, Send, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // محاكاة إرسال الإيميل
    setTimeout(() => {
      toast.success("تم إرسال رسالتك لفريق الدعم بنجاح! سيصلك الرد على إيميلك المسجل.");
      setFormData({ subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8 text-right">
        {/* العنوان والرجوع */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
            <ChevronRight size={20} />
          </button>
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">الدعم الفني</h1>
        </div>

        {/* بطاقات معلومات الدعم (إيميل فقط) */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-6 rounded-[35px] border border-white/5 flex items-center gap-5">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">راسلنا مباشرة</p>
              <p className="font-bold text-sm select-all">Support@HypeApp.com</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-3">
                <ShieldCheck size={18} className="text-purple-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">دعم آمن 100%</span>
             </div>
             <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-3">
                <MessageCircle size={18} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">رد خلال 24 ساعة</span>
             </div>
          </div>
        </div>

        {/* نموذج المراسلة */}
        <form onSubmit={handleSubmit} className="bg-[#0a0f3c] p-8 rounded-[40px] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
          
          <div className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mr-2">موضوع الرسالة</label>
              <input 
                required 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500 focus:bg-white/10 transition-all outline-none font-bold text-sm" 
                placeholder="مثلاً: مشكلة في الحجز..." 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mr-2">رسالتك بالتفصيل</label>
              <textarea 
                required 
                rows={5} 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500 focus:bg-white/10 transition-all outline-none font-bold text-sm resize-none" 
                placeholder="اكتب هنا ما يواجهك..." 
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-cyan-500 text-[#0a0f3c] py-5 rounded-[22px] font-[1000] italic uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">جاري الإرسال...</span>
                </div>
              ) : (
                <>
                  إرسال البريد
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
        
        <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
          HYPE Sports Platform - Support Hub
        </p>
      </main>
    </div>
  );
}