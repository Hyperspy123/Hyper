import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Users, MapPin, Clock, Zap, Plus, Search } from 'lucide-react';

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fake data for other players
  const [requests] = useState([
    {
      id: 1,
      creator: "سلطان الراجحي",
      location: "حي الصحافة - وورلد بادل",
      time: "10:30 مساءً",
      level: "متقدم",
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
        // Taking the part before @ as the name
        setUserName(user.email?.split('@')[0] || "لاعب جديد");
      }
      setLoading(false);
    }
    getUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f3c] pb-24 text-white font-sans" dir="rtl">
      <Header />

      <main className="p-4 max-w-2xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">المجتمع نشط الآن</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">هل تبحث عن لاعب مكمل لمباراتك اليوم؟</p>
        </div>

        {/* Search Feed */}
        <div className="relative mb-8">
          <Search className="absolute right-4 top-3.5 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن حي أو مستوى معين..." 
            className="w-full bg-[#14224d] border border-white/10 p-4 pr-12 rounded-2xl text-sm outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
        </div>

        {/* Requests Feed */}
        <div className="space-y-5">
          {requests.map((req) => (
            <div key={req.id} className="bg-[#14224d] border border-white/5 rounded-[32px] p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 shadow-xl">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">{req.creator} يطلب فزعة!</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <MapPin size={14} className="text-cyan-500" />
                      <span>{req.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Clock size={14} className="text-cyan-500" />
                      <span>{req.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 text-center min-w-[80px]">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">المستوى</span>
                  <span className="text-sm font-black text-cyan-400">{req.level}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2 space-x-reverse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#0a0f3c] border-2 border-[#14224d] flex items-center justify-center">
                        <Users size={12} className="text-gray-600" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500 mr-2">باقي {req.missing}</span>
                </div>

                <button className="px-6 py-3 bg-cyan-500 text-[#0a0f3c] font-black rounded-xl shadow-[0_5px_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all">
                  أبشر بالفزعة!
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed "Post Faz3a" Button */}
        <button 
          onClick={() => alert("سيتم فتح نافذة إضافة طلب فزعة قريباً")}
          className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(6,182,212,0.5)] z-50 hover:rotate-90 transition-all duration-500 border-4 border-[#0a0f3c]"
        >
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>
      </main>

      <BottomNav />
    </div>
  );
}