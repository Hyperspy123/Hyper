import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Calendar, MapPin, Zap, Check } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  // New States for Selection
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = ["16:00", "17:30", "19:00", "20:30", "22:00", "23:30"];

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
    if (!selectedDate || !selectedTime) {
      alert("الرجاء اختيار التاريخ والوقت أولاً");
      return;
    }

    setBookingInProgress(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("الرجاء تسجيل الدخول أولاً");
      navigate('/auth');
      return;
    }

    // Combine Date and Time for Supabase Timestamp
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    // Adding 90 minutes for a standard Padel match
    const endTime = new Date(new Date(startTime).getTime() + 90 * 60000).toISOString(); 

    const { error } = await supabase.from('bookings').insert([
      { 
        court_id: id, 
        user_id: user.id,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed'
      }
    ]);

    if (!error) {
      alert("تم الحجز بنجاح! نراك في الملعب 🎾");
      navigate('/my-bookings');
    } else {
      alert("خطأ في الحجز: " + error.message);
    }
    setBookingInProgress(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ChevronRight size={24} className="text-cyan-400" />
        </button>
        <h1 className="text-2xl font-black italic">تأكيد حجزك</h1>
      </div>

      <main className="p-6 max-w-lg mx-auto space-y-8">
        {/* Court Info */}
        <div className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex items-center gap-4">
          <img src={court.image_url} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
          <div>
            <h2 className="text-xl font-bold">{court.name}</h2>
            <p className="text-cyan-400 font-bold">{court.price_per_hour} ريال / ساعة</p>
          </div>
        </div>

        {/* Date Selection */}
        <section>
          <label className="text-gray-400 text-sm mb-3 block flex items-center gap-2">
            <Calendar size={16} /> اختر التاريخ
          </label>
          <input 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#14224d] border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-500"
          />
        </section>

        {/* Time Selection Grid */}
        <section>
          <label className="text-gray-400 text-sm mb-3 block flex items-center gap-2">
            <Clock size={16} /> اختر الوقت (٩٠ دقيقة)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-4 rounded-2xl font-bold transition-all ${
                  selectedTime === time 
                    ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' 
                    : 'bg-[#14224d] border border-white/5 text-gray-400'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        {/* Final Confirmation Button */}
        <button 
          onClick={handleConfirm}
          disabled={bookingInProgress || !selectedDate || !selectedTime}
          className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-black text-xl shadow-xl disabled:opacity-30 transition-all flex items-center justify-center gap-2"
        >
          {bookingInProgress ? "جاري الحجز..." : "تأكيد الحجز الآن"}
          {!bookingInProgress && <Check size={20} />}
        </button>
      </main>
    </div>
  );
}