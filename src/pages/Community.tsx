import { useState, useEffect, useRef } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Search, Swords, Zap, X, CheckCircle2, Send, Calendar, ShieldAlert, MessageSquare, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

// 🛑 فلتر الكلمات (تقدر تزيدها براحتك)
const BAD_WORDS = ['غبي', 'حمار', 'زفت', 'كلب', 'تافه', 'طز'];
const filterMessage = (text: string) => {
  let filtered = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '🎾🎾🎾');
  });
  return filtered;
};

export default function Community() {
  const [activeTab, setActiveTab] = useState<'players' | 'lobbies'>('players');
  const [activeLobby, setActiveLobby] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات الشات والتفاوض
  const [chatInput, setChatInput] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // التمرير التلقائي لأسفل الشات
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeLobby?.chat_history]);

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
        return {
          ...ch,
          opponent_name: opponent?.first_name || 'لاعب',
          opponent_level: opponent?.play_level || 'مبتدئ',
          chat_history: ch.chat_history || []
        };
      });
      setLobbies(formattedLobbies);
    }
    setLoading(false);
  };

  // 1. إرسال طلب التحدي
  const handleSendChallengeRequest = async (player: any) => {
    try {
      const { error } = await supabase.from('challenges').insert([{
        challenger_id: currentUser.id, challenged_id: player.id,
        status: 'pending', negotiation_status: 'none', chat_history: []
      }]);
      if (error) throw error;
      toast.success(`تم إرسال التحدي لـ ${player.first_name} 🎾`);
      fetchData();
    } catch (error) { toast.error("فشل إرسال التحدي"); }
  };

  // 2. قبول التحدي وفتح الشات
  const handleAcceptChallengeRequest = async (challengeId: string) => {
    try {
      const welcomeMsg = { sender: 'system', text: 'تم قبول التحدي! تقدرون تنسقون الموعد الآن 🔥', type: 'system', timestamp: new Date().toISOString() };
      const { error } = await supabase.from('challenges').update({
        status: 'accepted', negotiation_status: 'pending', chat_history: [welcomeMsg]
      }).eq('id', challengeId);
      if (error) throw error;
      toast.success("قبلت التحدي! الشات مفتوح للتنسيق ⚡");
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("فشل قبول التحدي"); }
  };

  // 3. إرسال رسالة عادية في الشات
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const cleanText = filterMessage(chatInput);
    if (cleanText !== chatInput) toast.error("خل روحك رياضية يا كابتن! تم تعديل كلمتك 🎾", { icon: '🚨' });

    const newMsg = { sender: currentUser.id, text: cleanText, type: 'text', timestamp: new Date().toISOString() };
    const updatedHistory = [...(activeLobby.chat_history || []), newMsg];
    
    // التحديث المحلي الفوري (للسرعة)
    setActiveLobby({ ...activeLobby, chat_history: updatedHistory });
    setChatInput('');

    // الرفع لـ Supabase
    await supabase.from('challenges').update({ chat_history: updatedHistory }).eq('id', activeLobby.id);
    fetchData();
  };

  // 4. إرسال كرت "اقتراح موعد" داخل الشات
  const handleSendProposalCard = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) { toast.error("حدد الملعب والوقت!"); return; }
    
    const matchTimestamp = `${selectedDate} ${selectedTime}`;
    const proposalMsg = { 
      sender: currentUser.id, type: 'proposal', 
      court: selectedCourt, time: matchTimestamp, 
      text: `وش رايك نلعب في ${selectedCourt}؟`,
      timestamp: new Date().toISOString() 
    };
    
    const updatedHistory = [...(activeLobby.chat_history || []), proposalMsg];
    
    try {
      await supabase.from('challenges').update({
        proposed_court: selectedCourt, proposed_time: matchTimestamp, proposed_by: currentUser.id,
        negotiation_status: 'negotiating', chat_history: updatedHistory
      }).eq('id', activeLobby.id);
      
      toast.success("تم إرسال العرض في الشات! 🎾");
      setShowProposalForm(false);
      setActiveLobby({ ...activeLobby, chat_history: updatedHistory, negotiation_status: 'negotiating', proposed_by: currentUser.id, proposed_court: selectedCourt, proposed_time: matchTimestamp });
      fetchData();
    } catch (error) { toast.error("خطأ في الإرسال"); }
  };

  // 5. الموافقة على الكرت وتأكيد الحجز (يقفل الشات)
  const handleConfirmProposalCard = async (court: string, time: string) => {
    const confirmMsg = { sender: 'system', text: `تم تأكيد المباراة في ${court}! 💥`, type: 'system', timestamp: new Date().toISOString() };
    const updatedHistory = [...(activeLobby.chat_history || []), confirmMsg];

    try {
      await supabase.from('challenges').update({
        negotiation_status: 'agreed', court_name: court, match_time: time, chat_history: updatedHistory
      }).eq('id', activeLobby.id);
      
      toast.success("تم تأكيد الحجز وتم إغلاق الشات! 🔒");
      setActiveLobby({ ...activeLobby, negotiation_status: 'agreed', chat_history: updatedHistory });
      fetchData();
    } catch (error) { toast.error("خطأ في التأكيد"); }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative overflow-hidden" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6 relative z-10">
        
        {/* التبويبات */}
        <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('players')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'players' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>اللاعبين المتاحين</button>
          <button onClick={() => setActiveTab('lobbies')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'lobbies' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>غرف المبارزة</button>
        </div>

        {/* قائمة اللاعبين */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-[1000] text-sm text-white">{player.first_name} {player.last_name}</h3>
                  <p className="text-[10px] text-cyan-400 font-bold">{player.play_level}</p>
                </div>
                <button onClick={() => handleSendChallengeRequest(player)} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black uppercase active:scale-95 transition-all flex items-center gap-1"><Swords size={14}/> تحدى</button>
              </div>
            ))}
          </div>
        )}

        {/* قائمة غرف المبارزة */}
        {activeTab === 'lobbies' && (
          <div className="space-y-4">
            {lobbies.map(lobby => (
              <div key={lobby.id} onClick={() => setActiveLobby(lobby)} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-4 cursor-pointer relative shadow-lg hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-[1000] text-sm text-white">{lobby.opponent_name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">
                      {lobby.status === 'pending' ? '⏳ بانتظار القبول' : lobby.negotiation_status === 'agreed' ? '🔒 شات مغلق (تم التأكيد)' : '🟢 الشات مفتوح للتنسيق'}
                    </p>
                  </div>
                  <MessageSquare size={20} className={lobby.negotiation_status === 'agreed' ? 'text-gray-600' : 'text-cyan-400'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= نافذة غرفة التنسيق والشات الذكي ================= */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#05081d]/90 backdrop-blur-md" onClick={() => setActiveLobby(null)} />
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full h-[90vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          {/* الهيدر العلوي للغرفة */}
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400"><Swords size={20} /></div>
              <div>
                <h2 className="font-[1000] text-sm uppercase">{activeLobby?.opponent_name}</h2>
                <p className="text-[10px] text-gray-400">{activeLobby?.negotiation_status === 'agreed' ? 'تم تأكيد المباراة ✅' : 'جاري التنسيق...'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.success("تم الإبلاغ للإدارة")} className="p-2 bg-red-500/10 text-red-500 rounded-full"><ShieldAlert size={16} /></button>
              <button onClick={() => setActiveLobby(null)} className="p-2 bg-white/5 text-gray-400 rounded-full"><X size={16} /></button>
            </div>
          </div>

          {/* منطقة الشات الأساسية */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* حالة الانتظار */}
            {activeLobby?.status === 'pending' ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-6 opacity-60">
                <Clock size={40} className="mb-4 text-yellow-500" />
                <h3 className="font-black text-lg mb-2">التحدي معلق</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {activeLobby.challenger_id === currentUser?.id ? 'أنتظر خصمك يقبل التحدي عشان يفتح الشات.' : 'خصمك يتحداك! اقبل التحدي عشان تقدرون تسولفون وتنسقون.'}
                </p>
                {activeLobby.challenged_id === currentUser?.id && (
                  <button onClick={() => handleAcceptChallengeRequest(activeLobby.id)} className="mt-6 px-8 py-3 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95">قبول التحدي 💥</button>
                )}
              </div>
            ) : (
              /* الرسائل والكروت */
              activeLobby?.chat_history?.map((msg: any, idx: number) => (
                <div key={idx} className={`flex ${msg.type === 'system' ? 'justify-center' : msg.sender === currentUser?.id ? 'justify-start' : 'justify-end'}`}>
                  
                  {/* رسالة النظام (System) */}
                  {msg.type === 'system' && (
                    <span className="bg-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black">{msg.text}</span>
                  )}

                  {/* رسالة نصية عادية (Text) */}
                  {msg.type === 'text' && (
                    <div className={`max-w-[80%] px-4 py-3 rounded-[20px] text-xs font-bold leading-relaxed ${msg.sender === currentUser?.id ? 'bg-cyan-500 text-[#0a0f3c] rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  )}

                  {/* كرت التفاوض (Proposal) */}
                  {msg.type === 'proposal' && (
                    <div className={`max-w-[85%] bg-[#05081d] border border-cyan-500/30 p-4 rounded-2xl ${msg.sender === currentUser?.id ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                      <p className="text-[10px] text-gray-400 mb-2 italic">{msg.text}</p>
                      <div className="bg-white/5 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 text-cyan-400 mb-1"><MapPin size={14}/> <span className="text-xs font-bold">{msg.court}</span></div>
                        <div className="flex items-center gap-2 text-emerald-400"><Calendar size={14}/> <span className="text-[10px] font-bold" dir="ltr">{new Date(msg.time).toLocaleString('en-GB', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span></div>
                      </div>
                      {/* الزر يظهر للخصم فقط، ويختفي إذا تم الاتفاق مسبقاً */}
                      {msg.sender !== currentUser?.id && activeLobby.negotiation_status !== 'agreed' && (
                        <button onClick={() => handleConfirmProposalCard(msg.court, msg.time)} className="w-full py-2.5 bg-emerald-500 text-[#0a0f3c] rounded-lg text-xs font-black">قبول وتأكيد الحجز ✅</button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* منطقة الإدخال (مقفلة إذا لم يتم القبول أو تم الاتفاق النهائي) */}
          {activeLobby?.status === 'accepted' && (
            <div className="p-4 bg-[#05081d] border-t border-white/5">
              
              {activeLobby.negotiation_status === 'agreed' ? (
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                  🔒 تم إغلاق الشات لأن المباراة مؤكدة.
                </div>
              ) : (
                <>
                  {/* فورم إرسال كرت الاقتراح (يظهر عند الضغط على الزر) */}
                  {showProposalForm && (
                    <div className="mb-4 bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                      <p className="text-[10px] font-black text-cyan-400 uppercase">اقتراح موعد كرت:</p>
                      <select className="w-full bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs font-bold outline-none" onChange={(e) => setSelectedCourt(e.target.value)}>
                        <option value="">اختر الملعب...</option><option value="ملعب هايب 1">ملعب هايب 1</option><option value="ملعب هايب 2">ملعب هايب 2</option>
                      </select>
                      <div className="flex gap-2">
                        <input type="date" className="flex-1 bg-[#0a0f3c] p-3 rounded-xl text-xs outline-none [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setSelectedDate(e.target.value)} />
                        <input type="time" className="flex-1 bg-[#0a0f3c] p-3 rounded-xl text-xs outline-none [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setSelectedTime(e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowProposalForm(false)} className="px-4 py-3 bg-white/5 rounded-xl text-xs font-black">إلغاء</button>
                        <button onClick={handleSendProposalCard} className="flex-1 py-3 bg-cyan-500 text-[#0a0f3c] rounded-xl text-xs font-black">إرسال العرض في الشات 📅</button>
                      </div>
                    </div>
                  )}

                  {/* شريط الإدخال الأساسي */}
                  <div className="flex items-center gap-2 relative">
                    <button onClick={() => setShowProposalForm(!showProposalForm)} className="p-3 bg-white/5 rounded-2xl text-cyan-400 active:scale-95 transition-all"><Calendar size={20} /></button>
                    <input 
                      type="text" 
                      placeholder="اكتب رسالتك..." 
                      className="flex-1 bg-white/5 border border-white/10 p-3 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all text-white pr-12"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} className={`absolute left-2 p-2 rounded-xl transition-all ${chatInput.trim() ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500 pointer-events-none'}`}>
                      <Send size={16} className="rotate-180" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}