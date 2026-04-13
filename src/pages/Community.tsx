import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Calendar, X, Check, Zap, Clock, ChevronRight, Timer } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<any[]>([]);
  const [acceptedChallenges, setAcceptedChallenges] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // حالات المودال والخطوات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60); 
  const [isSending, setIsSending] = useState(false);

  // السعر الديناميكي المحسوب
  const totalPrice = selectedCourt ? (selectedCourt.price_per_hour * duration) / 60 : 0;

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profiles } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', user.id);
      setPlayers(profiles || []);

      const { data: courtsData } = await supabase.from('courts').select('*');
      setCourts(courtsData || []);

      const { data: challenges } = await supabase
        .from('challenges')
        .select(`*, challenger:challenger_id (id, first_name, current_rank), challenged:challenged_id (id, first_name, current_rank)`)
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`);

      if (challenges) {
        setIncomingChallenges(challenges.filter(c => c.challenged_id === user.id && c.status === 'pending'));
        setAcceptedChallenges(challenges.filter(c => c.status === 'accepted'));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendChallenge = async () => {
    if (!selectedDate || !selectedTime) return toast.error("اختر التاريخ والوقت أولاً");
    
    setIsSending(true);
    const startTimeISO = `${selectedDate}T${selectedTime}:00+03:00`;

    const { error } = await supabase.from('challenges').insert([{
      challenger_id: currentUserId,
      challenged_id: selectedPlayer.id,
      court_name: selectedCourt.name,
      match_time: startTimeISO,
      duration: duration,
      total_price: totalPrice,
      status: 'pending'
    }]);

    if (!error) {
      toast.success(`تم إرسال التحدي لـ ${selectedPlayer.first_name} 🔥`);
      setIsModalOpen(false);
      resetModal();
    } else {
      toast.error(`خطأ: ${error.message}`);
    }
    setIsSending(false);
  };

  const resetModal = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setDuration(60);
    setSelectedCourt(null);
  };

  const updateChallengeStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('challenges').update({ status }).eq('id', id);
    if (!error) {
      toast.success(status === 'accepted' ? "تم قبول التحدي! 🔥" : "تم الرفض");
      fetchData();
    }
  };

  const days = [0, 1, 2, 3, 4].map(i => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { 
      iso: d.toISOString().split('T')[0], 
      label: i === 0 ? "اليوم" : d.toLocaleDateString('ar-SA', { weekday: 'short' }), 
      num: d.getDate() 
    };
  });

  const timeSlots = ["16:00", "17:30", "19:00", "20:30", "22:00", "23:30"];

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-10">
        
        {/* التحديات الواردة */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">
              وصلك تحدي جديد! <Zap size={18} className="text-cyan-400 fill-cyan-400" />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {incomingChallenges.map(ch => (
                <div key={ch.id} className="min-w-[280px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-xl border border-white/20">
                  <h4 className="font-black text-sm">{ch.challenger?.first_name} يبيك بمباراة!</h4>
                  <p className="text-[10px] font-bold opacity-80 mt-1 italic">{ch.court_name} | {ch.duration} دقيقة</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => updateChallengeStatus(ch.id, 'accepted')} className="flex-1 py-2.5 bg-[#0a0f3c] text-white rounded-xl text-[10px] font-black active:scale-95 transition-all">قبول</button>
                    <button onClick={() => updateChallengeStatus(ch.id, 'rejected')} className="flex-1 py-2.5 bg-white/30 text-[#0a0f3c] rounded-xl text-[10px] font-black active:scale-95 transition-all">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* قائمة المجتمع */}
        <section className="space-y-6">
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
          <div className="relative group">
            <Search className="absolute right-5 top-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن خصم..." 
              className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin text-cyan-400 mx-auto" size={32} /> : players.filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
              <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl hover:bg-[#0a0f3c]/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shadow-inner">
                    <User size={28} />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-lg italic text-white leading-none mb-1">{player.first_name}</h4>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase">{player.current_rank}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedPlayer(player); setIsModalOpen(true); }} 
                  className="flex items-center gap-2 bg-cyan-500 text-[#0a0f3c] px-4 py-3 rounded-2xl active:scale-90 transition-all shadow-lg hover:shadow-cyan-500/20 group"
                >
                  <span className="text-[10px] font-black uppercase italic">تحدي</span>
                  <Swords size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* مودال التحدي المطور */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#05081d]/90 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => { setIsModalOpen(false); resetModal(); }} className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            
            <div className="mb-6 text-right">
              <h3 className="text-2xl font-[1000] italic text-white leading-none tracking-tighter">تحدي <span className="text-cyan-400">{selectedPlayer?.first_name}</span></h3>
              <p className="text-[10px] font-black text-gray-500 mt-2 uppercase tracking-widest">{step === 1 ? '1. اختر الملعب' : '2. تفاصيل المباراة'}</p>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                {courts.map(court => (
                  <button key={court.id} onClick={() => { setSelectedCourt(court); setStep(2); }} className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/50 transition-all active:scale-95 group">
                    <img src={court.image_url} className="w-16 h-16 rounded-2xl object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
                    <div className="text-right flex-1">
                      <h4 className="font-black text-white italic text-lg">{court.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{court.price_per_hour} SAR / الساعة</p>
                    </div>
                    <ChevronRight size={20} className="text-cyan-400 rotate-180" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-left-5">
                {/* مدة اللعب والسعر */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-cyan-400 font-black text-xl italic">{totalPrice} SAR</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">المدة <Timer size={12} className="text-cyan-400"/></p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[60, 90, 120].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setDuration(m)} 
                        className={`py-3 rounded-2xl font-black text-xs border-2 transition-all ${duration === m ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' : 'bg-[#14224d] border-white/5 text-gray-500'}`}
                      >
                        {m} دقيقة
                      </button>
                    ))}
                  </div>
                </div>

                {/* اليوم */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 text-right uppercase flex justify-end gap-2 items-center">اليوم <Calendar size={12} className="text-cyan-400"/></p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {days.map(d => (
                      <button 
                        key={d.iso} 
                        onClick={() => setSelectedDate(d.iso)} 
                        className={`min-w-[70px] py-4 rounded-2xl font-black flex flex-col items-center border-2 transition-all ${selectedDate === d.iso ? 'bg-white border-white text-[#0a0f3c] shadow-lg' : 'bg-[#14224d] border-white/5 text-gray-500'}`}
                      >
                        <span className="text-[9px] uppercase">{d.label}</span>
                        <span className="text-lg leading-none mt-1">{d.num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* الوقت */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 text-right uppercase flex justify-end gap-2 items-center">الوقت <Clock size={12} className="text-cyan-400"/></p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(t => (
                      <button 
                        key={t} 
                        onClick={() => setSelectedTime(t)} 
                        className={`py-3 rounded-2xl font-black text-xs border-2 transition-all ${selectedTime === t ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' : 'bg-[#14224d] border-white/5 text-gray-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-xs active:scale-95 transition-all">رجوع</button>
                   <button 
                     onClick={handleSendChallenge} 
                     disabled={!selectedDate || !selectedTime || isSending} 
                     className="flex-[2] py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-[1000] text-sm uppercase italic active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-cyan-500/30"
                   >
                     {isSending ? <Loader2 className="animate-spin mx-auto" size={20} /> : "أرسل التحدي 🔥"}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}