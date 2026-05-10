import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Mail, Phone, Trophy, Zap, Loader2, Medal, Star, Flame, Crown, Swords, Sparkles, Lock, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Personal() {
  const { t, dir, lang } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const RANKS = [
    { id: 1, name: lang === 'ar' ? 'مبتدئ' : 'ROOKIE', Icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10', min: 0, max: 49 },
    { id: 2, name: lang === 'ar' ? 'محترف' : 'PRO', Icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', min: 50, max: 99 },
    { id: 3, name: lang === 'ar' ? 'نخبة' : 'ELITE', Icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', min: 100, max: 149 },
    { id: 4, name: lang === 'ar' ? 'أمير' : 'PRINCE', Icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', min: 150, max: 199 },
    { id: 5, name: lang === 'ar' ? 'ملك' : 'KING', Icon: Swords, color: 'text-yellow-400', bg: 'bg-yellow-500/10', min: 200, max: 249 },
    { id: 6, name: lang === 'ar' ? 'أسطورة' : 'LEGEND', Icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', min: 250, max: 299 },
    { id: 7, name: lang === 'ar' ? 'هايب' : 'HYPE', Icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', min: 300, max: 9999 },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/auth');
      else supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
        setProfile({ ...data, email: user.email });
        setLoading(false);
      });
    });
  }, []);

  const matches = profile?.total_matches || 0;
  const currentRank = RANKS.find(r => matches >= r.min && matches <= r.max) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  const progress = nextRank ? ((matches - currentRank.min) / (currentRank.max - currentRank.min + 1)) * 100 : 100;

  if (loading) return <div className="min-h-screen bg-[#05081d] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        
        {/* كرت الرانك وشريط التقدم */}
        <div className="bg-[#0a0f3c] border border-cyan-500/30 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10"><currentRank.Icon size={120} /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${currentRank.bg} flex items-center justify-center border border-white/10`}>
                  <currentRank.Icon size={32} className={currentRank.color} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">{t('rank')}</p>
                  <h2 className={`text-4xl font-[1000] italic uppercase ${currentRank.color}`}>{currentRank.name}</h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-[1000] italic">{matches}</span>
                <p className="text-[8px] font-black text-gray-500 uppercase">{t('matches')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-cyan-400">{t('current_progress')}</span>
                <span className="text-gray-400">{nextRank ? `${t('remaining_to_rank')}: ${currentRank.max + 1 - matches}` : t('max_level')}</span>
              </div>
              <div className="h-4 w-full bg-white/5 rounded-full border border-white/5 overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* مسار الرتب (الليدر) */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pr-4 flex items-center gap-2">
            <Trophy size={14} className="text-cyan-400" /> {lang === 'ar' ? 'مخطط التصنيفات' : 'RANK LADDER'}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
            {RANKS.map((r) => {
              const isComp = matches > r.max; const isCurr = matches >= r.min && matches <= r.max;
              return (
                <div key={r.id} className={`min-w-[130px] rounded-[30px] p-5 border flex flex-col items-center transition-all ${isCurr ? 'bg-[#0a0f3c] border-cyan-500 shadow-lg scale-105' : 'bg-white/5 border-white/5 opacity-40'}`}>
                  <r.Icon size={24} className={isCurr || isComp ? r.color : 'text-gray-600'} />
                  <h4 className={`text-xs font-black mt-3 ${isCurr || isComp ? 'text-white' : 'text-gray-600'}`}>{r.name}</h4>
                  <p className="text-[8px] font-bold text-gray-500 mt-1">{r.min} {t('matches')}</p>
                  {isComp && <CheckCircle2 size={12} className="text-emerald-400 mt-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* أزرار الإعدادات */}
        <div className="bg-white/5 rounded-[35px] p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
             <Phone size={18} className="text-cyan-400" />
             <div className="flex-1"><p className="text-[8px] text-gray-500 uppercase">{t('phone')}</p><p className="font-bold text-sm">{profile?.phone || '---'}</p></div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))} className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl font-black italic flex items-center justify-center gap-2 transition-all active:scale-95">
            <LogOut size={20} /> {t('logout')}
          </button>
        </div>
      </main>
    </div>
  );
}