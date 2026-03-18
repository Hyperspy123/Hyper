import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Globe, Shield, UserX, ChevronLeft, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  
  // Pro Padel States
  const [skillLevel, setSkillLevel] = useState(3.5);
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir="rtl">
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
                <ChevronLeft size={20} className="rotate-180" />
            </button>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">الإعدادات</h1>
        </div>

        {/* Skill Level Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
            <Target size={14} className="text-cyan-400" /> مستوى اللعب
          </h3>
          
          <div className="space-y-8">
            <div className="px-2">
                <div className="flex justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500">مبتدئ</span>
                    <span className="text-lg font-black text-cyan-400 italic">{skillLevel.toFixed(1)}</span>
                    <span className="text-xs font-bold text-gray-500">محترف</span>
                </div>
                <input 
                    type="range" min="1" max="7" step="0.1" 
                    value={skillLevel} 
                    onChange={(e) => setSkillLevel(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-6 py-5 rounded-[24px] bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Globe size={18} className="text-purple-400" />
              </div>
              <span className="text-sm font-black uppercase">اللغة</span>
            </div>
            <button className="text-cyan-400 text-xs font-black border border-cyan-400/30 px-4 py-2 rounded-lg bg-cyan-400/5">العربية</button>
          </div>

          <button 
            onClick={() => toast.error("تواصل مع الإدارة لحذف الحساب")}
            className="w-full flex items-center justify-between px-6 py-5 rounded-[24px] bg-red-500/5 border border-red-500/10 group hover:bg-red-500 transition-all mt-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-white/20">
                <UserX size={18} className="text-red-400 group-hover:text-white" />
              </div>
              <span className="text-red-400 group-hover:text-white text-sm font-black uppercase">حذف الحساب</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}