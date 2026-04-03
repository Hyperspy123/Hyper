import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Zap, CalendarDays, Timer, Loader2, Lock, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [viewerCount, setViewerCount] = useState(1);
  
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

  const fetchBookedSlots = useCallback(async (date: string) => {
    if (!cleanId || !date) return;
    
    const startOfDay = `${date}T00:00:00+03:00`;
    const endOfDay = `${date}T23:59:59+03:00`;

    const { data, error } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('court_id', cleanId)
      .eq('status', 'confirmed')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay);

    if (!error && data) {
      const times = data.map(b => {
        const d = new Date(b.start_time);
        return d.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false,
          timeZone: 'Asia/Riyadh' 
        });
      });
      setBookedSlots(times);
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
    if (!cleanId) return;

    const presenceChannel = supabase.channel(`presence-${cleanId}`, {
      config: { presence: { key: 'user' } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        setViewerCount(Object.keys(newState).length || 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    const bookingChannel = supabase
      .channel('booking-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        () => { if (selectedDate) fetchBookedSlots(selectedDate); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(bookingChannel);
    };
  }, [cleanId, selectedDate, fetchBookedSlots]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
      setSelectedTime('');
    }
  }, [selectedDate, fetchBookedSlots]);

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

      const { error: bookingError } = await supabase.from('bookings').insert([{ 
        court_id: cleanId, 
        user_id: user.id, 
        start_time: startTimeISO,
        end_time: endDate.toISOString(), 
        status: 'confirmed' 
      }]);

      if (bookingError) throw bookingError;

      toast.success("تم الحجز بنجاح! رانكك في تطور مستمر 🎾🚀");

      // 🔥 التعديل هنا: التوجيه لصفحة "حجوزاتي" بدلاً من المكافآت
      setTimeout(() => {
        navigate('/my-bookings'); 
      }, 1000);

    } catch (error: any) {
      console.error(error);
      toast.error("عذراً، هذا الوقت قد يكون حُجز للتو");
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

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-400 font-[1000] italic uppercase animate-pulse">HYPE LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-24" dir="rtl">
      <Header />
      <div className="px-6 mt-4 flex justify-end">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${viewerCount > 1 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${viewerCount > 1 ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[10px] font-black uppercase text-cyan-400">{viewerCount} أشخاص يشاهدون الآن</span>
          <Users size={12} className="text-cyan-400" />
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-2xl font-[1000] italic tracking-tighter uppercase">تأكيد الحجز</h1>
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
          <ChevronRight size={22} className="rotate-180" />
        </button>
      </div>
      <main className="px-6 max-w-md mx-auto space-y-8 text-right">
        <div className="bg-[#14224d] rounded-[35px] p-6 border border-white/10 flex items-center gap-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <img src={court?.image_url} className="w-24 h-24 rounded-2xl object-cover border border-white/10 z-10" />
          <div className="text-right z-10">
            <h2 className="text-2xl font-black italic uppercase leading-none mb-2">{court?.name}</h2>
            <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-black text-xs border border-cyan-500/20">{court?.price_per_hour} SAR / ساعة</span>
          </div>
        </div>
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>مدة اللعب</span><Timer size={14} /></div>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)} className={`py-4 rounded-2xl border-2 font-black text-[11px] transition-all duration-300 ${duration === d.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg' : 'bg-[#14224d] border-white/5 text-gray-400'}`}>{d.label}</button>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر التاريخ</span><CalendarDays size={14} /></div>
          <div className="grid grid-cols-4 gap-2">
            {getDateButtons().map((day) => (
              <button key={day.iso} onClick={() => setSelectedDate(day.iso)} className={`flex flex-col items-center justify-center aspect-square rounded-[28px] border-2 transition-all duration-300 ${selectedDate === day.iso ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>
                <span className="text-[8px] font-black mb-1 opacity-60">{day.dayLabel}</span>
                <span className="text-2xl font-[1000] leading-none tracking-tighter">{day.dateNum}</span>
                <span className="text-[8px] font-black mt-1 opacity-60">{day.month}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 justify-end opacity-40 text-[10px] font-black uppercase tracking-widest"><span>اختر الوقت</span><Clock size={14} /></div>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              const isBooked = bookedSlots.includes(slot.id);
              return (
                <button key={slot.id} disabled={isBooked} onClick={() => setSelectedTime(slot.id)} className={`py-5 rounded-2xl border-2 font-black text-xs transition-all relative overflow-hidden flex items-center justify-center ${isBooked ? 'bg-gray-950 border-white/5 text-gray-700 opacity-40' : selectedTime === slot.id ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-400'}`}>
                  {isBooked && <Lock size={12} className="absolute top-2 right-2 opacity-30" />}
                  {slot.label}
                </button>
              );
            })}
          </div>
        </section>
        <button onClick={handleConfirm} disabled={!selectedDate || !selectedTime || bookingInProgress} className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] text-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all mt-6 uppercase italic">
          {bookingInProgress ? <Loader2 className="animate-spin" /> : <>تأكيد الحجز الآن <Zap size={22} className="fill-[#0a0f3c]" /></>}
        </button>
      </main>
    </div>
  );
}