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
          <div className="min-h-screen bg-[#0a0f3c] pb-24">
            <Routes>
              {/* Main App Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/book/:id" element={<BookCourt />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              
              {/* Features & Social */}
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/faz3a" element={<Faz3a />} />
              
              {/* User & Settings */}
              <Route path="/account" element={<Account />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Auth Internals */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/error" element={<AuthError />} />
              
              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global Navigation Bar */}
            <BottomNav />
          </div>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;