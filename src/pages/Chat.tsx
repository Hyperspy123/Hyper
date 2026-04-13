import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import { ChevronRight, Send, ShieldAlert, Loader2 } from 'lucide-react';

export default function Chat() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/auth');
      setCurrentUser(user);

      // جلب بيانات التحدي والخصم
      const { data: challenge } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:challenger_id(id, first_name),
          challenged:challenged_id(id, first_name)
        `)
        .eq('id', challengeId)
        .single();

      if (challenge) {
        setOpponent(challenge.challenger_id === user.id ? challenge.challenged : challenge.challenger);
      }

      // جلب الرسائل السابقة
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });
      
      setMessages(msgData || []);
      setLoading(false);
      scrollToBottom();
    };

    initChat();

    // الاستماع للرسائل الجديدة لحظياً
    const channel = supabase.channel(`chat_${challengeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `challenge_id=eq.${challengeId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [challengeId, navigate]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg = newMessage;
    setNewMessage(''); // تفريغ الحقل فوراً لتجربة سريعة

    await supabase.from('messages').insert([{
      challenge_id: challengeId,
      sender_id: currentUser.id,
      content: msg
    }]);
  };

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white flex flex-col font-sans" dir="rtl">
      
      {/* هيدر الشات */}
      <header className="fixed top-0 left-0 right-0 bg-[#0a0f3c]/90 backdrop-blur-xl border-b border-white/10 p-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/30">
            {opponent?.first_name?.[0]}
          </div>
          <div>
            <h2 className="font-black italic leading-none">{opponent?.first_name}</h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تنسيق المباراة</span>
          </div>
        </div>
        <button onClick={() => navigate('/community')} className="p-2.5 bg-white/5 rounded-xl text-gray-400 active:scale-90 transition-all">
          <ChevronRight size={20} className="rotate-180" />
        </button>
      </header>

      {/* منطقة الرسائل */}
      <main className="flex-1 overflow-y-auto pt-24 pb-24 px-4 space-y-4">
        
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center mb-6">
          <ShieldAlert className="mx-auto text-cyan-400 mb-2" size={24} />
          <p className="text-xs font-black text-cyan-400 italic">الروح الرياضية أولاً! الشات مخصص لتنسيق موعد ومكان التحدي فقط 🤝</p>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] p-4 rounded-3xl text-sm font-bold shadow-lg ${
                isMe 
                  ? 'bg-cyan-500 text-[#0a0f3c] rounded-tr-sm' 
                  : 'bg-[#14224d] border border-white/10 text-white rounded-tl-sm'
              }`}>
                {msg.content}
                <div className={`text-[8px] mt-1 text-right opacity-60 font-black ${isMe ? 'text-[#0a0f3c]' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* حقل الإدخال */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0f3c]/90 backdrop-blur-xl border-t border-white/10 z-50">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-lg mx-auto">
          <input 
            type="text" 
            placeholder="اكتب رسالتك لخصمك..." 
            className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl active:scale-90 transition-all disabled:opacity-50"
          >
            <Send size={20} className="rotate-180" />
          </button>
        </form>
      </footer>
    </div>
  );
}