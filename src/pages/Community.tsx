import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Zap, Send, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchPlayers() {
      // جلب اللاعبين الذين جعلوا ملفهم "عام" فقط
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('total_matches', { ascending: false });
      
      if (data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  const sendInvite = async (receiverId: string, receiverName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // استدعاء الدالة اللي برمجناها في الـ SQL
    const { error } = await supabase.rpc('send_faz3a_invite', {
      p_receiver_id: receiverId,
      p_post_id: 'ID_OF_YOUR_FAZ3A', // هنا لازم نمرر آيدي الفزعة اللي تبي تدعوه لها
      p_sender_name: 'زميلك في هايب' 
    });

    if (!error) {
      toast.success(`تم إرسال دعوة لـ ${receiverName} 🔥`);
    } else {
      toast.error("فشل إرسال الدعوة");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto">
        <h1 className="text-3xl font-[1000] italic mb-8 uppercase italic">المجتمع <span className="text-cyan-400">Players</span></h1>
        
        {/* شريط البحث */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-4 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن لاعبين..." 
            className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl outline-none focus:border-cyan-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {loading ? <Loader2 className="animate-spin mx-auto text-cyan-400" /> : 
            players.filter(p => p.first_name.includes(searchTerm)).map(player => (
            <div key={player.id} className="p-5 rounded-[30px] bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm italic">{player.first_name} {player.last_name}</h4>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{player.current_rank}</span>
                </div>
              </div>
              
              <button 
                onClick={() => sendInvite(player.id, player.first_name)}
                className="p-3 bg-cyan-500 text-[#0a0f3c] rounded-xl hover:scale-110 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Send size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}