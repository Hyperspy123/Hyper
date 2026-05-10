import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Calendar, ChevronRight, Zap, Loader2, Star, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

export default function Community() {
  const { t, dir, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'open' | 'players'>('open');
  const [loading, setLoading] = useState(true);
  const [openMatches, setOpenMatches] = useState<any[]>([]);

  useEffect(() => {
    // محاكاة جلب بيانات مباريات مفتوحة (Open Lobbies)
    const mockMatches = [
      { id: 1, host: 'عمر الراجحي', court: 'ملعب هايب 1', time: '08:00 PM', date: 'Today', players: 2, total: 4, level: 'PRO' },
      { id: 2, host: 'James Wilson', court: 'VIP Court', time: '10:30 PM', date: 'Tomorrow', players: 3, total: 4, level: 'ELITE' },
    ];
    setOpenMatches(mockMatches);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        
        {/* تبديل التابات */}
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-full border border-white/10">
          <button onClick={() => setActiveTab('open')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 'open' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>
            {t('open_matches')}
          </button>
          <button onClick={() => setActiveTab('players')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 'players' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>
            {t('players')}
          </button>
        </div>

        {activeTab === 'open' ? (
          <div className="space-y-6">
            {openMatches.map(match => (
              <div key={match.id} className="bg-[#0a0f3c] border border-white/10 rounded-[40px] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={80} /></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400"><MapPin size={20} /></div>
                      <div>
                        <h3 className="font-black text-lg italic uppercase">{match.court}</h3>
                        <p className="text-[10px] text-gray-500 font-bold">{t('hosted_by')} {match.host}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-[9px] font-black text-cyan-400">{match.level}</div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs"><Calendar size={14} /> {match.date}</div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs"><Clock size={14} /> {match.time}</div>
                  </div>

                  {/* عداد اللاعبين الناقصين */}
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {[...Array(match.players)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0f3c] bg-gray-700 flex items-center justify-center text-[10px] font-bold">P</div>
                        ))}
                        {[...Array(match.total - match.players)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0f3c] bg-cyan-500/10 border-dashed border-cyan-500/30 flex items-center justify-center text-cyan-500"><UserPlus size={12} /></div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase">{match.players}/{match.total} {t('players')}</span>
                    </div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase">{match.total - match.players} {t('spots_left')}</span>
                  </div>

                  <button onClick={() => toast.success('Match request sent!')} className="w-full py-4 bg-cyan-500 text-[#0a0f3c] rounded-2xl font-black uppercase italic shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
                    {t('join_match')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-20"><Users size={60} className="mx-auto mb-4" /><p className="font-black italic">SEARCHING FOR PLAYERS...</p></div>
        )}
      </main>
    </div>
  );
}