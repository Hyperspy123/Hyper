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

    // نجلب فقط الحجوزات التي حالتها 'confirmed' لضمان عدم ظهور المحولة سابقاً
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, courts (name, image_url)`)
      .eq('user_id', user.id)
      .eq('status', 'confirmed') 
      .order('start_time', { ascending: true });

    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const handleFinalConversion = async () => {
    if (!selectedBooking) return;
    
    const bookingId = selectedBooking.id;
    const courtName = selectedBooking.courts?.name;

    setIsConverting(true);

    // --- تحديث الواجهة فوراً (Optimistic UI) ---
    // نخفي الحجز من المصفوفة المحلية فوراً قبل أي عملية طلب من السيرفر
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    setIsModalOpen(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. إدراج طلب الفزعة في جدول الفزعات
      const { error: faz3aError } = await supabase.from('faz3a_posts').insert([{
          creator_id: user.id,
          location: 'الصحافة', 
          court_name: courtName,
          match_time: new Date(selectedBooking.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          missing_players: missingCount,
          is_from_booking: true
      }]);
      if (faz3aError) throw faz3aError;

      // 2. تحديث حالة الحجز في قاعدة البيانات لضمان اختفائه للأبد
      // نغير الحالة إلى 'converted' بدلاً من الحذف لضمان عدم تعارض البيانات
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'converted' })
        .eq('id', bookingId);
      if (updateError) throw updateError;

      // 3. 🔥 تسجيل الإشعار الدائم في جدول التنبيهات
      const { error: notifError } = await supabase.from('notifications').insert([{
        user_id: user.id,
        title: 'تم تحويل حجزك 🔥',
        message: `حجزك في ملعب ${courtName} صار فزعة الآن. ابشر باللاعبين!`,
        type: 'faz3a',
        is_read: false,
        created_at: new Date().toISOString()
      }]);
      if (notifError) console.error("Notification failed but conversion succeeded");

      // إظهار تنبيه نجاح مؤقت (Toast)
      toast.success("كفو! تم التحويل بنجاح وظهر في إشعاراتك 🔔");

      // التوجه لصفحة الفزعة بعد نصف ثانية
      setTimeout(() => navigate('/faz3a'), 600);

    } catch (error: any) {
      console.error(error);
      toast.error("فشل التحويل، حاول مجدداً");
      // في حال الفشل، نعيد الحجز للقائمة
      fetchBookings();
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
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase">حجوزاتي</h1>
        </div>

        <div className="flex bg-white/5 backdrop-blur-3xl p-1.5 rounded-[24px] mb-8 border border-white/10">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'
              }`}
            >
              {tab === 'current' ? 'القادمة' : tab === 'previous' ? 'السابقة' : 'الملغاة'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black text-[10px] uppercase italic">لا توجد حجوزات</div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 backdrop-blur-2xl rounded-[35px] p-7 border border-white/10 space-y-5 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                    <img src={booking.courts?.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl italic uppercase leading-none">{booking.courts?.name}</h3>
                    <div className="text-cyan-400 text-[9px] font-black uppercase mt-1">ID: {booking.id.slice(0,8)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-2 text-[10px] font-black italic border border-white/5">
                    <Calendar size={14} className="text-cyan-400" /> {new Date(booking.start_time).toLocaleDateString('ar-EG')}
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-2 text-[10px] font-black italic border border-white/5">
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
          <div className="bg-[#0a0f3c]/95 border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-8 shadow-2xl relative text-center">
            <h3 className="text-3xl font-[1000] italic text-cyan-400 uppercase tracking-tighter">تخصيص الفزعة</h3>
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