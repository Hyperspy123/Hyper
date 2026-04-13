import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Calendar, MapPin, Users, X, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // دالة جلب التحديات الموجهة "لي" (مين يتحداك؟)
  const fetchIncomingChallenges = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        profiles:challenger_id (first_name, current_rank)
      `)
      .eq('challenged_id', session.user.id) // التحديات المرسلة لي
      .eq('status', 'pending'); // المعلقة فقط

    if (!error) setIncomingChallenges(data || []);
  }, []);

  // دالة جلب اللاعبين للبحث
  const fetchPlayers = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .neq('id', session?.user?.id) // استثناء حسابي
      .order('total_matches', { ascending: false });
    
    setPlayers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchIncomingChallenges();

    // الاستماع اللحظي للتحديات الجديدة لضمان ظهورها فوراً في "مين يتحداك"
    const channel = supabase.channel('realtime_challenges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchIncomingChallenges();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPlayers, fetchIncomingChallenges]);

  // دالة تحديث حالة التحدي (قبول أو رفض)
  const handleStatusUpdate = async (id: string, newStatus: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      toast.success(newStatus === 'accepted' ? "تم قبول التحدي! جاهز؟" : "تم الرفض");
      fetchIncomingChallenges();
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-8">
        
        {/* 🔥 خانة "مين يتحداك؟" 🔥 */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">
              مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" />
            </h2>
            <div className="space-y-3">
              {incomingChallenges.map((ch) => (
                <div key={ch.id} className="bg-cyan-500 text-[#0a0f3c] p-5 rounded-[30px] shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-right">
                      <h4 className="font-black text-sm uppercase italic leading-none mb-1">
                        تحدي من: {ch.profiles?.first_name}
                      </h4>
                      <p className="text-[10px] font-bold opacity-80 uppercase italic">
                         {ch.court_name} | {new Date(ch.match_time).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#0a0f3c]/10 flex items-center justify-center font-black">
                      <Swords size={18} />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(ch.id, 'accepted')}
                      className="flex-1 py-3 bg-[#0a0f3c] text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Check size={14} /> قبول التحدي
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(ch.id, 'rejected')}
                      className="flex-1 py-3 bg-white/20 text-[#0a0f3c] rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <X size={14} /> رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* قائمة المجتمع والبحث */}
        <section className="space-y-6">
          <h1 className="text-3xl font-[1000] italic uppercase leading-none">المجتمع <span className="text-cyan-400 font-black">PLAYERS</span></h1>
          
          <div className="relative">
            <Search className="absolute right-4 top-4 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن منافس..." 
              className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl outline-none focus:border-cyan-500 transition-all font-bold italic"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
            ) : (
              players
                .filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((player) => (
                  <div key={player.id} className="p-5 rounded-[30px] bg-[#0a0f3c]/60 border border-white/5 flex items-center justify-between backdrop-blur-xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 group-hover:scale-110 transition-transform">
                        <User size={24} />
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-sm italic">{player.first_name}</h4>
                        <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-tighter">{player.current_rank}</span>
                      </div>
                    </div>
                    
                    <button className="p-3.5 bg-cyan-500 text-[#0a0f3c] rounded-2xl active:scale-90 transition-all shadow-lg shadow-cyan-500/20">
                      <Swords size={20} />
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}