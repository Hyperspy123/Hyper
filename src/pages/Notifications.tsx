import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Bell, Zap, Swords, Calendar, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("تم حذف التنبيه");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <Swords className="text-purple-400" size={20} />;
      case 'booking': return <Calendar className="text-cyan-400" size={20} />;
      default: return <Zap className="text-yellow-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-20" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20"><Bell size={24} /></div>
          <div>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">التنبيهات</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">آخر مستجدات عالمك في هايب</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`group relative bg-[#0a0f3c]/60 backdrop-blur-xl border ${n.is_read ? 'border-white/5' : 'border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'} rounded-3xl p-5 transition-all hover:bg-white/5`}>
                <div className="flex gap-4">
                  <div className="flex-none w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-black ${n.is_read ? 'text-gray-300' : 'text-white'}`}>{n.title}</h3>
                      <span className="text-[9px] font-bold text-gray-500">{new Date(n.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                  </div>
                </div>
                <button onClick={() => deleteNotification(n.id)} className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 p-2 hover:text-red-400 transition-all text-gray-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <CheckCircle2 size={48} className="mx-auto mb-4" />
            <p className="font-black text-xs uppercase tracking-widest">صندوقك فاضي حالياً</p>
          </div>
        )}
      </main>
    </div>
  );
}