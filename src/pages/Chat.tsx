import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Send, ChevronLeft, Loader2, User } from 'lucide-react';
import { toast } from 'sonner'; // استيراد التنبيهات المفقود ✅

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
      // الحصول على المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // جلب الرسائل القديمة لهذا التحدي تحديداً
      const { data, error } = await supabase
        .from('challenge_messages')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data) {
        setMessages(data);
      }
      setLoading(false);
    }
    initChat();

    // الاشتراك في الرسائل اللحظية (Real-time) ✅
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

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [challengeId]);

  // التمرير لآخر رسالة تلقائياً عند وصول رسالة جديدة
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageToSend = newMessage;
    setNewMessage(''); // مسح الحقل فوراً ليعطي شعور بالسرعة للمستخدم

    const { error } = await supabase
      .from('challenge_messages')
      .insert([{
        challenge_id: challengeId,
        sender_id: currentUser.id,
        message: messageToSend
      }]);

    if (error) {
      toast.error("فشل إرسال الرسالة");
      setNewMessage(messageToSend); // إعادة النص في حال الفشل
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05081d] flex flex-col items-center justify-center text-cyan-400 gap-4">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">جاري فتح الغرفة...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05081d] text-white flex flex-col font-sans" dir="rtl">
      <Header />
      
      {/* Header الشات العلوي */}
      <div className="pt-24 px-6 pb-4 bg-[#0a0f3c]/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between sticky top-0 z-20 shadow-2xl">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
          <ChevronLeft size={20} className="rotate-180" />
        </button>
        <div className="text-center">
          <h2 className="font-[1000] italic text-sm uppercase tracking-tighter">غرفة التحدي ⚔️</h2>
          <p className="text-[8px] text-cyan-400/60 uppercase font-black tracking-[0.2em] italic">Elite Battleground</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-lg">
          <User size={20} />
        </div>
      </div>

      {/* منطقة عرض الرسائل */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-20 italic font-black text-[10px] uppercase tracking-widest">
            ابدأ الحديث مع خصمك...
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-[28px] text-sm font-bold shadow-2xl transition-all ${
                isMe 
                ? 'bg-cyan-500 text-[#0a0f3c] rounded-br-none shadow-cyan-500/10' 
                : 'bg-[#0a0f3c]/80 border border-white/10 text-white rounded-bl-none shadow-black/40'
              }`}>
                {msg.message}
                <div className={`text-[7px] mt-1.5 font-black uppercase tracking-tighter opacity-60 ${isMe ? 'text-[#0a0f3c]' : 'text-cyan-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* منطقة الإدخال السفلية */}
      <form onSubmit={sendMessage} className="p-6 bg-[#0a0f3c]/95 backdrop-blur-3xl border-t border-white/5 pb-10 sticky bottom-0">
        <div className="relative flex items-center max-w-lg mx-auto">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="توعد خصمك بكلمتين..."
            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pr-6 pl-16 text-xs font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
          />
          <button type="submit" className="absolute left-2 p-3.5 bg-cyan-500 text-[#0a0f3c] rounded-2xl active:scale-90 transition-all shadow-lg shadow-cyan-500/20">
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}