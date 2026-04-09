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
import Notifications from './pages/Notifications';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import Community from './pages/Community'; 
import Chat from './pages/Chat'; 
import Messages from './pages/Messages'; 

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

  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#02040a] text-white relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. الأنوار المموجة (Glows) */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/25 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-500/20 blur-[110px] rounded-full pointer-events-none z-0" />
      
      {/* 2. النجوم (Stardust) */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-40 mix-blend-screen" 
        style={{ 
          backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEVfX19fX19fX19fX19fX19fX19fX19fX19fX198mS8+AAAAB3RSTlMAVTY2NjY2S8N8YQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAClJREFUKJFjYBgFIMDIwMAAAsYGBuYGBuYGBuYGBuYGBuYGBuYGBuYGBuYGBgYArp8Cx8HUnHkAAAAASUVORK5CYII=')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px'
        }} 
      />
      
      {/* 3. طبقة المحتوى */}
      <div className="relative z-10 w-full min-h-screen bg-transparent">
        {children}
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-cyan-400" size={40} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 animate-pulse">جاري تحميل المجرة...</span>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <Toaster position="top-center" richColors />
          <BrowserRouter>
            <BackgroundWrapper>
              <div className="pb-32 bg-transparent">
                <Routes>
                  {!session ? (
                    <>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="*" element={<Navigate to="/auth" replace />} />
                    </>
                  ) : (
                    <>
                      {/* المسارات الأساسية */}
                      <Route path="/" element={<Index />} />
                      <Route path="/book/:id" element={<BookCourt />} />
                      <Route path="/my-bookings" element={<MyBookings />} />
                      <Route path="/rewards" element={<Rewards />} />
                      <Route path="/tournaments" element={<Tournaments />} />
                      
                      {/* تم إزالة مسار الفزعة من هنا 🗑️ */}
                      
                      <Route path="/community" element={<Community />} />
                      <Route path="/messages" element={<Messages />} /> 
                      <Route path="/chat/:challengeId" element={<Chat />} />
                      
                      {/* الإعدادات والحساب */}
                      <Route path="/account" element={<Account />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/personal" element={<Personal />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </>
                  )}
                </Routes>
              </div>
              
              {session && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-8 pointer-events-none">
                  <div className="pointer-events-auto max-w-lg mx-auto">
                    <BottomNav />
                  </div>
                </div>
              )}
            </BackgroundWrapper>
          </BrowserRouter>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;