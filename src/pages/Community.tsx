import { useState, useEffect, useRef } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Search, Swords, Zap, X, CheckCircle2, Send, ShieldAlert, MessageSquare, Clock, Info } from 'lucide-react';
import { toast } from 'sonner';

// 🛑 فلتر الكلمات المسيئة
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

  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  // 1. إرسال طلب التحدي + إشعار للخصم
  const handleSendChallengeRequest = async (player: any) => {
    try {
      const { data, error } = await supabase.from('challenges').insert([{
        challenger_id: currentUser.id, challenged_id: player.id,
        status: 'pending', negotiation_status: 'none', chat_history: []
      }]).select().single();

      if (error) throw error;

      // 🔥 إرسال الإشعار
      await supabase.from('notifications').insert([{
        user_id: player.id,
        title: 'تحدي جديد ⚔️',
        message: `وصلك طلب تحدي من ${currentUser.first_name}! ادخل واقبل التحدي.`,
        type: 'challenge'
      }]);

      toast.success(`تم إرسال التحدي لـ ${player.first_name} 🎾`);
      fetchData();
    } catch (error) { toast.error("فشل إرسال التحدي"); }
  };

  // 2. قبول التحدي + إشعار للمتحدي
  const handleAcceptChallengeRequest = async (lobby: any) => {
    try {
      const welcomeMsg = { sender: 'system', text: 'تم قبول التحدي! اتفقوا على الملعب والوقت هنا 🔥', type: 'system', timestamp: new Date().toISOString() };
      const { error } = await supabase.from('challenges').update({
        status: 'accepted', negotiation_status: 'pending', chat_history: [welcomeMsg]
      }).eq('id', lobby.id);

      if (error) throw error;

      // 🔥 إرسال إشعار للمتحدي الأصلي
      await supabase.from('notifications').insert([{
        user_id: lobby.challenger_id,
        title: 'قُبل التحدي 🔥',
        message: `${currentUser.first_name} قبل تحديك! ادخل ونسق الموعد.`,
        type: 'challenge'
      }]);

      toast.success("قبلت التحدي! الشات مفتوح الآن ⚡");
      fetchData();
      setActiveLobby(null);
    } catch (error) { toast.error("فشل قبول التحدي"); }
  };

  // 3. إرسال رسالة + إشعار بسيط للخصم
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const cleanText = filterMessage(chatInput);
    if (cleanText !== chatInput) toast.error("تم تنظيف رسالتك.. خلك رياضي 🎾");

    const newMsg = { sender: currentUser.id, text: cleanText, type: 'text', timestamp: new Date().toISOString() };
    const updatedHistory = [...(activeLobby.chat_history || []), newMsg];
    
    setActiveLobby({ ...activeLobby, chat_history: updatedHistory });
    setChatInput('');

    await supabase.from('challenges').update({ chat_history: updatedHistory }).eq('id', activeLobby.id);
    
    // 🔥 إرسال إشعار للخصم بوجود رسالة جديدة
    const opponentId = activeLobby.challenger_id === currentUser.id ? activeLobby.challenged_id : activeLobby.challenger_id;
    await supabase.from('notifications').insert([{
      user_id: opponentId,
      title: 'رسالة جديدة 💬',
      message: `${currentUser.first_name} أرسل لك رسالة في غرفة التنسيق.`,
      type: 'challenge'
    }]);

    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative overflow-hidden" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6 relative z-10">
        
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
                <button onClick={() => handleSendChallengeRequest(player)} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black active:scale-95 transition-all flex items-center gap-1"><Swords size={14}/> تحدى</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map(lobby => (
              <div key={lobby.id} onClick={() => setActiveLobby(lobby)} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-4 cursor-pointer relative shadow-lg hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-[1000] text-sm text-white">{lobby.opponent_name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">
                      {lobby.status === 'pending' ? '⏳ بانتظار القبول' : '🟢 الشات مفتوح للتنسيق'}
                    </p>
                  </div>
                  <MessageSquare size={20} className="text-cyan-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= نافذة الشات الذكي (Lobby Modal) ================= */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#05081d]/90 backdrop-blur-md" onClick={() => setActiveLobby(null)} />
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full h-[90vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400"><Swords size={20} /></div>
              <div><h2 className="font-[1000] text-sm uppercase">{activeLobby?.opponent_name}</h2><p className="text-[10px] text-gray-400">غرفة التنسيق</p></div>
            </div>
            <button onClick={() => setActiveLobby(null)} className="p-2 bg-white/5 text-gray-400 rounded-full"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeLobby?.status === 'pending' ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-6 opacity-60">
                <Clock size={40} className="mb-4 text-yellow-500" />
                <h3 className="font-black text-lg mb-2">بانتظار القبول</h3>
                {activeLobby.challenged_id === currentUser?.id && (
                  <button onClick={() => handleAcceptChallengeRequest(activeLobby)} className="mt-6 px-8 py-3 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95">قبول التحدي 💥</button>
                )}
              </div>
            ) : (
              <>
                {/* 🛡️ تنبيه أمني واضح جداً 🛡️ */}
                <div className="bg-[#05081d] border border-cyan-500/20 rounded-2xl p-4 text-center mb-4">
                  <div className="flex items-center justify-center gap-2 text-cyan-400 mb-1 font-black text-[10px] uppercase"><ShieldAlert size={14} /> محادثة مسجلة</div>
                  <p className="text-[9px] text-gray-500">لضمان سلامتك، جميع المحادثات مسجلة ومراقبة. يرجى الاتفاق على الموعد والملعب ثم التوجه للرئيسية لإتمام الحجز.</p>
                </div>

                {activeLobby?.chat_history?.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex ${msg.type === 'system' ? 'justify-center' : msg.sender === currentUser?.id ? 'justify-start' : 'justify-end'}`}>
                    {msg.type === 'system' ? (
                      <span className="bg-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[9px] font-black">{msg.text}</span>
                    ) : (
                      <div className={`max-w-[80%] px-4 py-3 rounded-[20px] text-xs font-bold ${msg.sender === currentUser?.id ? 'bg-cyan-500 text-[#0a0f3c] rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}

                {/* 💡 تلميح الحجز الطبيعي */}
                <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                  <Info size={18} className="text-purple-400 flex-none" />
                  <p className="text-[10px] text-purple-300 font-bold leading-relaxed">بعد الاتفاق هنا، رح لصفحة الملاعب بالرئيسية واحجز ملعبك المفضل كالمعتاد! 🎾</p>
                </div>
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {activeLobby?.status === 'accepted' && (
            <div className="p-4 bg-[#05081d] border-t border-white/5">
              <div className="flex items-center gap-2 relative">
                <input 
                  type="text" placeholder="اكتب رسالتك للاتفاق..." 
                  className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 text-white pr-12"
                  value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className={`absolute left-2 p-2 rounded-xl transition-all ${chatInput.trim() ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500 pointer-events-none'}`}>
                  <Send size={18} className="rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}