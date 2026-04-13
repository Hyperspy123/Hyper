import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays, Timer, Loader2, Lock, Swords } from 'lucide-react';
import { toast } from 'sonner';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // استلام بيانات التحدي إن وجدت
  const challengeInfo = location.state as { isChallengeMode?: boolean, opponentId?: string, opponentName?: string };

  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isCheckingTime, setIsCheckingTime] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);

  const cleanId = id ? id.replace(/[^a-f0-9-]/g, '') : '';

  // حساب السعر الإجمالي بناءً على المدة المختار
  const calculateTotalPrice = () => {
    if (!court?.price_per_hour) return 0;
    return (court.price_per_hour * duration) / 60;
  };

  const timeSlots = [
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  const durations = [
    { label: "60 دقيقة", value: 60 },
    { label: "90 دقيقة", value: 90 },
    { label: "120 دقيقة", value: 120 }
  ];

  const fetchBookedSlots = useCallback(async (date: string, courtName: string) => {
    if (!cleanId || !date || !courtName) return;
    setIsCheckingTime(true);
    
    const startOfDay = `${date}T00:00:00+03:00`;
    const endOfDay = `${date}T23:59:59+03:00`;
    const taken: string[] = [];

    try {
      // جلب الحجوزات العادية
      const { data: normalBookings } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('court_id', cleanId)
        .eq('status', 'confirmed')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);

      if (normalBookings) {
        normalBookings.forEach(b => {
           const d = new Date(b.start_time);
           const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Riyadh' });
           taken.push(timeStr);
        });
      }

      // جلب التحديات القائمة
      const { data: challenges } = await supabase
        .from('challenges')
        .select('match_time')
        .eq('court_name', courtName)
        .in('status', ['accepted', 'pending'])
        .gte('match_time', startOfDay)
        .lte('match_time', endOfDay);

      if (challenges) {
        challenges.forEach(ch => {
           const d = new Date(ch.match_time);
           const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Riyadh' });
           taken.push(timeStr);
        });
      }

      setBookedSlots(taken);
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setIsCheckingTime(false);
    }
  }, [cleanId]);

  useEffect(() => {
    const fetchCourt = async () => {
      if (!cleanId) return;
      setLoading(true);
      const { data } = await supabase.from('courts').select('*').eq('id', cleanId).maybeSingle();
      if (data) setCourt(data);
      setLoading(false);
    };
    fetchCourt();
  }, [cleanId]);

  useEffect(() => {
    if (selectedDate && court?.name) {
      fetchBookedSlots(selectedDate, court.name);
      setSelectedTime('');
    }
  }, [selectedDate, court?.name, fetchBookedSlots]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) { 
      toast.error("الرجاء اختيار التاريخ والوقت"); 
      return; 
    }
    
    setBookingInProgress(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    try {
      const startTimeISO = `${selectedDate}T${selectedTime}:00+03:00`;
      const startDate = new Date(startTimeISO);
      const endDate = new Date(startDate.getTime() + duration * 60000);
      const finalPrice = calculateTotalPrice();
      
      if (challengeInfo?.isChallengeMode) {
        // تنفيذ التحدي
        const { error: challengeError } = await supabase.from('challenges').insert([{
          challenger_id: user.id,
          challenged_id: challengeInfo.opponentId,
          court_name: court.name,
          match_time: startTimeISO,
          end_time: endDate.toISOString(),
          duration: duration,
          total_price: finalPrice,
          status: 'pending'
        }]);

        if (challengeError) throw challengeError;
        toast.success(`تم إرسال التحدي لـ ${challengeInfo.opponentName} 🔥`);
        setTimeout(() => navigate('/community'), 1200);
      } else {
        // حجز ملعب عادي
        const { error: bookingError } = await supabase.from('bookings').insert([{ 
          court_id: cleanId, 
          user_id: user.id, 
          start_time: startTimeISO,
          end_time: endDate.toISOString(), 
          total_price: finalPrice,
          status: 'confirmed' 
        }]);

        if (bookingError) throw bookingError;
        toast.success("تم الحجز بنجاح! ننتظرك في الملعب 🎾");
        setTimeout(() => navigate('/my-bookings'), 1000);
      }
    } catch (error: any) {
      toast.error("عذراً، حدث خطأ في العملية");
    } finally {
      setBookingInProgress(false);
    }
  };

  const getDateButtons = () => {
    const dates = [];
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayLabel: i === 0 ? "اليوم" : d.toLocaleDateString('ar-SA', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: months[d.getMonth()]
      });
    }
    return dates;
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-400 font-black italic animate-pulse">HYPE LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      {challengeInfo?.isChallengeMode && (
        <div className="bg-cyan-500 text-[#0a0f3c] px-6 py-2 text-center font-black text-[11px] uppercase italic animate-pulse sticky top-16 z-20 shadow-xl">
          أنت الآن تتحدى {challengeInfo.opponentName} ⚔️
        </div>
      )}

      <main className="px-6 max-w-md mx-auto space-y-8 text-right pt-6">
        {/* صورة الملعب ومعلومات السعر */}
        <div className="relative h-56 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group">
          <img src={court?.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Court" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f3c] via-transparent to-transparent" />
          <div className="absolute bottom-6 right-6">
            <h2 className="text-3xl font-[1000] italic uppercase leading-none">{court?.name}</h2>
            <div className="mt-2 flex items-center gap-2">
               <span className="text-cyan-400 font-black text-2xl italic">{calculateTotalPrice()} SAR</span>
               <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">/ {duration} دقيقة</span>
            </div>
          </div>
        </div>

        {/* اختيار المدة */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر مدة اللعب</span><Timer size={14} /></div>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)} className={`py-4 rounded-2xl border-2 font-black text-[12px] transition-all duration-300 ${duration === d.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* اختيار التاريخ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر اليوم</span><CalendarDays size={14} /></div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {getDateButtons().map((day) => (
              <button key={day.iso} onClick={() => setSelectedDate(day.iso)} className={`min-w-[80px] py-5 rounded-[28px] border-2 flex flex-col items-center transition-all ${selectedDate === day.iso ? 'bg-white text-[#0a0f3c] border-white shadow-xl scale-105' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>
                <span className="text-[10px] font-black mb-1 opacity-60 uppercase">{day.dayLabel}</span>
                <span className="text-2xl font-[1000] leading-none">{day.dateNum}</span>
                <span className="text-[9px] font-black mt-1 opacity-40">{day.month}</span>
              </button>
            ))}
          </div>
        </section>

        {/* اختيار الوقت */}
        <section className="space-y-4 relative">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر وقت البداية</span><Clock size={14} /></div>
          
          {isCheckingTime && (
            <div className="absolute inset-0 z-10 bg-[#0a0f3c]/60 backdrop-blur-sm flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-cyan-400" size={24} /></div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              const isBooked = bookedSlots.includes(slot.id);
              return (
                <button 
                  key={slot.id} 
                  disabled={isBooked || isCheckingTime} 
                  onClick={() => setSelectedTime(slot.id)} 
                  className={`py-5 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center 
                    ${isBooked ? 'bg-black/40 border-white/5 text-red-500/50 opacity-40 cursor-not-allowed' 
                    : selectedTime === slot.id ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg' 
                    : 'bg-[#14224d] border-white/5 text-gray-400'}`}
                >
                  {isBooked ? "محجوز 🚫" : slot.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* زر التأكيد النهائي */}
        <div className="fixed bottom-24 left-0 right-0 px-6 max-w-md mx-auto">
          <button 
            onClick={handleConfirm} 
            disabled={!selectedDate || !selectedTime || bookingInProgress || isCheckingTime} 
            className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all uppercase italic"
          >
            {bookingInProgress ? <Loader2 className="animate-spin" /> : (
              <>
                {challengeInfo?.isChallengeMode ? 'إرسال التحدي النهائي' : 'إتمام الحجز'} 
                <Zap size={22} fill="currentColor" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}