import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Calendar, UserPlus, Trash2, Zap, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { t, dir, lang } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الإشعارات من قاعدة البيانات أول ما تفتح الصفحة
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    // جلب الإشعارات وترتيبها من الأحدث للأقدم
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    
    // تحويل الإشعارات الجديدة إلى "مقروءة" بمجرد فتح الصفحة
    if (data?.some(n => !n.is_read)) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    }
    setLoading(false);
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // تحديد الأيقونة واللون بناءً على نوع الإشعار (مدمج مع تصميمك)
  const getNotificationStyle = (key: string) => {
    switch (key) {
      case 'notif_booking_confirmed':
        return { icon: Calendar, color: 'text-cyan-400' };
      case 'notif_new_player_joined':
        return { icon: UserPlus, color: 'text-purple-400' };
      case 'notif_match_cancelled':
        return { icon: XCircle, color: 'text-red-400' };
      case 'notif_slot_taken':
        return { icon: Zap, color: 'text-orange-400' };
      default:
        return { icon: Bell, color: 'text-gray-400' };
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        
        {/* العنوان */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">
              {t('notification_title' as any)}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {lang === 'ar' ? 'آخر التحديثات' : 'Latest Updates'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
            <Bell size={24} className="text-cyan-400" />
          </div>
        </div>

        {/* قائمة الإشعارات */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const style = getNotificationStyle(notif.translation_key);
              const Icon = style.icon;

              return (
                <div key={notif.id} className="group bg-[#0a0f3c]/40 backdrop-blur-xl p-5 rounded-[30px] border border-white/5 flex items-center gap-4 transition-all hover:border-white/10 relative overflow-hidden">
                  
                  {/* تأثير التوهج للإشعار غير المقروء */}
                  {!notif.is_read && <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />}

                  {/* أيقونة الإشعار */}
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Icon className={style.color} size={24} />
                  </div>

                  {/* محتوى الإشعار */}
                  <div className="flex-1">
                    <p className={`text-sm font-black leading-tight mb-1 ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>
                      {t(notif.translation_key as any)}
                    </p>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(notif.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* النقطة المشعة (تختفي إذا الإشعار مقروء) */}
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] flex-shrink-0" />
                  )}

                  {/* زر الحذف */}
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