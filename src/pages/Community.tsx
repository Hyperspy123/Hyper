import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { User, Swords, Search, Loader2, Calendar, MapPin, Users, X, Check, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Community() {
  const [players, setPlayers] = useState<any[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]); // قائمة الملاعب
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  
  const [challengeData, setChallengeData] = useState({
    courtName: '',
    matchTime: '',
    playersCount: 2
  });
  const [isSending, setIsSending] = useState(false);

  // توليد قائمة أوقات ذكية (كل ساعة من الآن ولمدة 24 ساعة)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    now.setMinutes(0, 0, 0);
    
    for (let i = 1; i <= 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      slots.push({
        label: time.toLocaleString('ar-EG', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
        value: time.toISOString()
      });
    }
    return slots;
  };

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. جلب اللاعبين
    const { data: profiles } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', user.id);
    setPlayers(profiles || []);

    // 2. جلب التحديات الواردة
    const { data: challenges } = await supabase.from('challenges').select('*, profiles:challenger_id (first_name)').eq('challenged_id', user.id).eq('status', 'pending');
    setIncomingChallenges(challenges || []);

    // 3. جلب الملاعب الموجودة في قاعدة البيانات
    const { data: courtsData } = await supabase.from('courts').select('name');
    setCourts(courtsData || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendChallenge = async () => {
    if (!challengeData.courtName || !challengeData.matchTime) {
      return toast.error("اختر الملعب والوقت أولاً");
    }

    setIsSending(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('challenges').insert([{
      challenger_id: user?.id,
      challenged_id: selectedPlayer.id,
      court_name: challengeData.courtName,
      match_time: challengeData.matchTime,
      players_count: challengeData.playersCount,
      status: 'pending'
    }]);

    if (!error) {
      toast.success("تم إرسال التحدي بنجاح 🔥");
      setIsModalOpen(false);
    } else {
      toast.error("حدث خطأ أثناء الإرسال");
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32 text-right font-sans" dir="rtl">
      <Header />
      <main className="pt-28 px-6 max-w-lg mx-auto space-y-10">
        
        {/* قسم مين يتحداك */}
        {incomingChallenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black italic flex items-center gap-2 justify-end">مين يتحداك؟ <Zap size={18} className="text-cyan-400 fill-cyan-400" /></h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {incomingChallenges.map((ch) => (
                <div key={ch.id} className="min-w-[280px] bg-cyan-500 text-[#0a0f3c] p-6 rounded-[35px] shadow-xl">
                  <h4 className="font-black text-sm">{ch.profiles?.first_name} يبيك بمباراة!</h4>
                  <p className="text-[10px] font-bold opacity-80 mt-1">{ch.court_name}</p>
                  <div className="flex gap-2 mt-4">
                     <button className="flex-1 py-2 bg-[#0a0f3c] text-white rounded-xl text-[10px] font-black">قبول</button>
                     <button className="flex-1 py-2 bg-white/30 text-[#0a0f3c] rounded-xl text-[10px] font-black">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* البحث عن لاعبين */}
        <section className="space-y-6">
          <h1 className="text-3xl font-[1000] italic uppercase leading-none">المجتمع <span className="text-cyan-400">PLAYERS</span></h1>
          <div className="relative">
            <Search className="absolute right-5 top-5 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن خصم..." 
              className="w-full bg-[#0a0f3c]/60 border border-white/5 p-5 pr-14 rounded-[25px] outline-none focus:border-cyan-500/50 transition-all font-bold italic backdrop-blur-3xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin text-cyan-400 mx-auto" /> : players.filter(p => p.first_name.toLowerCase().includes(searchTerm.toLowerCase())).map((player) => (
              <div key={player.id} className="p-6 rounded-[35px] bg-[#0a0f3c]/40 border border-white/5 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10"><User size={24} /></div>
                  <div className="text-right">
                    <h4 className="font-black text-lg italic text-white">{player.first_name}</h4>
                    <span className="text-[10px] font-black text-cyan-400 uppercase">{player.current_rank}</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedPlayer(player); setIsModalOpen(true); }} className="p-4 bg-cyan-500 text-[#0a0f3c] rounded-[22px] active:scale-90 transition-all"><Swords size={20} /></button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* مودال التحدي المطور بخيارات منسدلة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-3xl animate-in fade-in">
          <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-sm rounded-[50px] p-10 space-y-8 shadow-2xl relative text-right">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 left-8 text-gray-500"><X size={24}/></button>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-[1000] italic text-white">تحدي <span className="text-cyan-400">{selectedPlayer?.first_name}</span></h3>
              <p className="text-[9px] font-black text-gray-500 uppercase italic">اختر تفاصيل المباراة</p>
            </div>

            <div className="space-y-5">
              {/* اختيار الملعب من القائمة */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 flex items-center gap-2 justify-end">اختر الملعب <MapPin size={12} className="text-cyan-400"/></label>
                <select 
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-cyan-500 font-bold text-sm text-right text-white appearance-none cursor-pointer"
                  onChange={(e) => setChallengeData({...challengeData, courtName: e.target.value})}
                  value={challengeData.courtName}
                >
                  <option value="">— اختر من الملاعب المتوفرة —</option>
                  {courts.map((court, idx) => (
                    <option key={idx} value={court.name}>{court.name}</option>
                  ))}
                </select>
              </div>

              {/* اختيار الوقت من القائمة */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 flex items-center gap-2 justify-end">اختر الوقت المتاح <Clock size={12} className="text-cyan-400"/></label>
                <select 
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-cyan-500 font-bold text-sm text-right text-white appearance-none cursor-pointer"
                  onChange={(e) => setChallengeData({...challengeData, matchTime: e.target.value})}
                  value={challengeData.matchTime}
                >
                  <option value="">— اختر وقت المباراة —</option>
                  {generateTimeSlots().map((slot, idx) => (
                    <option key={idx} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 flex items-center gap-2 justify-end">نوع المباراة <Users size={12} className="text-cyan-400"/></label>
                <select 
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-cyan-500 font-bold text-sm text-right text-white appearance-none cursor-pointer"
                  onChange={(e) => setChallengeData({...challengeData, playersCount: parseInt(e.target.value)})}
                >
                  <option value={2}>1 ضد 1</option>
                  <option value={4}>2 ضد 2</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSendChallenge}
              disabled={isSending}
              className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
            >
              {isSending ? <Loader2 className="animate-spin" size={20}/> : "أرسل التحدي الآن 🔥"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}