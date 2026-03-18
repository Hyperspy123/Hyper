import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Zap, Plus, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    // STEP 1: Changed bg-[#0a0f3c] to bg-transparent
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
          <p className="text-gray-400 text-xs mt-2 font-bold tracking-widest uppercase opacity-60">
            هل تبحث عن لاعب مكمل لمباراتك اليوم؟
          </p>
        </div>

        {/* Search Feed - Glass Style */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن حي أو مستوى معين..." 
            className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 focus:bg-white/10 transition-all shadow-2xl backdrop-blur-md placeholder:text-gray-600"
          />
        </div>

        {/* Requests Feed */}
        <div className="space-y-6">
          {requests.map((req) => (
            // STEP 2: Applied Glassmorphism to Request Cards
            <div 
              key={req.id} 
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">{req.creator} يطلب فزعة!</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-300 text-xs font-bold bg-white/5 p-2 px-3 rounded-xl border border-white/5">
                      <MapPin size={14} className="text-cyan-500" />
                      <span>{req.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-xs font-bold bg-white/5 p-2 px-3 rounded-xl border border-white/5">
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
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-3 space-x-reverse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-[#0a0f3c] border-2 border-white/10 flex items-center justify-center shadow-lg">
                        <Users size={14} className="text-gray-500" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase">باقي</span>
                    <span className="text-sm font-black text-white leading-none">{req.missing} لاعبين</span>
                  </div>
                </div>

                <button className="px-8 py-4 bg-cyan-500 text-[#0a0f3c] font-black rounded-2xl shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:bg-white active:scale-95 transition-all text-xs uppercase tracking-tighter">
                  أبشر بالفزعة!
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed "Post Faz3a" Button */}
        <button 
          onClick={() => alert("سيتم فتح نافذة إضافة طلب فزعة قريباً")}
          className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(6,182,212,0.5)] z-50 hover:rotate-90 hover:scale-110 transition-all duration-500 border-4 border-[#05081d]"
        >
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}