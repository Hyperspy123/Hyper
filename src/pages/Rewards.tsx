import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { 
  Target, 
  Gift, 
  Star, 
  ChevronLeft, 
  Award, 
  QrCode, 
  Loader2, 
  Flame 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rewards() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();

  const COURT_IDS = {
    COURT1: "d1111111-1111-1111-1111-111111111111", 
    COURT2: "b2222222-2222-2222-2222-222222222222",
    COURT3: "33333333-3333-3333-3333-333333333333"
  };

  useEffect(() => {
    async function fetchAllCounts() {
      try {
        const results = await Promise.all(
          Object.values(COURT_IDS).map(id => 
            supabase.rpc('get_user_booking_count', { target_court_id: id })
          )
        );

        setCounts({
          [COURT_IDS.COURT1]: parseInt(results[0]?.data || "0"),
          [COURT_IDS.COURT2]: parseInt(results[1]?.data || "0"),
          [COURT_IDS.COURT3]: parseInt(results[2]?.data || "0"),
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCounts();
  }, []);

  const courtBrands = [
    {
      name: "ملعب ١",
      id: COURT_IDS.COURT1,
      accent: "text-cyan-400",
      tasks: [
        { title: "خبير ملعب ١", desc: "حجز ٥ مرات في هذا الملعب", goal: 5, reward: "خصم 20%" },
        { title: "الأسطورة", desc: "حجز ١٠ مرات في هذا الملعب", goal: 10, reward: "مضرب مجاني" }
      ]
    },
    {
      name: "ملعب ٢",
      id: COURT_IDS.COURT2,
      accent: "text-purple-400",
      tasks: [
        { title: "ولاء ملعب ٢", desc: "حجز ٣ مرات في هذا الملعب", goal: 3, reward: "ساعة مجانية" }
      ]
    },
    {
      name: "ملعب ٣",
      id: COURT_IDS.COURT3,
      accent: "text-orange-400",
      tasks: [
        { title: "نجم ملعب ٣", desc: "حجز مرتين في هذا الملعب", goal: 2, reward: "مشروب طاقة" }
      ]
    }
  ];

  if (loading) return (
    // Changed loader background to transparent
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" size={40} />
    </div>
  );

  return (
    // STEP 1: Changed bg-[#0a0f3c] to bg-transparent
    <div className="min-h-screen bg-transparent text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] transition-all active:scale-90"
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">إنجازاتي</h1>
        </div>

        <div className="space-y-12">
          {courtBrands.map((brand, bIdx) => (
            <div key={bIdx} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500 fill-orange-500" />
                  <h2 className={`font-black uppercase tracking-widest text-sm ${brand.accent}`}>
                    {brand.name}
                  </h2>
                </div>
              </div>

              <div className="grid gap-6">
                {brand.tasks.map((task, tIdx) => {
                  const currentProgress = counts[brand.id] || 0;
                  const isDone = currentProgress >= task.goal;
                  const progressPercent = Math.min((currentProgress / task.goal) * 100, 100);

                  return (
                    // STEP 2: Applied Glassmorphism (bg-white/5 + backdrop-blur-xl)
                    <div 
                      key={tIdx} 
                      className="bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 relative overflow-hidden group shadow-2xl transition-all duration-300 hover:border-white/20"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="z-10">
                          <h3 className="font-black text-lg leading-tight tracking-tight">{task.title}</h3>
                          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">{task.desc}</p>
                        </div>
                        {isDone ? (
                          <div className="bg-yellow-400/20 p-2 rounded-xl">
                             <Award className="text-yellow-400 fill-yellow-400 animate-pulse" size={28} />
                          </div>
                        ) : (
                          <Star className="text-white/10 group-hover:text-white/20 transition-colors" size={28} />
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            التقدم: {currentProgress} / {task.goal}
                          </span>
                          <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            {task.reward}
                          </span>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-[2px] border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                              isDone ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          >
                             {/* Glossy shine on progress bar */}
                             <div className="absolute inset-0 bg-white/20 w-full h-[1px] top-0" />
                          </div>
                        </div>
                      </div>

                      {isDone && (
                        <button className="w-full mt-6 py-4 bg-white text-[#0a0f3c] rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-xl active:scale-95">
                          استلام كود الخصم <QrCode size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}