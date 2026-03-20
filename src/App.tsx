import { useEffect, useState } from 'react';
import { supabase } from './LLL';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

// Components & Pages
import BottomNav from '@/components/BottomNav';
import Index from './pages/Index';
import Auth from './pages/Auth';
import BookCourt from './pages/BookCourt';
import MyBookings from './pages/MyBookings';
import Rewards from './pages/Rewards';
import Tournaments from './pages/Tournaments';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Personal from './pages/Personal';
import Contact from './pages/Contact';
import Faz3a from './pages/Faz3a';
import Notifications from './pages/Notifications';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // المكون المسؤول عن الخلفية الموحدة الاحترافية
  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#05081d] text-white relative overflow-x-hidden font-sans">
      
      {/* 1. DYNAMIC MESH GRADIENTS (الأنوار المموجة الثلاثية) */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[350px] h-[350px] bg-indigo-500/10 blur-[110px] rounded-full pointer-events-none z-0" />
      
      {/* 2. STARDUST TEXTURE (النقاط البيضاء مع التكرار لضمان التغطية) */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat opacity-[0.04] pointer-events-none z-0" />
      
      {/* 3. CONTENT LAYER */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-pulse">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/50 italic">Hype Padel Loading...</span>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <Toaster />
          <BrowserRouter>
            {!session ? (
              <BackgroundWrapper>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
              </BackgroundWrapper>
            ) : (
              <BackgroundWrapper>
                <div className="pb-28">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/book/:id" element={<BookCourt />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/faz3a" element={<Faz3a />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/personal" element={<Personal />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                
                {/* NAVIGATION LAYER */}
                <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pointer-events-none">
                  <div className="pointer-events-auto max-w-lg mx-auto">
                    <BottomNav />
                  </div>
                </div>
              </BackgroundWrapper>
            )}
          </BrowserRouter>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;