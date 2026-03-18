import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { ChevronLeft, Zap, Calendar, BellOff, Check, X } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();

  // Mock Notifications
  const notifications = [
    { 
      id: 1, 
      title: "دعوة فزعة جديدة!", 
      desc: "فهد م. (كينج 🦁) يطلب انضمامك لمباراة في ملاعب Padel X الساعة 10م.", 
      type: "faz3a", 
      time: "منذ دقيقتين" 
    },
    { 
      id: 2, 
      title: "تم تأكيد الحجز", 
      desc: "حجزك في ملاعب اليرموك غداً تم تأكيده بنجاح.", 
      type: "booking", 
      time: "منذ ساعة" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir="rtl">
      <Header />
      <div className="pt-24 max-w-lg mx-auto px-6">
        
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">الإشعارات <span className="text-cyan-400">Alerts</span></h1>
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="p-6 rounded-[35px] bg-white/5 border border-white/10 flex items-start gap-4 backdrop-blur-md relative overflow-hidden">
                <div className={`p-3 rounded-2xl ${n.type === 'faz3a' ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-green-500/10 text-green-400'}`}>
                  {n.type === 'faz3a' ? <Zap size={22} /> : <Calendar size={22} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-sm uppercase italic tracking-tight">{n.title}</h4>
                    <span className="text-[9px] text-gray-600 font-bold">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-bold leading-relaxed">{n.desc}</p>
                  
                  {n.type === 'faz3a' && (
                    <div className="flex gap-2 mt-5">
                      <button className="flex-1 py-3 bg-cyan-500 text-[#0a0f3c] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all">
                        <Check size={14} /> قبول
                      </button>
                      <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all">
                        <X size={14} /> رفض
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-20">
              <BellOff size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-[0.3em] text-xs">لا توجد تنبيهات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}