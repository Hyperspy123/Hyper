import { useEffect, useState } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Hash, Loader2, Zap, Trash2 } from 'lucide-react';
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

  // --- ميزة التحويل لفزعة ---
  const convertToFaz3a = async (booking: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // إدراج البيانات في جدول الفزعة العامة
      const { error } = await supabase
        .from('faz3a_posts')
        .insert([{
          creator_id: user.id,
          location: 'الصحافة', // يمكنك تغييرها لتكون ديناميكية
          court_name: booking.courts?.name,
          match_time: new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          missing_players: 1, // القيمة الافتراضية
          is_from_booking: true
        }]);

      if (error) throw error;

      toast.success("تم إدراج حجزك في الفزعة العامة بنجاح! 🔥");
      navigate('/faz3a'); // توجيهه لصفحة الفزعة ليرى طلبه هناك
    } catch (error: any) {
      toast.error("فشل التحويل: " + error.message);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء الحجز؟")) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) {
      toast.success("تم إلغاء الحجز");
      fetchBookings();
    }
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
    <div className="min-h-screen bg-transparent text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <div className="p-6 max-w-md mx-auto relative z-10 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-[1000] italic tracking-tighter uppercase">حجوزاتي</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-[24px] mb-8 border border-white/10">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-400'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 opacity-40 font-black text-xs uppercase tracking-widest">لا توجد حجوزات</div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 backdrop-blur-xl rounded-[35px] p-7 border border-white/10 shadow-2xl space-y-5">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                      <img src={booking.courts?.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl italic">{booking.courts?.name}</h3>
                      <div className="text-cyan-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Hash size={10}/> {booking.id.slice(0,8)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                    <Calendar size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-black">{new Date(booking.start_time).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                    <Clock size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-black">{new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Actions: تحويل لفزعة + إلغاء */}
                {activeTab === 'current' && booking.status === 'confirmed' && (
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => convertToFaz3a(booking)}
                      className="flex-[2] py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-[1000] text-[10px] uppercase shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Zap size={14} className="fill-[#0a0f3c]" /> تحويل لفزعة عامة
                    </button>
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="flex-1 py-4 bg-white/5 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Trash2 size={14} /> إلغاء
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}