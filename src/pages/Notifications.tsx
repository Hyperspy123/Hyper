import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '../LLL';
import { ChevronLeft, Zap, BellOff, Check, X, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        return;
      }

      console.log("Fetching notifications for user ID:", user.id);

      // تعديل الاستعلام ليكون أكثر دقة في جلب بيانات المرسل
      const { data, error } = await supabase
        .from('faz3a_invites')
        .select(`
          id,
          status,
          created_at,
          sender:profiles!sender_id (
            first_name,
            last_name
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error.message);
        throw error;
      }

      console.log("Notifications received:", data);
      setNotifications(data || []);
    } catch (error: any) {
      toast.error("فشل في تحديث التنبيهات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // الاستماع الفوري للتغييرات
    const channel = supabase
      .channel('realtime-invites')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faz3a_invites' },
        (payload) => {
          console.log("Realtime update received!", payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const handleAction = async (inviteId: string, newStatus: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('faz3a_invites')
        .update({ status: newStatus })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success(newStatus === 'accepted' ? "كفو! تم قبول الفزعة 🔥" : "تم الرفض");
      setNotifications(prev => prev.filter(n => n.id !== inviteId));
    } catch (error: any) {
      toast.error("عذراً، تعذر تحديث الحالة");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 relative overflow-hidden" dir="rtl">
      
      {/* الديكور الخلفي */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <Header />

      <div className="pt-28 max-w-lg mx-auto px-6 relative z-10">
        
        <div className="flex items-center gap-4 mb-10">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <div>
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">التنبيهات</h1>
            </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-cyan-400 mb-4" size={32} />
              <p className="text-[10px] font-black text-gray-500 uppercase">جاري التزامن...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl relative group hover:border-cyan-500/30 transition-all">
                <div className="flex items-start gap-5">
                  <div className="p-4 rounded-[22px] bg-cyan-500 text-[#0a0f3c]">
                    <Zap size={24} className="fill-[#0a0f3c]" />
                  </div>
                  
                  <div className="flex-1 text-right">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-[1000] text-lg italic tracking-tight uppercase">طلب فزعة!</h4>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
                        <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 font-bold leading-relaxed mb-6">
                      اللاعب <span className="text-cyan-400">
                        {n.sender?.first_name || 'لاعب'} {n.sender?.last_name || ''}
                      </span> يبيك فزعة معه بمباراة. وش رايك؟
                    </p>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAction(n.id, 'accepted')}
                        className="flex-1 py-4 bg-cyan-500 text-[#0a0f3c] rounded-[22px] text-xs font-[1000] uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                      >
                        أبشر بالفزعة
                      </button>
                      <button 
                        onClick={() => handleAction(n.id, 'declined')}
                        className="px-6 py-4 bg-white/5 border border-white/10 rounded-[22px] text-gray-500 hover:text-red-400 transition-all active:scale-95"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 opacity-50">
              <BellOff size={60} className="mx-auto mb-6 text-gray-700" />
              <p className="font-black text-[10px] uppercase tracking-widest text-gray-600">لا توجد تنبيهات جديدة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}