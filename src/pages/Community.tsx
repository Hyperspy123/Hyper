import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Swords, Zap, X, Calendar, MapPin, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

// 🔥 توليد 7 أيام قادمة (أسبوع كامل) مع أسماء الأيام
const getUpcomingDates = () => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isToday = i === 0;
    const isTomorrow = i === 1;
    return {
      value: d.toISOString().split('T')[0],
      dayName: isToday ? 'اليوم' : isTomorrow ? 'غداً' : days[d.getDay()],
      dateNum: d.getDate()
    };
  });
};

// 🔥 قائمة الملاعب (شاملة)
const COURTS = ['ملعب 1', 'ملعب 2', 'ملعب 3', 'ملعب 4', 'ملعب 5', 'ملعب VIP'];

// 🔥 الأوقات بنظام AM / PM (القيمة البرمجية 24h عشان الداتا بيس، والعرض 12h)
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
  const [loading, setLoading] = useState(true);

  // حالات لوحة التفاوض
  const [selectedCourt, setSelectedCourt] = useState(COURTS[0]);
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedTime, setSelectedTime] = useState(TIMES[2].value); // افتراضي 08:00 PM
  const [isCounterProposing, setIsCounterProposing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data: profilesData } = await supabase.from('profiles').select('*').neq('id', user.id).eq('is_public', true);
    if (profilesData) setPlayers(profilesData);

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

  const handleSendChallengeRequest = async (player: any) => {
    try {
      const { error } = await supabase.from('challenges').insert([{ challenger_id: currentUser.id, challenged_id: player.id, status: 'pending', negotiation_status: 'none' }]);
      if (error) throw error;
      await supabase.from('notifications').insert([{ user_id: player.id, title: 'تحدي جديد ⚔️', message: `طلب تحدي من ${currentUser.first_name}!`, type: 'challenge' }]);
      toast.success(`تم إرسال التحدي لـ ${player.first_name} 🎾`);
      fetchData();
    } catch (error) { toast.error("فشل إرسال التحدي"); }
  };

  const handleAcceptChallengeRequest = async (lobby: any) => {
    try {
      const { error } = await supabase.from('challenges').update({ status: 'accepted', negotiation_status: 'pending' }).eq('id', lobby.id);
      if (error) throw error;
      await supabase.from('notifications').insert([{ user_id: lobby.challenger_id, title: 'قُبل التحدي 🔥', message: `${currentUser.first_name} قبل تحديك!`, type: 'challenge' }]);
      toast.success("قبلت التحدي! ابدأ التنسيق ⚡");
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("فشل قبول التحدي"); }
  };

  const handleSendProposal = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) { toast.error("تأكد من تحديد جميع الخيارات!"); return; }
    const matchTimestamp = `${selectedDate} ${selectedTime}`;
    
    try {
      await supabase.from('challenges').update({ proposed_court: selectedCourt, proposed_time: matchTimestamp, proposed_by: currentUser.id, negotiation_status: 'negotiating' }).eq('id', activeLobby.id);
      const opponentId = activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id;
      await supabase.from('notifications').insert([{ user_id: opponentId, title: 'عرض جديد 📅', message: `اقترح ${currentUser.first_name} موعداً للمباراة.`, type: 'challenge' }]);
      toast.success("تم إرسال العرض للخصم 🎾");
      setIsCounterProposing(false);
      setActiveLobby({ ...activeLobby, negotiation_status: 'negotiating', proposed_by: currentUser.id, proposed_court: selectedCourt, proposed_time: matchTimestamp });
      fetchData();
    } catch (error) { toast.error("خطأ في الإرسال"); }
  };

  const handleAcceptProposal = async () => {
    try {
      await supabase.from('challenges').update({ negotiation_status: 'agreed', court_name: activeLobby.proposed_court, match_time: activeLobby.proposed_time }).eq('id', activeLobby.id);
      const opponentId = activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id;
      await supabase.from('notifications').insert([{ user_id: opponentId, title: 'تم الاتفاق ✅', message: `تم تأكيد موعد المباراة في ${activeLobby.proposed_court}! احجز الآن.`, type: 'booking' }]);
      toast.success("تم تأكيد الموعد بينكم! توجه للرئيسية للحجز 🔒");
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
                       lobby.negotiation_status === 'agreed' ? <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">✅ تم الاتفاق</span> : 
                       lobby.proposed_by === currentUser?.id ? <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded-full">بانتظار رد الخصم</span> :
                       <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">⚡ دورك للتنسيق</span>}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400"><Zap size={18} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= لوحة التفاوض (الـ Dashboard) ================= */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#05081d]/95 backdrop-blur-xl" onClick={() => setActiveLobby(null)} />
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full max-h-[92vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><Swords size={20} className="text-cyan-400" /></div>
              <div><h2 className="font-[1000] text-sm uppercase text-white">{activeLobby?.opponent_name}</h2><p className="text-[10px] text-gray-400 font-bold">{activeLobby?.opponent_level}</p></div>
            </div>
            <button onClick={() => setActiveLobby(null)} className="p-2 bg-white/5 text-gray-400 rounded-full hover:text-white transition-all"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {activeLobby?.status === 'pending' ? (
              <div className="text-center py-10 opacity-60">
                <Clock size={48} className="mb-4 text-yellow-500 mx-auto" />
                <h3 className="font-black text-xl mb-2 text-white">التحدي معلق</h3>
                <p className="text-xs text-gray-400 mb-6">{activeLobby.challenger_id === currentUser?.id ? 'أنتظر خصمك يقبل التحدي عشان تفتح لوحة التنسيق.' : 'خصمك يتحداك! اقبل التحدي للبدء في اختيار الملعب.'}</p>
                {activeLobby.challenged_id === currentUser?.id && <button onClick={() => handleAcceptChallengeRequest(activeLobby)} className="w-full py-4 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]">قبول التحدي 💥</button>}
              </div>
            ) : 

            activeLobby?.negotiation_status === 'agreed' ? (
              <div className="text-center py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px]">
                <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white font-black text-2xl mb-2">اتفاق مؤكد!</h3>
                <div className="inline-flex items-center gap-2 bg-[#0a0f3c] px-4 py-2 rounded-full border border-white/10 text-cyan-400 text-xs font-bold mb-4"><MapPin size={14}/> {activeLobby.court_name}</div>
                <p className="text-xs text-gray-400 px-6 leading-relaxed">الملعب غير محجوز بعد. توجه لصفحة الملاعب في الرئيسية وأتمم عملية الدفع لضمان حجزك.</p>
              </div>
            ) : 

            (
              <div className="space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 flex-none" />
                  <p className="text-[10px] text-yellow-500/80 font-bold leading-relaxed">هذا التنسيق مبدئي ولا يضمن حجز الملعب. من يسبق للدفع في الرئيسية يؤكد الحجز.</p>
                </div>

                {activeLobby?.negotiation_status === 'negotiating' && !isCounterProposing && (
                  <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-4 text-center">{activeLobby.proposed_by === currentUser?.id ? 'عرضك الحالي للخصم' : 'الخصم يقترح عليك'}</p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 bg-[#0a0f3c] p-4 rounded-2xl border border-white/5">
                        <MapPin className="text-cyan-400 flex-none" size={20} />
                        <div><p className="text-[10px] text-gray-500 font-bold">الملعب</p><p className="text-sm font-black text-white">{activeLobby.proposed_court}</p></div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#0a0f3c] p-4 rounded-2xl border border-white/5">
                        <Calendar className="text-emerald-400 flex-none" size={20} />
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold">التاريخ والوقت</p>
                          <p className="text-sm font-black text-white" dir="ltr">{new Date(activeLobby.proposed_time).toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true})}</p>
                        </div>
                      </div>
                    </div>
                    {activeLobby.proposed_by !== currentUser?.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => setIsCounterProposing(true)} className="flex-1 py-4 bg-[#0a0f3c] border border-white/10 text-white rounded-xl text-xs font-black active:scale-95 transition-all">اقتراح بديل 🔄</button>
                        <button onClick={handleAcceptProposal} className="flex-1 py-4 bg-emerald-500 text-[#0a0f3c] rounded-xl text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all">قبول العرض ✅</button>
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-[#0a0f3c] rounded-xl border border-white/5"><span className="text-xs text-gray-500 font-bold animate-pulse">بانتظار رد الخصم...</span></div>
                    )}
                  </div>
                )}

                {/* 🔥 نموذج الاقتراح الجديد (بالأزرار الواضحة بدل القوائم) 🔥 */}
                {(activeLobby?.negotiation_status === 'pending' || isCounterProposing) && (
                  <div className="bg-white/5 border border-cyan-500/30 rounded-[24px] p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-4 opacity-20"><Calendar size={60} className="text-cyan-500" /></div>
                    <div className="relative z-10 space-y-6">
                      <h3 className="text-sm font-black text-cyan-400 mb-2">{isCounterProposing ? 'اقتراح موعد جديد' : 'ابدأ باقتراح موعد'}</h3>
                      
                      {/* 1. اختيار الملعب */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. اختر الملعب</p>
                        <div className="grid grid-cols-3 gap-2">
                          {COURTS.map(court => (
                            <button key={court} onClick={() => setSelectedCourt(court)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedCourt === court ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-[#0a0f3c] text-gray-300 border-white/10 hover:border-white/30'}`}>
                              {court}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. اختيار اليوم */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. اختر اليوم</p>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                          {DATES.map(date => (
                            <button key={date.value} onClick={() => setSelectedDate(date.value)} className={`flex-none w-[72px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${selectedDate === date.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-[#0a0f3c] text-gray-300 border-white/10 hover:border-white/30'}`}>
                              <span className="text-[10px] font-bold">{date.dayName}</span>
                              <span className="text-base font-black">{date.dateNum}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. اختيار الوقت (AM/PM) */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. اختر الوقت</p>
                        <div className="grid grid-cols-3 gap-2">
                          {TIMES.map(time => (
                            <button key={time.value} onClick={() => setSelectedTime(time.value)} className={`py-3 rounded-xl text-xs font-black transition-all border ${selectedTime === time.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-[#0a0f3c] text-gray-300 border-white/10 hover:border-white/30'} flex flex-col items-center justify-center gap-0.5`} dir="ltr">
                              <span className="text-xs">{time.label.split(' ')[0]}</span>
                              <span className="text-[9px] text-opacity-80">{time.label.split(' ')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {isCounterProposing && <button onClick={() => setIsCounterProposing(false)} className="px-4 py-4 bg-[#0a0f3c] text-white rounded-xl text-xs font-black">إلغاء</button>}
                        <button onClick={handleSendProposal} className="flex-1 py-4 bg-cyan-500 text-[#0a0f3c] rounded-xl text-sm font-black shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 transition-all flex justify-center items-center gap-2">
                          إرسال العرض للخصم <Zap size={16}/>
                        </button>
                      </div>
                    </div>
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