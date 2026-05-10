import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Calendar, Plus, X, Zap, Loader2, UserPlus, Trophy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

export default function Community() {
  const { t, dir, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'open' | 'players'>('open');
  const [loading, setLoading] = useState(true);
  const [openMatches, setOpenMatches] = useState<any[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);

  // حالات النموذج الجديد
  const [newMatch, setNewMatch] = useState({
    court: 'Court 1',
    date: 'Today',
    time: '08:00 PM',
    level: 'PRO'
  });

  const COURTS = ['Court 1', 'Court 2', 'Court 3', 'VIP Court'];
  const LEVELS = ['ROOKIE', 'PRO', 'ELITE', 'HYPE'];

  useEffect(() => {
    fetchOpenMatches();
  }, []);

  const fetchOpenMatches = async () => {
    setLoading(true);
    // هنا مستقبلاً تسحب من جدول open_matches في Supabase
    const { data, error } = await supabase.from('open_matches').select('*').order('created_at', { ascending: false });
    if (!error && data) setOpenMatches(data);
    setLoading(false);
  };

  const handleCreateMatch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error(lang === 'ar' ? "سجل دخولك أولاً" : "Please login first");

    try {
      const { error } = await supabase.from('open_matches').insert([{
        host_id: user.id,
        host_name: user.user_metadata?.first_name || 'Player',
        court_name: newMatch.court,
        match_date: newMatch.date,
        match_time: newMatch.time,
        level_required: newMatch.level,
        players_joined: 1,
        total_slots: 4
      }]);

      if (error) throw error;

      toast.success(lang === 'ar' ? "تم فتح التحدي بنجاح! 🔥" : "Challenge created successfully! 🔥");
      setShowHostForm(false);
      fetchOpenMatches();
    } catch (e) {
      toast.error("Error creating match");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-6">
        
        {/* هيدر الصفحة مع زر الإضافة */}
        <div className="flex justify-between items-center px-2">
          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">{t('community')}</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('open_matches')}</p>
          </div>
          <button 
            onClick={() => setShowHostForm(true)}
            className="w-12 h-12 bg-cyan-500 text-[#0a0f3c] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 active:scale-90 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* التابات */}
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-3xl border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('open')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'open' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>
            {t('open_matches')}
          </button>
          <button onClick={() => setActiveTab('players')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'players' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>
            {t('players')}
          </button>
        </div>

        {/* قائمة المباريات المفتوحة */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
          ) : openMatches.map(match => (
            <div key={match.id} className="bg-[#0a0f3c] border border-white/10 rounded-[40px] p-6 relative overflow-hidden group shadow-xl">
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20"><MapPin size={20} /></div>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <h3 className="font-black text-lg italic uppercase leading-none mb-1">{match.court_name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{t('hosted_by')} {match.host_name}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-[9px] font-black text-purple-400">{match.level_required}</div>
                </div>

                <div className={`flex gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold"><Calendar size={14} className="text-cyan-500" /> {match.match_date}</div>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold"><Clock size={14} className="text-cyan-500" /> {match.match_time}</div>
                </div>

                <button className="w-full py-4 bg-white/5 hover:bg-cyan-500 hover:text-[#0a0f3c] border border-white/10 rounded-2xl font-black uppercase italic transition-all active:scale-95">
                  {t('join_match')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* نموذج استضافة مباراة (Overlay Form) */}
      {showHostForm && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-[#05081d]/90 backdrop-blur-md" onClick={() => setShowHostForm(false)} />
          <div className="relative bg-[#0a0f3c] border-t border-white/10 rounded-t-[45px] p-8 space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-[1000] italic uppercase">{t('host_match')}</h2>
              <button onClick={() => setShowHostForm(false)} className="p-2 bg-white/5 rounded-full text-gray-400"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {/* اختيار الملعب */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_court')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {COURTS.map(c => (
                    <button key={c} onClick={() => setNewMatch({...newMatch, court: c})} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${newMatch.court === c ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* الوقت والتاريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_date')}</p>
                   <input type="date" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-cyan-500/50" onChange={(e) => setNewMatch({...newMatch, date: e.target.value})} />
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_time')}</p>
                   <input type="time" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-cyan-500/50" onChange={(e) => setNewMatch({...newMatch, time: e.target.value})} />
                </div>
              </div>

              <button onClick={handleCreateMatch} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[25px] font-[1000] italic uppercase shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">
                {t('create_match')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}