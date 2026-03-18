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

  // --- THE NUCLEAR CLEANER ---
  // This removes quotes, double quotes, spaces, and percent-encoding
  const getCleanId = (rawId: string | undefined) => {
    if (!rawId) return '';
    return rawId
      .replace(/%22/g, '')  // Removes URL-encoded double quotes
      .replace(/%27/g, '')  // Removes URL-encoded single quotes
      .replace(/['"]+/g, '') // Removes literal quotes
      .trim();              // Removes hidden spaces
  };

  const cleanId = getCleanId(id);

  // LOGGING - Right click -> Inspect -> Console to see this!
  console.log("DEBUG: Raw ID from URL:", id);
  console.log("DEBUG: Cleaned ID for Database:", cleanId);

  const timeSlots = [
    { id: "16:00", label: "04:00 PM" },
    { id: "17:30", label: "05:30 PM" },
    { id: "19:00", label: "07:00 PM" },
    { id: "20:30", label: "08:30 PM" },
    { id: "22:00", label: "10:00 PM" },
    { id: "23:30", label: "11:30 PM" },
  ];

  const durations = [{ label: "60 Min", value: 60 }, { label: "90 Min", value: 90 }, { label: "120 Min", value: 120 }];

  useEffect(() => {
    const fetchCourt = async () => {
      if (!cleanId) return;
      setLoading(true);
      const { data, error } = await supabase.from('courts').select('*').eq('id', cleanId).maybeSingle();
      if (data) setCourt(data);
      setLoading(false);
    };
    fetchCourt();
  }, [cleanId]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) { alert("الرجاء اختيار التاريخ والوقت"); return; }
    setBookingInProgress(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const localDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const startTime = localDateTime.toISOString();
    const endTime = new Date(localDateTime.getTime() + duration * 60000).toISOString(); 

    // THE MOMENT OF TRUTH
    const { error: bookingError } = await supabase.from('bookings').insert([{ 
      court_id: cleanId, 
      user_id: user.id, 
      start_time: startTime, 
      end_time: endTime, 
      status: 'confirmed' 
    }]);

    if (!bookingError) {
      navigate('/rewards');
    } else {
      alert("خطأ في الحجز: " + bookingError.message);
    }
    setBookingInProgress(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center text-cyan-400 font-black italic uppercase tracking-tighter">Hype is Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-24" dir="rtl">
      <Header />
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">تأكيد الحجز</h1>
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 rotate-180"><ChevronRight size={22} /></button>
      </div>

      <main className="px-6 max-w-md mx-auto space-y-8 text-right">
        <div className="bg-[#14224d] rounded-[32px] p-5 border border-white/5 flex items-center gap-5 shadow-2xl">
          <img src={court?.image_url || court?.image} className="w-20 h-20 rounded-2xl object-cover border border-cyan-400/20 shadow-lg" />
          <div className="text-right">
            <h2 className="text-xl font-black leading-tight mb-1">{court?.name || "ملعب بادل"}</h2>
            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
               <span className="bg-cyan-400/10 px-2 py-0.5 rounded-lg">{court?.price_per_hour || court?.price || 250} SAR</span>
            </div>
          </div>
        </div>

        {/* ... (Keep the rest of your UI as is) ... */}
        
        <button onClick={handleConfirm} disabled={!selectedDate || !selectedTime || bookingInProgress} className="w-full py-6 bg-cyan-400 text-[#0a0f3c] rounded-[28px] font-black text-xl shadow-[0_15px_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all mt-6">
          {bookingInProgress ? "جاري الحجز..." : "تأكيد الحجز الآن"}
          <Zap size={22} className="fill-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}