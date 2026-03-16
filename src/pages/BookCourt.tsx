import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Calendar, Zap, MapPin } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // 1. Clear Time Slots with AM/PM
  const timeSlots = [
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  // 2. Simple logic for the next 4 days as Buttons
  const getDays = () => {
    const days = [];
    const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        iso: d.toISOString().split('T')[0],
        name: i === 0 ? 'اليوم' : names[d.getDay()],
        num: d.getDate()
      });
    }
    return days;
  };

  useEffect(() => {
    const fetchCourt = async () => {
      if (!id) return;
      const { data } = await supabase.from('courts').select('*').eq('id', id).single();
      if (data) setCourt(data);
      setLoading(false);
    };
    fetchCourt();
  }, [id]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setBookingInProgress(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const startTime = new Date(`${selectedDate} ${selectedTime}`).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + 90 * 60000).toISOString(); 

    // Double-booking check: prevents others from booking same place/time
    const { data: taken } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', id)
      .eq('start_time', startTime)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (taken) {
      alert("عذراً، هذا الوقت محجوز بالفعل. يرجى اختيار وقت آخر.");
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
      alert("تم الحجز بنجاح! نراك في الملعب 🎾");
      navigate('/my-bookings');
    }
    setBookingInProgress(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-500 font-black">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-10" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ChevronRight size={24} className="text-cyan-400" />
        </button>
        <h1 className="text-2xl font-black italic">تأكيد الحجز</h1>
      </div>

      <main className="p-6 max-w-lg mx-auto space-y-10">
        
        {/* Step 1: Big Date Buttons */}
        <section className="space-y-4">
          <h3 className="text-gray-400 text-xs font-bold flex items-center gap-2 tracking-widest uppercase">
            ١. اختر التاريخ
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {getDays().map((day) => (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedDate === day.iso 
                  ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg scale-95' 
                  : 'bg-[#14224d] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold">{day.name}</span>
                <span className="text-2xl font-black">{day.num}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Clear Time Buttons */}
        <section className="space-y-4">
          <h3 className="text-gray-400 text-xs font-bold flex items-center gap-2 tracking-widest uppercase">
            ٢. اختر الوقت
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTime(slot.id)}
                className={`py-5 rounded-[24px] border-2 font-black text-sm transition-all ${
                  selectedTime === slot.id 
                  ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg' 
                  : 'bg-[#14224d] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </section>

        {/* Final Button */}
        <button 
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || bookingInProgress}
          className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[32px] font-black text-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-10 transition-all"
        >
          {bookingInProgress ? "جاري الحجز..." : "تأكيد الحجز الآن"}
          <Zap size={24} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}