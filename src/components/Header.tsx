import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Menu, X, User, Settings, Headphones, ChevronLeft, LogIn, Bell, Trophy } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ first_name: string, current_rank: string, total_matches: number } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  const navigate = useNavigate();

  const getRankProgress = (matches: number) => {
    if (matches < 11) return { next: 'HYPE ⚡', min: 0, max: 11 };
    if (matches < 51) return { next: 'PRINCE 👑', min: 11, max: 51 };
    if (matches < 151) return { next: 'KING 🦁', min: 51, max: 151 };
    if (matches < 301) return { next: 'LEGEND 🌌', min: 151, max: 301 };
    if (matches < 501) return { next: 'HYPER 💫', min: 301, max: 501 };
    return { next: 'MAX LEVEL 🏆', min: 501, max: 501 };
  };

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, current_rank, total_matches')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }, []);

  // تحسين جلب عدد التنبيهات ليكون أدق
  const fetchUnreadStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUnreadCount(0);
      return;
    }

    const userId = session.user.id;

    // جلب عدد التنبيهات غير المقروءة
    const { count: systemCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    // جلب عدد الدعوات المعلقة (إذا كنت تستخدم هذا الجدول)
    const { count: inviteCount } = await supabase
      .from('faz3a_invites')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    setUnreadCount((systemCount || 0) + (inviteCount || 0));
  }, []);

  useEffect(() => {
    // التحقق المبدئي من الجلسة
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUnreadStatus();
        fetchProfile(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUnreadStatus();
        fetchProfile(currentUser.id);
      } else {
        setUnreadCount(0);
        setProfile(null);
      }
    });

    // مراقبة التغييرات اللحظية بدقة
    const channel = supabase.channel('header-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadStatus();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.new) setProfile(payload.new as any);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadStatus, fetchProfile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      navigate('/auth');
    } catch (error) { 
      console.error("Logout error:", error); 
    }
  };

  const progress = profile ? getRankProgress(profile.total_matches) : { next: '', min: 0, max: 1 };
  const percentage = profile ? Math.min(100, ((profile.total_matches - progress.min) / (progress.max - progress.min)) * 100) : 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[110] flex items-center justify-between bg-[#0a0f3c]/80 border-b border-white/5 px-6 h-24 backdrop-blur-2xl" dir="rtl">
        
        {/* اليمين: اللوغو وشريط الرانك */}
        <div className="flex flex-col gap-1.5 text-right">
          <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all justify-end" onClick={() => navigate('/')}>
            <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <Zap size={16} className="text-[#0a0f3c] fill-[#0a0f3c]" />
            </div>
            <h1 className="text-xl font-[1000] italic tracking-tighter text-white uppercase leading-none">HYPE</h1>
          </div>

          {profile && (
            <div className="w-32 space-y-1">
              <div className="flex justify-between text-[7px] font-black uppercase italic text-cyan-400/70">
                <span>{profile.current_rank}</span>
                <span>باقي {progress.max - profile.total_matches}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* اليسار: الأزرار والمنيو */}
        <div className="flex items-center gap-2.5" dir="ltr">
          <button onClick={() => navigate('/notifications')} className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 transition-all active:scale-90">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f3c] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            )}
          </button>

          {user && (
            <div className="hidden xs:flex flex-col items-end mr-1 text-right">
               <span className="text-[10px] font-black text-white leading-none mb-1">{profile?.first_name || 'لاعب'}</span>
               <div className="flex items-center gap-1 text-[8px] font-bold text-yellow-500 uppercase italic">
                  <Trophy size={8} /> {profile?.current_rank}
               </div>
            </div>
          )}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-95 ${isMenuOpen ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-cyan-400'}`}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className={`absolute top-20 left-6 w-[220px] bg-[#14224d]/98 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-2xl transition-all duration-300 z-[120] overflow-hidden ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-4 invisible pointer-events-none'}`} style={{ transformOrigin: 'top left' }}>
            <div className="p-3 space-y-1" dir="rtl">
              {[
                { icon: User, label: 'ملفي الشخصي', path: '/account' },
                { icon: Settings, label: 'الإعدادات', path: '/settings' },
                { icon: Headphones, label: 'الدعم الفني', path: '/contact' },
              ].map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0f3c] transition-colors"><item.icon size={16} /></div>
                    <span className="font-black text-xs text-gray-200">{item.label}</span>
                  </div>
                  <ChevronLeft size={14} className="text-gray-600 group-hover:text-cyan-400" />
                </button>
              ))}
              {user && (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/5 transition-all">
                  <LogOut size={16} /> <span className="font-black text-xs uppercase">تسجيل الخروج</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && <div className="fixed inset-0 z-[115] bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />}
      </header>
      
      <div className="h-24 w-full pointer-events-none" />
    </>
  );
}