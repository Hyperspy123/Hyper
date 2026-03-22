import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '../LLL';
import { ChevronLeft, Zap, BellOff, Check, X, Loader2, Clock, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. جلب دعوات الفزعة (Invites)
      const { data: invites } = await supabase
        .from('faz3a_invites')
        .select('*, sender:profiles(first_name, last_name)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      // 2. 🔥 جلب إشعارات النظام (تحويل الحجز، إلخ) من جدول notifications
      const { data: systemNotifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // 3. دمج وترتيب التنبيهات من الأحدث للأقدم
      const allNotifs = [
        ...(invites || []).map(i => ({ ...i, category: 'invite' })),
        ...(systemNotifs || []).map(s => ({ ...s, category: 'system' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifs);
    } catch (error: any) {
      console.error("Fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNotifications();

    // استماع للتغييرات في الجدولين لضمان التحديث اللحظي
    const channel = supabase
      .channel('notif-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchAllNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_invites' }, () => fetchAllNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAllNotifications]);

  const handleAction = async (inviteId: string, newStatus: 'accepted' | 'declined') => {
    try {
      await supabase.from('faz3a_invites').update({ status: newStatus }).eq('id', inviteId);
      toast.success(newStatus === 'accepted' ? "أبشر بالفزعة! 🔥" : "تم الرفض");
      setNotifications(prev => prev.filter(n => n.id !== inviteId));
    } catch (error) { toast.error("فشل التحديث"); }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    // 🌌 جعل الخلفية شفافة لتناغم المجرة
    <div className="min-h-screen bg-transparent text-white pb-32 relative overflow-x-hidden text-right" dir="rtl">
      <Header />

      <main className="pt-28 max-w-lg mx-auto px-6 relative z-10">
        <div className="flex items-center gap-4 mb-10">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 backdrop-blur-md">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">التنبيهات</h1>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="p-7 rounded-[35px] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl transition-all active:scale-[0.98]">
                
                {/* حالة 1: إشعار تحويل الحجز (النظام) */}
                {n.category === 'system' ? (
                  <div className="flex items-start gap-5">
                    <div className="p-4 rounded-2xl bg-green-500/20 text-green-400 border border-green-500/20">
                      <CalendarCheck size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-lg italic text-green-400 uppercase tracking-tighter">{n.title}</h4>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">{new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-gray-300 font-bold mb-4">{n.message}</p>
                      <button onClick={() => markAsRead(n.id)} className="text-[10px] font-black text-cyan-400 uppercase tracking-widest opacity-60 hover:opacity-100">فهمت</button>
                    </div>
                  </div>
                ) : (
                  /* حالة 2: طلب فزعة (دعوة من لاعب) */
                  <div className="flex items-start gap-5">
                    <div className="p-4 rounded-2xl bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20">
                      <Zap size={24} className="fill-[#0a0f3c]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-lg italic text-white uppercase tracking-tighter">طلب فزعة جديد!</h4>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">{new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-gray-400 font-bold mb-5 leading-snug">
                         اللاعب <span className="text-cyan-400">{n.sender?.first_name}</span> يبيك فزعة معه في مباراة بادل.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(n.id, 'accepted')} className="flex-1 py-3.5 bg-cyan-500 text-[#0a0f3c] rounded-xl text-[10px] font-[1000] uppercase shadow-lg active:scale-95 transition-all">أبشر بالفزعة</button>
                        <button onClick={() => handleAction(n.id, 'declined')} className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 active:scale-95"><X size={18} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 opacity-30">
              <BellOff size={60} className="mx-auto mb-6 text-gray-800" />
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-600 italic">لا توجد تنبيهات جديدة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}