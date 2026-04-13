import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Calendar, MapPin, X, Check, Zap, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // إعدادات المودال والخطوات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: اختيار ملعب, 2: اختيار وقت
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profiles } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', user.id);
    const { data: challenges } = await supabase.from('challenges').select('*, profiles:challenger_id (first_name)').eq('challenged_id', user.id).eq('status', 'pending');
    const { data: courtsData } = await supabase.from('courts').select('*');
    setPlayers(profiles || []);
    setIncomingChallenges(challenges || []);
    setCourts(courtsData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendChallenge = async () => {
    setIsSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('challenges').insert([{
      challenger_id: user?.id,
      challenged_id: selectedPlayer.id,
      court_name: selectedCourt.name,
      match_time: `${selectedDate}T${selectedTime}:00`,
      status: 'pending'
    }]);

    if (!error) {
      toast.success("تم إرسال التحدي بنجاح 🔥");
      setIsModalOpen(false);
      setStep(1);
    } else {
      toast.error("حدث خطأ");
    }
    setIsSending(false);
  };

  const days = [0, 1, 2, 3].map(i => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { 
      iso: d.toISOString().split('T')[0], 
      label: i === 0 ? "اليوم" : d.toLocaleDateString('ar-EG', { weekday: 'short' }) 
    };
  });

  const times = ["16:00", "17:30", "19:00", "20:30", "22:00", "23:30"];

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-8">
        
        {/* قسم مين يتحداك */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" /></h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {incomingChallenges.map(ch => (
                <div key={ch.id} className="min-w-[280px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-xl">
                  <h4 className="font-black text-sm">{ch.profiles?.first_name} يبيك بمباراة!</h4>
                  <p className="text-[10px] font-black opacity-70">{ch.court_name}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2.5 bg-[#0a0f3c] text-white rounded-xl text-[10px] font-black">قبول التحدي</button>
                    <button className="flex-1 py-2.5 bg-white/30 text-[#0a0f3c] rounded-xl text-[10px] font-black">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* قائمة اللاعبين */}
        <section className="space-y-6">
          <h1 className="text-3xl font-[1000] italic uppercase">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
          <div className="relative">
            <Search className="absolute right-5 top-5 text-gray-500" size={20} />
            <input type="text" placeholder="ابحث عن خصم..." className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin text-cyan-400 mx-auto" /> : players.filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
              <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10"><User size={24} /></div>
                  <div className="text-right">
                    <h4 className="font-black text-lg italic text-white">{player.first_name}</h4>
                    <span className="text-[10px] font-black text-cyan-400 uppercase">{player.current_rank}</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedPlayer(player); setIsModalOpen(true); }} className="p-4 bg-cyan-500 text-[#0a0f3c] rounded-[22px] active:scale-90 transition-all"><Swords size={20} /></button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* مودال التحدي الذكي (الخطوات) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#05081d]/90 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
            <button onClick={() => { setIsModalOpen(false); setStep(1); }} className="absolute top-6 left-6 text-gray-500"><X size={24}/></button>
            
            <div className="mb-8 text-right">
              <h3 className="text-2xl font-[1000] italic text-white leading-none">تحدي <span className="text-cyan-400">{selectedPlayer?.first_name}</span></h3>
              <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase italic tracking-widest">{step === 1 ? 'الخطوة 1: اختر الملعب' : 'الخطوة 2: حدد الموعد'}</p>
            </div>

            {step === 1 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {courts.map(court => (
                  <button key={court.id} onClick={() => { setSelectedCourt(court); setStep(2); }} className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/50 transition-all group">
                    <img src={court.image_url} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="text-right flex-1">
                      <h4 className="font-black text-white italic">{court.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase italic mt-1">{court.price_per_hour} SAR / ساعة</p>
                    </div>
                    <ChevronRight size={20} className="text-cyan-400 rotate-180" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-left-5">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 text-right uppercase italic px-2">اختر اليوم</p>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map(d => (
                      <button key={d.iso} onClick={() => setSelectedDate(d.iso)} className={`py-3 rounded-2xl font-black text-[10px] border-2 transition-all ${selectedDate === d.iso ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/5 text-gray-500'}`}>{d.label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 text-right uppercase italic px-2">اختر الوقت</p>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)} className={`py-4 rounded-2xl font-black text-[10px] border-2 transition-all ${selectedTime === t ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/5 text-gray-500'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white/5 text-gray-400 rounded-3xl font-black text-xs uppercase italic active:scale-95 transition-all">رجوع</button>
                   <button onClick={handleSendChallenge} disabled={!selectedDate || !selectedTime || isSending} className="flex-[2] py-5 bg-cyan-500 text-[#0a0f3c] rounded-3xl font-[1000] text-xs uppercase italic active:scale-95 transition-all shadow-xl shadow-cyan-500/20">
                     {isSending ? <Loader2 className="animate-spin mx-auto" size={20} /> : "إرسال التحدي 🔥"}
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