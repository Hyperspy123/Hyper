import Header from '@/components/Header';
import { Target, Gift, Star, ChevronLeft, Award, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rewards() {
  const navigate = useNavigate();

  // Mock data for the court achievements
  const courtData = [
    {
      name: "مركز هايب ١ - الدرعية",
      tasks: [
        { id: 1, title: "خبير الدرعية", desc: "حجز ٥ مرات في الشهر", progress: 3, goal: 5, reward: "خصم 20%" },
        { id: 2, title: "لاعب الصباح", desc: "اللعب مرتين قبل ١٢ ظهراً", progress: 1, goal: 2, reward: "مشروب طاقة مجاني" }
      ]
    },
    {
      name: "مركز هايب ٢ - الملقا",
      tasks: [
        { id: 3, title: "الولاء للملعب", desc: "حجز ٨ مرات في الشهر", progress: 8, goal: 8, reward: "ساعة مجانية", completed: true },
        { id: 4, title: "نجم الملقا", desc: "الفوز في مباراة فزعة واحدة", progress: 0, goal: 1, reward: "١٠٠ نقطة إضافية" }
      ]
    }
  ];

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

        <div className="space-y-10">
          {courtData.map((court, idx) => (
            <section key={idx} className="space-y-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-cyan-400" />
                <h2 className="text-sm font-black text-gray-400 tracking-widest uppercase">{court.name}</h2>
              </div>

              <div className="grid gap-4">
                {court.tasks.map((task) => {
                  const isDone = task.progress >= task.goal;
                  return (
                    <div key={task.id} className="bg-[#14224d] rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                          <p className="text-xs text-gray-400 mb-3">{task.desc}</p>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit border ${
                            isDone ? 'bg-green-500/10 border-green-500/20' : 'bg-cyan-500/10 border-cyan-500/20'
                          }`}>
                            <Gift size={12} className={isDone ? 'text-green-500' : 'text-cyan-400'} />
                            <span className={`text-[10px] font-black ${isDone ? 'text-green-500' : 'text-cyan-400'}`}>
                              الجائزة: {task.reward}
                            </span>
                          </div>
                        </div>
                        {isDone ? (
                          <Award size={24} className="text-yellow-400 fill-yellow-400 animate-bounce" />
                        ) : (
                          <Star size={24} className="text-white/10" />
                        )}
                      </div>

                      {/* Progress Tracker */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-500 tracking-tighter">
                          <span>التقدم: {task.progress} / {task.goal}</span>
                          <span>{Math.round((task.progress / task.goal) * 100)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out ${
                              isDone ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                            }`}
                            style={{ width: `${(task.progress / task.goal) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Claim Button - Only shows when 100% */}
                      {isDone && (
                        <button className="w-full mt-5 py-3 bg-green-500 text-[#0a0f3c] rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
                          استلام المكافأة <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}