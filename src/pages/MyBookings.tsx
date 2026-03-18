import { useEffect, useState } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, XCircle, CheckCircle2, History, Hash, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'previous' | 'cancelled'>('current');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        courts (
          name,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء الحجز؟ سيتم تحديث الحالة فوراً.")) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) fetchBookings();
  };

  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    if (b.status === 'cancelled') return false; 
    if (activeTab === 'current') return bookingDate >= now && b.status === 'confirmed';
    if (activeTab === 'previous') return bookingDate < now && b.status === 'confirmed';
    return false;
  });

  return (
    // STEP 1: Changed bg-[#0a0f3c] to bg-transparent
    <div className="min-h-screen bg-transparent text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] transition-all active:scale-90"
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">حجوزاتي</h1>
        </div>

        {/* Navigation Tabs - Glass Style */}
        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-[24px] mb-8 border border-white/10 shadow-xl">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-cyan-500 text-[#0a0f3c] shadow-[0_10px_20px_rgba(6,182,212,0.3)] scale-100' 
                : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="text-cyan-500 font-black italic text-sm animate-pulse uppercase tracking-widest">جاري التحميل...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-[40px] border border-dashed border-white/10 opacity-60">
             <div className="text-gray-500 font-bold text-sm">لا توجد حجوزات في هذا القسم</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              // STEP 2: Applied Glassmorphism to Cards
              <div 
                key={booking.id} 
                className="group bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 flex flex-col gap-5 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-2xl"
              >
                {/* Header: Court Image and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                      <img src={booking.courts?.image_url} className="w-full h-full object-cover" alt="Court" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl tracking-tight">{booking.courts?.name}</h3>
                      <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        <Hash size={12} /> {booking.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                    booking.status === 'confirmed' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                    <Calendar size={16} className="text-cyan-400" />
                    <span className="text-white text-[11px] font-black">
                      {new Date(booking.start_time).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                    <Clock size={16} className="text-cyan-400" />
                    <span className="text-white text-[11px] font-black">
                      {new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Cancel Action */}
                {activeTab === 'current' && booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95 mt-2"
                  >
                    إلغاء الحجز
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}