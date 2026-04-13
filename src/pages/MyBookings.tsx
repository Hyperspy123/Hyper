import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Loader2, Trash2, Swords } from 'lucide-react';
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

      // 1. جلب الحجوزات العادية
      const { data: normalBookings, error: normalError } = await supabase
        .from('bookings')
        .select(`*, courts (name, image_url)`)
        .eq('user_id', user.id);

      if (normalError) throw normalError;

      // 2. جلب التحديات المقبولة
      const { data: challengeBookings, error: challengeError } = await supabase
        .from('challenges')
        .select(`*, challenger:challenger_id(id, first_name), challenged:challenged_id(id, first_name)`)
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`);

      if (challengeError) throw challengeError;

      // 3. جلب صور الملاعب عشان نعرضها للتحديات
      const { data: courtsData } = await supabase.from('courts').select('name, image_url');

      // 4. توحيد ودمج البيانات في مصفوفة واحدة
      const mergedBookings: any[] = [];

      // إضافة الحجوزات العادية
      normalBookings?.forEach(b => {
        mergedBookings.push({
          id: b.id,
          type: 'normal',
          court_name: b.courts?.name,
          image_url: b.courts?.image_url,
          start_time: b.start_time,
          status: b.status,
        });
      });

      // إضافة التحديات (وتحويل حالتها عشان تطابق نظام التبويبات)
      challengeBookings?.forEach(c => {
        const court = courtsData?.find(crt => crt.name === c.court_name);
        const isChallenger = c.challenger_id === user.id;
        const opponentName = isChallenger ? c.challenged?.first_name : c.challenger?.first_name;

        // نعرض التحديات المقبولة كحجوزات مؤكدة، والمرفوضة كملغاة
        const mappedStatus = c.status === 'accepted' ? 'confirmed' : (c.status === 'rejected' || c.status === 'cancelled') ? 'cancelled' : c.status;

        mergedBookings.push({
          id: c.id,
          type: 'challenge',
          court_name: c.court_name,
          image_url: court?.image_url,
          start_time: c.match_time,
          status: mappedStatus,
          opponent_name: opponentName
        });
      });

      // 5. ترتيب الكل من الأقرب للأبعد زمنياً
      mergedBookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      setBookings(mergedBookings);
    } catch (error: any) {
      console.error(error);
      toast.error("فشل في جلب الحجوزات");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: any) => {
    const confirmCancel = window.confirm("هل أنت متأكد من إلغاء هذا الموعد؟");
    if (!confirmCancel) return;

    try {
      if (booking.type === 'challenge') {
        // إلغاء التحدي
        const { error } = await supabase.from('challenges').update({ status: 'cancelled' }).eq('id', booking.id);
        if (error) throw error;
        toast.success("تم إلغاء التحدي وإشعار الخصم 🛑");
      } else {
        // إلغاء الحجز العادي
        const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
        if (error) throw error;
        toast.success("تم إلغاء الحجز بنجاح 🛑");
      }
      
      // تحديث الواجهة فوراً
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
      
    } catch (error: any) {
      toast.error("فشل في الإلغاء");
    }
  };

  // فلترة حسب التبويب
  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    
    if (activeTab === 'current') return bookingDate >= now && b.status === 'confirmed';
    if (activeTab === 'previous') return bookingDate < now && b.status === 'confirmed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
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
              <div key={booking.id} className={`bg-white/5 backdrop-blur-2xl rounded-[35px] p-7 border space-y-6 shadow-2xl relative overflow-hidden group ${booking.type === 'challenge' ? 'border-purple-500/30' : 'border-white/10'}`}>
                
                {/* بادج التحدي */}
                {booking.type === 'challenge' && (
                  <div className="absolute top-5 left-5 bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                    <Swords size={12} /> تحدي
                  </div>
                )}

                <div className="flex items-center gap-5 text-right">
                  <div className="w-16 h-16 rounded-[22px] overflow-hidden border border-white/10 bg-[#0a0f3c]">
                    <img src={booking.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-xl italic leading-none mb-1 text-white">{booking.court_name}</h3>
                    {booking.type === 'challenge' ? (
                      <p className="text-[10px] font-black text-purple-400 mt-1 uppercase italic">ضد: {booking.opponent_name}</p>
                    ) : (
                      <div className="text-cyan-400 text-[9px] font-black uppercase tracking-widest opacity-60">
                          ID: {booking.id.slice(0,8).toUpperCase()}
                      </div>
                    )}
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
                      onClick={() => handleCancelBooking(booking)}
                      className="w-full py-4.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-[1000] text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                    >
                      <Trash2 size={15} /> {booking.type === 'challenge' ? 'إلغاء التحدي' : 'إلغاء الحجز النهائي'}
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-center opacity-20 py-20 italic font-black uppercase tracking-widest text-gray-500 leading-none">لا توجد مواعيد <br/> في هذا القسم</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}