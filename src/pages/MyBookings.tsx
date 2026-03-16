import { useState, useEffect } from 'react';
import { supabase } from '@/LLL';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Calendar, MapPin, QrCode, Ticket, Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyBookings() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Robust query: Explicitly linking court_id to the courts table
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              courts:court_id (
                name, 
                image_url
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Link Error, trying fallback:", error.message);
            // Fallback: Just get the raw booking data if the join fails
            const { data: fallbackData } = await supabase
              .from('bookings')
              .select('*')
              .eq('user_id', user.id);
            
            setBookings(fallbackData || []);
          } else {
            setBookings(data || []);
          }
        }
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBookings();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f3c] pb-24 text-white font-sans" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-lg mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-cyan-400">حجوزاتي</h1>
            <p className="text-gray-400 text-sm">تذاكر مبارياتك القادمة</p>
          </div>
          <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full border border-white/10">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-[#14224d] rounded-[32px]" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="relative group">
                <div className="bg-[#14224d] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative">
                  
                  {/* Ticket Style Notches */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#0a0f3c] rounded-full z-10 -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0a0f3c] rounded-full z-10 -translate-y-1/2" />

                  <div className="p-6 border-b border-dashed border-white/20 pb-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={booking.courts?.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=200'} 
                          className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/30" 
                        />
                        <div>
                          <h3 className="text-lg font-bold">{booking.courts?.name || "ملعب بادل"}</h3>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <MapPin size={12} className="text-cyan-500" /> الرياض
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <span className="text-cyan-400 text-[10px] font-black uppercase">مؤكد</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">التاريخ</span>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Calendar size={14} className="text-cyan-500" />
                          {new Date(booking.start_time).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">الوقت</span>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Clock size={14} className="text-cyan-500" />
                          {new Date(booking.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-500 p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-[#0a0f3c]/60 uppercase tracking-tighter">رمز الدخول</span>
                      <p className="text-sm font-black text-[#0a0f3c] font-mono">#{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-lg">
                      <QrCode size={32} className="text-[#0a0f3c]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#14224d]/40 rounded-[40px] border border-dashed border-white/10">
            <Ticket size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
            <p className="text-gray-500 font-medium">لا توجد حجوزات حالياً...</p>
            <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 font-bold hover:underline">
              احجز أول ملعب الآن
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}