import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Search, Swords, Shield, Zap, X, CheckCircle2, Flame } from 'lucide-react';
import { toast } from 'sonner';

// 💬 الجمل الجاهزة للشات السريع
const HYPE_MESSAGES = [
  "جاهز للخسارة؟ 😈", "الوعد في الملعب 🎾", "لا تتأخر ⏰", 
  "جهّز مضربك 🔥", "الشبكة لي اليوم 🕸️", "بالتوفيق يا وحش 💪"
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<'players' | 'lobbies'>('players');
  const [activeLobby, setActiveLobby] = useState<any>(null); // للتحكم بظهور نافذة المبارزة
  
  // حالات وهمية للعرض (اربطها بقاعدة البيانات لاحقاً)
  const [players] = useState([
    { id: '1', name: 'تركي الدوسري', level: 'متقدم', rank: 'KING' },
    { id: '2', name: 'سعود فهد', level: 'متوسط', rank: 'PRO' },
  ]);

  const [lobbies] = useState([
    { id: '101', opponent_name: 'تركي الدوسري', opponent_level: 'متقدم', status: 'negotiating', proposed_court: 'ملعب هايب 1' }
  ]);

  // -- دوال غرفة المبارزة --
  const handleSendHypeMessage = (msg: string) => toast.success(`تم إرسال: ${msg}`);
  const handleAcceptProposal = () => {
    toast.success("تم تأكيد المباراة! 💥");
    setActiveLobby({ ...activeLobby, status: 'agreed' });
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative overflow-hidden" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6 relative z-10">
        
        {/* العنوان والتبويبات */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20"><Swords size={24} /></div>
            <div>
              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">المجتمع</h1>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">تحدى أفضل اللاعبين</p>
            </div>
          </div>

          <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
            <button onClick={() => setActiveTab('players')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${activeTab === 'players' ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg' : 'text-gray-400 hover:text-white'}`}>اللاعبين</button>
            <button onClick={() => setActiveTab('lobbies')} className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 relative ${activeTab === 'lobbies' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              غرف المبارزة 
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'players' ? (
          <div className="space-y-4">
            {/* شريط البحث */}
            <div className="relative">
              <Search className="absolute right-4 top-4 text-gray-500" size={18} />
              <input type="text" placeholder="ابحث عن لاعب..." className="w-full bg-[#0a0f3c] border border-white/10 p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:border-cyan-500 transition-all text-white" />
            </div>

            {players.map(player => (
              <div key={player.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-[1000] text-sm text-white">{player.name}</h3>
                  <p className="text-[10px] text-cyan-400 font-bold">{player.rank} | {player.level}</p>
                </div>
                <button onClick={() => setActiveLobby({ id: 'new', opponent_name: player.name, opponent_level: player.level, status: 'pending' })} className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-black uppercase active:scale-95 transition-all flex gap-1 items-center">
                  <Swords size={14} /> تحدى
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map(lobby => (
              <div key={lobby.id} onClick={() => setActiveLobby(lobby)} className="bg-[#0a0f3c] border border-purple-500/40 rounded-3xl p-5 cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h3 className="font-[1000] text-sm text-white">{lobby.opponent_name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold">بانتظار ردك في التنسيق ⏳</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                    <Zap size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= نافذة غرفة المبارزة المنبثقة (Modal) ================= */}
      <div className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-500 ${activeLobby ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        {/* خلفية سوداء ضبابية */}
        <div className="absolute inset-0 bg-[#05081d]/80 backdrop-blur-sm" onClick={() => setActiveLobby(null)} />
        
        {/* جسم النافذة اللي تطلع من تحت */}
        <div className={`bg-[#0a0f3c] border-t border-white/10 rounded-t-[40px] w-full max-h-[85vh] flex flex-col relative z-10 transition-transform duration-500 ${activeLobby ? 'translate-y-0' : 'translate-y-full'}`}>
          
          {/* مقبض السحب (وهمي للشكل) و زر الإغلاق */}
          <div className="flex justify-center pt-4 pb-2 relative">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            <button onClick={() => setActiveLobby(null)} className="absolute left-6 top-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"><X size={18} /></button>
          </div>

          {activeLobby && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* هيدر الخصم */}
              <div className="p-6 pb-4 border-b border-white/5 text-center">
                <div className="inline-flex w-16 h-16 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full items-center justify-center p-0.5 mb-2">
                  <div className="w-full h-full bg-[#05081d] rounded-full flex items-center justify-center"><Swords size={24} className="text-white"/></div>
                </div>
                <h2 className="font-[1000] text-xl uppercase italic">{activeLobby.opponent_name}</h2>
                <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{activeLobby.opponent_level}</span>
              </div>

              {/* منطقة التفاوض */}
              <div className="p-6 bg-white/5 flex-none relative">
                {activeLobby.status === 'agreed' ? (
                  <div className="text-center py-4 space-y-2">
                      <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-400 mb-2"><CheckCircle2 size={32} /></div>
                      <h3 className="text-xl font-[1000] italic text-white uppercase">المباراة مؤكدة!</h3>
                  </div>
                ) : activeLobby.status === 'negotiating' ? (
                  <div className="bg-[#0a0f3c] border border-cyan-500/30 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-gray-400 mb-2">عرض مطروح من الخصم</p>
                      <h4 className="text-lg font-[1000] text-cyan-400 mb-4">{activeLobby.proposed_court || 'ملعب هايب 1'}</h4>
                      <div className="flex gap-2">
                          <button onClick={handleAcceptProposal} className="flex-1 py-3 bg-emerald-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95">قبول 💥</button>
                          <button className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl text-xs active:scale-95">رفض 🔄</button>
                      </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                      <select className="w-full bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs font-bold text-white outline-none">
                          <option>اختر الملعب...</option><option>ملعب 1</option><option>ملعب 2</option>
                      </select>
                      <div className="flex gap-2">
                          <input type="date" className="flex-1 bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs text-white [&::-webkit-calendar-picker-indicator]:invert" />
                          <input type="time" className="flex-1 bg-[#0a0f3c] border border-white/10 p-3 rounded-xl text-xs text-white [&::-webkit-calendar-picker-indicator]:invert" />
                      </div>
                      <button className="w-full py-3 bg-cyan-500 text-[#0a0f3c] font-black rounded-xl text-xs active:scale-95">إرسال العرض 🎾</button>
                  </div>
                )}
              </div>

              {/* الشات السريع */}
              <div className="flex-1 p-6 flex flex-col justify-center items-center opacity-30 min-h-[150px]">
                  <Flame size={40} className="mb-2" />
                  <p className="font-black text-xs uppercase tracking-widest">الميدان هادي.. استفز خصمك!</p>
              </div>

              {/* أزرار الاستفزاز */}
              <div className="p-4 pb-8 border-t border-white/5 bg-[#05081d]">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {HYPE_MESSAGES.map((msg, idx) => (
                          <button key={idx} onClick={() => handleSendHypeMessage(msg)} className="whitespace-nowrap px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 rounded-full text-xs font-bold transition-all active:scale-95">
                              {msg}
                          </button>
                      ))}
                  </div>
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}