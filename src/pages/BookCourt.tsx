import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  // Logic for the 4 compact date squares
  const getDateButtons = () => {
    const dates = [];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      let label = "";
      if (i === 0) label = "TODAY";
      else if (i === 1) label = "TOMORROW";
      else label = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

      dates.push({
        iso: d.toISOString().split('T')[0],
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

    const { data: taken } = await supabase.from('bookings').select('id')
      .eq('court_id', id).eq('start_time', startTime).eq('status', 'confirmed').maybeSingle();

    if (taken) {
      alert("This slot is already booked. Please choose another time.");
      setBookingInProgress(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert([{ 
      court_id: id, user_id: user.id, start_time: startTime, end_time: endTime, status: 'confirmed'
    }]);

    if (!error) navigate('/my-bookings');
    setBookingInProgress(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c]" />;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-10" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10">
          <ChevronRight size={22} className="text-cyan-400" />
        </button>
        <h1 className="text-xl font-black italic tracking-tighter">BOOKING DETAILS</h1>
      </div>

      <main className="px-6 max-w-md mx-auto space-y-8 text-right">
        
        {/* Court Preview - Smaller */}
        <div className="bg-[#14224d] rounded-3xl p-4 border border-white/5 flex items-center gap-4 shadow-xl">
          <img src={court?.image_url} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
          <div>
            <h2 className="text-lg font-black">{court?.name}</h2>
            <p className="text-cyan-400 font-bold text-sm">{court?.price_per_hour} SAR / Hour</p>
          </div>
        </div>

        {/* Compact Date Grid */}
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
                  : 'bg-[#14224d] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                <span className="text-[8px] font-black">{day.dayLabel}</span>
                <span className="text-lg font-black leading-none my-0.5">{day.dateNum}</span>
                <span className="text-[9px] font-bold opacity-70">{day.month}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Compact Time Grid */}
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

        {/* Action Button */}
        <button 
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || bookingInProgress}
          className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-10 transition-all mt-4"
        >
          {bookingInProgress ? "PROCESSING..." : "CONFIRM BOOKING"}
          <Zap size={20} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}
