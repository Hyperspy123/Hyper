import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Send, ChevronLeft, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Chat() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data } = await supabase
        .from('challenge_messages')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      setLoading(false);
    }
    initChat();

    const channel = supabase
      .channel(`chat-${challengeId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'challenge_messages',
        filter: `challenge_id=eq.${challengeId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [challengeId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageToSend = newMessage;
    setNewMessage('');

    const { error } = await supabase
      .from('challenge_messages')
      .insert([{
        challenge_id: challengeId,
        sender_id: currentUser.id,
        message: messageToSend
      }]);

    if (error) {
      toast.error("فشل إرسال الرسالة");
      setNewMessage(messageToSend);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05081d] flex flex-col items-center justify-center text-cyan-400 gap-4">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">جاري فتح الغرفة...</span>
    </div>
  );

  return (
    <div className="h-screen bg-[#05081d] text-white flex flex-col overflow-hidden" dir="rtl">
      <Header />
      
      {/* Header الشات - ثابت في الأعلى */}
      <div className="pt-24 px-6 pb-4 bg-[#0a0f3c] border-b border-white/5 flex items-center justify-between z-20 shadow-xl">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl text-cyan-400 border border-white/10 active:scale-90 transition-all">
          <ChevronLeft size={20} className="rotate-180" />
        </button>
        <div className="text-center">
          <h2 className="font-black italic text-sm tracking-tighter uppercase">غرفة التحدي ⚔️</h2>
          <p className="text-[8px] text-cyan-400/50 uppercase font-bold tracking-widest">Live Battle Chat</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-lg">
          <User size={20} />
        </div>
      </div>

      {/* منطقة الرسائل - قابلة للتمرير فقط في المنتصف ✅ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center py-20 opacity-20 italic font-black text-[10px] uppercase tracking-[0.2em]">ابدأ التوعد بالهزيمة...</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-[26px] text-sm font-bold shadow-2xl ${
                isMe 
                ? 'bg-cyan-500 text-[#0a0f3c] rounded-br-none shadow-cyan-500/10' 
                : 'bg-[#0a0f3c] border border-white/10 text-white rounded-bl-none shadow-black/40'
              }`}>
                {msg.message}
                <div className={`text-[7px] mt-1.5 font-black uppercase tracking-tighter opacity-50 ${isMe ? 'text-[#0a0f3c]' : 'text-cyan-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" /> {/* مساحة إضافية في الأسفل */}
      </div>

      {/* حقل الإدخال - ثابت بقوة ولا يسمح برؤية الخلفية من تحته ✅ */}
      <div className="p-6 bg-[#0a0f3c] border-t border-white/5 pb-10 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <form onSubmit={sendMessage} className="relative flex items-center max-w-lg mx-auto">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="w-full bg-white/5 border border-white/10 rounded-[22px] py-5 pr-6 pl-16 text-xs font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600 shadow-inner"
          />
          <button type="submit" className="absolute left-2.5 p-3.5 bg-cyan-500 text-[#0a0f3c] rounded-xl active:scale-90 transition-all shadow-lg shadow-cyan-500/20">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}