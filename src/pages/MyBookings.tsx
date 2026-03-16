import { useEffect, useState } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, XCircle, CheckCircle2, History, Hash } from 'lucide-react';
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
      .order('start_time', { ascending: false });

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
    if (b.status === 'cancelled') return false; // Hide cancelled from other tabs
    
    if (activeTab === 'current') return bookingDate >= now;
    if (activeTab === 'previous') return bookingDate < now;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-20" dir="rtl">
      <Header />
      
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-xl border border-white/10">
            <ChevronLeft size={20} className="text-cyan-400 rotate-180" />
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">حجوزاتي</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#14224d] p-1.5 rounded-2xl mb-8 border border-white/5">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg' : 'text-gray-400'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 animate-pulse text-cyan-500 font-bold italic">جاري جلب بياناتك...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 opacity-50">
             لا توجد حجوزات حالياً
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                
                {/* Header: Court Image and Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10">
                      <img src={booking.courts?.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{booking.courts?.name}</h3>
                      <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-black uppercase">
                        <Hash size={10} /> {booking.id.slice(0, 8).toUpperCase()} {/* Reservation Number */}
                      </div>
                    </div>
                  </div>
                  
                  {/* Dynamic Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    booking.status === 'confirmed' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                  </span>
                </div>

                <hr className="border-white/5" />

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                    <Calendar size={14} className="text-cyan-500" />
                    {new Date(booking.start_time).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                    <Clock size={14} className="text-cyan-500" />
                    {new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Cancel Action */}
                {activeTab === 'current' && booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="w-full py-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all"
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