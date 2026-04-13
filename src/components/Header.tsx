import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Menu, X, User, CreditCard, Headphones, Globe, Trash2, Bell, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  const navigate = useNavigate();

  const getRankProgress = (matches: number) => {
    if (matches < 11) return { next: 'HYPE ⚡', min: 0, max: 11 };
    if (matches < 51) return { next: 'PRINCE 👑', min: 11, max: 51 };
    if (matches < 151) return { next: 'KING 🦁', min: 51, max: 151 };
    return { next: 'LEGEND 🌌', min: 151, max: 301 };
  };

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('first_name, current_rank, total_matches').eq('id', userId).single();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
  }, [fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate('/auth');
  };

  const progress = profile ? getRankProgress(profile.total_matches) : { next: '', min: 0, max: 1 };
  const percentage = profile ? Math.min(100, ((profile.total_matches - progress.min) / (progress.max - progress.min)) * 100) : 0;

  return (
    <>
      {isMenuOpen && <div className="fixed inset-0 z-[115] bg-[#05081d]/40 backdrop-blur-md transition-all duration-500" onClick={() => setIsMenuOpen(false)} />}

      <header className="fixed top-0 left-0 right-0 z-[130] flex items-center justify-between bg-[#0a0f3c]/80 border-b border-white/5 px-6 h-24 backdrop-blur-2xl" dir="rtl">
        
        {/* اللوجو والرانك (اليسار) */}
        <div className="flex flex-col gap-1.5 text-right">
          <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all justify-end" onClick={() => navigate('/')}>
            <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)]"><Zap size={16} className="text-[#0a0f3c] fill-[#0a0f3c]" /></div>
            <h1 className="text-xl font-[1000] italic tracking-tighter text-white uppercase leading-none">HYPE</h1>
          </div>
          {profile && (
            <div className="w-32 space-y-1">
              <div className="flex justify-between text-[7px] font-black uppercase italic text-cyan-400/70"><span>{profile.current_rank}</span><span>باقي {progress.max - profile.total_matches}</span></div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]" style={{ width: `${percentage}%` }}/>
              </div>
            </div>
          )}
        </div>

        {/* الأيقونات العلوية والمنيو (اليمين) */}
        <div className="flex items-center gap-3" dir="ltr">
          
          {/* ✅ زر الرسائل المنفصل */}
          <button onClick={() => navigate('/messages')} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-white/10 active:scale-90 transition-all">
            <MessageSquare size={20} />
          </button>

          {/* ✅ زر التنبيهات المنفصل */}
          <button onClick={() => navigate('/notifications')} className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-white/10 active:scale-90 transition-all">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f3c] animate-pulse" />}
          </button>

          {/* زر القائمة المنسدلة (المنيو) */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2.5 rounded-xl border transition-all duration-300 relative z-[140] active:scale-95 ${isMenuOpen ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-cyan-400'}`}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* ✅ المنيو النظيف والمختصر بدون تكرار */}
          <div className={`absolute top-24 left-6 w-[240px] bg-[#0a0f3c]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[140] overflow-hidden ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-4 invisible pointer-events-none'}`} style={{ transformOrigin: 'top left' }}>
            <div className="p-4 space-y-1" dir="rtl">
              {[
                { icon: User, label: 'ملفي الشخصي', path: '/profile' },
                { icon: CreditCard, label: 'معلومات الدفع', path: '/payment' },
                { icon: Headphones, label: 'الدعم الفني', path: '/support' },
                { icon: Globe, label: 'اللغة', path: '/language' },
              ].map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group text-right">
                  <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0f3c] transition-all"><item.icon size={18} /></div>
                  <span className="font-black text-sm text-gray-200 group-hover:text-white">{item.label}</span>
                </button>
              ))}
              
              <div className="h-px bg-white/5 my-2 mx-4" />

              {/* زر حذف الحساب */}
              <button onClick={() => {
                toast.error('لحذف حسابك نهائياً، يرجى التواصل مع الدعم الفني');
                setIsMenuOpen(false);
              }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group text-right">
                <div className="p-2 rounded-xl bg-red-400/10 group-hover:bg-red-400 group-hover:text-white transition-all"><Trash2 size={18} /></div>
                <span className="font-black text-sm">حذف الحساب</span>
              </button>

              {user && (
                <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:bg-white/5 transition-all group text-right mt-1">
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/20 transition-all"><LogOut size={18} /></div>
                  <span className="font-black text-sm">تسجيل الخروج</span>
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