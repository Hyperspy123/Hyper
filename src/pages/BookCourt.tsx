import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Calendar, Zap, MapPin, Timer } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(90); 

  // AM/PM Time Slots
  const timeSlots = [
    { id: "08:00", label: "08:00 AM" },
    { id: "10:00", label: "10:00 AM" },
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  const durations = [
    { label: "٦٠ دقيقة", value: 60 },
    { label: "٩٠ دقيقة", value: 90 },
    { label: "١٢٠ دقيقة", value: 120 },
  ];

  useEffect(() => {
    const fetchCourt = async () => {
      if (!id) return;
      setLoading(true);
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
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString(); 

    const { error } = await supabase.from('bookings').insert([{ 
      court_id: id, user_id: user.id, start_time: startTime, end_time: endTime, status: 'confirmed'
    }]);

    if (!error) {
      alert("تم الحجز بنجاح!");
      navigate('/my-bookings');
    } else {
      alert("Error: " + error.message);
    }
    setBookingInProgress(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c]" />;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-10" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ChevronRight size={24} className="text-cyan-400" />
        </button>
        <h1 className="text-2xl font-black italic">تأكيد الحجز</h1>
      </div>

      <main className="p-6 max-w-lg mx-auto space-y-8">
        
        {/* Uniform Court Card */}
        <div className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex items-center gap-5 shadow-2xl">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-white/10">
            <img 
              src={court?.image_url || 'https://images.unsplash.com/photo-1626225967045-9c76db7b3ed4'} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h2 className="text-xl font-black">{court?.name}</h2>
            <p className="text-cyan-400 font-black text-lg">{court?.price_per_hour} ريال</p>
          </div>
        </div>

        {/* 1. Duration Selection */}
        <section className="space-y-4">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <Timer size={18} className="text-cyan-500" /> مدة اللعب
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button 
                key={d.value} 
                onClick={() => setDuration(d.value)} 
                className={`py-3 rounded-xl font-bold text-xs border ${duration === d.value ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-400'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Date Selection */}
        <section className="space-y-4">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <Calendar size={18} className="text-cyan-500" /> اختر اليوم
          </label>
          <input 
            type="date" 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="w-full bg-[#14224d] border border-white/5 p-4 rounded-2xl outline-none" 
            style={{ colorScheme: 'dark' }} 
          />
        </section>

        {/* 3. Time Selection (AM/PM Buttons) */}
        <section className="space-y-4">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <Clock size={18} className="text-cyan-500" /> اختر الوقت
          </label>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTime(slot.id)}
                className={`py-4 rounded-2xl font-black text-sm border transition-all ${
                  selectedTime === slot.id 
                  ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' 
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
          className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[28px] font-black text-xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20"
        >
          {bookingInProgress ? "جاري..." : "تأكيد الحجز"}
          <Zap size={22} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}