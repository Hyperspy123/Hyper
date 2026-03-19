import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Zap, Plus, Search, Loader2, Target, Award, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const getRankInfo = (matches: number) => {
  if (matches < 10) return { title: 'مستجد', icon: '🥚' };
  if (matches < 50) return { title: 'هايب', icon: '⚡' };
  if (matches < 150) return { title: 'برنس', icon: '👑' };
  if (matches < 300) return { title: 'كينج', icon: '🦁' };
  return { title: 'أسطورة', icon: '🌌' };
};

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'community'>('community');
  const [communityPlayers, setCommunityPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingPlayers, setMissingPlayers] = useState(1);
  const navigate = useNavigate();

  // 1. جلب بيانات المستخدم الحالي
  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single();
        setUserName(profile?.first_name || "لاعب");
      }
    }
    getUserData();
  }, []);

  // 2. جلب اللاعبين في المجمع
  useEffect(() => {
    async function fetchCommunity() {
      if (activeTab !== 'community') return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('matches_count', { ascending: false });
      if (!error && data) setCommunityPlayers(data);
      setLoading(false);
    }
    fetchCommunity();
  }, [activeTab]);

  // 3. دالة إرسال دعوة خاصة (للمجمع)
  const sendDirectInvite = async (receiverId: string, receiverName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("سجل دخولك أولاً");

    const { error } = await supabase.from('faz3a_invites').insert([
      { sender_id: user.id, receiver_id: receiverId, status: 'pending' }
    ]);

    if (!error) {
      toast.success(`تم إرسال دعوة لـ ${receiverName}`, { icon: <CheckCircle2 className="text-cyan-400" /> });
    } else {
      toast.error("حدث خطأ في إرسال الدعوة");
    }
  };

  // 4. دالة إنشاء طلب فزعة عام (لتبويب الطلبات)
  const handleCreatePost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('faz3a_posts').insert([
      { creator_id: user?.id, missing_players: missingPlayers, location: 'وورلد بادل', match_time: '10:00 PM' }
    ]);

    if (!error) {
      toast.success("تم نشر طلب الفزعة!");
      setIsModalOpen(false);
      setActiveTab('requests');
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] pb-32 text-white font-sans relative overflow-x-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24">
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">المجتمع نشط الآن</span>
          </div>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-md">
            {['requests', 'community'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 rounded-[20px] text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg' : 'text-gray-500'}`}
                >
                    {tab === 'requests' ? 'طلبات الفزعة' : 'المجمع (العام)'}
                </button>
            ))}
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input type="text" placeholder="ابحث عن لاعبين أو ملاعب..." className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500/50 transition-all backdrop-blur-md" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'community' ? (
            loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-400" size={32} /></div> :
            communityPlayers.map((player) => {
              const rank = getRankInfo(player.matches_count || 0);
              return (
                <div key={player.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[35px] p-6 flex items-center justify-between group hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-white/10 flex items-center justify-center font-black text-cyan-400 text-xl">{player.first_name?.[0]}</div>
                      <div>
                          <h4 className="font-black text-sm text-white">{player.first_name} {player.last_name}</h4>
                          <div className="flex gap-2 mt-1">
                              <span className="text-[8px] font-black bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 uppercase">{player.skill_level}</span>
                              <span className="text-[8px] font-black bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-400 uppercase">{rank.icon} {rank.title}</span>
                          </div>
                      </div>
                  </div>
                  <button onClick={() => sendDirectInvite(player.id, player.first_name)} className="px-4 py-2 bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] rounded-xl text-[10px] font-black transition-all">إرسال دعوة</button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 opacity-30 font-black text-[10px] uppercase tracking-widest italic">لا توجد طلبات فزعة عامة حالياً</div>
          )}
        </div>

        {/* Floating Button */}
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg z-50 hover:scale-110 active:scale-95 transition-all border-4 border-[#05081d]">
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>

        {/* Create Post Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-md">
            <div className="bg-white/10 border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase text-cyan-400">إنشاء طلب فزعة</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">كم لاعب ناقصك؟</label>
                <div className="flex gap-4">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setMissingPlayers(num)} className={`flex-1 py-4 rounded-2xl font-black border transition-all ${missingPlayers === num ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-400'}`}>{num}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleCreatePost} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] uppercase text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">نشر الطلب الآن</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}