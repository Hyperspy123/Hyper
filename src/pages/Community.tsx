import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Swords, Zap, X, Calendar, MapPin, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Ban, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// توليد 7 أيام قادمة
const getUpcomingDates = () => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'اليوم' : i === 1 ? 'غداً' : days[d.getDay()],
      dateNum: d.getDate()
    };
  });
};

const COURTS = ['ملعب 1', 'ملعب 2', 'ملعب 3', 'ملعب 4', 'ملعب 5', 'ملعب VIP'];
const TIMES = [
  { value: '16:00', label: '04:00 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '00:00', label: '12:00 AM' },
];
const DATES = getUpcomingDates();

export default function Community() {
  const [activeTab, setActiveTab] = useState<'players' | 'lobbies'>('players');
  const [activeLobby, setActiveLobby] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]); // لتخزين الحجوزات الحالية
  const [loading, setLoading] = useState(true);

  // حالات لوحة التفاوض
  const [selectedCourt, setSelectedCourt] = useState(COURTS[0]);
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedTime, setSelectedTime] = useState(TIMES[2].value);
  const [isCounterProposing, setIsCounterProposing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    // 1. جلب اللاعبين
    const { data: profilesData } = await supabase.from('profiles').select('*').neq('id', user.id).eq('is_public', true);
    if (profilesData) setPlayers(profilesData);

    // 2. جلب الحجوزات الحالية للتحقق من التوفر
    const { data: bookingsData } = await supabase.from('bookings').select('court_name, start_time');
    if (bookingsData) setAllBookings(bookingsData);

    // 3. جلب التحديات
    const { data: challengesData } = await supabase
      .from('challenges')
      .select(`*, challenger:challenger_id(id, first_name, play_level), challenged:challenged_id(id, first_name, play_level)`)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .neq('status', 'cancelled').neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (challengesData) {
      const formattedLobbies = challengesData.map(ch => {
        const isChallenger = ch.challenger_id === user.id;
        const opponent = isChallenger ? ch.challenged : ch.challenger;
        return { ...ch, opponent_name: opponent?.first_name || 'لاعب', opponent_level: opponent?.play_level || 'مبتدئ' };
      });
      setLobbies(formattedLobbies);
    }
    setLoading(false);
  };

  // وظيفة التحقق هل الموعد محجوز؟
  const isSlotBooked = (court: string, date: string, time: string) => {
    const checkTime = `${date} ${time}`;
    return allBookings.some(b => b.court_name === court && b.start_time.includes(checkTime));
  };

  const handleSendChallengeRequest = async (player: any) => {
    try {
      const { error } = await supabase.from('challenges').insert([{ challenger_id: currentUser.id, challenged_id: player.id, status: 'pending', negotiation_status: 'none' }]);
      if (error) throw error;
      await supabase.from('notifications').insert([{ user_id: player.id, title: 'تحدي جديد ⚔️', message: `طلب تحدي من ${currentUser.first_name}!`, type: 'challenge' }]);
      toast.success(`تم إرسال التحدي لـ ${player.first_name} 🎾`);
      fetchData();
    } catch (error) { toast.error("فشل إرسال التحدي"); }
  };

  const handleRejectChallenge = async (lobby: any) => {
    try {
      await supabase.from('challenges').update({ status: 'rejected' }).eq('id', lobby.id);
      toast.info("تم رفض التحدي");
      setActiveLobby(null);
      fetchData();
    } catch (error) { toast.error("حدث خطأ"); }
  };

  const handleAcceptChallengeRequest = async (lobby: any) => {
    try {
      const { error } = await supabase.from('challenges').update({ status: 'accepted', negotiation_status: 'pending' }).eq('id', lobby.id);
      if (error) throw error;
      await supabase.from('notifications').insert([{ user_id: lobby.challenger_id, title: 'قُبل التحدي 🔥', message: `${currentUser.first_name} قبل تحديك!`, type: 'challenge' }]);
      toast.success("قبلت التحدي! ⚡");
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("فشل قبول التحدي"); }
  };

  const handleSendProposal = async () => {
    if (isSlotBooked(selectedCourt, selectedDate, selectedTime)) {
      toast.error("هذا الموعد تم حجزه للتو، اختر موعداً آخر"); return;
    }
    const matchTimestamp = `${selectedDate} ${selectedTime}`;
    try {
      await supabase.from('challenges').update({ proposed_court: selectedCourt, proposed_time: matchTimestamp, proposed_by: currentUser.id, negotiation_status: 'negotiating' }).eq('id', activeLobby.id);
      const opponentId = activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id;
      await supabase.from('notifications').insert([{ user_id: opponentId, title: 'عرض جديد 📅', message: `اقترح ${currentUser.first_name} موعداً للمباراة.`, type: 'challenge' }]);
      toast.success("تم إرسال العرض للخصم 🎾");
      setIsCounterProposing(false);
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("خطأ في الإرسال"); }
  };

  const handleAcceptProposal = async () => {
    const court = activeLobby.proposed_court;
    const time = activeLobby.proposed_time;

    // تأكد مرة أخيرة قبل الحجز
    if (isSlotBooked(court, activeLobby.proposed_time.split(' ')[0], activeLobby.proposed_time.split(' ')[1])) {
      toast.error("للأسف، الملعب حُجز أثناء التنسيق!"); return;
    }

    try {
      // 1. تحديث التحدي
      await supabase.from('challenges').update({ negotiation_status: 'agreed', court_name: court, match_time: time }).eq('id', activeLobby.id);
      
      // 2. إنشاء حجز رسمي لكل لاعب (أو حجز مشترك)
      const { error: bookingError } = await supabase.from('bookings').insert([
        { user_id: currentUser.id, court_name: court, start_time: time, status: 'confirmed', type: 'challenge' },
        { user_id: activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id, court_name: court, start_time: time, status: 'confirmed', type: 'challenge' }
      ]);

      if (bookingError) throw bookingError;

      const opponentId = activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id;
      await supabase.from('notifications').insert([{ user_id: opponentId, title: 'اتفاق مؤكد ✅', message: `تم تأكيد المباراة والحجز في ${court}!`, type: 'booking' }]);

      toast.success("تم تأكيد المباراة وإضافتها لحجوزاتك! 🎾");
      setActiveLobby({ ...activeLobby, negotiation_status: 'agreed' });
      fetchData();
    } catch (error) { toast.error("خطأ في التأكيد"); }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative overflow-hidden" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6 relative z-10">
        <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('players')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'players' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>اللاعبين</button>
          <button onClick={() => setActiveTab('lobbies')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'lobbies' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>لوحة التنسيق</button>
        </div>

        {activeTab === 'players' ? (
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div><h3 className="font-[1000] text-sm text-white">{player.first_name} {player.last_name}</h3><p className="text-[10px] text-cyan-400 font-bold">{player.play_level}</p></div>
                <button onClick={() => handleSendChallengeRequest(player)} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black active:scale-95 transition-all flex items-center gap-1"><Swords size={14}/> تحدى</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map(lobby => (
              <div key={lobby.id} onClick={() => {setActiveLobby(lobby); setIsCounterProposing(false);}} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-4 cursor-pointer relative shadow-lg hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-[1000] text-sm text-white mb-1">{lobby.opponent_name}</h3>
                    <div className="flex items-center gap-1">
                      {lobby.status === 'pending' ? <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full">⏳ بانتظار القبول</span> : 
                       lobby.negotiation_status === 'agreed' ? <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">✅ تم الحجز</span> : 
                       <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">⚡ تنسيق الموعد</span>}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400"><Zap size={18} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* لوحة التفاوض Dashboard */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#05081d]/95 backdrop-blur-xl" onClick={() => setActiveLobby(null)} />
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full max-h-[92vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><Swords size={20} className="text-cyan-400" /></div>
              <div><h2 className="font-[1000] text-sm uppercase text-white">{activeLobby?.opponent_name}</h2><p className="text-[10px] text-gray-400 font-bold">{activeLobby?.opponent_level}</p></div>
            </div>
            <button onClick={() => setActiveLobby(null)} className="p-2 bg-white/5 text-gray-400 rounded-full hover:text-white"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeLobby?.status === 'pending' ? (
              <div className="text-center py-10">
                <Clock size={48} className="mb-4 text-yellow-500 mx-auto" />
                <h3 className="font-black text-xl mb-2 text-white text-center">طلب تحدي معلق</h3>
                <div className="flex gap-2 mt-8">
                  {activeLobby.challenged_id === currentUser?.id ? (
                    <>
                      <button onClick={() => handleRejectChallenge(activeLobby)} className="flex-1 py-4 bg-white/5 border border-white/10 text-red-400 font-black rounded-xl text-sm flex items-center justify-center gap-2"><Ban size={18}/> رفض</button>
                      <button onClick={() => handleAcceptChallengeRequest(activeLobby)} className="flex-1 py-4 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20">قبول 💥</button>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 text-center w-full">أنتظار قبول الخصم للتحدي...</p>
                  )}
                </div>
              </div>
            ) : 

            activeLobby?.negotiation_status === 'agreed' ? (
              <div className="text-center py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px]">
                <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white font-black text-2xl mb-2 text-center">تم الحجز!</h3>
                <p className="text-xs text-gray-400 px-6 leading-relaxed text-center">المباراة مسجلة الآن في جدول حجوزاتك وفي ملعب {activeLobby.court_name}.</p>
              </div>
            ) : 

            (
              <div className="space-y-6">
                {/* عرض العرض الحالي */}
                {activeLobby?.negotiation_status === 'negotiating' && !isCounterProposing && (
                  <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-4 text-center">{activeLobby.proposed_by === currentUser?.id ? 'عرضك بانتظار الرد' : 'عرض الخصم'}</p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 bg-[#0a0f3c] p-4 rounded-2xl border border-white/5"><MapPin className="text-cyan-400" size={20} /><div><p className="text-[10px] text-gray-500 font-bold text-right">الملعب</p><p className="text-sm font-black text-white text-right">{activeLobby.proposed_court}</p></div></div>
                      <div className="flex items-center gap-3 bg-[#0a0f3c] p-4 rounded-2xl border border-white/5"><Calendar className="text-emerald-400" size={20} /><div><p className="text-[10px] text-gray-500 font-bold text-right">الموعد</p><p className="text-sm font-black text-white text-right" dir="ltr">{new Date(activeLobby.proposed_time).toLocaleString('ar-EG', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true})}</p></div></div>
                    </div>
                    {activeLobby.proposed_by !== currentUser?.id && (
                      <div className="flex gap-2">
                        <button onClick={() => setIsCounterProposing(true)} className="flex-1 py-4 bg-[#0a0f3c] border border-white/10 text-white rounded-xl text-xs font-black">اقتراح آخر 🔄</button>
                        <button onClick={handleAcceptProposal} className="flex-1 py-4 bg-emerald-500 text-[#0a0f3c] rounded-xl text-xs font-black">قبول وحجز ✅</button>
                      </div>
                    )}
                  </div>
                )}

                {/* لوحة اختيار الموعد الذكية */}
                {(activeLobby?.negotiation_status === 'pending' || isCounterProposing) && (
                  <div className="bg-white/5 border border-cyan-500/30 rounded-[24px] p-5 space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3 text-right">1. اختر الملعب</p>
                      <div className="grid grid-cols-3 gap-2">
                        {COURTS.map(court => (
                          <button key={court} onClick={() => setSelectedCourt(court)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedCourt === court ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400' : 'bg-[#0a0f3c] text-gray-300 border-white/10'}`}>{court}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3 text-right">2. اختر اليوم</p>
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {DATES.map(date => (
                          <button key={date.value} onClick={() => setSelectedDate(date.value)} className={`flex-none w-[72px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${selectedDate === date.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400' : 'bg-[#0a0f3c] text-gray-300 border-white/10'}`}>
                            <span className="text-[10px] font-bold">{date.dayName}</span>
                            <span className="text-base font-black">{date.dateNum}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3 text-right">3. الوقت المتاح</p>
                      <div className="grid grid-cols-3 gap-2">
                        {TIMES.map(time => {
                          const booked = isSlotBooked(selectedCourt, selectedDate, time.value);
                          return (
                            <button key={time.value} disabled={booked} onClick={() => setSelectedTime(time.value)} className={`py-3 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-0.5 ${booked ? 'opacity-30 bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed' : selectedTime === time.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400' : 'bg-[#0a0f3c] text-gray-300 border-white/10'}`}>
                              <span className="text-xs">{booked ? 'محجوز' : time.label.split(' ')[0]}</span>
                              {!booked && <span className="text-[9px]">{time.label.split(' ')[1]}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button onClick={handleSendProposal} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-xl text-sm font-black flex justify-center items-center gap-2">إرسال العرض للخصم <Zap size={16}/></button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}