import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`*, courts (name, image_url)`)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error("فشل في جلب الحجوزات");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm("هل أنت متأكد من إلغاء هذا الحجز؟");
    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      
      toast.error("تم إلغاء الحجز بنجاح 🛑");
    } catch (error: any) {
      toast.error("فشل في إلغاء الحجز");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    if (activeTab === 'current') return bookingDate >= now && b.status === 'confirmed';
    if (activeTab === 'previous') return bookingDate < now && b.status === 'confirmed';
    if (activeTab === 'cancelled') return b.status === 'cancelled' || b.status === 'converted';
    return false;
  });

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8 text-right">
        
        {/* العنوان وزر العودة */}
        <div className="flex items-center gap-4 text-right">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-4xl font-[1000] italic uppercase leading-none tracking-tighter text-right">حجوزاتي</h1>
        </div>

        {/* التبويبات */}
        <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {/* قائمة الحجوزات */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 backdrop-blur-2xl rounded-[35px] p-7 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-5 text-right">
                  <div className="w-16 h-16 rounded-[22px] overflow-hidden border border-white/10 bg-[#0a0f3c]">
                    <img src={booking.courts?.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-xl italic leading-none mb-1 text-white">{booking.courts?.name}</h3>
                    <div className="text-cyan-400 text-[9px] font-black uppercase tracking-widest opacity-60">
                        ID: {booking.id.slice(0,8).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic text-gray-300 justify-end">
                    {new Date(booking.start_time).toLocaleDateString('ar-EG')} <Calendar size={14} className="text-cyan-400" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic text-gray-300 justify-end">
                    {new Date(booking.start_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})} <Clock size={14} className="text-cyan-400" />
                  </div>
                </div>

                {activeTab === 'current' && (
                  <div className="pt-2">
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="w-full py-4.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-[1000] text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                    >
                      <Trash2 size={15} /> إلغاء الحجز النهائي
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-center opacity-20 py-20 italic font-black uppercase tracking-widest text-gray-500 leading-none">لا توجد حجوزات <br/> في هذا القسم</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}