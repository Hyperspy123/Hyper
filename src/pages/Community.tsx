import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Zap, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. جلب اللاعبين
    const { data: profiles } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', user.id);
    setPlayers(profiles || []);

    // 2. جلب التحديات الواردة
    const { data: challenges } = await supabase.from('challenges')
      .select('*, profiles:challenger_id (first_name)')
      .eq('challenged_id', user.id)
      .eq('status', 'pending');
    setIncomingChallenges(challenges || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔥 الدالة الجديدة: بدء رحلة التحدي عبر نظام الحجز
  const startChallengeBooking = (player: any) => {
    toast.info(`اختر الملعب والوقت لتحدي ${player.first_name}`);
    // نرسل المستخدم لصفحة الملاعب ونحفظ بيانات التحدي في الـ state
    navigate('/', { 
      state: { 
        isChallengeMode: true, 
        opponentId: player.id,
        opponentName: player.first_name 
      } 
    });
  };

  const updateChallengeStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('challenges').update({ status }).eq('id', id);
    if (!error) {
      toast.success(status === 'accepted' ? "كفو! تم قبول التحدي" : "تم الرفض");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-10">
        
        {/* قسم مين يتحداك */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">
              مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {incomingChallenges.map((ch) => (
                <div key={ch.id} className="min-w-[280px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-xl space-y-3">
                  <div className="text-right">
                    <h4 className="font-black text-sm">{ch.profiles?.first_name} يتحداك 🔥</h4>
                    <p className="text-[10px] font-bold opacity-80 uppercase italic">{ch.court_name} | {new Date(ch.match_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => updateChallengeStatus(ch.id, 'accepted')} className="flex-1 py-2.5 bg-[#0a0f3c] text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1"><Check size={14}/> قبول</button>
                     <button onClick={() => updateChallengeStatus(ch.id, 'rejected')} className="flex-1 py-2.5 bg-white/30 text-[#0a0f3c] rounded-xl text-[10px] font-black flex items-center justify-center gap-1"><X size={14}/> رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* البحث عن لاعبين */}
        <section className="space-y-6">
          <div className="text-right">
             <h1 className="text-4xl font-[1000] italic uppercase leading-none">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
             <p className="text-[10px] font-black text-gray-500 uppercase mt-2 italic tracking-widest leading-none">اختر خصمك وابدأ التحدي</p>
          </div>
          
          <div className="relative">
            <Search className="absolute right-5 top-5 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن وحش للمباراة..." 
              className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic backdrop-blur-3xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
            ) : (
              players.filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase())).map((player) => (
                <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10"><User size={24} /></div>
                    <div className="text-right">
                      <h4 className="font-black text-lg italic text-white leading-none mb-1">{player.first_name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase italic tracking-tighter">{player.current_rank}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => startChallengeBooking(player)} 
                    className="p-4 bg-cyan-500 text-[#0a0f3c] rounded-[22px] active:scale-90 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Swords size={22} />
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