import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/lib/i18n';

// Components
import BottomNav from '@/components/BottomNav';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth'; 
import BookCourt from './pages/BookCourt';
import MyBookings from './pages/MyBookings';
import Rewards from './pages/Rewards';
import Tournaments from './pages/Tournaments';
import Account from './pages/Account';
import Contact from './pages/Contact';
import Faz3a from './pages/Faz3a';
import Notifications from './pages/Notifications';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <BrowserRouter>
          {/* 1. THE BEAUTY WRAPPER: Deep Midnight Base */}
          <div className="min-h-screen bg-[#05081d] text-white relative overflow-x-hidden font-sans">
            
            {/* 2. DYNAMIC MESH GRADIENTS (The Glows) */}
            {/* Cyan Glow (Top Left) */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
            
            {/* Purple Glow (Middle Right) */}
            <div className="fixed top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
            
            {/* Indigo Glow (Bottom Left) */}
            <div className="fixed bottom-[-5%] left-[-5%] w-[350px] h-[350px] bg-indigo-500/10 blur-[110px] rounded-full pointer-events-none z-0" />

            {/* 3. NOISE & GRID TEXTURE (High-End Feel) */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none z-0" />

            {/* 4. CONTENT LAYER */}
            <div className="relative z-10 pb-28"> {/* Extra padding for BottomNav safety */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/book/:id" element={<BookCourt />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/achievements" element={<Rewards />} /> 
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/faz3a" element={<Faz3a />} />
                <Route path="/account" element={<Account />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/error" element={<AuthError />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            
            {/* 5. NAVIGATION LAYER (Glass Effect) */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pointer-events-none">
              <div className="pointer-events-auto max-w-lg mx-auto">
                <BottomNav />
              </div>
            </div>
          </div>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;