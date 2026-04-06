import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MessageSquare, ChevronLeft, User, Loader2 } from 'lucide-react';

export default function Messages() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyChats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // تعديل السطر 35 لاستخدام استعلام متوافق ✅
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id,
          sender_id,
          receiver_id,
          sender:profiles!challenges_sender_id_fkey(first_name, current_rank),
          receiver:profiles!challenges_receiver_id_fkey(first_name, current_rank)
        `)
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Chat fetch error:", error.message);
      }

      if (data) {
        const formattedChats = (data as any[]).map((chat) => {
          const isSender = chat.sender_id === user.id;
          // إذا كنت أنت المرسل، نريد بيانات المستلم، والعكس صحيح
          const otherUser = isSender ? chat.receiver : chat.sender;
          return { 
            id: chat.id, 
            first_name: otherUser?.first_name || 'لاعب بادل',
            current_rank: otherUser?.current_rank || 'ROOKIE'
          };
        });
        setChats(formattedChats);
      }
      setLoading(false);
    }
    fetchMyChats();
  }, []);

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto">
        <h1 className="text-3xl font-[1000] italic mb-8 uppercase">الرسائل <span className="text-cyan-400">CHATS</span></h1>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full p-5 rounded-[30px] bg-[#0a0f3c]/60 border border-white/5 flex items-center justify-between hover:border-cyan-500/30 transition-all active:scale-95 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                    <User size={24} />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black italic text-white text-lg leading-none mb-1">{chat.first_name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter italic">{chat.current_rank} • تحدي قائم ⚔️</p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 opacity-30">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">لا توجد محادثات نشطة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}