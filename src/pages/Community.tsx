import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Calendar, MapPin, X, Check, Zap, Clock, ChevronRight, ShieldAlert } from 'lucide-react';
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

  // حالات المودال والخطوات (لإنشاء تحدي)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSending, setIsSending] = useState(false);

  // حالة شاشة المواجهة (VS)
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: profiles } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', user.id);
    setPlayers(profiles || []);

    const { data: courtsData } = await supabase.from('courts').select('*');
    setCourts(courtsData || []);

    const { data: challenges } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id (id, first_name, current_rank, total_matches),
        challenged:challenged_id (id, first_name, current_rank, total_matches)
      `)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`);

    if (challenges) {
      setIncomingChallenges(challenges.filter(c => c.challenged_id === user.id && c.status === 'pending'));
      setAcceptedChallenges(challenges.filter(c => c.status === 'accepted'));
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase.channel('live_challenges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleSendChallenge = async () => {
    setIsSending(true);
    const startTimeISO = `${selectedDate}T${selectedTime}:00+03:00`;

    const { error } = await supabase.from('challenges').insert([{
      challenger_id: currentUserId,
      challenged_id: selectedPlayer.id,
      court_name: selectedCourt.name,
      match_time: startTimeISO,
      players_count: 2,
      status: 'pending'
    }]);

    if (!error) {
      toast.success(`تم إرسال التحدي لـ ${selectedPlayer.first_name} 🔥`);
      setIsModalOpen(false);
      setStep(1); setSelectedDate(''); setSelectedTime('');
    } else {
      toast.error(`حدث خطأ: ${error.message}`);
    }
    setIsSending(false);
  };

  const updateChallengeStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('challenges').update({ status }).eq('id', id);
    if (!error) {
      toast.success(status === 'accepted' ? "تم قبول التحدي! موعدنا الملعب 🎾" : "تم الرفض");
      fetchData();
    }
  };

  const days = [0, 1, 2, 3].map(i => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { iso: d.toISOString().split('T')[0], label: i === 0 ? "اليوم" : d.toLocaleDateString('ar-EG', { weekday: 'short' }) };
  });

  const timeSlots = [
    { value: "16:00", label: "04:00 PM" }, { value: "17:30", label: "05:30 PM" },
    { value: "19:00", label: "07:00 PM" }, { value: "20:30", label: "08:30 PM" },
    { value: "22:00", label: "10:00 PM" }, { value: "23:30", label: "11:30 PM" },
  ];

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-10">
        
        {/* 1. قسم مين يتحداك */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" /></h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {incomingChallenges.map(ch => (
                <div key={ch.id} className="min-w-[280px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-xl border border-cyan-400/50">
                  <h4 className="font-black text-sm">{ch.challenger?.first_name} يبيك بمباراة!</h4>
                  <p className="text-[10px] font-black opacity-70 mt-1 uppercase italic">
                    {ch.court_name} | {new Date(ch.match_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => updateChallengeStatus(ch.id, 'accepted')} className="flex-1 py-2.5 bg-[#0a0f3c] text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all"><Check size={14}/> قبول</button>
                    <button onClick={() => updateChallengeStatus(ch.id, 'rejected')} className="flex-1 py-2.5 bg-white/30 text-[#0a0f3c] rounded-xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all"><X size={14}/> رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. قسم مبارياتك القادمة */}
        {acceptedChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end text-purple-400">مبارياتك القادمة <Swords size={18} /></h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {acceptedChallenges.map(match => {
                const isChallenger = match.challenger_id === currentUserId;
                const opponent = isChallenger ? match.challenged : match.challenger;
                
                return (
                  <button key={match.id} onClick={() => setSelectedMatch({ match, opponent, isChallenger })} className="min-w-[280px] bg-[#1a0b2e] border border-purple-500/30 p-5 rounded-[30px] shadow-xl shadow-purple-900/20 active:scale-95 transition-all group text-right flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-purple-300">ضد {opponent?.first_name}</h4>
                      <p className="text-[10px] font-black text-gray-400 mt-1 uppercase italic">{new Date(match.match_time).toLocaleDateString('ar-EG')} - {new Date(match.match_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <ShieldAlert size={20} />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 3. قائمة اللاعبين */}
        <section className="space-y-6">
          <h1 className="text-3xl font-[1000] italic uppercase">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
          <div className="relative">
            <Search className="absolute right-5 top-5 text-gray-500" size={20} />
            <input type="text" placeholder="ابحث عن خصم..." className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin text-cyan-400 mx-auto" size={32} /> : players.filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
              <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10"><User size={28} /></div>
                  <div className="text-right">
                    <h4 className="font-black text-lg italic text-white leading-none mb-1">{player.first_name}</h4>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-tighter">{player.current_rank}</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedPlayer(player); setIsModalOpen(true); }} className="p-4 bg-cyan-500 text-[#0a0f3c] rounded-[22px] active:scale-90 transition-all shadow-lg shadow-cyan-500/20"><Swords size={22} /></button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 🔥 مودال المواجهة الكبرى (VS Screen) 🔥 */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#05081d]/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-md relative overflow-y-auto max-h-[90vh] pb-8 custom-scrollbar">
            <button onClick={() => setSelectedMatch(null)} className="absolute -top-4 left-0 text-white/50 hover:text-white p-2 z-10"><X size={28}/></button>
            
            <div className="text-center mb-6 mt-6 space-y-2">
              <h2 className="text-4xl font-[1000] italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-widest">المواجهة الكبرى</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedMatch.match.court_name} | {new Date(selectedMatch.match.match_time).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div className="flex items-center justify-between bg-[#0a0f3c]/80 border border-white/10 p-6 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="flex flex-col items-center gap-3 z-10 w-1/3">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-[20px] border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <User size={28} className="text-cyan-400" />
                </div>
                <div className="text-center">
                  <h4 className="font-black text-xs text-white">أنت</h4>
                  <p className="text-[8px] font-black text-cyan-400 uppercase mt-1">{selectedMatch.isChallenger ? selectedMatch.match.challenger.current_rank : selectedMatch.match.challenged.current_rank}</p>
                </div>
              </div>

              <div className="z-10 flex flex-col items-center animate-pulse">
                <div className="bg-gradient-to-br from-purple-500 to-cyan-500 p-3 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  <Swords size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-[1000] italic mt-2 text-white">VS</span>
              </div>

              <div className="flex flex-col items-center gap-3 z-10 w-1/3">
                <div className="w-16 h-16 bg-purple-500/20 rounded-[20px] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <User size={28} className="text-purple-400" />
                </div>
                <div className="text-center">
                  <h4 className="font-black text-xs text-white">{selectedMatch.opponent.first_name}</h4>
                  <p className="text-[8px] font-black text-purple-400 uppercase mt-1">{selectedMatch.opponent.current_rank}</p>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px] -translate-y-1/2" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] -translate-y-1/2" />
            </div>

            {/* ✅ صندوق التعليمات وزر التوجه لغرفة الشات المغلقة */}
            <div className="mt-6 bg-[#14224d]/80 rounded-[30px] p-6 border border-white/10 space-y-5">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-cyan-400">
                  <ShieldAlert size={18} />
                  <h4 className="font-black text-xs uppercase italic tracking-widest">تعليمات الحضور</h4>
                </div>
                <p className="text-[11px] font-bold text-gray-300 leading-relaxed">
                  للتأكد من خصمك، توجه لمسؤول الحجز في <span className="text-white font-black">{selectedMatch.match.court_name}</span> وأعطه اسمك. بمجرد وصول خصمك، سيوجهكم المسؤول للملعب.
                </p>
              </div>

              <button 
                onClick={() => navigate(`/chat/${selectedMatch.match.id}`)} 
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-[20px] font-[1000] text-sm uppercase italic active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2"
              >
                دخول غرفة التنسيق 💬
              </button>
            </div>

            <button onClick={() => setSelectedMatch(null)} className="w-full mt-4 py-5 bg-white/5 border border-white/10 text-white rounded-[25px] font-black text-xs uppercase italic active:scale-95 transition-all">إغلاق البطاقة</button>
          </div>
        </div>
      )}

      {/* مودال التحدي المباشر (إنشاء تحدي) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#05081d]/90 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
            <button onClick={() => { setIsModalOpen(false); setStep(1); }} className="absolute top-6 left-6 text-gray-500"><X size={24}/></button>
            <div className="mb-8 text-right">
              <h3 className="text-3xl font-[1000] italic text-white leading-none">تحدي <span className="text-cyan-400">{selectedPlayer?.first_name}</span></h3>
              <p className="text-[10px] font-black text-gray-500 mt-2 uppercase italic tracking-widest">{step === 1 ? 'الخطوة 1: اختر الملعب' : 'الخطوة 2: حدد الموعد'}</p>
            </div>
            {step === 1 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {courts.map(court => (
                  <button key={court.id} onClick={() => { setSelectedCourt(court); setStep(2); }} className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/50 transition-all group active:scale-95">
                    <img src={court.image_url} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="text-right flex-1">
                      <h4 className="font-black text-white italic text-lg">{court.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase italic mt-1">{court.price_per_hour} SAR / ساعة</p>
                    </div>
                    <ChevronRight size={20} className="text-cyan-400 rotate-180" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-left-5">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 text-right uppercase italic px-2 flex justify-end gap-2 items-center">اختر اليوم <Calendar size={12} className="text-cyan-400"/></p>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map(d => (
                      <button key={d.iso} onClick={() => setSelectedDate(d.iso)} className={`py-4 rounded-2xl font-black text-[10px] border-2 transition-all active:scale-95 ${selectedDate === d.iso ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>{d.label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 text-right uppercase italic px-2 flex justify-end gap-2 items-center">اختر الوقت <Clock size={12} className="text-cyan-400"/></p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(t => (
                      <button key={t.value} onClick={() => setSelectedTime(t.value)} className={`py-4 rounded-2xl font-black text-[12px] border-2 transition-all active:scale-95 ${selectedTime === t.value ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-[#14224d] border-white/5 text-gray-500'}`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white/5 text-gray-400 rounded-3xl font-black text-xs uppercase italic active:scale-95 transition-all">رجوع</button>
                   <button onClick={handleSendChallenge} disabled={!selectedDate || !selectedTime || isSending} className="flex-[2] py-5 bg-cyan-500 text-[#0a0f3c] rounded-3xl font-[1000] text-xs uppercase italic active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-cyan-500/20">
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