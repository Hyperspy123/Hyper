import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '../LLL';
import { ChevronLeft, Zap, BellOff, X, Loader2, Trophy, Check, Swords } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب التنبيهات وتحديث حالة القراءة تلقائياً
  const fetchAllNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
        
        // تحويل غير المقروء إلى مقروء فور فتح الصفحة
        const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNotifications();
    
    // المزامنة اللحظية للإشعارات
    const channel = supabase
      .channel('notif-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchAllNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAllNotifications]);

  // 2. معالج التحديات: عند القبول يتم التوجه للشات مباشرة ✅
  const handleChallengeAction = async (challengeId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status: action })
        .eq('id', challengeId);

      if (error) throw error;

      if (action === 'accepted') {
        toast.success("كفو! تم قبول التحدي.. جاري فتح الشات 🔥");
        // توجيه المستخدم لصفحة الشات الخاصة بهذا التحدي
        setTimeout(() => {
          navigate(`/chat/${challengeId}`);
        }, 1000);
      } else {
        toast.info("تم رفض التحدي");
        fetchAllNotifications();
      }
    } catch (error: any) {
      toast.error("حدث خطأ في تحديث حالة التحدي");
    }
  };

  // 3. معالج دعوات الفزعة (نظام الـ RPC)
  const handleInviteAction = async (postId: string, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: success, error: joinError } = await supabase.rpc('join_faz3a_secure', {
          p_post_id: postId,
          p_user_id: user.id
        });

        if (joinError) throw joinError;

        if (success) {
          toast.success("أبشر بالفزعة! تم الانضمام للفريق 🔥");
          navigate('/faz3a'); 
        } else {
          toast.error("للأسف اكتمل العدد في هذا الفريق");
        }
      } catch (error: any) {
        toast.error("خطأ أثناء محاولة الانضمام");
      }
    } else {
      toast.info("تم رفض الدعوة");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 relative text-right font-sans selection:bg-cyan-500/30" dir="rtl">
      <Header />
      
      <main className="pt-28 max-w-lg mx-auto px-6 relative z-10">
        {/* العناوين */}
        <div className="flex items-center gap-4 mb-10">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all backdrop-blur-md">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
              التنبيهات <span className="text-cyan-400 text-2xl tracking-normal">NOTIFS</span>
            </h1>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 rounded-[35px] border backdrop-blur-2xl transition-all duration-500 ${!n.is_read ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/10 opacity-80'}`}
              >
                
                {/* النوع الأول: تحدي من المجتمع */}
                {n.type === 'challenge' ? (
                  <div className="flex items-start gap-5">
                    <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      <Swords size={24} className="animate-bounce" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] text-gray-500 font-bold uppercase">
                          {new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <h4 className="font-black text-lg italic text-yellow-500 uppercase leading-none">تحدي جديد ⚔️</h4>
                      </div>
                      <p className="text-sm text-gray-300 font-bold mb-5 leading-snug">{n.message}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleChallengeAction(n.related_id, 'accepted')} 
                          className="flex-1 py-4 bg-yellow-500 text-[#0a0f3c] rounded-2xl text-[10px] font-[1000] uppercase active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
                        >
                          أنا قد التحدي ⚡
                        </button>
                        <button 
                          onClick={() => handleChallengeAction(n.related_id, 'rejected')} 
                          className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 active:scale-95 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : n.type === 'invite' ? (
                  /* النوع الثاني: دعوة انضمام لفزعة */
                  <div className="flex items-start gap-5">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Zap size={24} className="fill-cyan-400" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] text-gray-500 font-bold uppercase">
                          {new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <h4 className="font-black text-lg italic text-white uppercase leading-none">{n.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 font-bold mb-5 leading-snug">{n.message}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleInviteAction(n.related_id, 'accept')} className="flex-1 py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl text-[10px] font-[1000] uppercase shadow-lg shadow-cyan-400/20 active:scale-95 transition-all">أبشر بالفزعة 🔥</button>
                        <button onClick={() => handleInviteAction(n.related_id, 'decline')} className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 active:scale-95 transition-all">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* النوع الثالث: تنبيهات النظام والرانك */
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl border ${n.type === 'rank_up' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {n.type === 'rank_up' ? <Trophy size={24} /> : <Check size={24} />}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] text-gray-500 font-bold uppercase">
                          {new Date(n.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <h4 className={`font-black text-lg italic uppercase leading-none ${n.type === 'rank_up' ? 'text-purple-400' : 'text-green-400'}`}>
                          {n.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-300 font-bold leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            /* حالة عدم وجود بيانات */
            <div className="text-center py-32 bg-[#0a0f3c]/40 rounded-[50px] border border-dashed border-white/10 opacity-30">
              <BellOff size={60} className="mx-auto mb-6 text-gray-800" />
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-600 italic text-center">لا توجد تنبيهات جديدة حالياً</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}