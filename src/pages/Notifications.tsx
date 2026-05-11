import Header from '@/components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Calendar, UserPlus, Trash2, Zap } from 'lucide-react';

export default function Notifications() {
  const { t, dir } = useLanguage();

  // مثال لبيانات الإشعارات (مستقبلاً نسحبها من Supabase)
  const notificationsList = [
    { id: 1, type: 'success', key: 'notif_booking_confirmed', time: '2m ago', icon: <Calendar className="text-cyan-400" /> },
    { id: 2, type: 'info', key: 'notif_new_player_joined', time: '1h ago', icon: <UserPlus className="text-purple-400" /> },
    { id: 3, type: 'error', key: 'notif_slot_taken', time: '3h ago', icon: <Zap className="text-red-400" /> },
  ];

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter mb-8">{t('notification_title')}</h1>

        <div className="space-y-4">
          {notificationsList.map((notif) => (
            <div key={notif.id} className="bg-[#0a0f3c]/40 backdrop-blur-xl p-6 rounded-[30px] border border-white/5 flex items-center gap-5 transition-all hover:border-white/10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
                {notif.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black leading-tight mb-1">
                  {t(notif.key as any)}
                </p>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{notif.time}</span>
              </div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
            </div>
          ))}
        </div>

        {notificationsList.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Bell size={60} className="mx-auto mb-4" />
            <p className="font-black italic uppercase">No new alerts</p>
          </div>
        )}
      </main>
    </div>
  );
}