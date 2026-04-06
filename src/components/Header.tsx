import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Menu, X, User, Settings, Headphones, ChevronLeft, Bell, Trophy, Users, MessageSquare } from 'lucide-react';

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

  const fetchUnreadStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUnreadCount(0);
      return;
    }

    const userId = session.user.id;

    const { count: systemCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setUnreadCount(systemCount || 0);
  }, []);

  useEffect(() => {
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
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[115] bg-[#05081d]/40 backdrop-blur-md transition-all duration-500 animate-in fade-in"
          onClick={() => setIsMenuOpen(false)} 
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-[130] flex items-center justify-between bg-[#0a0f3c]/80 border-b border-white/5 px-6 h-24 backdrop-blur-2xl" dir="rtl">
        
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
        <div className="flex items-center gap-2" dir="ltr">
          
          {/* أيقونة الرسائل (المحادثات) ✅ */}
          <button 
            onClick={() => navigate('/messages')} 
            className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 transition-all active:scale-90"
            title="المحادثات"
          >
            <MessageSquare size={20} />
          </button>

          {/* أيقونة المجتمع ✅ */}
          <button 
            onClick={() => navigate('/community')} 
            className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 transition-all active:scale-90 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            title="المجتمع"
          >
            <Users size={20} />
          </button>

          {/* أيقونة التنبيهات */}
          <button onClick={() => navigate('/notifications')} className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 transition-all active:scale-90">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f3c] animate-pulse" />
            )}
          </button>

          {/* زر المنيو */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`p-2.5 rounded-xl border transition-all duration-300 relative z-[140] active:scale-95 ${isMenuOpen ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-cyan-400'}`}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* المنيو المنسدل */}
          <div className={`absolute top-24 left-6 w-[240px] bg-[#0a0f3c]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[140] overflow-hidden ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-4 invisible pointer-events-none'}`} style={{ transformOrigin: 'top left' }}>
            <div className="p-4 space-y-1" dir="rtl">
              {[
                { icon: User, label: 'ملفي الشخصي', path: '/account' },
                { icon: MessageSquare, label: 'مركز الرسائل', path: '/messages' },
                { icon: Users, label: 'مجتمع الأساطير', path: '/community' },
                { icon: Trophy, label: 'الفعاليات', path: '/tournaments' },
                { icon: Settings, label: 'الإعدادات', path: '/settings' },
                { icon: Headphones, label: 'الدعم الفني', path: '/contact' },
              ].map((item) => (
                <button 
                  key={item.path} 
                  onClick={() => { navigate(item.path); setIsMenuOpen(false); }} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0f3c] transition-all"><item.icon size={18} /></div>
                    <span className="font-black text-sm text-gray-200 group-hover:text-white">{item.label}</span>
                  </div>
                  <ChevronLeft size={16} className="text-gray-600 group-hover:text-cyan-400 transition-transform group-hover:-translate-x-1" />
                </button>
              ))}
              
              <div className="h-px bg-white/5 my-2 mx-4" />

              {user && (
                <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group">
                  <div className="p-2 rounded-xl bg-red-400/10 group-hover:bg-red-400 group-hover:text-white transition-all"><LogOut size={18} /></div>
                  <span className="font-black text-sm uppercase italic">تسجيل الخروج</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="h-24 w-full pointer-events-none" />
    </>
  );
}