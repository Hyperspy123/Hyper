import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays, Timer, Loader2 } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);

  // --- THE ULTIMATE WHITELIST SANITIZER ---
  // This takes the ID from the URL and deletes EVERYTHING except 
  // numbers, letters a-f (hex), and hyphens. 
  // This kills quotes (""), spaces, and special characters dead.
  const getCleanId = (rawId: string | undefined) => {
    if (!rawId) return '';
    return rawId
      .toLowerCase()
      .replace(/[^a-f0-9-]/g, ''); // Whitelist: only hex and hyphens allowed
  };

  const cleanId = getCleanId(id);

  const timeSlots = [
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  const durations = [
    { label: "60 Min", value: 60 },
    { label: "90 Min", value: 90 },
    { label: "120 Min", value: 120 },
  ];

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

  useEffect(() => {
    const fetchCourt = async () => {
      if (!cleanId) return;
      setLoading(true);
      // Using the sanitized ID for the query
      const { data } = await supabase.from('courts').select('*').eq('id', cleanId).maybeSingle();
      if (data) setCourt(data);
      setLoading(false);
    };
    fetchCourt();
  }, [cleanId]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) { 
      alert("الرجاء اختيار التاريخ والوقت"); 
      return; 
    }
    setBookingInProgress(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      navigate('/auth'); 
      return; 
    }

    const localDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

    // We use cleanId strictly here to satisfy Postgres UUID requirements
    const { error: bookingError } = await supabase.from('bookings').insert([{ 
      court_id: cleanId, 
      user_id: user.id, 
      start_time: localDateTime.toISOString(), 
      end_time: new Date(localDateTime.getTime() + duration * 60000).toISOString(), 
      status: 'confirmed' 
    }]);

    if (!bookingError) { 
      navigate('/rewards'); 
    } else { 
      console.error("Supabase Error:", bookingError);
      alert("خطأ في الحجز: " + bookingError.message); 
    }
    setBookingInProgress(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f3c] flex flex-col items-center justify-center text-cyan-400 font-black italic">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p>LOADING...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-24" dir="rtl">
      <Header />
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">تأكيد الحجز</h1>
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 rotate-180 text-cyan-400">
          <ChevronRight size={22} />
        </button>
      </div>

      <main className="px-6 max-w-md mx-auto space-y-8 text-right">
        {/* Court Summary */}
        <div className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex items-center gap-5 shadow-2xl">
          <img src={court?.image_url || court?.image} className="w-20 h-20 rounded-2xl object-cover border border-cyan-400/20 shadow-lg" />
          <div className="text-right">
            <h2 className="text-xl font-black leading-tight mb-1">{court?.name || "ملعب بادل"}</h2>
            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
               <span className="bg-cyan-400/10 px-2 py-0.5 rounded-lg">{court?.price_per_hour || 250} SAR / ساعة</span>
            </div>
          </div>
        </div>

        {/* 1. Duration Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">مدة اللعب</span>
            <Timer size={14} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button 
                key={d.value} 
                onClick={() => setDuration(d.value)} 
                className={`py-3 rounded-2xl border-2 font-black text-[11px] transition-all duration-300 ${
                  duration === d.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] scale-105' : 'bg-[#14224d] border-white/5 text-gray-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Date Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">اختر التاريخ</span>
            <CalendarDays size={14} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {getDateButtons().map((day) => (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`flex flex-col items-center justify-center aspect-square rounded-[24px] border-2 transition-all duration-300 ${
                  selectedDate === day.iso 
                  ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] scale-105 shadow-xl shadow-cyan-500/20' 
                  : 'bg-[#14224d] border-white/5 text-gray-500'
                }`}
              >
                <span className="text-[7px] font-black mb-1">{day.dayLabel}</span>
                <span className="text-xl font-black leading-none">{day.dateNum}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Time Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">اختر الوقت</span>
            <Clock size={14} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTime(slot.id)}
                className={`py-4 rounded-2xl border-2 font-black text-[11px] transition-all duration-300 ${
                  selectedTime === slot.id 
                  ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] scale-105 shadow-lg shadow-cyan-500/20' 
                  : 'bg-[#14224d] border-white/5 text-gray-400'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || bookingInProgress}
          className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[28px] font-black text-xl shadow-[0_15px_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all mt-6"
        >
          {bookingInProgress ? <Loader2 className="animate-spin" /> : "تأكيد الحجز الآن"}
          <Zap size={22} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}