import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Zap, Plus, Search, Loader2, Target, Award, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock Data for the Community Directory
const communityPlayers = [
  { id: 1, name: "سلطان الراجحي", level: "محترف", rank: "كينج 🦁", matches: 45, avatar: "S" },
  { id: 2, name: "نايف محمد", level: "متوسط", rank: "هايب ⚡", matches: 22, avatar: "N" },
  { id: 3, name: "عبدالله الفهد", level: "مبتدئ", rank: "مستجد 🥚", matches: 5, avatar: "A" },
];

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'community'>('requests');
  const navigate = useNavigate();

  const [requests] = useState([
    {
      id: 1,
      creator: "سلطان الراجحي",
      location: "حي الصحافة - وورلد بادل",
      time: "10:30 مساءً",
      level: "محترف",
      missing: 2,
    },
    {
      id: 2,
      creator: "نايف محمد",
      location: "حي القيروان - بادل إن",
      time: "8:00 مساءً",
      level: "متوسط",
      missing: 1,
    }
  ]);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email?.split('@')[0] || "لاعب جديد");
      }
      setLoading(false);
    }
    getUserData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" size={40} />
    </div>
  );

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
                مجمع اللاعبين
            </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'requests' ? "ابحث عن حي أو ملعب..." : "ابحث عن لاعب أو لقب..."}
            className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all shadow-2xl backdrop-blur-md placeholder:text-gray-600"
          />
        </div>

        {/* --- REQUESTS FEED --- */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {requests.map((req) => (
              <div key={req.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black mb-3 tracking-tight">{req.creator} يطلب فزعة!</h3>
                    <div className="flex flex-col gap-3 text-gray-300 text-xs font-bold">
                      <div className="flex items-center gap-2 bg-white/5 p-2 px-3 rounded-xl border border-white/5">
                        <MapPin size={14} className="text-cyan-500" />
                        <span>{req.location}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 p-2 px-3 rounded-xl border border-white/5">
                        <Clock size={14} className="text-cyan-500" />
                        <span>{req.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-center min-w-[90px]">
                    <span className="block text-[8px] text-gray-500 font-black uppercase tracking-tighter">المستوى</span>
                    <span className="text-sm font-black text-cyan-400">{req.level}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 border-t border-white/5 pt-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">المطلوب</span>
                        <span className="text-sm font-black text-white">{req.missing} لاعبين</span>
                    </div>
                    <button className="px-8 py-4 bg-cyan-500 text-[#0a0f3c] font-black rounded-2xl shadow-lg active:scale-95 transition-all text-xs uppercase">
                        أبشر بالفزعة!
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- COMMUNITY DIRECTORY --- */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            {communityPlayers.map((player) => (
              <div key={player.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 flex items-center justify-between group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/20 border border-white/10 flex items-center justify-center font-black text-cyan-400 text-xl shadow-inner">
                        {player.avatar}
                    </div>
                    <div>
                        <h4 className="font-black text-sm text-white">{player.name}</h4>
                        <div className="flex gap-2 mt-1">
                            <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                                <Target size={8} className="text-cyan-400" />
                                <span className="text-[8px] font-black text-cyan-400 uppercase">{player.level}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                <Award size={8} className="text-yellow-400" />
                                <span className="text-[8px] font-black text-yellow-400 uppercase">{player.rank}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button 
                  onClick={() => toast.success(`تم إرسال دعوة فزعة لـ ${player.name}`, {
                      icon: <CheckCircle2 className="text-cyan-400" />
                  })}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  إرسال دعوة
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Fixed "Post Faz3a" Button */}
        <button 
          onClick={() => alert("سيتم فتح نافذة إضافة طلب فزعة قريباً")}
          className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg z-50 hover:rotate-90 hover:scale-110 transition-all duration-500 border-4 border-[#05081d]"
        >
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}