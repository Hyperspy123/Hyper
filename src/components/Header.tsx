import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Zap } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a user is already logged in when the app starts
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for changes (like when someone logs in or out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="p-5 flex justify-between items-center bg-[#0a0f3c] border-b border-white/5 sticky top-0 z-50 backdrop-blur-lg" dir="rtl">
      {/* Logo Section */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Zap size={18} className="text-[#0a0f3c] fill-[#0a0f3c]" />
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white">
          هايب <span className="text-cyan-400 uppercase">Padel</span>
        </h1>
      </div>
      
      {/* Auth Action Section */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-bold hidden sm:block uppercase tracking-widest">
              {user.email?.split('@')[0]}
            </span>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/5 rounded-2xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all border border-white/10 flex items-center gap-2"
            >
              <span className="text-xs font-bold">خروج</span>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-2.5 bg-cyan-500 rounded-xl text-sm font-black text-[#0a0f3c] shadow-[0_5px_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            تسجيل دخول
          </button>
        )}
      </div>
    </header>
  );
}