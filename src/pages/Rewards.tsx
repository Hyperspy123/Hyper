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

  // These match the fixed IDs from your SQL script
  const COURT_IDS = {
    HYPER: "d1111111-1111-1111-1111-111111111111", 
    SMASH: "m2222222-2222-2222-2222-222222222222"
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
          [COURT_IDS.HYPER]: parseInt(results[0]?.data || "0"),
          [COURT_IDS.SMASH]: parseInt(results[1]?.data || "0"),
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
      name: "هايب هايبر - HYPER",
      id: COURT_IDS.HYPER,
      accent: "text-cyan-400",
      tasks: [
        { title: "العميل المميز", desc: "حجز ٥ مرات في هذا الملعب", goal: 5, reward: "خصم 20%" },
        { title: "بطل الدرعية", desc: "حجز ١٠ مرات لتصبح بطل الساحة", goal: 10, reward: "مضرب مجاني" }
      ]
    },
    {
      name: "هايب سماش - SMASH",
      id: COURT_IDS.SMASH,
      accent: "text-purple-400",
      tasks: [
        { title: "ولاء الملقا", desc: "حجز ٣ مرات في الملقا", goal: 3, reward: "ساعة مجانية" }
      ]
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f3c] flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">مكافآتي</h1>
        </div>

        <div className="space-y-12">
          {courtBrands.map((brand, bIdx) => (
            <div key={bIdx} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500 fill-orange-500" />
                  <h2 className={`font-black uppercase tracking-widest text-sm ${brand.accent}`}>
                    {brand.name}
                  </h2>
                </div>
              </div>

              <div className="grid gap-4">
                {brand.tasks.map((task, tIdx) => {
                  const currentProgress = counts[brand.id] || 0;
                  const isDone = currentProgress >= task.goal;
                  const progressPercent = Math.min((currentProgress / task.goal) * 100, 100);

                  return (
                    <div key={tIdx} className="bg-[#14224d] rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="z-10">
                          <h3 className="font-bold text-lg leading-tight">{task.title}</h3>
                          <p className="text-[10px] text-gray-400 mt-1">{task.desc}</p>
                        </div>
                        {isDone ? (
                          <Award className="text-yellow-400 fill-yellow-400 animate-bounce" size={28} />
                        ) : (
                          <Star className="text-white/5" size={28} />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-gray-500">
                            التقدم: {currentProgress} / {task.goal}
                          </span>
                          <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md">
                            {task.reward}
                          </span>
                        </div>
                        
                        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out ${
                              isDone ? 'bg-green-500' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {isDone && (
                        <button className="w-full mt-5 py-3 bg-white text-[#0a0f3c] rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all">
                          استلام المكافأة <QrCode size={16} />
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