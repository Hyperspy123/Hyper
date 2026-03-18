import { useState, useEffect } from 'react';
import { supabase } from '../LLL'; // Ensure this matches your Supabase client path
import Header from '@/components/Header';
import { Target, Gift, Star, ChevronLeft, Award, QrCode, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rewards() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [claimedId, setClaimedId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Court IDs from your Supabase 'courts' table
  const COURTS = {
    DIRIYAH: "your-diriyah-court-uuid-here",
    MALQA: "your-malqa-court-uuid-here"
  };

  useEffect(() => {
    async function fetchStats() {
      const { data: diriyahCount } = await supabase.rpc('get_user_booking_count', { target_court_id: COURTS.DIRIYAH });
      const { data: malqaCount } = await supabase.rpc('get_user_booking_count', { target_court_id: COURTS.MALQA });

      setCounts({
        [COURTS.DIRIYAH]: parseInt(diriyahCount || "0"),
        [COURTS.MALQA]: parseInt(malqaCount || "0")
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const courtData = [
    {
      name: "مركز هايب ١ - الدرعية",
      tasks: [
        { id: 1, title: "خبير الدرعية", desc: "حجز ٥ مرات", progress: counts[COURTS.DIRIYAH] || 0, goal: 5, reward: "خصم 20%" },
      ]
    },
    {
      name: "مركز هايب ٢ - الملقا",
      tasks: [
        { id: 3, title: "الولاء للملعب", desc: "حجز ٨ مرات", progress: counts[COURTS.MALQA] || 0, goal: 8, reward: "ساعة مجانية" },
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
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-8">مكافآتي</h1>
        <div className="space-y-10">
          {courtData.map((court, idx) => (
            <section key={idx} className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Target size={16} className="text-cyan-400" />
                <h2 className="text-xs font-black uppercase tracking-widest">{court.name}</h2>
              </div>
              {court.tasks.map((task) => {
                const isDone = task.progress >= task.goal;
                return (
                  <div key={task.id} className="bg-[#14224d] rounded-[32px] p-6 border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{task.title}</h3>
                        <p className="text-[10px] text-gray-500 mt-1">{task.desc}</p>
                      </div>
                      {isDone ? <Award className="text-yellow-400 fill-yellow-400" /> : <Star className="text-white/10" />}
                    </div>
                    
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-4">
                      <div 
                        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000"
                        style={{ width: `${Math.min((task.progress / task.goal) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500">
                      <span>{task.progress} / {task.goal} حجز</span>
                      <span>الجائزة: {task.reward}</span>
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}