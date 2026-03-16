import { useEffect, useState } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, MapPin, ChevronLeft, XCircle, CheckCircle2, History } from 'lucide-react';
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
          image_url,
          type
        )
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) {
      alert("تم إلغاء الحجز بنجاح");
      fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    if (b.status === 'cancelled') return false;
    
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
          <h1 className="text-3xl font-black italic">حجوزاتي</h1>
        </div>

        {/* Professional Tabs */}
        <div className="flex bg-[#14224d] p-1.5 rounded-2xl mb-8 border border-white/5">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg' : 'text-gray-400'
              }`}
            >
              {tab === 'current' ? 'الحالية' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
            <p className="text-gray-500 mb-4 font-bold">لا توجد حجوزات في هذا القسم</p>
            <button onClick={() => navigate('/')} className="text-cyan-400 font-black border-b border-cyan-400/30">احجز ملعبك الآن</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex gap-5 items-center relative overflow-hidden group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <img src={booking.courts?.image_url} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg truncate mb-2">{booking.courts?.name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                      <Calendar size={14} className="text-cyan-500" />
                      {new Date(booking.start_time).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                      <Clock size={14} className="text-cyan-500" />
                      {new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {activeTab === 'current' && (
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                )}
                
                {activeTab === 'previous' && <CheckCircle2 size={24} className="text-green-500/50 ml-2" />}
                {activeTab === 'cancelled' && <History size={24} className="text-gray-500 ml-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}