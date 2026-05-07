import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Search, Swords, Shield, Zap, X, CheckCircle2, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const HYPE_MESSAGES = [
  "جاهز للخسارة؟ 😈", "الوعد في الملعب 🎾", "لا تتأخر ⏰", 
  "جهّز مضربك 🔥", "الشبكة لي اليوم 🕸️", "بالتوفيق يا وحش 💪"
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<'players' | 'lobbies'>('players');
  const [activeLobby, setActiveLobby] = useState<any>(null);
  
  // 🔥 حالات البيانات الحقيقية
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات التفاوض
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

    // 1️⃣ جلب اللاعبين الحقيقيين (نستثني حسابك عشان ما تتحدى نفسك)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .eq('is_public', true); // نجلب اللاعبين اللي حساباتهم عامة

    if (profilesData) setPlayers(profilesData);

    // 2️⃣ جلب غرف المبارزة (التحديات اللي أنت طرف فيها)
    const { data: challengesData } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:challenger_id(id, first_name, play_level),
        challenged:challenged_id(id, first_name, play_level)
      `)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .neq('status', 'cancelled') // ما نعرض التحديات الملغاة
      .neq('status', 'rejected'); 

    if (challengesData) {
      // تنسيق البيانات عشان تناسب الواجهة
      const formattedLobbies = challengesData.map(ch => {
        const isChallenger = ch.challenger_id === user.id;
        const opponent = isChallenger ? ch.challenged : ch.challenger;
        return {
          id: ch.id,
          opponent_id: opponent?.id,
          opponent_name: opponent?.first_name || 'لاعب',
          opponent_level: opponent?.play_level || 'مبتدئ',
          status: ch.negotiation_status || 'pending',
          proposed_court: ch.proposed_court,
          proposed_time: ch.proposed_time,
          proposed_by: ch.proposed_by,
        };
      });
      setLobbies(formattedLobbies);
    }
    setLoading(false);
  };

  const handleNewChallengeClick = (player: any) => {
    // تجهيز نافذة التفاوض للاعب جديد (تحدي جديد لم يحفظ في الداتا بيس بعد)
    setActiveLobby({
      isNew: true,
      opponent_id: player.id,
      opponent_name: player.first_name,
      opponent_level: player.play_level,
      status: 'pending'
    });
  };

  const handleSendProposal = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      toast.error("حدد الملعب والوقت أولاً!"); return;
    }
    
    try {
      const matchTimestamp = `${selectedDate} ${selectedTime}`;
      
      if (activeLobby.isNew) {
        // إنشاء تحدي جديد كلياً
        const { error } = await supabase.from('challenges').insert([{
          challenger_id: currentUser.id,
          challenged_id: activeLobby.opponent_id,
          proposed_court: selectedCourt,
          proposed_time: matchTimestamp,
          proposed_by: currentUser.id,
          negotiation_status: 'negotiating',
          status: 'pending'
        }]);
        if (error) throw error;
        toast.success("تم إرسال العرض بنجاح! 🎾");
      } else {
        // تحديث تحدي قائم (رد عرض)
        const { error } = await supabase.from('challenges').update({
          proposed_court: selectedCourt,
          proposed_time: matchTimestamp,
          proposed_by: currentUser.id,
          negotiation_status: 'negotiating'
        }).eq('id', activeLobby.id);
        if (error) throw error;
        toast.success("تم رد العرض للخصم! 🔄");
      }
      
      setActiveLobby(null); // قفل النافذة
      fetchData(); // تحديث البيانات
    } catch (error) {
      toast.error("حدث خطأ أثناء الإرسال");
    }
  };

  const handleAcceptProposal = async () => {
    try {
      const { error } = await supabase.from('challenges').update({
        negotiation_status: 'agreed',
        status: 'accepted',
        court_name: activeLobby.proposed_court, // نثبت الملعب
        match_time: activeLobby.proposed_time   // نثبت الوقت
      }).eq('id', activeLobby.id);
      
      if (error) throw error;
      toast.success("تم تأكيد المباراة! 💥");
      setActiveLobby(null);
      fetchData();
    } catch (error) {
      toast.error("حدث خطأ أثناء القبول");
    }
  };

  const handleSendHypeMessage = (msg: string) => toast.success(`تم إرسال: ${msg} (وهمي حالياً)`);

  const isMyProposal = activeLobby?.proposed_by === currentUser?.id;

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative overflow-hidden" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6 relative z-10">
        
        {/* العنوان والتبويبات */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20"><Swords size={24} /></div>
            <div>
              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">المجتمع</h1>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">تحدى أفضل اللاعبين</p>
            </div>
          </div>

          <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
            <button onClick={() => setActiveTab('players')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'players' ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg' : 'text-gray-400 hover:text-white'}`}>اللاعبين</button>
            <button onClick={() => setActiveTab('lobbies')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 relative ${activeTab === 'lobbies' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              غرف المبارزة 
              {lobbies.some(l => l.status === 'negotiating' && l.proposed_by !== currentUser?.id) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : activeTab === 'players' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-4 text-gray-500" size={18} />
              <input type="text" placeholder="ابحث عن لاعب..." className="w-full bg-[#0a0f3c] border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all text-white" />
            </div>

            {players.length > 0 ? players.map(player => (
              <div key={player.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-[1000] text-sm text-white">{player.first_name} {player.last_name}</h3>
                  <p className="text-[10px] text-cyan-400 font-bold">{player.current_rank || 'ROOKIE'} | {player.play_level || 'مبتدئ'}</p>
                </div>
                <button onClick={() => handleNewChallengeClick(player)} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black uppercase active:scale-95 transition-all flex gap-1 items-center">
                  <Swords size={14} /> تحدى
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500 text-xs py-10">لا يوجد لاعبين متاحين حالياً</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.length > 0 ? lobbies.map(lobby => (
              <div key={lobby.id} onClick={() => setActiveLobby(lobby)} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-5 cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h3 className="font-[1000] text-sm text-white mb-1">{lobby.opponent_name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold">
                      {lobby.status === 'agreed' ? '✅ تم الاتفاق' : lobby.proposed_by === currentUser?.id ? '⏳ بانتظار رده' : '⚡ عرض مطروح لك!'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                    <Zap size={18} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 text-xs py-10">ما عندك أي غرف مبارزة حالياً</p>
            )}
          </div>
        )}
      </main>

      {/* ================= نافذة غرفة المبارزة المنبثقة ================= */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#05081d]/80 backdrop-blur-sm" onClick={() => setActiveLobby(null)} />
        
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full max-h-[85vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          <div className="flex justify-center pt-4 pb-2 relative">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            <button onClick={() => setActiveLobby(null)} className="absolute left-6 top-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"><X size={18} /></button>
          </div>

          {activeLobby && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 pb-4 border-b border-white/5 text-center">
                <div className="inline-flex w-16 h-16 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full items-center justify-center p-0.5 mb-2">
                  <div className="w-full h-full bg-[#05081d] rounded-full flex items-center justify-center"><Swords size={24} className="text-white"/></div>
                </div>
                <h2 className="font-[1000] text-xl uppercase italic">{activeLobby.opponent_name}</h2>
                <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-widest mt-1 inline-block">{activeLobby.opponent_level}</span>
              </div>

              <div className="p-6 bg-white/5 flex-none relative">
                {activeLobby.status === 'agreed' ? (
                  <div className="text-center py-4 space-y-2">
                      <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-400 mb-2"><CheckCircle2 size={32} /></div>
                      <h3 className="text-xl font-[1000] italic text-white uppercase">المباراة مؤكدة!</h3>
                      <p className="text-xs text-gray-400">ستجد التذكرة في صفحة حجوزاتي</p>
                  </div>
                ) : activeLobby.status === 'negotiating' ? (
                  <div className="bg-[#0a0f3c] border border-cyan-500/30 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-gray-400 mb-2">
                        {isMyProposal ? 'عرضك بانتظار رد الخصم ⏳' : 'عرض مطروح من الخصم ⚡'}
                      </p>
                      <h4 className="text-lg font-[1000] text-cyan-400 mb-2">{activeLobby.proposed_court || 'ملعب غير محدد'}</h4>
                      <p className="text-xs text-gray-300 mb-4" dir="ltr">{activeLobby.proposed_time ? new Date(activeLobby.proposed_time).toLocaleString('en-GB', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : ''}</p>
                      
                      {!isMyProposal ? (
                        <div className="flex gap-2">
                            <button onClick={handleAcceptProposal} className="flex-1 py-3 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95">قبول 💥</button>
                            <button onClick={() => setActiveLobby({...activeLobby, status: 'pending'})} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl text-xs active:scale-95">رفض واقتراح 🔄</button>
                        </div>
                      ) : (
                        <div className="animate-pulse h-10 flex items-center justify-center text-xs font-bold text-gray-500">جاري الانتظار...</div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-3">
                      <select className="w-full bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs font-bold text-white outline-none" onChange={(e) => setSelectedCourt(e.target.value)}>
                          <option value="">اختر الملعب...</option>
                          <option value="ملعب هايب 1">ملعب هايب 1</option>
                          <option value="ملعب هايب 2">ملعب هايب 2</option>
                      </select>
                      <div className="flex gap-2">
                          <input type="date" className="flex-1 bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs text-white [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setSelectedDate(e.target.value)} />
                          <input type="time" className="flex-1 bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs text-white [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setSelectedTime(e.target.value)} />
                      </div>
                      <button onClick={handleSendProposal} className="w-full py-3 bg-cyan-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95 transition-all">إرسال العرض 🎾</button>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center items-center opacity-30 min-h-[150px]">
                  <Flame size={40} className="mb-2" />
                  <p className="font-black text-xs uppercase tracking-widest">الميدان هادي.. استفز خصمك!</p>
              </div>

              <div className="p-4 pb-8 border-t border-white/5 bg-[#05081d]">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {HYPE_MESSAGES.map((msg, idx) => (
                          <button key={idx} onClick={() => handleSendHypeMessage(msg)} className="whitespace-nowrap px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 rounded-full text-xs font-bold transition-all active:scale-95">
                              {msg}
                          </button>
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