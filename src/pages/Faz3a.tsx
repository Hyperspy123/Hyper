import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Zap, Plus, Search, Loader2, Target, Award, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// دالة لتحديد اللقب بناءً على عدد المباريات الحقيقي من قاعدة البيانات
const getRankInfo = (matches: number) => {
  if (matches < 10) return { title: 'مستجد', icon: '🥚' };
  if (matches < 50) return { title: 'هايب', icon: '⚡' };
  if (matches < 150) return { title: 'برنس', icon: '👑' };
  if (matches < 300) return { title: 'كينج', icon: '🦁' };
  if (matches < 500) return { title: 'أسطورة', icon: '🌌' };
  return { title: 'هايبر', icon: '💫' };
};

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'community'>('requests');
  const [communityPlayers, setCommunityPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. جلب اسم المستخدم الحالي للترحيب
  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.first_name || user.email?.split('@')[0] || "لاعب");
      }
    }
    getUserData();
  }, []);

  // 2. جلب اللاعبين الحقيقيين من Supabase (المجمع)
  useEffect(() => {
    async function fetchCommunity() {
      if (activeTab !== 'community') return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true) // جلب الحسابات العامة فقط
        .order('matches_count', { ascending: false });

      if (!error && data) {
        setCommunityPlayers(data);
      }
      setLoading(false);
    }
    fetchCommunity();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans" dir="rtl">
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">المجتمع نشط الآن</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
        </div>

        {/* --- TAB SWITCHER --- */}
        <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-md">
            <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-3 rounded-[20px] text-xs font-black uppercase transition-all ${activeTab === 'requests' ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
            >
                طلبات الفزعة
            </button>
            <button 
                onClick={() => setActiveTab('community')}
                className={`flex-1 py-3 rounded-[20px] text-xs font-black uppercase transition-all ${activeTab === 'community' ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
            >
                المجمع (العام)
            </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'requests' ? "ابحث عن حي أو ملعب..." : "ابحث عن لاعبين..."}
            className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all shadow-2xl backdrop-blur-md placeholder:text-gray-600"
          />
        </div>

        {/* --- CONTENT AREA --- */}
        {activeTab === 'requests' ? (
          <div className="space-y-6">
            <div className="text-center py-10 opacity-30 font-black uppercase text-xs tracking-widest">لا توجد طلبات فزعة حالياً</div>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
              </div>
            ) : communityPlayers.length > 0 ? (
              communityPlayers.map((player) => {
                const rank = getRankInfo(player.matches_count || 0);
                return (
                  <div key={player.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 flex items-center justify-between group hover:border-cyan-500/40 transition-all shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/20 border border-white/10 flex items-center justify-center font-black text-cyan-400 text-xl shadow-inner">
                            {player.first_name?.[0] || "P"}
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="font-black text-sm text-white">{player.first_name} {player.last_name}</h4>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-cyan-400">
                                    <span className="text-[8px] font-black uppercase">{player.skill_level || 'مبتدئ'}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20 text-yellow-400">
                                    <span className="text-[8px] font-black uppercase">{rank.icon} {rank.title}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                      onClick={() => toast.success(`تم إرسال دعوة لـ ${player.first_name}`, { icon: <CheckCircle2 className="text-cyan-400" /> })}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                    >
                      إرسال دعوة
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 opacity-30 font-black uppercase text-xs italic">المجمع فارغ حالياً</div>
            )}
          </div>
        )}

        {/* Floating Action Button */}
        <button className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg z-50 hover:rotate-90 transition-all duration-500 border-4 border-[#05081d]">
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}