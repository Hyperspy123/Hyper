import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Calendar, UserPlus, Trash2, Zap, XCircle, Loader2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Notifications() {
  const { t, dir, lang } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/auth');
      } else {
        setUser(data.user);
        fetchNotifications(data.user.id);
      }
    });

    // 🔥 تفعيل النظام المباشر (Real-time) للإشعارات
    const channel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        if (user) fetchNotifications(user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    
    // تحويل الإشعارات إلى مقروءة
    if (data?.some(n => !n.is_read)) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    }
    setLoading(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      // 🔥 حذف فعلي من قاعدة البيانات
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(lang === 'ar' ? 'تم حذف الإشعار نهائياً' : 'Notification deleted permanently');
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting notification');
    }
  };

  const getNotificationStyle = (key: string) => {
    switch (key) {
      case 'notif_booking_confirmed': return { icon: Calendar, color: 'text-cyan-400' };
      case 'notif_new_player_joined': return { icon: UserPlus, color: 'text-purple-400' };
      case 'notif_match_cancelled': return { icon: XCircle, color: 'text-red-400' };
      case 'notif_slot_taken': return { icon: Zap, color: 'text-orange-400' };
      case 'notif_match_now_full': return { icon: Zap, color: 'text-yellow-400' };
      case 'notif_tournament_joined': return { icon: Trophy, color: 'text-yellow-500' }; // 👈 إشعار الفعاليات
      default: return { icon: Bell, color: 'text-gray-400' };
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">
              {t('notification_title' as any)}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {lang === 'ar' ? 'آخر التحديثات' : 'Latest Updates'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center relative">
            <Bell size={24} className="text-cyan-400" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f3c] animate-pulse" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const style = getNotificationStyle(notif.translation_key);
              const Icon = style.icon;

              return (
                <div key={notif.id} className="group bg-[#0a0f3c]/40 backdrop-blur-xl p-5 rounded-[30px] border border-white/5 flex items-center gap-4 transition-all hover:border-white/10 relative overflow-hidden">
                  {!notif.is_read && <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />}
                  
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Icon className={style.color} size={24} />
                  </div>

                  <div className="flex-1">
                    <p className={`text-sm font-black leading-tight mb-1 ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>
                      {t(notif.translation_key as any) || notif.translation_key}
                    </p>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(notif.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button 
                    onClick={() => deleteNotification(notif.id)} 
                    className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-xl transition-all flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
            <Bell size={50} className="mx-auto mb-4 text-gray-600" />
            <p className="font-black italic uppercase text-gray-500">
              {lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new alerts'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}