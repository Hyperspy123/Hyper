import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Target, Gift, Star, ChevronLeft, Award, QrCode, Loader2, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext'; // 🔥 استيراد المترجم

export default function Rewards() {
  const { t, dir, lang } = useLanguage(); // 🔥 جلب أدوات اللغة
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
      name: lang === 'ar' ? "ملعب ١" : "Court 1",
      id: COURT_IDS.COURT1,
      accent: "text-cyan-400",
      tasks: [
        { 
          title: lang === 'ar' ? "خبير ملعب ١" : "Court 1 Expert", 
          desc: lang === 'ar' ? "حجز ٥ مرات في هذا الملعب" : "Book 5 times in this court", 
          goal: 5, 
          reward: lang === 'ar' ? "خصم 20%" : "20% Discount" 
        },
        { 
          title: lang === 'ar' ? "الأسطورة" : "The Legend", 
          desc: lang === 'ar' ? "حجز ١٠ مرات في هذا الملعب" : "Book 10 times in this court", 
          goal: 10, 
          reward: lang === 'ar' ? "مضرب مجاني" : "Free Racket" 
        }
      ]
    },
    {
      name: lang === 'ar' ? "ملعب ٢" : "Court 2",
      id: COURT_IDS.COURT2,
      accent: "text-purple-400",
      tasks: [
        { 
          title: lang === 'ar' ? "ولاء ملعب ٢" : "Court 2 Loyalty", 
          desc: lang === 'ar' ? "حجز ٣ مرات في هذا الملعب" : "Book 3 times in this court", 
          goal: 3, 
          reward: lang === 'ar' ? "ساعة مجانية" : "Free Hour" 
        }
      ]
    },
    {
      name: lang === 'ar' ? "ملعب ٣" : "Court 3",
      id: COURT_IDS.COURT3,
      accent: "text-orange-400",
      tasks: [
        { 
          title: lang === 'ar' ? "نجم ملعب ٣" : "Court 3 Star", 
          desc: lang === 'ar' ? "حجز مرتين في هذا الملعب" : "Book 2 times in this court", 
          goal: 2, 
          reward: lang === 'ar' ? "مشروب طاقة" : "Energy Drink" 
        }
      ]
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-32" dir={dir}>
      <Header />
      
      <div className="p-6 max-w-md mx-auto pt-24">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] transition-all active:scale-90"
          >
            <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <h1 className={`text-3xl font-black italic tracking-tighter uppercase ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
            {t('rewards')}
          </h1>
        </div>

        <div className="space-y-12">
          {courtBrands.map((brand, bIdx) => (
            <div key={bIdx} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className={`flex items-center gap-2 ${dir === 'ltr' ? 'flex-row' : ''}`}>
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
                    <div 
                      key={tIdx} 
                      className="bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 relative overflow-hidden group shadow-2xl transition-all duration-300 hover:border-white/20"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`z-10 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
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
                            {lang === 'ar' ? `التقدم: ${currentProgress} / ${task.goal}` : `Progress: ${currentProgress} / ${task.goal}`}
                          </span>
                          <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            {task.reward}
                          </span>
                        </div>
                        
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-[2px] border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                              isDone ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          >
                             <div className="absolute inset-0 bg-white/20 w-full h-[1px] top-0" />
                          </div>
                        </div>
                      </div>

                      {isDone && (
                        <button className="w-full mt-6 py-4 bg-white text-[#0a0f3c] rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-xl active:scale-95">
                          {lang === 'ar' ? 'استلام كود الخصم' : 'Claim Discount Code'} <QrCode size={18} />
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