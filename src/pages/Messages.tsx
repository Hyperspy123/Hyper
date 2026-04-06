import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MessageCircle, ChevronLeft, User, Swords } from 'lucide-react';

export default function Messages() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyChats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب التحديات المقبولة فقط (لأنها هي التي تفتح شات)
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id,
          status,
          sender:sender_id(first_name, current_rank),
          receiver:receiver_id(first_name, current_rank)
        `)
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (data) setChats(data);
      setLoading(false);
    }
    fetchMyChats();
  }, []);

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-[1000] italic uppercase leading-none">محادثات <span className="text-cyan-400 text-xl tracking-normal">CHATS</span></h1>
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400"><ChevronLeft size={20} className="rotate-180" /></button>
        </div>

        <div className="space-y-4">
          {chats.length > 0 ? chats.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="w-full p-5 rounded-[30px] bg-[#0a0f3c]/60 border border-white/5 backdrop-blur-xl flex items-center justify-between hover:border-cyan-500/30 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center text-cyan-400 border border-white/5">
                  <User size={24} />
                </div>
                <div className="text-right">
                  <h4 className="font-black italic text-white leading-none mb-1 text-lg">
                    {/* عرض اسم الشخص الآخر (ليس أنا) */}
                    مباراة التحدي 🔥
                  </h4>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter italic">اضغط لمواصلة الدردشة</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
          )) : (
            <div className="text-center py-20 opacity-30">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">لا توجد محادثات نشطة حالياً</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}