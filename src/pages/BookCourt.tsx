import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays, Timer, Loader2, Lock, Users } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [viewerCount, setViewerCount] = useState(1); // Live counter state
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);

  const cleanId = id ? id.replace(/[^a-f0-9-]/g, '') : '';

  const timeSlots = [
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  const durations = [{ label: "60 Min", value: 60 }, { label: "90 Min", value: 90 }, { label: "120 Min", value: 120 }];

  const fetchBookedSlots = async (date: string) => {
    if (!cleanId || !date) return;
    const { data } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('court_id', cleanId)
      .eq('status', 'confirmed')
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`);

    if (data) {
      const times = data.map(b => {
        const d = new Date(b.start_time);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      });
      setBookedSlots(times);
    }
  };

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
    if (!cleanId) return;

    // --- REALTIME PRESENCE (Live Counter) ---
    const presenceChannel = supabase.channel(`presence-${cleanId}`, {
      config: { presence: { key: 'user' } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const totalViewers = Object.keys(newState).length;
        setViewerCount(totalViewers > 0 ? totalViewers : 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    // --- REALTIME BOOKINGS ---
    const bookingChannel = supabase
      .channel('booking-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bookings', filter: `court_id=eq.${cleanId}` }, 
        () => { if (selectedDate) fetchBookedSlots(selectedDate); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(bookingChannel);
    };
  }, [cleanId, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
      setSelectedTime('');
    }
  }, [selectedDate]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) { alert("الرجاء اختيار التاريخ والوقت"); return; }
    setBookingInProgress(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const localDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const { error: bookingError } = await supabase.from('bookings').insert([{ 
      court_id: cleanId, 
      user_id: user.id, 
      start_time: localDateTime.toISOString(), 
      end_time: new Date(localDateTime.getTime() + duration * 60000).toISOString(), 
      status: 'confirmed' 
    }]);

    if (!bookingError) { navigate('/rewards'); } 
    else { alert("خطأ في الحجز: " + bookingError.message); }
    setBookingInProgress(false);
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

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-400 font-black italic uppercase">HYPE LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-24" dir="rtl">
      <Header />
      
      {/* 🚀 LIVE VIEWER COUNTER BADGE */}
      <div className="px-6 mt-4 flex justify-end">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${viewerCount > 1 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${viewerCount > 1 ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-gray-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter text-cyan-400">
            {viewerCount} أشخاص يشاهدون الملعب الآن
          </span>
          <Users size={12} className="text-cyan-400" />
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">تأكيد الحجز</h1>
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 rotate-180 text-cyan-400"><ChevronRight size={22} /></button>
      </div>

      <main className="px-6 max-w-md mx-auto space-y-8 text-right">
        {/* Court Card */}
        <div className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex items-center gap-5 shadow-2xl">
          <img src={court?.image_url || court?.image} className="w-20 h-20 rounded-2xl object-cover border border-cyan-400/20 shadow-lg" />
          <div className="text-right">
            <h2 className="text-xl font-black mb-1">{court?.name || "ملعب بادل"}</h2>
            <span className="text-cyan-400 font-black text-sm">{court?.price_per_hour || 250} SAR / ساعة</span>
          </div>
        </div>

        {/* 1. Duration */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>مدة اللعب</span><Timer size={14} /></div>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)} className={`py-3 rounded-2xl border-2 font-black text-[11px] transition-all ${duration === d.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-400'}`}>{d.label}</button>
            ))}
          </div>
        </section>

        {/* 2. Date */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر التاريخ</span><CalendarDays size={14} /></div>
          <div className="grid grid-cols-4 gap-2">
            {getDateButtons().map((day) => (
              <button key={day.iso} onClick={() => setSelectedDate(day.iso)} className={`flex flex-col items-center justify-center aspect-square rounded-[24px] border-2 transition-all ${selectedDate === day.iso ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>
                <span className="text-[7px] font-black mb-1">{day.dayLabel}</span>
                <span className="text-xl font-black leading-none">{day.dateNum}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Time Slots */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر الوقت</span><Clock size={14} /></div>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              const isBooked = bookedSlots.includes(slot.id);
              return (
                <button 
                  key={slot.id} 
                  disabled={isBooked}
                  onClick={() => setSelectedTime(slot.id)} 
                  className={`py-4 rounded-2xl border-2 font-black text-[11px] transition-all relative overflow-hidden flex items-center justify-center ${
                    isBooked 
                    ? 'bg-gray-900/50 border-white/5 text-gray-700 cursor-not-allowed grayscale opacity-50' 
                    : selectedTime === slot.id 
                      ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' 
                      : 'bg-[#14224d] border-white/5 text-gray-400'
                  }`}
                >
                  {isBooked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-[60%] h-[1px] bg-red-500/50 rotate-12 absolute" />
                      <Lock size={12} className="opacity-40 text-red-500" />
                    </div>
                  )}
                  {slot.label}
                </button>
              );
            })}
          </div>
        </section>

        <button onClick={handleConfirm} disabled={!selectedDate || !selectedTime || bookingInProgress} className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[28px] font-black text-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all mt-6">
          {bookingInProgress ? <Loader2 className="animate-spin" /> : "تأكيد الحجز الآن"}
          <Zap size={22} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}