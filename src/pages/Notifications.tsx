import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Calendar, UserPlus, Trash2, Zap, XCircle, Loader2, Trophy, Swords, Clock } from 'lucide-react';import { useNavigate } from 'react-router-dom';
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
    
    // تحويل الإشعارات غير المقروءة إلى مقروءة
    if (data?.some(n => !n.is_read)) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    }
    setLoading(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(lang === 'ar' ? 'تم حذف الإشعار نهائياً' : 'Notification deleted permanently');
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting notification');
    }
  };

  // 🔥 تحديث الأيقونات عشان تتوافق مع نظام الـ type الجديد
  const getNotificationStyle = (type: string, key: string) => {
    if (type === 'booking') return { icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (type === 'cancellation') return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' };
    if (type === 'challenge') return { icon: Swords, color: 'text-purple-400', bg: 'bg-purple-500/10' };
    if (type === 'tournament') return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    
    // دعم للإشعارات القديمة
    switch (key) {
      case 'notif_new_player_joined': return { icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      case 'notif_slot_taken': return { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' };
      default: return { icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
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
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center relative shadow-inner">
            <Bell size={24} className="text-cyan-400" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f3c] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const style = getNotificationStyle(notif.type, notif.translation_key);
              const Icon = style.icon;

              // 🔥 تحديد النص والعنوان
              const displayTitle = notif.title || (notif.translation_key ? t(notif.translation_key as any) : (lang === 'ar' ? 'إشعار جديد' : 'New Notification'));
              const displayMessage = notif.message;

              return (
                <div key={notif.id} className="group bg-[#0a0f3c]/40 backdrop-blur-xl p-5 rounded-[30px] border border-white/5 flex items-start gap-4 transition-all hover:border-white/10 relative overflow-hidden shadow-xl">
                  
                  {/* تأثير إضاءة خلفي إذا الإشعار جديد */}
                  {!notif.is_read && <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-24 h-24 ${style.bg} blur-3xl rounded-full pointer-events-none opacity-50`} />}
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 mt-1 ${style.bg}`}>
                    <Icon className={style.color} size={22} />
                  </div>

                  <div className="flex-1 pt-1">
                    {/* 🔥 عرض العنوان */}
                    <h3 className={`text-sm font-[1000] leading-tight mb-1 ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>
                      {displayTitle}
                    </h3>
                    
                    {/* 🔥 عرض الرسالة إذا كانت موجودة */}
                    {displayMessage && (
                      <p className="text-[11px] font-bold text-gray-400 leading-snug mb-2">
                        {displayMessage}
                      </p>
                    )}

                    <div className="flex items-center gap-1 opacity-60">
                      <Clock size={10} className="text-gray-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400" dir="ltr">
                        {new Date(notif.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteNotification(notif.id)} 
                    className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-xl transition-all flex-shrink-0 self-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/5 rounded-[40px] border border-dashed border-white/10 shadow-inner">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-600" />
            </div>
            <p className="font-[1000] text-lg text-gray-400 mb-1">
              {lang === 'ar' ? 'لا توجد إشعارات!' : 'No Notifications!'}
            </p>
            <p className="text-[10px] font-black italic uppercase text-gray-500 tracking-widest">
              {lang === 'ar' ? 'أنت في السليم، لا يوجد شيء جديد.' : 'You are all caught up.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}