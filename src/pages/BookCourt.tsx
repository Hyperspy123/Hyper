import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays, Timer, Loader2, Lock, Users, Swords, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const challengeInfo = location.state as { isChallengeMode?: boolean, opponentId?: string, opponentName?: string };

  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [viewerCount, setViewerCount] = useState(1);
  const [isCheckingTime, setIsCheckingTime] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);

  const cleanId = id ? id.replace(/[^a-f0-9-]/g, '') : '';

  // حساب السعر الإجمالي بناءً على المدة
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

  const durations = [{ label: "60 Min", value: 60 }, { label: "90 Min", value: 90 }, { label: "120 Min", value: 120 }];

  const fetchBookedSlots = useCallback(async (date: string, courtName: string) => {
    if (!cleanId || !date || !courtName) return;
    setIsCheckingTime(true);
    
    const startOfDay = `${date}T00:00:00+03:00`;
    const endOfDay = `${date}T23:59:59+03:00`;
    const taken: string[] = [];

    try {
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
      
      if (challengeInfo?.isChallengeMode) {
        // 🔥 تحديث التحدي ليرسل المدة ووقت النهاية أيضاً
        const { error: challengeError } = await supabase.from('challenges').insert([{
          challenger_id: user.id,
          challenged_id: challengeInfo.opponentId,
          court_name: court.name,
          match_time: startTimeISO,
          end_time: endDate.toISOString(), // حفظ وقت النهاية لمنع التعارض
          duration: duration,
          total_price: calculateTotalPrice(),
          status: 'pending'
        }]);

        if (challengeError) throw challengeError;
        toast.success(`تم إرسال التحدي لـ ${challengeInfo.opponentName} 🔥`);
        setTimeout(() => navigate('/community'), 1200);
      } else {
        // الحجز العادي
        const { error: bookingError } = await supabase.from('bookings').insert([{ 
          court_id: cleanId, 
          user_id: user.id, 
          start_time: startTimeISO,
          end_time: endDate.toISOString(), 
          total_price: calculateTotalPrice(),
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
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayLabel: i === 0 ? "TODAY" : i === 1 ? "TOMORROW" : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dateNum: d.getDate(),
        month: months[d.getMonth()]
      });
    }
    return dates;
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-400 font-[1000] italic animate-pulse">HYPE LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      {challengeInfo?.isChallengeMode && (
        <div className="bg-cyan-500 text-[#0a0f3c] px-6 py-2 text-center font-black text-[10px] uppercase italic animate-bounce shadow-lg">
          وضع التحدي: اختر تفاصيل مباراتك ضد {challengeInfo.opponentName} ⚔️
        </div>
      )}

      <main className="px-6 max-w-md mx-auto space-y-8 text-right pt-10">
        {/* بطاقة الملعب مع السعر المتغير */}
        <div className="bg-[#14224d] rounded-[35px] p-6 border border-white/10 flex items-center gap-5 shadow-2xl relative overflow-hidden group">
          <img src={court?.image_url} className="w-24 h-24 rounded-2xl object-cover border border-white/10" />
          <div className="text-right">
            <h2 className="text-2xl font-black italic uppercase leading-none mb-2">{court?.name}</h2>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">إجمالي المبلغ:</span>
              <span className="text-cyan-400 font-black text-xl italic">{calculateTotalPrice()} SAR</span>
            </div>
          </div>
        </div>

        {/* ✅ قسم اختيار المدة - متاح للكل الآن */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>مدة اللعب (يتغير السعر بناءً عليها)</span><Timer size={14} /></div>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)} className={`py-4 rounded-2xl border-2 font-black text-[11px] transition-all duration-300 ${duration === d.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg' : 'bg-[#14224d] border-white/5 text-gray-400'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر التاريخ</span><CalendarDays size={14} /></div>
          <div className="grid grid-cols-4 gap-2">
            {getDateButtons().map((day) => (
              <button key={day.iso} onClick={() => setSelectedDate(day.iso)} className={`flex flex-col items-center justify-center aspect-square rounded-[28px] border-2 transition-all ${selectedDate === day.iso ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>
                <span className="text-[8px] font-black mb-1 opacity-60">{day.dayLabel}</span>
                <span className="text-2xl font-[1000] leading-none">{day.dateNum}</span>
                <span className="text-[8px] font-black mt-1 opacity-60">{day.month}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4 relative">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر الوقت</span><Clock size={14} /></div>
          
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
                  className={`py-5 rounded-2xl border-2 font-black text-xs transition-all relative overflow-hidden flex items-center justify-center 
                    ${isBooked ? 'bg-gray-950 border-white/5 text-red-500/70 opacity-50 cursor-not-allowed' 
                    : selectedTime === slot.id ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' 
                    : 'bg-[#14224d] border-white/5 text-gray-400'}`}
                >
                  {isBooked ? <span className="flex items-center gap-1 text-[10px]"><Lock size={12} /> محجوز</span> : slot.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ملخص الحجز الصغير فوق الزر */}
        {(selectedDate && selectedTime) && (
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
             <div className="text-left">
                <p className="text-[8px] font-black text-gray-500 uppercase">الإجمالي</p>
                <p className="text-xl font-black text-cyan-400 italic">{calculateTotalPrice()} SAR</p>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black text-gray-400 uppercase">موعد المباراة</p>
                <p className="text-[11px] font-bold text-white">{selectedTime} | {duration} دقيقة</p>
             </div>
          </div>
        )}

        <button 
          onClick={handleConfirm} 
          disabled={!selectedDate || !selectedTime || bookingInProgress || isCheckingTime} 
          className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all uppercase italic"
        >
          {bookingInProgress ? <Loader2 className="animate-spin" /> : (
            <>
              {challengeInfo?.isChallengeMode ? 'إرسال التحدي' : 'تأكيد الحجز'} 
              <Zap size={22} className="fill-[#0a0f3c]" />
            </>
          )}
        </button>
      </main>
    </div>
  );
}