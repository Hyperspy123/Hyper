import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { Bell, BellOff, Calendar, Loader2, Check, Zap, X, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

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

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      markAsRead(n.id);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'faz3a_invite':
        return { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
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
      <div className="min-h-screen bg-[#05081d] pb-20 flex flex-col items-center justify-center px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 text-center max-w-md shadow-2xl">
          <Bell size={48} className="text-cyan-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-black italic text-white mb-2 uppercase tracking-tighter">Login Required</h2>
          <p className="text-gray-400 mb-8 font-bold text-sm leading-relaxed">Please sign in to view your Faz3a invites and booking alerts.</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-4 rounded-2xl bg-cyan-500 text-[#0a0f3c] font-black text-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir={dir}>
      <Header />

      <div className="max-w-lg mx-auto px-6 pt-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Notifications</h1>
              {unreadCount > 0 && <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">{unreadCount} New Alerts</span>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-all"
            >
              <Check size={18} />
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-center shadow-xl">
            <BellOff size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">All Caught Up</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`relative overflow-hidden bg-white/5 border rounded-[30px] p-5 transition-all backdrop-blur-md ${
                    notification.is_read ? 'border-white/5 opacity-60' : 'border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-white font-black text-sm italic uppercase tracking-tight">{notification.title}</h4>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">{getTimeAgo(notification.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed">{notification.message}</p>
                      
                      {/* Interactive Buttons for Faz3a Invites */}
                      {notification.type === 'faz3a_invite' && !notification.is_read && (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => {
                                toast.success("Invite Accepted!");
                                markAsRead(notification.id);
                            }}
                            className="flex-1 py-2.5 bg-cyan-500 text-[#0a0f3c] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button 
                            onClick={() => {
                                toast.error("Invite Declined");
                                markAsRead(notification.id);
                            }}
                            className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}