import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Hash, Loader2, Zap, Trash2, X, User, MapPin } from 'lucide-react';
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
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast.error("تم إلغاء الحجز 🛑");
    } catch (error: any) {
      toast.error("فشل الإلغاء");
    }
  };

  // 🔥 الدالة المحدثة: تحويل الحجز لفزعة وضمان ظهوره فوراً
  const handleFinalConversion = async () => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking.id;
    const courtName = selectedBooking.courts?.name || "ملعب بادل";
    setIsConverting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // تنسيق الوقت (مثلاً: 10:00 PM)
      const formattedTime = new Date(selectedBooking.start_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // إرسال الفزعة لجدول faz3a_posts
      const { error: insertError } = await supabase
        .from('faz3a_posts')
        .insert([{
            creator_id: user.id,
            court_name: courtName,
            match_time: formattedTime,
            missing_players: missingCount,
            status: 'open' // ✅ ضمان ظهورها في البحث والتبويبات
        }]);

      if (insertError) throw new Error(`فشل نشر الفزعة: ${insertError.message}`);

      // تحديث حالة الحجز الأصلي إلى "محول"
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'converted' })
        .eq('id', bookingId);
      
      if (updateError) throw new Error(`فشل تحديث حالة الحجز: ${updateError.message}`);

      // تحديث الواجهة المحلية
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setIsModalOpen(false);
      
      toast.success("كفو! حجزك الحين في ساحة الفزعات 🔥");
      
      // الانتقال التلقائي لصفحة الفزعات لمشاهدة الحجز هناك
      setTimeout(() => {
        navigate('/faz3a');
      }, 800);

    } catch (error: any) {
      console.error("Critical Error:", error);
      toast.error(error.message || "حدث خطأ أثناء التحويل");
    } finally {
      setIsConverting(false);
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
        
        <div className="flex items-center gap-4 text-right">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-4xl font-[1000] italic uppercase leading-none tracking-tighter text-right">حجوزاتي</h1>
        </div>

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
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                      className="flex-[2] py-4.5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
                    >
                      <Zap size={15} fill="currentColor" /> تحويل لفزعة
                    </button>
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 py-4.5 bg-white/5 text-red-500 border border-red-500/20 rounded-[24px] font-[1000] text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Trash2 size={15} /> إلغاء
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-center opacity-20 py-20 italic font-black uppercase tracking-widest text-gray-500">لا توجد حجوزات هنا</p>
            )}
          </div>
        )}
      </main>

      {/* مودال التحويل */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-3xl animate-in fade-in duration-300 text-right">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-sm rounded-[50px] p-10 shadow-2xl relative">
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><X size={20} /></button>
                <div className="text-right">
                  <h3 className="text-3xl font-[1000] italic text-white tracking-tighter uppercase leading-none">تحويل <span className="text-cyan-400">لفزعة</span></h3>
                  <p className="text-[9px] font-black text-gray-500 uppercase mt-2 italic">انشر حجزك وابحث عن أبطال</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest px-2 italic text-right">1. كم وحش ناقصك؟</p>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(num => (
                    <button 
                      key={num} 
                      onClick={() => setMissingCount(num)} 
                      className={`flex flex-col items-center justify-center py-8 rounded-[35px] border-2 transition-all ${
                        missingCount === num 
                        ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] scale-105 shadow-xl shadow-cyan-500/20' 
                        : 'bg-white/5 border-white/5 text-gray-500'
                      }`}
                    >
                      <User size={22} className={`${missingCount === num ? 'animate-bounce' : 'opacity-20'}`} />
                      <span className="text-2xl font-[1000] italic leading-none mt-1">{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleFinalConversion} 
                disabled={isConverting} 
                className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-cyan-500/30"
              >
                {isConverting ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} fill="currentColor" /> انشر الفزعة الآن 🔥</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}