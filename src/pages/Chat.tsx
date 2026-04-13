import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import { ChevronRight, ShieldAlert, Loader2, Navigation, MapPin, Car, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Chat() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/auth');
      setCurrentUser(user);

      const { data: challenge } = await supabase
        .from('challenges')
        .select('*, challenger:challenger_id(id, first_name), challenged:challenged_id(id, first_name)')
        .eq('id', challengeId)
        .single();

      if (challenge) {
        setOpponent(challenge.challenger_id === user.id ? challenge.challenged : challenge.challenger);
      }

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

    const channel = supabase.channel(`chat_${challengeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `challenge_id=eq.${challengeId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [challengeId, navigate]);

  const scrollToBottom = () => {
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  // إرسال الرسالة الجاهزة فقط
  const sendPredefinedMessage = async (text: string) => {
    if (!currentUser || isSending) return;
    setIsSending(true);

    const { error } = await supabase.from('messages').insert([{
      challenge_id: challengeId,
      sender_id: currentUser.id,
      content: text
    }]);

    if (error) toast.error("فشل الإرسال");
    setIsSending(false);
  };

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white flex flex-col font-sans" dir="rtl">
      
      <header className="fixed top-0 left-0 right-0 bg-[#0a0f3c]/90 backdrop-blur-xl border-b border-white/10 p-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center font-black text-cyan-400 border border-cyan-500/30">
            {opponent?.first_name?.[0]}
          </div>
          <div>
            <h2 className="font-black italic leading-none">{opponent?.first_name}</h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">غرفة التنسيق المغلقة</span>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl text-gray-400 active:scale-90 transition-all">
          <ChevronRight size={20} className="rotate-180" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pt-24 pb-48 px-4 space-y-4">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center mb-6">
          <ShieldAlert className="mx-auto text-cyan-400 mb-2" size={24} />
          <p className="text-[10px] font-black text-cyan-400 italic">هذه الغرفة مغلقة لأمانكم. استخدم الأزرار بالأسفل لتحديث حالتك لخصمك. وتذكر إبلاغ موظف الحجز عند وصولك!</p>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] p-4 rounded-3xl text-sm font-bold shadow-lg ${isMe ? 'bg-cyan-500 text-[#0a0f3c] rounded-tr-sm' : 'bg-[#14224d] border border-white/10 text-white rounded-tl-sm'}`}>
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

      {/* منطقة الأزرار الجاهزة (بدون كيبورد) */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0f3c]/95 backdrop-blur-2xl border-t border-white/10 z-50 rounded-t-[30px]">
        <p className="text-[10px] text-gray-400 font-black text-center uppercase mb-3">اختر التحديث المناسب لإرساله لخصمك</p>
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          <button onClick={() => sendPredefinedMessage("في طريقي للملعب 🚗")} disabled={isSending} className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black active:scale-95 transition-all flex justify-center items-center gap-2"><Car size={16}/> في الطريق</button>
          <button onClick={() => sendPredefinedMessage("وصلت الملعب 📍")} disabled={isSending} className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black active:scale-95 transition-all flex justify-center items-center gap-2"><MapPin size={16}/> وصلت الملعب</button>
          <button onClick={() => sendPredefinedMessage("تأخرت شوي، بالطريق ⏳")} disabled={isSending} className="col-span-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black active:scale-95 transition-all flex justify-center items-center gap-2"><Clock size={16}/> تأخرت شوي</button>
          <button onClick={() => sendPredefinedMessage("أنا عند مسؤول الحجز، وينك؟ 🔥")} disabled={isSending} className="col-span-2 py-4 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl text-[12px] font-[1000] active:scale-95 transition-all uppercase italic flex items-center justify-center gap-2"><Navigation size={18}/> أنا عند مسؤول الحجز</button>
        </div>
      </footer>
    </div>
  );
}