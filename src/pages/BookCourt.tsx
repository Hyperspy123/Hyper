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
  
  // Selection States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Fixed Time Slots (90 min sessions)
  const timeSlots = ["16:00", "17:30", "19:00", "20:30", "22:00", "23:30"];
  
  // Generate next 4 days as easy-to-press buttons
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        full: d.toISOString().split('T')[0],
        display: i === 0 ? "اليوم" : d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })
      });
    }
    return days;
  };

  useEffect(() => {
    const fetchCourt = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .eq('id', id) 
          .single();

        if (error) throw error;
        setCourt(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourt();
  }, [id]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setBookingInProgress(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("الرجاء تسجيل الدخول أولاً");
        navigate('/auth');
        return;
      }

      // Prepare timestamps
      const startTime = new Date(`${selectedDate} ${selectedTime}`).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + 90 * 60000).toISOString(); 

      // Check for Double Booking
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('court_id', id)
        .eq('start_time', startTime)
        .eq('status', 'confirmed')
        .maybeSingle();

      if (existing) {
        alert("عذراً، هذا الوقت محجوز بالفعل. يرجى اختيار وقت آخر.");
        setBookingInProgress(false);
        return;
      }

      // Insert Booking
      const { error } = await supabase.from('bookings').insert([
        { 
          court_id: id, 
          user_id: user.id,
          start_time: startTime,
          end_time: endTime,
          status: 'confirmed'
        }
      ]);

      if (error) throw error;

      alert("تم الحجز بنجاح! نراك في الملعب 🎾");
      navigate('/my-bookings');

    } catch (err: any) {
      alert("خطأ في الحجز: " + err.message);
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-10" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
          <ChevronRight size={24} className="text-cyan-400" />
        </button>
        <h1 className="text-2xl font-black italic tracking-tight">احجز ملعبك</h1>
      </div>

      <main className="p-6 max-w-lg mx-auto space-y-10">
        
        {/* Uniform Professional Court Card */}
        <div className="bg-[#14224d] rounded-[32px] p-6 border border-white/5 flex items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-cyan-500 text-[#0a0f3c] text-[10px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-widest">
            {court.type}
          </div>
          <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 shrink-0 mt-2">
            <img 
              src={court.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black mb-1">{court.name}</h2>
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
              <MapPin size={12} className="text-cyan-500" /> الرياض، حي الملقا
            </div>
            <p className="text-cyan-400 font-black text-xl">{court.price_per_hour} ريال</p>
          </div>
        </div>

        {/* Date Button Grid */}
        <section className="space-y-4">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <Calendar size={18} className="text-cyan-500" /> ١. اختر اليوم
          </label>
          <div className="grid grid-cols-2 gap-3">
            {getNextDays().map((day) => (
              <button
                key={day.full}
                onClick={() => setSelectedDate(day.full)}
                className={`py-4 rounded-2xl font-bold text-sm transition-all border ${
                  selectedDate === day.full 
                  ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/30' 
                  : 'bg-[#14224d] border-white/10 text-gray-300'
                }`}
              >
                {day.display}
              </button>
            ))}
          </div>
        </section>

        {/* Time Button Grid */}
        <section className="space-y-4">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <Clock size={18} className="text-cyan-500" /> ٢. اختر الوقت (٩٠ دقيقة)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-4 rounded-2xl font-black text-sm transition-all border ${
                  selectedTime === time 
                  ? 'bg-cyan-500 border-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/30' 
                  : 'bg-[#14224d] border-white/10 text-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        {/* Uniform Professional Confirm Button */}
        <button 
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || bookingInProgress}
          className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[28px] font-black text-xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-10"
        >
          {bookingInProgress ? "جاري الحجز..." : "تأكيد الحجز الآن"}
          <Zap size={22} className="fill-[#0a0f3c]" />
        </button>

      </main>
    </div>
  );
}