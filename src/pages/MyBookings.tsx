import { useEffect, useState } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Hash, Loader2, Zap, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'previous' | 'cancelled'>('current');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [missingCount, setMissingCount] = useState(1);
  const [isConverting, setIsConverting] = useState(false);

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

  const openConversionModal = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleFinalConversion = async () => {
    if (!selectedBooking) return;

    const isConfirmed = window.confirm(
      "⚠️ تنبيه هام: بمجرد تحويل هذا الحجز إلى فزعة عامة، سيتم إلغاء خصوصيته ولا يمكنك إعادته لحجوزاتك الشخصية. هل أنت متأكد؟"
    );
    
    if (!isConfirmed) return;

    setIsConverting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: insertError } = await supabase
        .from('faz3a_posts')
        .insert([{
          creator_id: user.id,
          location: 'الصحافة', 
          court_name: selectedBooking.courts?.name,
          match_time: new Date(selectedBooking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          missing_players: missingCount,
          is_from_booking: true
        }]);

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', selectedBooking.id);

      if (deleteError) throw deleteError;

      toast.success("كفو! حجزك صار فزعة عامة الآن 🔥");
      setIsModalOpen(false);
      await fetchBookings(); 
      navigate('/faz3a');
    } catch (error: any) {
      toast.error("فشل التحويل: " + error.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء الحجز؟")) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success("تم إلغاء الحجز بنجاح");
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      setActiveTab('cancelled');
      fetchBookings();
    } catch (error: any) {
      toast.error("فشل في إلغاء الحجز");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    if (b.status === 'cancelled') return activeTab === 'cancelled';
    if (activeTab === 'current') return bookingDate >= now && b.status === 'confirmed';
    if (activeTab === 'previous') return bookingDate < now && b.status === 'confirmed';
    return false;
  });

  return (
    // 🌌 خلفية شفافة بالكامل لتكشف النجوم من App.tsx
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative overflow-x-hidden" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto relative z-10 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 backdrop-blur-md">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">حجوزاتي</h1>
        </div>

        {/* التبويبات الزجاجية */}
        <div className="flex bg-white/5 backdrop-blur-3xl p-1.5 rounded-[24px] mb-8 border border-white/10 shadow-2xl">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-400'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-[40px] border border-dashed border-white/10 opacity-30 font-black text-[10px] uppercase tracking-widest italic">
            لا توجد حجوزات
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 backdrop-blur-2xl rounded-[35px] p-7 border border-white/10 shadow-2xl space-y-5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                      <img src={booking.courts?.image_url} className="w-full h-full object-cover" alt="Court" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl italic tracking-tight uppercase leading-none">{booking.courts?.name}</h3>
                      <div className="text-cyan-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 opacity-70">
                        <Hash size={10}/> {booking.id.slice(0,8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-tighter border ${
                    booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic">
                    <Calendar size={14} className="text-cyan-400" /> {new Date(booking.start_time).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic">
                    <Clock size={14} className="text-cyan-400" /> {new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {activeTab === 'current' && booking.status === 'confirmed' && (
                  <div className="flex gap-2.5 pt-2">
                    <button onClick={() => openConversionModal(booking)} className="flex-[2] py-4 bg-cyan-500 text-[#0a0f3c] rounded-[20px] font-[1000] text-[10px] uppercase shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Zap size={14} className="fill-[#0a0f3c]" /> تحويل لفزعة عامة
                    </button>
                    <button onClick={() => handleCancel(booking.id)} className="flex-1 py-4 bg-white/5 text-red-500 border border-red-500/20 rounded-[20px] font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Trash2 size={14} /> إلغاء
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* مودال التخصيص الزجاجي */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0f3c]/90 border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
            
            <div className="text-center relative">
              <h3 className="text-3xl font-[1000] italic text-cyan-400 uppercase tracking-tighter mb-2 leading-none">تخصيص الفزعة</h3>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest opacity-60 italic leading-none">حدد اللاعبين الناقصين قبل النشر</p>
            </div>

            <div className="space-y-4 relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block italic">كم لاعب ناقصك؟</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button key={num} onClick={() => setMissingCount(num)} className={`flex-1 py-4 rounded-2xl font-[1000] transition-all border ${missingCount === num ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] scale-105 shadow-xl shadow-cyan-500/40' : 'bg-white/10 border-white/10 text-gray-400'}`}>{num}</button>
                ))}
              </div>
            </div>

            <div className="bg-red-500/5 p-5 rounded-3xl border border-red-500/10 space-y-3 relative">
              <div className="flex items-center gap-2 text-red-400 font-black text-[9px] uppercase"><AlertTriangle size={12}/> تنبيه نهائي</div>
              <p className="text-[8px] text-gray-400 leading-relaxed font-bold italic uppercase tracking-tighter">بمجرد الضغط على تأكيد، سيختفي الحجز من قائمتك الخاصة ويُفتح للجميع للمشاركة.</p>
            </div>

            <div className="flex gap-3 relative">
              <button onClick={handleFinalConversion} disabled={isConverting} className="flex-[2] py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] uppercase text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                {isConverting ? <Loader2 className="animate-spin" size={18} /> : "تأكيد ونشر"}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white/5 text-gray-400 rounded-[24px] font-black uppercase text-[10px] active:scale-95 border border-white/5">رجوع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}