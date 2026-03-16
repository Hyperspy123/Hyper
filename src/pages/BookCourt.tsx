import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays, Timer } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(90);

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
      
      let label = i === 0 ? "TODAY" : i === 1 ? "TOMORROW" : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      dates.push({
        iso: `${year}-${month}-${day}`, // Local date format
        dayLabel: label,
        dateNum: d.getDate(),
        month: months[d.getMonth()]
      });
    }
    return dates;
  };

  useEffect(() => {
    const fetchCourt = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase.from('courts').select('*').eq('id', id).maybeSingle();
      if (data) {
        setCourt(data);
      } else {
        console.error("Court not found or error:", error);
      }
      setLoading(false);
    };
    fetchCourt();
  }, [id]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      alert("الرجاء اختيار التاريخ والوقت");
      return;
    }
    setBookingInProgress(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      alert("الرجاء تسجيل الدخول أولاً");
      navigate('/auth'); 
      return; 
    }

    // --- FIX FOR TIMING MISMATCH ---
    // Create the date object using current local timezone (Riyadh)
    // Format: YYYY-MM-DDTHH:MM:00
    const localDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    
    // Convert to ISO string for Supabase (this will include the UTC 'Z')
    const startTime = localDateTime.toISOString();
    const endTime = new Date(localDateTime.getTime() + duration * 60000).toISOString(); 

    // Check availability
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', id)
      .eq('start_time', startTime)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (existing) {
      alert("عذراً، هذا الوقت محجوز بالفعل!");
      setBookingInProgress(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert([{ 
      court_id: id, 
      user_id: user.id, 
      start_time: startTime, 
      end_time: endTime, 
      status: 'confirmed'
    }]);

    if (!error) {
      navigate('/my-bookings');
    } else {
      alert("خطأ في الحجز: " + error.message);
    }
    setBookingInProgress(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-500 font-black">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-24" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10">
          <ChevronRight size={22} className="text-cyan-400" />
        </button>
        <h1 className="text-xl font-black italic tracking-tighter uppercase">تفاصيل الحجز</h1>
      </div>

      <main className="px-6 max-w-md mx-auto space-y-6 text-right">
        
        {/* Court Card */}
        <div className="bg-[#14224d] rounded-3xl p-4 border border-white/5 flex items-center gap-4 shadow-xl">
          <img src={court?.image_url} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
          <div className="text-left">
            <h2 className="text-lg font-black leading-tight">{court?.name || "ملعب بادل"}</h2>
            <p className="text-cyan-400 font-bold text-sm">{court?.price_per_hour || 250} SAR / ساعة</p>
          </div>
        </div>

        {/* 1. Duration */}
        <section className="space-y-3">
          <p className="text-gray-400 text-[10px] font-black tracking-[3px] uppercase flex items-center gap-2 justify-end">
             مدة اللعب <Timer size={14} className="text-cyan-500" />
          </p>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button 
                key={d.value} 
                onClick={() => setDuration(d.value)} 
                className={`py-2 rounded-xl border-2 font-black text-[10px] transition-all ${
                  duration === d.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Date Grid */}
        <section className="space-y-3">
          <p className="text-gray-400 text-[10px] font-black tracking-[3px] uppercase flex items-center gap-2 justify-end">
             اختر التاريخ <CalendarDays size={14} className="text-cyan-500" />
          </p>
          <div className="grid grid-cols-4 gap-2">
            {getDateButtons().map((day) => (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border-2 transition-all ${
                  selectedDate === day.iso 
                  ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' 
                  : 'bg-[#14224d] border-white/5 text-gray-400'
                }`}
              >
                <span className="text-[8px] font-black leading-none">{day.dayLabel}</span>
                <span className="text-lg font-black leading-none my-1">{day.dateNum}</span>
                <span className="text-[9px] font-bold opacity-70">{day.month}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Time Grid */}
        <section className="space-y-3">
          <p className="text-gray-400 text-[10px] font-black tracking-[3px] uppercase flex items-center gap-2 justify-end">
             اختر الوقت <Clock size={14} className="text-cyan-500" />
          </p>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTime(slot.id)}
                className={`py-3 rounded-xl border-2 font-black text-[10px] transition-all ${
                  selectedTime === slot.id 
                  ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' 
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
          className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-10 transition-all mt-4 mb-10"
        >
          {bookingInProgress ? "جاري الحجز..." : "تأكيد الحجز الآن"}
          <Zap size={20} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}