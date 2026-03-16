import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, Clock, Calendar, MapPin, Zap } from 'lucide-react';

export default function BookCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const fetchCourt = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // REMOVED parseInt/Number conversion because your Supabase uses UUID strings
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .eq('id', id) 
          .single();

        if (error) throw error;
        setCourt(data);
      } catch (err) {
        console.error("Fetch error:", err);
        // Error handling: if not found, stay on page to show error state
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [id]);

  const handleConfirm = async () => {
    setBookingInProgress(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("الرجاء تسجيل الدخول أولاً");
      navigate('/auth');
      return;
    }

    const startTime = new Date().toISOString(); 
    const endTime = new Date(Date.now() + 3600000).toISOString(); 

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f3c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-400 font-bold animate-pulse">جاري تحميل بيانات الملعب...</p>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-[#0a0f3c] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="bg-red-500/20 p-6 rounded-3xl border border-red-500/50 mb-6">
          <p className="text-red-400 font-bold">عذراً، لم يتم العثور على هذا الملعب في الرياض</p>
          <p className="text-gray-500 text-sm mt-2">ID: {id}</p>
        </div>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans" dir="rtl">
      <Header />
      
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
          <ChevronRight size={24} className="text-cyan-400" />
        </button>
        <h1 className="text-2xl font-black italic tracking-tight">تأكيد حجزك</h1>
      </div>

      <main className="p-6 max-w-lg mx-auto space-y-6">
        {/* Court Details Card */}
        <div className="bg-[#14224d] rounded-[40px] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 bg-cyan-500 text-[#0a0f3c] text-[10px] font-black px-4 py-1.5 rounded-br-3xl uppercase tracking-widest">
            Confirmed Slot
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <div className="w-24 h-24 rounded-[24px] overflow-hidden border-2 border-cyan-500/20">
              <img 
                src={court.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000'} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1">{court.name}</h2>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <MapPin size={14} className="text-cyan-400" /> حي الملقا، الرياض
              </p>
              <div className="mt-3 inline-block bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
                <span className="text-cyan-400 font-black">{court.price_per_hour} ريال</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date/Time Info */}
        <div className="bg-white/5 rounded-[32px] p-6 space-y-4 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <Calendar size={18} className="text-cyan-500" /> التاريخ المختار
            </span>
            <span className="font-bold">اليوم، ١٦ مارس</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <Clock size={18} className="text-cyan-500" /> مدة الحجز
            </span>
            <span className="font-bold">٦٠ دقيقة</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleConfirm}
          disabled={bookingInProgress}
          className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-black text-xl shadow-[0_20px_40px_rgba(6,182,212,0.3)] hover:shadow-[0_25px_50px_rgba(6,182,212,0.5)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {bookingInProgress ? (
            <div className="w-6 h-6 border-3 border-[#0a0f3c] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>إتمام الدفع والحجز</span>
              <Zap size={20} className="fill-[#0a0f3c]" />
            </>
          )}
        </button>
      </main>
    </div>
  );
}