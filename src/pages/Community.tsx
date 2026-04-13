import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Zap, X, Check, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<any[]>([]);
  const [acceptedChallenges, setAcceptedChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: profiles } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', user.id);
    setPlayers(profiles || []);

    // جلب التحديات مع بيانات الخصم كاملة
    const { data: challenges } = await supabase
      .from('challenges')
      .select(`*, challenger:challenger_id (id, first_name, current_rank), challenged:challenged_id (id, first_name, current_rank)`)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`);

    if (challenges) {
      setIncomingChallenges(challenges.filter(c => c.challenged_id === user.id && c.status === 'pending'));
      setAcceptedChallenges(challenges.filter(c => c.status === 'accepted'));
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateChallengeStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('challenges').update({ status }).eq('id', id);
    if (!error) {
      toast.success(status === 'accepted' ? "تم قبول التحدي! موعدنا الملعب 🎾" : "تم الرفض");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-10">
        
        {/* ✅ رجعنا قسم: مين يتحداك؟ */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-5">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">
              مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {incomingChallenges.map(ch => (
                <div key={ch.id} className="min-w-[280px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-xl border border-cyan-400/50">
                  <h4 className="font-black text-sm">{ch.challenger?.first_name} يبيك بمباراة!</h4>
                  <p className="text-[10px] font-black opacity-70 mt-1 uppercase italic">
                    {ch.court_name} | {new Date(ch.match_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => updateChallengeStatus(ch.id, 'accepted')} className="flex-1 py-2.5 bg-[#0a0f3c] text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all">قبول</button>
                    <button onClick={() => updateChallengeStatus(ch.id, 'rejected')} className="flex-1 py-2.5 bg-white/30 text-[#0a0f3c] rounded-xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ✅ رجعنا قسم: مبارياتك القادمة */}
        {acceptedChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end text-purple-400">
              مبارياتك القادمة <Swords size={18} />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {acceptedChallenges.map(match => {
                const isChallenger = match.challenger_id === currentUserId;
                const opponent = isChallenger ? match.challenged : match.challenger;
                return (
                  <button key={match.id} onClick={() => setSelectedMatch({ match, opponent, isChallenger })} className="min-w-[280px] bg-[#1a0b2e] border border-purple-500/30 p-5 rounded-[30px] shadow-xl active:scale-95 transition-all group text-right flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-purple-300">ضد {opponent?.first_name}</h4>
                      <p className="text-[10px] font-black text-gray-400 mt-1 uppercase italic">
                        {new Date(match.match_time).toLocaleDateString('ar-EG')} - {new Date(match.match_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <ShieldAlert size={20} />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* قائمة اللاعبين */}
        <section className="space-y-6">
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
          <div className="relative group">
            <Search className="absolute right-5 top-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن خصم..." 
              className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <Loader2 className="animate-spin text-cyan-400 mx-auto" size={32} />
            ) : (
              players.filter(p => p.first_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
                <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shadow-inner">
                      <User size={28} />
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-lg italic text-white leading-none mb-1">{player.first_name}</h4>
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase">
                        {player.current_rank}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/book/1`, { 
                      state: { isChallengeMode: true, opponentId: player.id, opponentName: player.first_name } 
                    })}
                    className="flex items-center gap-2 bg-cyan-500 text-[#0a0f3c] px-4 py-3 rounded-2xl active:scale-90 transition-all shadow-lg shadow-cyan-500/20 group"
                  >
                    <span className="text-[10px] font-black uppercase italic">تحدي</span>
                    <Swords size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ✅ رجعنا: مودال المواجهة الكبرى (VS Screen) */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#05081d]/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-md relative">
            <button onClick={() => setSelectedMatch(null)} className="absolute -top-12 left-0 text-white/50 hover:text-white p-2"><X size={32}/></button>
            
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-4xl font-[1000] italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase">المواجهة الكبرى</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {selectedMatch.match.court_name} | {new Date(selectedMatch.match.match_time).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center justify-between bg-[#0a0f3c]/80 border border-white/10 p-8 rounded-[45px] shadow-2xl relative overflow-hidden">
              <div className="flex flex-col items-center gap-3 z-10 w-1/3 text-center">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-[20px] border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <User size={28} className="text-cyan-400" />
                </div>
                <h4 className="font-black text-xs text-white">أنت</h4>
              </div>
              <div className="z-10 flex flex-col items-center animate-bounce">
                <Swords size={32} className="text-white" />
                <span className="text-[10px] font-[1000] italic mt-2">VS</span>
              </div>
              <div className="flex flex-col items-center gap-3 z-10 w-1/3 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-[20px] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <User size={28} className="text-purple-400" />
                </div>
                <h4 className="font-black text-xs text-white">{selectedMatch.opponent.first_name}</h4>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/chat/${selectedMatch.match.id}`)} 
              className="w-full mt-6 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-[25px] font-[1000] italic uppercase shadow-xl active:scale-95 transition-all shadow-cyan-500/20"
            >
              فتح المحادثة 💬
            </button>
          </div>
        </div>
      )}
    </div>
  );
}