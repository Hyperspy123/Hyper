import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '../LLL';
import { ChevronLeft, Zap, BellOff, X, Loader2, CalendarCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNotifications();
    
    const channel = supabase
      .channel('notif-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => fetchAllNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAllNotifications]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // 🔥 محرك القبول المطور لربط "الفزيع" بالطلب
  const handleInviteAction = async (notifId: string, postId: string, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. تسجيل اللاعب كمشارك في الفزعة (لضمان ظهورها في "الشباب طالبينك")
        const { error: joinError } = await supabase
          .from('faz3a_participants')
          .insert([{ post_id: postId, participant_id: user.id }]);

        if (joinError && joinError.code !== '23505') { // تجاهل الخطأ إذا كان منضماً مسبقاً
          throw joinError;
        }

        toast.success("كفو! أبشر بالفزعة 🔥 جاري توجيهك لتنسيق اللعب...");
        
        // 2. التوجيه لصفحة الفزعة الرئيسية (تبويب طلباتي سيعالج الباقي)
        navigate('/faz3a'); 
      } catch (error: any) {
        toast.error("حدث خطأ في قبول الفزعة أو ربما اكتمل العدد");
        console.error(error.message);
      }
    } else {
      toast.info("تم رفض الدعوة");
    }
    
    // تحديث التنبيه كمقروء في كل الحالات
    await markAsRead(notifId);
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 relative text-right" dir="rtl">
      <Header />
      
      <main className="pt-28 max-w-lg mx-auto px-6 relative z-10">
        <div className="flex items-center gap-4 mb-10">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">التنبيهات <span className="text-cyan-400">Notifs</span></h1>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="p-6 rounded-[35px] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {n.type === 'invite' ? (
                  <div className="flex items-start gap-5">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      <Zap size={24} className="fill-cyan-400 shadow-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-lg italic text-white uppercase tracking-tighter">{n.title}</h4>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                          {new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 font-bold mb-5 leading-snug">{n.message}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleInviteAction(n.id, n.related_post_id, 'accept')} 
                          className="flex-1 py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl text-[10px] font-[1000] uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                        >
                          أبشر بالفزعة 🔥
                        </button>
                        <button 
                          onClick={() => handleInviteAction(n.id, n.related_post_id, 'decline')} 
                          className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 active:scale-95 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl border ${n.type === 'rank_up' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {n.type === 'rank_up' ? <CalendarCheck size={24} /> : <Check size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-black text-lg italic uppercase tracking-tighter ${n.type === 'rank_up' ? 'text-yellow-500' : 'text-green-400'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">
                          {new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 font-bold mb-4 leading-relaxed">{n.message}</p>
                      <button 
                        onClick={() => markAsRead(n.id)} 
                        className="py-2.5 px-5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] transition-all"
                      >
                        تم الاطلاع ✓
                      </button>
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