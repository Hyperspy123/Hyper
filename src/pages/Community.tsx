import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Swords, Zap, X, Calendar, MapPin, Clock, CheckCircle2, Ban, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext'; // 🔥 استيراد المترجم

// 🔥 توليد 7 أيام قادمة مع دعم الترجمة
const getUpcomingDates = (lang: string) => {
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = lang === 'ar' ? daysAr : daysEn;
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    let dayName = days[d.getDay()];
    if (i === 0) dayName = lang === 'ar' ? 'اليوم' : 'Today';
    if (i === 1) dayName = lang === 'ar' ? 'غداً' : 'Tomorrow';
    
    return { value: d.toISOString().split('T')[0], dayName, dateNum: d.getDate() };
  });
};

const COURTS = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'VIP Court'];
const TIMES = [
  { value: '16:00', label: '04:00 PM' }, { value: '18:00', label: '06:00 PM' },
  { value: '20:00', label: '08:00 PM' }, { value: '22:00', label: '10:00 PM' }, { value: '00:00', label: '12:00 AM' }
];

export default function Community() {
  const { t, dir, lang } = useLanguage(); // 🔥 جلب أدوات اللغة
  const [activeTab, setActiveTab] = useState<'players' | 'lobbies'>('players');
  const [activeLobby, setActiveLobby] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const [selectedCourt, setSelectedCourt] = useState(COURTS[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(TIMES[2].value);
  const [isCounterProposing, setIsCounterProposing] = useState(false);

  const DATES = getUpcomingDates(lang);

  // 🔥 سلم التصنيفات مترجم
  const RANKS_LADDER = [
    { id: 1, name: lang === 'ar' ? 'مبتدئ' : 'ROOKIE', min: 0, max: 49, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
    { id: 2, name: lang === 'ar' ? 'محترف' : 'PRO', min: 50, max: 99, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { id: 3, name: lang === 'ar' ? 'نخبة' : 'ELITE', min: 100, max: 149, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 4, name: lang === 'ar' ? 'أمير' : 'PRINCE', min: 150, max: 199, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { id: 5, name: lang === 'ar' ? 'ملك' : 'KING', min: 200, max: 249, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { id: 6, name: lang === 'ar' ? 'أسطورة' : 'LEGEND', min: 250, max: 299, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 7, name: lang === 'ar' ? 'هايب' : 'HYPE', min: 300, max: 9999, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400/20' },
  ];

  const getRankInfo = (matches: number) => {
    return RANKS_LADDER.find(r => matches >= r.min && matches <= r.max) || RANKS_LADDER[0];
  };

  useEffect(() => { 
    setSelectedDate(DATES[0].value);
    fetchData(); 
  }, [lang]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data: profilesData } = await supabase.from('profiles').select('*').neq('id', user.id).eq('is_public', true);
    if (profilesData) setPlayers(profilesData);

    const { data: bookingsData } = await supabase.from('bookings').select('court_name, start_time');
    if (bookingsData) setAllBookings(bookingsData);

    const { data: challengesData } = await supabase
      .from('challenges')
      .select(`*, challenger:challenger_id(id, first_name, play_level, total_matches), challenged:challenged_id(id, first_name, play_level, total_matches)`)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .neq('status', 'cancelled').neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (challengesData) {
      const formattedLobbies = challengesData.map(ch => {
        const isChallenger = ch.challenger_id === user.id;
        const opponent = isChallenger ? ch.challenged : ch.challenger;
        return { 
          ...ch, 
          opponent_name: opponent?.first_name || (lang === 'ar' ? 'لاعب' : 'Player'), 
          opponent_level: opponent?.play_level || '---',
          opponent_matches: opponent?.total_matches || 0
        };
      });
      setLobbies(formattedLobbies);
    }
    setLoading(false);
  };

  const isSlotBooked = (court: string, date: string, time: string) => {
    const checkTime = `${date} ${time}`;
    return allBookings.some(b => b.court_name === court && b.start_time.includes(checkTime));
  };

  const handleSendChallengeRequest = async (player: any) => {
    try {
      const { error } = await supabase.from('challenges').insert([{ challenger_id: currentUser.id, challenged_id: player.id, status: 'pending', negotiation_status: 'none' }]);
      if (error) throw error;
      toast.success(lang === 'ar' ? `تم إرسال التحدي لـ ${player.first_name} 🎾` : `Challenge sent to ${player.first_name} 🎾`);
      fetchData();
    } catch (error) { toast.error("Error"); }
  };

  const handleRejectChallenge = async (lobby: any) => {
    try {
      await supabase.from('challenges').update({ status: 'rejected' }).eq('id', lobby.id);
      toast.info(lang === 'ar' ? "تم رفض التحدي" : "Challenge rejected");
      setActiveLobby(null);
      fetchData();
    } catch (error) { toast.error("Error"); }
  };

  const handleAcceptChallengeRequest = async (lobby: any) => {
    try {
      await supabase.from('challenges').update({ status: 'accepted', negotiation_status: 'pending' }).eq('id', lobby.id);
      toast.success(lang === 'ar' ? "قبلت التحدي! ⚡" : "Challenge accepted! ⚡");
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("Error"); }
  };

  const handleSendProposal = async () => {
    if (isSlotBooked(selectedCourt, selectedDate, selectedTime)) { 
      toast.error(lang === 'ar' ? "هذا الموعد محجوز" : "Slot already booked"); 
      return; 
    }
    const matchTimestamp = `${selectedDate} ${selectedTime}`;
    try {
      await supabase.from('challenges').update({ proposed_court: selectedCourt, proposed_time: matchTimestamp, proposed_by: currentUser.id, negotiation_status: 'negotiating' }).eq('id', activeLobby.id);
      toast.success(lang === 'ar' ? "تم إرسال العرض للخصم 🎾" : "Offer sent to opponent 🎾");
      setIsCounterProposing(false);
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("Error"); }
  };

  const handleAcceptProposal = async () => {
    const court = activeLobby.proposed_court;
    const time = activeLobby.proposed_time;
    try {
      await supabase.from('challenges').update({ negotiation_status: 'agreed', court_name: court, match_time: time }).eq('id', activeLobby.id);
      await supabase.from('bookings').insert([
        { user_id: currentUser.id, court_name: court, start_time: time, status: 'confirmed', type: 'challenge' },
        { user_id: activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id, court_name: court, start_time: time, status: 'confirmed', type: 'challenge' }
      ]);
      toast.success(lang === 'ar' ? "تم تأكيد المباراة والحجز! 🎾" : "Match & booking confirmed! 🎾");
      setActiveLobby({ ...activeLobby, negotiation_status: 'agreed' });
      fetchData();
    } catch (error) { toast.error("Error"); }
  };

  if (loading && !players.length) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('players')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'players' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>{t('players')}</button>
          <button onClick={() => setActiveTab('lobbies')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'lobbies' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>{t('lobbies')}</button>
        </div>

        {activeTab === 'players' ? (
          <div className="space-y-4">
            {players.map(player => {
              const rankInfo = getRankInfo(player.total_matches || 0);
              return (
                <div key={player.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div>
                    <h3 className="font-[1000] text-sm text-white mb-1.5">{player.first_name} {player.last_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-bold">{player.play_level}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border tracking-widest ${rankInfo.bg} ${rankInfo.color} ${rankInfo.border}`}>{rankInfo.name}</span>
                    </div>
                  </div>
                  <button onClick={() => handleSendChallengeRequest(player)} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black active:scale-95 transition-all flex items-center gap-1"><Swords size={14}/> {t('challenge')}</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map(lobby => {
              const oppRankInfo = getRankInfo(lobby.opponent_matches);
              return (
                <div key={lobby.id} onClick={() => {setActiveLobby(lobby); setIsCounterProposing(false);}} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-4 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-[1000] text-sm text-white">{lobby.opponent_name}</h3>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border tracking-widest ${oppRankInfo.bg} ${oppRankInfo.color} ${oppRankInfo.border}`}>{oppRankInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {lobby.status === 'pending' ? <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full">⏳ {lang === 'ar' ? 'بانتظار القبول' : 'Pending'}</span> : 
                         lobby.negotiation_status === 'agreed' ? <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">✅ {lang === 'ar' ? 'تم الحجز' : 'Booked'}</span> : 
                         <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">⚡ {lang === 'ar' ? 'تنسيق الموعد' : 'Negotiating'}</span>}
                      </div>
                    </div>
                    <Zap size={18} className="text-gray-400" />
                  </div>
                </div>
              );
            })}
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
              <div>
                <h2 className={`font-[1000] text-sm uppercase text-white flex items-center gap-2 ${dir === 'ltr' ? 'flex-row-reverse' : ''}`}>
                  {activeLobby?.opponent_name}
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border tracking-widest ${getRankInfo(activeLobby?.opponent_matches || 0).bg} ${getRankInfo(activeLobby?.opponent_matches || 0).color}`}>{getRankInfo(activeLobby?.opponent_matches || 0).name}</span>
                </h2>
                <p className={`text-[10px] text-gray-400 font-bold mt-1 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>{activeLobby?.opponent_level}</p>
              </div>
            </div>
            <button onClick={() => setActiveLobby(null)} className="p-2 bg-white/5 text-gray-400 rounded-full"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeLobby?.status === 'pending' ? (
              <div className="text-center py-10">
                <Clock size={48} className="mb-4 text-yellow-500 mx-auto" />
                <h3 className="font-black text-xl mb-2 text-white">{lang === 'ar' ? 'طلب تحدي معلق' : 'Pending Request'}</h3>
                <div className="flex gap-2 mt-8">
                  {activeLobby.challenged_id === currentUser?.id ? (
                    <>
                      <button onClick={() => handleRejectChallenge(activeLobby)} className="flex-1 py-4 bg-white/5 border border-white/10 text-red-400 font-black rounded-xl text-sm flex items-center justify-center gap-2"><Ban size={18}/> {lang === 'ar' ? 'رفض' : 'Reject'}</button>
                      <button onClick={() => handleAcceptChallengeRequest(activeLobby)} className="flex-1 py-4 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-sm">{lang === 'ar' ? 'قبول 💥' : 'Accept 💥'}</button>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 w-full">{lang === 'ar' ? 'أنتظار قبول الخصم...' : 'Waiting for opponent...'}</p>
                  )}
                </div>
              </div>
            ) : 

            activeLobby?.negotiation_status === 'agreed' ? (
              <div className="text-center py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px]">
                <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white font-black text-2xl mb-2">{lang === 'ar' ? 'تم الحجز!' : 'Booked!'}</h3>
                <p className="text-xs text-gray-400 px-6 leading-relaxed">{lang === 'ar' ? `المباراة في ${activeLobby.court_name}` : `Match at ${activeLobby.court_name}`}</p>
              </div>
            ) : 

            (
              <div className="space-y-6">
                {activeLobby?.negotiation_status === 'negotiating' && !isCounterProposing && (
                  <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-4 text-center">{activeLobby.proposed_by === currentUser?.id ? (lang === 'ar' ? 'عرضك بانتظار الرد' : 'Waiting Response') : (lang === 'ar' ? 'عرض الخصم' : 'Opponent Offer')}</p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 bg-[#0a0f3c] p-4 rounded-2xl border border-white/5"><MapPin className="text-cyan-400" size={20} /><div className={dir === 'ltr' ? 'text-left' : 'text-right'}><p className="text-[10px] text-gray-500 font-bold">{lang === 'ar' ? 'الملعب' : 'Court'}</p><p className="text-sm font-black text-white">{activeLobby.proposed_court}</p></div></div>
                      <div className="flex items-center gap-3 bg-[#0a0f3c] p-4 rounded-2xl border border-white/5"><Calendar className="text-emerald-400" size={20} /><div className={dir === 'ltr' ? 'text-left' : 'text-right'}><p className="text-[10px] text-gray-500 font-bold">{lang === 'ar' ? 'الموعد' : 'Time'}</p><p className="text-sm font-black text-white" dir="ltr">{new Date(activeLobby.proposed_time).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</p></div></div>
                    </div>
                    {activeLobby.proposed_by !== currentUser?.id && (
                      <div className="flex gap-2">
                        <button onClick={() => setIsCounterProposing(true)} className="flex-1 py-4 bg-[#0a0f3c] border border-white/10 text-white rounded-xl text-xs font-black">{lang === 'ar' ? 'اقتراح آخر 🔄' : 'Counter Offer 🔄'}</button>
                        <button onClick={handleAcceptProposal} className="flex-1 py-4 bg-emerald-500 text-[#0a0f3c] rounded-xl text-xs font-black">{lang === 'ar' ? 'قبول وحجز ✅' : 'Accept ✅'}</button>
                      </div>
                    )}
                  </div>
                )}

                {(activeLobby?.negotiation_status === 'pending' || isCounterProposing) && (
                  <div className="bg-white/5 border border-cyan-500/30 rounded-[24px] p-5 space-y-6">
                    <div>
                      <p className={`text-[10px] font-black text-gray-400 uppercase mb-3 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>1. {lang === 'ar' ? 'اختر الملعب' : 'Select Court'}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {COURTS.map(court => (
                          <button key={court} onClick={() => setSelectedCourt(court)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedCourt === court ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400' : 'bg-[#0a0f3c] text-gray-300 border-white/10'}`}>{court}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className={`text-[10px] font-black text-gray-400 uppercase mb-3 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>2. {lang === 'ar' ? 'اختر اليوم' : 'Select Day'}</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {DATES.map(date => (
                          <button key={date.value} onClick={() => setSelectedDate(date.value)} className={`flex-none w-[72px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${selectedDate === date.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400' : 'bg-[#0a0f3c] text-gray-300 border-white/10'}`}>
                            <span className="text-[10px] font-bold">{date.dayName}</span>
                            <span className="text-base font-black">{date.dateNum}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className={`text-[10px] font-black text-gray-400 uppercase mb-3 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>3. {lang === 'ar' ? 'الوقت المتاح' : 'Available Time'}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {TIMES.map(time => {
                          const booked = isSlotBooked(selectedCourt, selectedDate, time.value);
                          return (
                            <button key={time.value} disabled={booked} onClick={() => setSelectedTime(time.value)} className={`py-3 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-0.5 ${booked ? 'opacity-30 bg-red-500/10 border-red-500/20 text-red-400' : selectedTime === time.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400' : 'bg-[#0a0f3c] text-gray-300 border-white/10'}`}>
                              <span className="text-xs">{booked ? (lang === 'ar' ? 'محجوز' : 'Full') : time.label.split(' ')[0]}</span>
                              {!booked && <span className="text-[9px]">{time.label.split(' ')[1]}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button onClick={handleSendProposal} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-xl text-sm font-black flex justify-center items-center gap-2">{lang === 'ar' ? 'إرسال العرض للخصم' : 'Send Offer'} <Zap size={16}/></button>
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