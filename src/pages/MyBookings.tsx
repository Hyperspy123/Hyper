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

    // نجلب فقط الحجوزات التي حالتها 'confirmed'
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, courts (name, image_url)`)
      .eq('user_id', user.id)
      .eq('status', 'confirmed') 
      .order('start_time', { ascending: true });

    if (!error) setBookings(data || []);
    setLoading(false);
  };

  /**
   * دالة التحويل النهائية: تختفي، تحول، وترسل إشعار في "خانة الإشعارات"
   */
  const handleFinalConversion = async () => {
    if (!selectedBooking) return;
    
    const bookingId = selectedBooking.id;
    const courtName = selectedBooking.courts?.name;

    setIsConverting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. تحديث حالة الحجز فوراً في قاعدة البيانات لإخفائه للأبد
      // نستخدم update بدلاً من delete لضمان استقرار البيانات
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'converted' })
        .eq('id', bookingId);
      
      if (updateError) throw updateError;

      // 2. إدراج طلب الفزعة في جدول الفزعات
      const { error: faz3aError } = await supabase.from('faz3a_posts').insert([{
          creator_id: user.id,
          location: 'الصحافة', 
          court_name: courtName,
          match_time: new Date(selectedBooking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          missing_players: missingCount,
          is_from_booking: true
      }]);
      if (faz3aError) throw faz3aError;

      // 3. 🔥 تسجيل الإشعار الدائم في جدول التنبيهات (notifications)
      await supabase.from('notifications').insert([{
        user_id: user.id,
        title: 'تم تحويل حجزك 🔥',
        message: `تم تحويل حجزك في ملعب ${courtName} إلى فزعة عامة. ابشر باللاعبين!`,
        type: 'faz3a',
        is_read: false,
        created_at: new Date().toISOString()
      }]);

      // 4. تحديث الواجهة المحلية فوراً ليختفي الكرت من القائمة
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      
      // إغلاق المودال وإظهار رسالة النجاح
      setIsModalOpen(false);
      toast.success("كفو! تم التحويل بنجاح وظهر في إشعاراتك 🔔");

      // التوجه لصفحة الفزعة بعد مهلة بسيطة
      setTimeout(() => navigate('/faz3a'), 800);

    } catch (error: any) {
      console.error("Conversion Error:", error);
      toast.error("فشل التحويل، تأكد من اتصالك بالإنترنت");
      fetchBookings(); // إعادة المحاولة لجلب البيانات الأصلية في حال الفشل
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
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative overflow-x-hidden" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto relative z-10 pt-24 text-right">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 backdrop-blur-md">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">حجوزاتي</h1>
        </div>

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
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-[40px] border border-dashed border-white/10 opacity-30 font-black text-[10px] uppercase tracking-widest italic">
            لا توجد حجوزات
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 backdrop-blur-2xl rounded-[35px] p-7 border border-white/10 space-y-5 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <img src={booking.courts?.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl italic uppercase leading-none">{booking.courts?.name}</h3>
                    <div className="text-cyan-400 text-[9px] font-black uppercase mt-1 opacity-70">
                        <Hash size={10} className="inline mb-0.5" /> {booking.id.slice(0,8).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic">
                    <Calendar size={14} className="text-cyan-400" /> {new Date(booking.start_time).toLocaleDateString('ar-EG')}
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black italic">
                    <Clock size={14} className="text-cyan-400" /> {new Date(booking.start_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                  </div>
                </div>

                {activeTab === 'current' && (
                  <button 
                    onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                    className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-[20px] font-[1000] text-[10px] uppercase shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Zap size={14} fill="#0a0f3c" /> تحويل لفزعة
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* مودال التخصيص */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
          <div className="bg-[#0a0f3c]/95 border border-white/10 w-full max-sm rounded-[40px] p-8 space-y-8 shadow-2xl text-center">
            <h3 className="text-3xl font-[1000] italic text-cyan-400 uppercase tracking-tighter leading-none">تخصيص الفزعة</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button 
                  key={num} 
                  onClick={() => setMissingCount(num)} 
                  className={`flex-1 py-4 rounded-2xl font-[1000] transition-all border ${
                    missingCount === num ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/10 border-white/10 text-gray-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button 
              onClick={handleFinalConversion} 
              disabled={isConverting} 
              className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] uppercase text-xs shadow-lg active:scale-95"
            >
              {isConverting ? <Loader2 className="animate-spin mx-auto" /> : "تأكيد ونشر"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 font-black uppercase text-[10px]">رجوع</button>
          </div>
        </div>
      )}
    </div>
  );
}