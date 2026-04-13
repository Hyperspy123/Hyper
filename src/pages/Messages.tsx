import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { ChevronRight, MessageSquare, Loader2, User } from 'lucide-react';

export default function Messages() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/auth');
      setCurrentUserId(user.id);

      // جلب جميع التحديات المقبولة (التي تعتبر غرف شات)
      const { data } = await supabase
        .from('challenges')
        .select(`
          id, court_name, match_time,
          challenger:challenger_id(id, first_name),
          challenged:challenged_id(id, first_name)
        `)
        .eq('status', 'accepted')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`);
        
      setChats(data || []);
      setLoading(false);
    };
    fetchChats();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-24" dir="rtl">
      <Header />
      <div className="p-6 flex items-center justify-between mt-4">
        <h1 className="text-3xl font-[1000] italic tracking-tighter uppercase flex items-center gap-3">الرسائل <MessageSquare className="text-cyan-400" /></h1>
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
          <ChevronRight size={22} className="rotate-180" />
        </button>
      </div>

      <main className="px-6 max-w-lg mx-auto space-y-4">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 font-black text-sm border border-white/5 p-10 rounded-[30px] bg-white/5">
            لا توجد محادثات حالياً.<br/>اقبل تحدي لتبدأ التنسيق! 🎾
          </div>
        ) : (
          chats.map(chat => {
            // تحديد من هو الخصم
            const opponent = chat.challenger.id === currentUserId ? chat.challenged : chat.challenger;
            return (
              <button 
                key={chat.id} 
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full bg-[#0a0f3c] border border-white/10 p-5 rounded-[25px] flex items-center gap-4 active:scale-95 transition-all text-right shadow-lg hover:border-cyan-500/30"
              >
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-lg text-white">{opponent.first_name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase italic mt-1">{chat.court_name}</p>
                </div>
                <ChevronRight size={20} className="text-gray-500 rotate-180" />
              </button>
            )
          })
        )}
      </main>
    </div>
  );
}