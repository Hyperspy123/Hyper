import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '../LLL'; // تأكد من مسار ملف السوبابيس
import { ChevronLeft, Zap, BellOff, Check, X, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب الإشعارات الخاصة بالمستخدم الحالي فقط
  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('faz3a_invites')
        .select(`
          id,
          status,
          created_at,
          sender:sender_id (
            first_name,
            last_name,
            matches_count
          )
        `)
        .eq('receiver_id', user.id) // 👈 أهم سطر: يجلب فقط ما يخص المستخدم الحالي
        .eq('status', 'pending')    // عرض الطلبات المعلقة فقط
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. دالة التعامل مع قبول أو رفض الطلب
  const handleAction = async (inviteId: string, newStatus: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('faz3a_invites')
      .update({ status: newStatus })
      .eq('id', inviteId);

    if (!error) {
      toast.success(newStatus === 'accepted' ? "تم قبول الفزعة! كفو 🔥" : "تم رفض الطلب");
      fetchNotifications(); // تحديث القائمة
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 relative overflow-hidden" dir="rtl">
      
      {/* الخلفية السينمائية (نفس ثيم الصفحة الرئيسية) */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05081d]/80 via-transparent to-[#05081d]" />
      </div>

      <Header />

      <div className="pt-28 max-w-lg mx-auto px-6 relative z-10">
        
        <div className="flex items-center gap-4 mb-10">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <div>
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">التنبيهات</h1>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Faz3a Alerts & Activity</p>
            </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-2xl">
                <div className="flex items-start gap-5">
                  <div className="p-4 rounded-[22px] bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20">
                    <Zap size={24} className="fill-[#0a0f3c]" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-[1000] text-lg italic tracking-tight uppercase">طلب فزعة جديد!</h4>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
                        <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 font-bold leading-relaxed mb-6">
                      اللاعب <span className="text-white">{n.sender?.first_name} {n.sender?.last_name}</span> يطلب انضمامك لمباراة قادمة. هل أنت جاهز؟
                    </p>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAction(n.id, 'accepted')}
                        className="flex-1 py-4 bg-cyan-500 text-[#0a0f3c] rounded-[22px] text-xs font-[1000] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/10 hover:bg-white"
                      >
                        <Check size={16} /> أبشر بالفزعة
                      </button>
                      <button 
                        onClick={() => handleAction(n.id, 'declined')}
                        className="p-4 bg-white/5 border border-white/10 rounded-[22px] text-gray-500 hover:text-red-400 hover:border-red-400/30 transition-all active:scale-95"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 backdrop-blur-md">
              <BellOff size={60} className="mx-auto mb-6 text-gray-700 animate-pulse" />
              <p className="font-[1000] uppercase tracking-[0.4em] text-[10px] text-gray-600">لا توجد تنبيهات حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}