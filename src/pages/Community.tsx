import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Search, Swords, Shield, Zap, X, CheckCircle2, Flame, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const HYPE_MESSAGES = [
  "جاهز للخسارة؟ 😈", "الوعد في الملعب 🎾", "لا تتأخر ⏰", 
  "جهّز مضربك 🔥", "الشبكة لي اليوم 🕸️", "بالتوفيق يا وحش 💪"
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<'players' | 'lobbies'>('players');
  const [activeLobby, setActiveLobby] = useState<any>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات التفاوض (الملعب والزمان)
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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
      .neq('status', 'cancelled').neq('status', 'rejected'); 

    if (challengesData) {
      const formattedLobbies = challengesData.map(ch => {
        const isChallenger = ch.challenger_id === user.id;
        const opponent = isChallenger ? ch.challenged : ch.challenger;
        return {
          ...ch,
          opponent_name: opponent?.first_name || 'لاعب',
          opponent_level: opponent?.play_level || 'مبتدئ',
        };
      });
      setLobbies(formattedLobbies);
    }
    setLoading(false);
  };

  // 🔥 1. إرسال طلب تحدي "فارغ" فقط (انتظار القبول)
  const handleSendChallengeRequest = async (player: any) => {
    try {
      const { error } = await supabase.from('challenges').insert([{
        challenger_id: currentUser.id,
        challenged_id: player.id,
        status: 'pending', // حالة الانتظار
        negotiation_status: 'none' // لم يبدأ التنسيق بعد
      }]);
      if (error) throw error;
      toast.success(`تم إرسال طلب التحدي لـ ${player.first_name} 🎾`);
      fetchData();
    } catch (error) {
      toast.error("فشل إرسال التحدي");
    }
  };

  // 🔥 2. قبول التحدي (فتح غرفة التنسيق)
  const handleAcceptChallengeRequest = async (challengeId: string) => {
    try {
      const { error } = await supabase.from('challenges').update({
        status: 'accepted',
        negotiation_status: 'pending' // الآن ننتقل لمرحلة التنسيق
      }).eq('id', challengeId);
      if (error) throw error;
      toast.success("قبلت التحدي! الآن حددوا الملعب والوقت ⚡");
      fetchData();
      setActiveLobby(null);
    } catch (error) {
      toast.error("فشل قبول التحدي");
    }
  };

  // 🔥 3. إرسال اقتراح (بعد ما صار التحدي Accepted)
  const handleSendProposal = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      toast.error("حدد الملعب والوقت أولاً!"); return;
    }
    try {
      const matchTimestamp = `${selectedDate} ${selectedTime}`;
      const { error } = await supabase.from('challenges').update({
        proposed_court: selectedCourt,
        proposed_time: matchTimestamp,
        proposed_by: currentUser.id,
        negotiation_status: 'negotiating'
      }).eq('id', activeLobby.id);
      if (error) throw error;
      toast.success("تم إرسال تفاصيل الملعب والوقت 🔄");
      setActiveLobby(null);
      fetchData();
    } catch (error) {
      toast.error("خطأ في الإرسال");
    }
  };

  const handleFinalConfirmMatch = async () => {
    try {
      const { error } = await supabase.from('challenges').update({
        negotiation_status: 'agreed',
        court_name: activeLobby.proposed_court,
        match_time: activeLobby.proposed_time
      }).eq('id', activeLobby.id);
      if (error) throw error;
      toast.success("تم تأكيد الحجز النهائي! الوعد بالملعب 💥");
      setActiveLobby(null);
      fetchData();
    } catch (error) {
      toast.error("خطأ في التأكيد");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative overflow-hidden" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6 relative z-10">
        
        {/* التبويبات */}
        <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('players')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'players' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>اللاعبين</button>
          <button onClick={() => setActiveTab('lobbies')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'lobbies' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>غرف المبارزة</button>
        </div>

        {activeTab === 'players' ? (
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-[1000] text-sm text-white">{player.first_name} {player.last_name}</h3>
                  <p className="text-[10px] text-cyan-400 font-bold">{player.play_level}</p>
                </div>
                <button onClick={() => handleSendChallengeRequest(player)} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black uppercase active:scale-95 transition-all">تحدى 🎾</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map(lobby => (
              <div key={lobby.id} onClick={() => setActiveLobby(lobby)} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-5 cursor-pointer relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h3 className="font-[1000] text-sm text-white mb-1">{lobby.opponent_name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold italic">
                      {lobby.status === 'pending' ? (lobby.challenger_id === currentUser.id ? '⏳ بانتظار قبوله للتحدي' : '⚡ أرسل لك تحدي!') : 
                       lobby.negotiation_status === 'agreed' ? '✅ مباراة مؤكدة' : '🎾 جاري تنسيق الملعب'}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lobby.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-purple-500/20 text-purple-400'}`}><Zap size={18} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= نافذة التحدي / التنسيق ================= */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#05081d]/80 backdrop-blur-sm" onClick={() => setActiveLobby(null)} />
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full max-h-[85vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          <div className="flex justify-center pt-4 pb-2 relative"><div className="w-12 h-1.5 bg-white/20 rounded-full" /></div>

          {activeLobby && (
            <div className="flex flex-col h-full overflow-hidden p-6 space-y-6">
              
              {/* هيدر النافذة */}
              <div className="text-center">
                <h2 className="font-[1000] text-xl uppercase italic">{activeLobby.opponent_name}</h2>
                <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase">{activeLobby.opponent_level}</span>
              </div>

              {/* 🛑 الحالة 1: التحدي لسا Pending (انتظار القبول) */}
              {activeLobby.status === 'pending' ? (
                <div className="bg-white/5 rounded-2xl p-6 text-center space-y-4">
                  <p className="text-xs text-gray-300 font-bold">
                    {activeLobby.challenger_id === currentUser.id ? "أرسلت طلب التحدي.. بمجرد ما يقبل الخصم راح تقدرون تختارون الملعب والوقت." : "وصلك تحدي جديد! اقبل عشان تبدأون تنسيق الموعد والملعب."}
                  </p>
                  {activeLobby.challenged_id === currentUser.id && (
                    <button onClick={() => handleAcceptChallengeRequest(activeLobby.id)} className="w-full py-4 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95 transition-all">قبول التحدي 💥</button>
                  )}
                </div>
              ) : activeLobby.negotiation_status === 'agreed' ? (
                /* ✅ الحالة 2: تم الاتفاق */
                <div className="text-center py-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                  <h3 className="font-black text-emerald-400">المباراة مؤكدة</h3>
                  <p className="text-xs text-white mt-1">{activeLobby.proposed_court} | {new Date(activeLobby.proposed_time).toLocaleString('ar-EG')}</p>
                </div>
              ) : (
                /* 🔄 الحالة 3: مرحلة التنسيق (بعد القبول) */
                <div className="space-y-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-black text-cyan-400 uppercase mb-2">تنسيق موعد المباراة</p>
                    {activeLobby.proposed_court ? (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-white mb-1">العرض المطروح: {activeLobby.proposed_court}</p>
                        <p className="text-[10px] text-gray-400" dir="ltr">{new Date(activeLobby.proposed_time).toLocaleString()}</p>
                        {activeLobby.proposed_by !== currentUser.id && (
                          <button onClick={handleFinalConfirmMatch} className="w-full mt-3 py-3 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-xs">تأكيد هذا الموعد ✅</button>
                        )}
                      </div>
                    ) : <p className="text-xs text-gray-500">لا يوجد اقتراح حالياً.. ابدأ بإرسال أول عرض</p>}
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase pr-1">اقتراح موعد/ملعب جديد:</p>
                    <select className="w-full bg-[#0a0f3c] border border-white/10 p-4 rounded-xl text-xs font-bold text-white outline-none" onChange={(e) => setSelectedCourt(e.target.value)}>
                      <option value="">اختر الملعب...</option>
                      <option value="ملعب هايب 1">ملعب هايب 1</option>
                      <option value="ملعب هايب 2">ملعب هايب 2</option>
                    </select>
                    <div className="flex gap-2">
                      <input type="date" className="flex-1 bg-[#0a0f3c] border border-white/10 p-4 rounded-xl text-xs text-white [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setSelectedDate(e.target.value)} />
                      <input type="time" className="flex-1 bg-[#0a0f3c] border border-white/10 p-4 rounded-xl text-xs text-white [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setSelectedTime(e.target.value)} />
                    </div>
                    <button onClick={handleSendProposal} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] font-black rounded-xl text-xs shadow-lg shadow-cyan-500/20 active:scale-95">إرسال العرض 🎾</button>
                  </div>
                </div>
              )}

              {/* الشات السريع تحت دائماً */}
              <div className="p-4 bg-[#05081d] rounded-2xl border border-white/5">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {HYPE_MESSAGES.map((msg, idx) => (
                    <button key={idx} className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-300 active:scale-95">{msg}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}