import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Menu, X, User, Settings, Headphones, ChevronLeft, LogIn, Bell } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  const navigate = useNavigate();

  // 1. دالة جلب عدد الإشعارات غير المقروءة من قاعدة البيانات
  const fetchUnreadStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // فحص التنبيهات العامة غير المقروءة
    const { count: systemCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    // فحص طلبات الفزعة المعلقة
    const { count: inviteCount } = await supabase
      .from('faz3a_invites')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    setUnreadCount((systemCount || 0) + (inviteCount || 0));
  }, []);

  useEffect(() => {
    // جلب بيانات المستخدم عند تحميل الصفحة
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchUnreadStatus();
    });

    // مراقبة تغيير حالة الجلسة (دخول/خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUnreadStatus();
      else setUnreadCount(0);
    });

    // الاستماع اللحظي (Realtime) لتحديث عداد الإشعارات
    const channel = supabase
      .channel('header-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchUnreadStatus())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_invites' }, () => fetchUnreadStatus())
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadStatus]);

  // دالة تسجيل الخروج (تم تصحيحها بإضافة .auth)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      navigate('/auth');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { icon: User, label: 'ملفي الشخصي', path: '/account' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
    { icon: Headphones, label: 'الدعم الفني', path: '/contact' },
  ];

  return (
    <header 
      className="p-5 flex items-center justify-between bg-[#0a0f3c]/80 border-b border-white/5 sticky top-0 z-[100] backdrop-blur-xl h-20"
      dir="rtl"
    >
      {/* اليمين: اللوغو */}
      <div 
        className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-all" 
        onClick={() => navigate('/')}
      >
        <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
          هايب <span className="text-cyan-400">Padel</span>
        </h1>
      </div>

      {/* اليسار: الأزرار والمنيو */}
      <div className="flex items-center gap-2" dir="ltr">
        
        {/* زر التنبيهات مع النقطة الحمراء التفاعلية */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:border-cyan-400/40 transition-all active:scale-90"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f3c] animate-pulse" />
          )}
        </button>

        {user ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline font-[1000] uppercase">خروج</span>
          </button>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-[#0a0f3c] text-xs font-black shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <LogIn size={16} />
            <span className="font-[1000] uppercase">دخول</span>
          </button>
        )}

        {/* المنيو الجانبي */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-95 ${
              isMenuOpen 
              ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' 
              : 'bg-white/5 border-white/10 text-cyan-400 hover:border-cyan-400/40'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div 
            className={`absolute top-14 left-0 w-[240px] bg-[#14224d] border border-white/10 rounded-[28px] shadow-2xl transition-all duration-300 z-[110] overflow-hidden ${
              isMenuOpen 
              ? 'opacity-100 scale-100 translate-y-0 visible' 
              : 'opacity-0 scale-95 -translate-y-4 invisible pointer-events-none'
            }`}
            style={{ transformOrigin: 'top left' }}
          >
            <div className="p-3 space-y-1" dir="rtl">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0f3c] transition-colors">
                      <item.icon size={18} />
                    </div>
                    <span className="font-black text-sm text-gray-200">{item.label}</span>
                  </div>
                  <ChevronLeft size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}
    </header>
  );
}