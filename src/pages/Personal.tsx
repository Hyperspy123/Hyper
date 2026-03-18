import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Target, Users, Zap, Award, ChevronLeft, Star } from 'lucide-react';

export default function Personal() {
  const navigate = useNavigate();
  
  // Player Stats
  const [skillLevel, setSkillLevel] = useState(3.5);
  const [playSide, setPlaySide] = useState<'Left' | 'Right' | 'Both'>('Both');
  const [racket, setRacket] = useState('Bullpadel Hack 03');

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir="rtl">
      <Header />

      <div className="pt-24 max-w-lg mx-auto px-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
                    <ChevronLeft size={20} className="rotate-180" />
                </button>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-cyan-400">شخصي</h1>
            </div>
            <div className="flex gap-1">
                {[1, 2, 3].map((i) => <Star key={i} size={12} className="fill-yellow-500 text-yellow-500" />)}
            </div>
        </div>

        {/* --- PRO PLAYER CARD --- */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 mb-6 shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full -mr-16 -mt-16" />
          
          <h3 className="text-[10px] font-black text-gray-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
            <Target size={14} className="text-cyan-400" /> مستوى اللعب والتمركز
          </h3>
          
          <div className="space-y-10">
            {/* Skill Level Display */}
            <div className="px-2">
                <div className="flex justify-between mb-4 items-end">
                    <span className="text-[10px] font-black text-gray-600 uppercase">مبتدئ</span>
                    <div className="text-center">
                        <span className="block text-[8px] text-cyan-500 font-black uppercase tracking-tighter">Current Level</span>
                        <span className="text-4xl font-black text-white italic leading-none">{skillLevel.toFixed(1)}</span>
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

            {/* Side Selection */}
            <div className="space-y-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2">
                    <Users size={12} /> جهة اللعب المفضلة
                </span>
                <div className="grid grid-cols-3 gap-3">
                    {(['Left', 'Right', 'Both'] as const).map((side) => (
                        <button 
                            key={side}
                            onClick={() => setPlaySide(side)}
                            className={`py-4 rounded-2xl border text-[10px] font-black uppercase transition-all duration-300 ${
                                playSide === side 
                                ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg shadow-cyan-500/20 scale-105' 
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

        {/* --- GEAR SECTION --- */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-6">
            <h3 className="text-[10px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Zap size={14} className="text-yellow-400" /> العتاد الخاص بك
            </h3>
            <div className="relative group">
                <Award className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input 
                    type="text" 
                    value={racket}
                    onChange={(e) => setRacket(e.target.value)}
                    placeholder="ما هو نوع مضربك؟" 
                    className="w-full bg-black/40 border border-white/5 p-5 pr-14 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-800"
                />
            </div>
            <p className="mt-3 text-[9px] text-gray-500 font-bold px-2">يساعدك نوع المضرب في العثور على شركاء بأسلوب لعب متوافق.</p>
        </div>

        <p className="text-center mt-8 text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Hype Padel Athlete Profile</p>
      </div>
    </div>
  );
}