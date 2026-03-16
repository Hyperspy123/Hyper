import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { Bell, BellOff, Calendar, CheckCircle, Loader2, Check } from 'lucide-react';

const client = createClient();

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id: number;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) {
          setUser(res.data);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch {
        setUser(null);
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await client.entities.notifications.query({
        query: {},
        sort: '-created_at',
      });
      if (response?.data?.items) {
        setNotifications(response.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      try {
        await client.entities.notifications.update({
          id: String(n.id),
          data: { is_read: true },
        });
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markAsRead = async (id: number) => {
    try {
      await client.entities.notifications.update({
        id: String(id),
        data: { is_read: true },
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('hoursAgo', { count: diffHours });
    return t('daysAgo', { count: diffDays });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'waitlist_confirmed':
        return { icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'booking_cancelled':
        return { icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      default:
        return { icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
        <Header />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-[#14224d] border border-white/5 rounded-2xl p-10 text-center max-w-md">
            <Bell size={48} className="text-cyan-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t('loginRequiredTitle')}</h2>
            <p className="text-gray-400 mb-6">{t('loginRequiredDesc')}</p>
            <button
              onClick={() => client.auth.toLogin()}
              className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-all"
            >
              {t('login')}
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
      <Header />

      <div className="max-w-4xl mx-auto px-4" style={{ paddingTop: '4.5rem' }}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center relative">
              <Bell size={24} className="text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t('notificationsTitle')}</h1>
              <p className="text-gray-400 mt-0.5 text-sm">{t('notificationsSubtitle')}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-all"
            >
              <Check size={14} />
              <span>{t('markAllRead')}</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#14224d] border border-white/5 rounded-2xl p-10 text-center">
            <BellOff size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">{t('noNotifications')}</h3>
            <p className="text-gray-400 text-sm">{t('noNotificationsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
              return (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                    if (notification.type === 'waitlist_confirmed') {
                      navigate('/');
                    }
                  }}
                  className={`w-full text-start bg-[#14224d] border rounded-2xl p-4 transition-all hover:border-cyan-500/20 ${
                    notification.is_read
                      ? 'border-white/5 opacity-70'
                      : 'border-cyan-500/10 shadow-lg shadow-cyan-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-white font-bold text-sm">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{notification.message}</p>
                      <span className="text-gray-500 text-[10px] mt-2 block">
                        {notification.created_at ? getTimeAgo(notification.created_at) : ''}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}