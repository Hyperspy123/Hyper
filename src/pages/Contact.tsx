import { useState } from 'react';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare, Phone, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("تم إرسال رسالتك بنجاح! سيرد عليك فريق HYPE قريباً.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400">
            <ChevronRight size={20} />
          </button>
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">الدعم الفني</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-6 rounded-[30px] border border-white/10 space-y-2 text-center">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 mb-2">
              <Phone size={20} />
            </div>
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">اتصال مباشر</p>
            <p className="font-bold text-xs leading-none">96650000000+</p>
          </div>
          <div className="bg-white/5 p-6 rounded-[30px] border border-white/10 space-y-2 text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto text-purple-400 mb-2">
              <Clock size={20} />
            </div>
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">وقت الاستجابة</p>
            <p className="font-bold text-xs leading-none">خلال 24 ساعة</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0f3c] p-8 rounded-[40px] border border-white/10 space-y-6 relative overflow-hidden">
          <div className="space-y-4 relative z-10 text-right">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mr-2">موضوع الرسالة</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500 focus:bg-white/10 transition-all outline-none font-bold text-sm" placeholder="كيف يمكننا مساعدتك؟" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mr-2">التفاصيل</label>
              <textarea required rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-cyan-500 focus:bg-white/10 transition-all outline-none font-bold text-sm resize-none" placeholder="اشرح لنا المشكلة بالتفصيل..." />
            </div>

            <button disabled={loading} className="w-full bg-cyan-500 text-[#0a0f3c] py-5 rounded-2xl font-[1000] italic uppercase flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50 transition-all">
              {loading ? "جاري الإرسال..." : "إرسال الطلب"}
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}