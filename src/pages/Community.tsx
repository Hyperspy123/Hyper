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
  
  // حالات المودال (نافذة إعداد التحدي)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [challengeData, setChallengeData] = useState({
    courtName: '',
    matchTime: '',
    location: '',
    playersCount: 2
  });
  const [isSending, setIsSending] = useState(false);

  // 1. جلب التحديات الواصلة لي (مين يتحداك)
  const fetchIncomingChallenges = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('challenges')
      .select(`
        *,
        profiles:challenger_id (first_name, avatar_url, current_rank)
      `)
      .eq('challenged_id', user.id)
      .eq('status', 'pending');
    
    setIncomingChallenges(data || []);
  }, []);

  // 2. جلب قائمة اللاعبين للبحث
  const fetchPlayers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .neq('id', user?.id)
      .order('total_matches', { ascending: false });
    
    setPlayers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchIncomingChallenges();

    // الاستماع اللحظي للتحديات
    const channel = supabase.channel('challenges_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchIncomingChallenges();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPlayers, fetchIncomingChallenges]);

  // 3. إرسال طلب التحدي
  const handleSendChallenge = async () => {
    if (!challengeData.courtName || !challengeData.matchTime) {
      return toast.error("أكمل بيانات التحدي (الملعب والوقت) أولاً");
    }

    setIsSending(true);
    const { data: { user } } = await supabase.auth.getUser();

    try {
      const { error } = await supabase
        .from('challenges')
        .insert([{
          challenger_id: user?.id,
          challenged_id: selectedPlayer.id,
          court_name: challengeData.courtName,
          match_time: challengeData.matchTime,
          location_name: challengeData.location,
          players_count: challengeData.playersCount,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success(`كفو! تم إرسال التحدي لـ ${selectedPlayer.first_name} 🔥`);
      setIsModalOpen(false);
      setChallengeData({ courtName: '', matchTime: '', location: '', playersCount: 2 });
    } catch (err) {
      toast.error("فشل إرسال التحدي.. تأكد من الاتصال");
    } finally {
      setIsSending(false);
    }
  };

  // 4. قبول أو رفض التحدي الواصل
  const updateChallengeStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('challenges')
      .update({ status })
      .eq('id', id);

    if (!error) {
      toast(status === 'accepted' ? "تم قبول التحدي! موعدنا الملعب 🎾" : "تم رفض التحدي");
      fetchIncomingChallenges();
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-10">
        
        {/* --- قسم: مين يتحداك؟ (يظهر فقط عند وجود طلبات) --- */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">
              مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {incomingChallenges.map((ch) => (
                <div key={ch.id} className="min-w-[300px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-2xl space-y-4 shadow-cyan-500/20" style={{ scrollSnapAlign: 'center' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#0a0f3c]/10 flex items-center justify-center font-[1000] text-xl italic">
                      {ch.profiles?.first_name?.[0]}
                    </div>
                    <div className="text-right flex-1">
                      <h4 className="font-black text-sm leading-none">{ch.profiles?.first_name} يتحداك!</h4>
                      <p className="text-[10px] font-black opacity-80 italic mt-1 uppercase">
                         {ch.court_name} | {new Date(ch.match_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateChallengeStatus(ch.id, 'accepted')} className="flex-1 py-3.5 bg-[#0a0f3c] text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all"><Check size={14}/> قبول</button>
                    <button onClick={() => updateChallengeStatus(ch.id, 'rejected')} className="flex-1 py-3.5 bg-white/30 text-[#0a0f3c] rounded-2xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all"><X size={14}/> رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- قسم: البحث واللاعبين --- */}
        <section className="space-y-6">
          <div className="text-right">
             <h1 className="text-4xl font-[1000] italic uppercase leading-none text-white">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
             <p className="text-[10px] font-black text-gray-500 uppercase mt-2 italic tracking-widest leading-none">ابحث عن خصمك القادم</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute right-5 top-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن وحش للمباراة..." 
              className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic backdrop-blur-3xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
            ) : (
              players
                .filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((player) => (
                  <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl group hover:border-cyan-500/20 transition-all shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                        <User size={28} />
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic leading-none mb-1 text-white">{player.first_name}</h4>
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[8px] font-[1000] uppercase italic tracking-tighter border border-cyan-500/10">{player.current_rank}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { setSelectedPlayer(player); setIsModalOpen(true); }}
                      className="p-4.5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] active:scale-90 transition-all shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/30"
                    >
                      <Swords size={22} />
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>

      {/* --- مودال إعداد التحدي --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-sm rounded-[50px] p-10 space-y-8 shadow-2xl relative text-right">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-[1000] italic uppercase leading-none text-white">تحدي <span className="text-cyan-400">{selectedPlayer?.first_name}</span></h3>
              <p className="text-[9px] font-black text-gray-500 uppercase italic tracking-widest">حدد تفاصيل المواجهة القادمة</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-[1000] text-gray-400 mr-2 uppercase italic flex items-center gap-2 justify-end">مكان المباراة <MapPin size={12} className="text-cyan-400"/></label>
                <input 
                  type="text" 
                  placeholder="اسم الملعب أو اللوكيشن"
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-cyan-500 font-bold text-sm text-right text-white"
                  value={challengeData.courtName}
                  onChange={(e) => setChallengeData({...challengeData, courtName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-[1000] text-gray-400 mr-2 uppercase italic flex items-center gap-2 justify-end">الوقت والتاريخ <Calendar size={12} className="text-cyan-400"/></label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-cyan-500 font-bold text-sm text-right text-white"
                  onChange={(e) => setChallengeData({...challengeData, matchTime: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-[1000] text-gray-400 mr-2 uppercase italic flex items-center gap-2 justify-end">نوع المباراة <Users size={12} className="text-cyan-400"/></label>
                <select 
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-cyan-500 font-bold text-sm text-right text-white appearance-none"
                  value={challengeData.playersCount}
                  onChange={(e) => setChallengeData({...challengeData, playersCount: parseInt(e.target.value)})}
                >
                  <option value={2}>1 ضد 1 (مواجهة مباشرة)</option>
                  <option value={4}>2 ضد 2 (فريق كامل)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSendChallenge}
              disabled={isSending}
              className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] text-xs uppercase flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {isSending ? <Loader2 className="animate-spin" size={20}/> : <><Swords size={20} fill="currentColor"/> أرسل التحدي الآن 🔥</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}