import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Globe, Shield, UserX, ChevronLeft, Target, Users, Zap, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  
  // Advanced Player States
  const [skillLevel, setSkillLevel] = useState(3.5);
  const [playSide, setPlaySide] = useState<'Left' | 'Right' | 'Both'>('Both');
  const [racket, setRacket] = useState('Bullpadel Hack 03');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir="rtl">
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                    <ChevronLeft size={20} className="rotate-180" />
                </button>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">الإعدادات</h1>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Pro Player</span>
            </div>
        </div>

        {/* 1. SKILL LEVEL & PLAY SIDE */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          
          <h3 className="text-[10px] font-black text-gray-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
            <Target size={14} className="text-cyan-400" /> مستوى اللعب والتمركز
          </h3>
          
          <div className="space-y-10">
            {/* Skill Slider */}
            <div className="px-2">
                <div className="flex justify-between mb-4 items-end">
                    <span className="text-[10px] font-black text-gray-600 uppercase">مبتدئ</span>
                    <div className="text-center">
                        <span className="block text-[8px] text-cyan-500 font-black uppercase tracking-tighter">Your Level</span>
                        <span className="text-3xl font-black text-white italic leading-none">{skillLevel.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 uppercase">محترف</span>
                </div>
                <input 
                    type="range" min="1" max="7" step="0.1" 
                    value={skillLevel} 
                    onChange={(e) => setSkillLevel(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>

            {/* Play Side Selector */}
            <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">جهة اللعب المفضلة</span>
                <div className="grid grid-cols-3 gap-3">
                    {(['Left', 'Right', 'Both'] as const).map((side) => (
                        <button 
                            key={side}
                            onClick={() => setPlaySide(side)}
                            className={`py-3 rounded-2xl border text-[10px] font-black uppercase transition-all duration-300 ${
                                playSide === side 
                                ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                                : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'
                            }`}
                        >
                            {side === 'Left' ? 'يسار' : side === 'Right' ? 'يمين' : 'الكل'}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* 2. EQUIPMENT FLEX & GEAR */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6">
            <h3 className="text-[10px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Zap size={14} className="text-yellow-400" /> العتاد • Gear
            </h3>
            <div className="relative">
                <Award className="absolute right-4 top-4 text-gray-600" size={18} />
                <input 
                    type="text" 
                    value={racket}
                    onChange={(e) => setRacket(e.target.value)}
                    placeholder="نوع المضرب..." 
                    className="w-full bg-black/20 border border-white/5 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-800"
                />
            </div>
        </div>

        {/* 3. APP PREFERENCES */}
        <div className="space-y-3">
          {/* Language Toggle */}
          <div className="flex items-center justify-between px-6 py-5 rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Globe size={18} className="text-purple-400" />
              </div>
              <span className="text-sm font-black uppercase tracking-tight">اللغة • Language</span>
            </div>
            <button className="text-cyan-400 text-[10px] font-black border border-cyan-400/30 px-4 py-2 rounded-lg bg-cyan-400/5 uppercase">العربية</button>
          </div>

          {/* Privacy Glass Toggle */}
          <div className="flex items-center justify-between px-6 py-5 rounded-[24px] bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Shield size={18} className="text-green-400" />
              </div>
              <span className="text-sm font-black uppercase tracking-tight">الملف الشخصي عام</span>
            </div>
            <button 
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isPublic ? 'bg-cyan-500' : 'bg-gray-800'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isPublic ? 'left-1' : 'right-1'}`} />
            </button>
          </div>

          {/* Delete Account */}
          <button 
            onClick={() => toast.error("تواصل مع الإدارة لحذف الحساب")}
            className="w-full flex items-center justify-between px-6 py-5 rounded-[24px] bg-red-500/5 border border-red-500/10 group hover:bg-red-500 transition-all duration-300 mt-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <UserX size={18} className="text-red-400 group-hover:text-white" />
              </div>
              <span className="text-red-400 group-hover:text-white text-sm font-black uppercase transition-all tracking-widest">حذف الحساب</span>
            </div>
          </button>
        </div>

        <p className="text-center mt-8 text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Hype Padel v2.0.4</p>
      </div>
    </div>
  );
}