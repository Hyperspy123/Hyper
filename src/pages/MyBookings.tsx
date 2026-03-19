import { useEffect, useState } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Hash, Loader2, Zap, Trash2, X } from 'lucide-react';
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

      toast.success("كفو! تحول حجزك لفزعة عامة 🔥");
      setIsModalOpen(false);
      await fetchBookings(); 
      navigate('/faz3a');
    } catch (error: any) {
      toast.error("فشل التحويل: " + error.message);
    } finally {
      setIsConverting(false);
    }
  };

  // --- التعديل هنا: دالة الإلغاء المحدثة ---
  const handleCancel = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء الحجز؟")) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success("تم إلغاء الحجز بنجاح");
      
      // تحديث البيانات في الصفحة
      await fetchBookings(); 
      
      // الانتقال تلقائياً لتبويب الملغاة لرؤية الحجز هناك
      setActiveTab('cancelled');
      
    } catch (error: any) {
      toast.error("فشل في إلغاء الحجز");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    
    // إذا كنت في تبويب الملغاة، اعرض فقط الملغي
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    
    // في التبويبات الأخرى، لا تعرض أي حجز ملغي
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
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-cyan-500/20 transition-all">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-[1000] italic tracking-tighter uppercase">حجوزاتي</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-[24px] mb-8 border border-white/10 shadow-2xl">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20 scale-100' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="text-[10px] font-black text-cyan-500 uppercase italic animate-pulse">جاري جلب حجوزاتك...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 opacity-40 font-black text-[10px] uppercase tracking-widest italic">
            لا توجد حجوزات نشطة
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 backdrop-blur-xl rounded-[35px] p-7 border border-white/10 shadow-2xl space-y-5 transition-all hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                      <img src={booking.courts?.image_url} className="w-full h-full object-cover" alt="Court" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl italic tracking-tight">{booking.courts?.name}</h3>
                      <div className="text-cyan-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 opacity-70">
                        <Hash size={10}/> {booking.id.slice(0,8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-tighter border ${
                    booking.status === 'confirmed' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic">
                    <Calendar size={14} className="text-cyan-400" /> 
                    {new Date(booking.start_time).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic">
                    <Clock size={14} className="text-cyan-400" /> 
                    {new Date(booking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {activeTab === 'current' && booking.status === 'confirmed' && (
                  <div className="flex gap-2.5 pt-2">
                    <button 
                      onClick={() => openConversionModal(booking)}
                      className="flex-[2] py-4 bg-cyan-500 text-[#0a0f3c] rounded-[20px] font-[1000] text-[10px] uppercase shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-cyan-400"
                    >
                      <Zap size={14} className="fill-[#0a0f3c]" /> تحويل لفزعة عامة
                    </button>
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="flex-1 py-4 bg-white/5 text-red-500 border border-red-500/20 rounded-[20px] font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-500/10"
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

      {/* مودال تخصيص الفزعة (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
            
            <div className="text-center relative">
              <h3 className="text-3xl font-[1000] italic text-cyan-400 uppercase tracking-tighter mb-2 italic">تخصيص الفزعة</h3>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest opacity-60">حدد اللاعبين الناقصين قبل النشر</p>
            </div>

            <div className="space-y-4 relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block italic">كم لاعب ناقصك؟</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num} 
                    onClick={() => setMissingCount(num)}
                    className={`flex-1 py-4 rounded-2xl font-[1000] transition-all border duration-300 ${
                      missingCount === num 
                      ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c] scale-110 shadow-xl shadow-cyan-500/40' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-3 relative backdrop-blur-md">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-gray-500 tracking-tighter italic">الملعب المختار:</span>
                <span className="text-white italic text-cyan-400">{selectedBooking?.courts?.name}</span>
              </div>
              <div className="h-[1px] w-full bg-white/5" />
              <div className="text-[9px] font-black text-red-400/80 text-center uppercase tracking-widest leading-relaxed">
                سيتم حذف الحجز وتحويله لمنشور عام فور التأكيد
              </div>
            </div>

            <div className="flex gap-3 relative">
              <button 
                onClick={handleFinalConversion}
                disabled={isConverting}
                className="flex-[2] py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] uppercase text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-cyan-500/20"
              >
                {isConverting ? <Loader2 className="animate-spin" size={18} /> : "تأكيد ونشر"}
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-5 bg-white/5 text-gray-500 rounded-[24px] font-black uppercase text-[10px] active:scale-95 border border-white/5"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}