import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Trophy, Zap, Shield, Search, MessageSquare, ChevronLeft, Star, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('total_matches', { ascending: false }); // الترتيب حسب النقاط
    
    if (!error) setPlayers(data);
    setLoading(false);
  };

  const sendChallenge = async (player: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("سجل دخولك أولاً");
    if (user.id === player.id) return toast.error("ما تقدر تتحدى نفسك يا وحش! 😂");

    const { error } = await supabase.from('challenges').insert([
      { sender_id: user.id, receiver_id: player.id, status: 'pending' }
    ]);

    if (!error) {
      toast.success(`تم إرسال التحدي لـ ${player.first_name} 🔥`);
    } else {
      toast.error("فشل إرسال التحدي");
    }
  };

  const filteredPlayers = players.filter(p => 
    p.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative overflow-x-hidden" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24 text-right">
        {/* Header Section */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter leading-none">
                مجتمع <span className="text-cyan-400">الأساطير</span>
              </h1>
              <p className="text-[10px] font-black text-gray-500 mt-2 uppercase italic tracking-widest">صراع النخبة .. من القادم؟</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400"><ChevronLeft size={20} className="rotate-180" /></button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن خصمك القادم..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0f3c]/60 border border-white/10 rounded-[22px] py-4 pr-12 pl-6 text-sm font-bold focus:outline-none focus:border-cyan-500/50 transition-all backdrop-blur-xl"
          />
        </div>

        {/* Players Grid */}
        <div className="grid gap-6">
          {filteredPlayers.map((player, index) => (
            <div key={player.id} className="relative group">
              {/* Badge للترتيب */}
              <div className="absolute -top-3 -left-3 z-20 bg-yellow-500 text-[#0a0f3c] w-8 h-8 rounded-full flex items-center justify-center font-[1000] italic shadow-lg border-2 border-[#0a0f3c]">
                #{index + 1}
              </div>

              <div className="bg-[#0a0f3c]/80 backdrop-blur-3xl border border-white/10 rounded-[35px] p-6 flex items-center justify-between transition-all hover:border-cyan-500/30 group-hover:translate-y-[-5px] shadow-2xl">
                
                {/* معلومات اللاعب */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-2xl italic text-[#0a0f3c] shadow-lg">
                      {player.first_name?.[0] || 'P'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#0a0f3c]" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-xl italic leading-none mb-1">{player.first_name}</h3>
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Shield size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{player.current_rank}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-500 mt-1">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black italic">{player.total_matches * 10} نقطة</span>
                    </div>
                  </div>
                </div>

                {/* أزرار التفاعل */}
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => sendChallenge(player)}
                    className="p-3 bg-cyan-500 text-[#0a0f3c] rounded-xl shadow-lg shadow-cyan-500/20 active:scale-90 transition-all"
                    title="تحدي"
                  >
                    <Swords size={20} />
                  </button>
                  <button 
                    className="p-3 bg-white/5 text-gray-400 rounded-xl border border-white/10 hover:text-white transition-all"
                    title="شات"
                    onClick={() => toast.info("سيفتح الشات عند قبول التحدي 😉")}
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}