import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchPlayers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب اللاعبين العامين مع استبعاد المستخدم الحالي (أنت) ✅
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .neq('id', user.id) // استبعاد بروفايلي الشخصي
        .order('total_matches', { ascending: false });
      
      if (data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  const sendChallenge = async (receiverId: string, receiverName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('challenges')
      .insert([{ 
        sender_id: user.id, 
        receiver_id: receiverId, 
        status: 'pending' 
      }]);

    if (!error) {
      toast.success(`تم إرسال تحدي لـ ${receiverName} ⚔️`);
    } else {
      toast.error("حدث خطأ في إرسال التحدي");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto">
        <h1 className="text-3xl font-[1000] italic mb-8 uppercase italic">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
        
        <div className="relative mb-6">
          <Search className="absolute right-4 top-4 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن منافس..." 
            className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl outline-none focus:border-cyan-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
          ) : (
            players
              .filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((player, index) => (
                <div key={player.id} className="p-5 rounded-[30px] bg-[#0a0f3c]/60 border border-white/5 flex items-center justify-between backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm italic">{player.first_name}</h4>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{player.current_rank}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => sendChallenge(player.id, player.first_name)}
                    className="p-3.5 bg-cyan-500 text-[#0a0f3c] rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Swords size={20} />
                  </button>
                </div>
              ))
          )}
        </div>
      </main>
    </div>
  );
}