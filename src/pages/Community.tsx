import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Calendar, Plus, X, Zap, Loader2, Star, ShieldCheck, ChevronRight, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

export default function Community() {
  const { t, dir, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'open' | 'my'>('open');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [newMatch, setNewMatch] = useState({ court: 'Court 1', date: '', time: '20:00', price: '100' });

  const COURTS = [
    { name: 'Court 1', img: 'https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=1000' },
    { name: 'Court 2', img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000' },
    { name: 'VIP Court', img: 'https://images.unsplash.com/photo-1626225453016-8344555034a7?q=80&w=1000' }
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    const { data } = await supabase.from('open_matches').select('*').order('created_at', { ascending: false });
    if (data) setMatches(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) return toast.error("Login first");
    const selectedCourt = COURTS.find(c => c.name === newMatch.court);
    
    const { error } = await supabase.from('open_matches').insert([{
      host_id: user.id,
      host_name: user.user_metadata?.first_name || 'Hype Player',
      court_name: newMatch.court,
      match_date: newMatch.date || 'Today',
      match_time: newMatch.time,
      image_url: selectedCourt?.img,
      price: newMatch.price
    }]);

    if (!error) {
      toast.success(lang === 'ar' ? "تم إضافة ملعبك للمجتمع! 🎾" : "Match added to community! 🎾");
      setShowHostForm(false);
      fetchMatches();
    }
  };

  const deleteMatch = async (id: string) => {
    await supabase.from('open_matches').delete().eq('id', id);
    fetchMatches();
    toast.info("Deleted");
  };

  const filteredMatches = activeTab === 'open' 
    ? matches.filter(m => m.host_id !== user?.id) 
    : matches.filter(m => m.host_id === user?.id);

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-10">
        
        {/* التبويبات الفخمة */}
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[28px] border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('open')} className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase transition-all ${activeTab === 'open' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>
            {t('open_matches')}
          </button>
          <button onClick={() => setActiveTab('my')} className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase transition-all ${activeTab === 'my' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>
            {t('my_matches')}
          </button>
        </div>

        {/* زر الإضافة الكبير */}
        <button 
          onClick={() => setShowHostForm(true)}
          className="w-full py-5 bg-white/5 border border-dashed border-white/20 rounded-[35px] flex items-center justify-center gap-3 text-gray-400 font-black italic uppercase hover:border-cyan-500 transition-all"
        >
          <Plus size={20} /> {t('host_match')}
        </button>

        {/* قائمة المباريات - تصميم مطابق للرئيسية */}
        <div className="grid gap-12">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : filteredMatches.length > 0 ? filteredMatches.map(match => (
            <div key={match.id} className="group relative bg-[#0a0f3c]/40 backdrop-blur-xl rounded-[50px] overflow-hidden border border-white/10 shadow-2xl transition-all hover:border-cyan-500/30">
              
              <div className="h-64 overflow-hidden relative">
                <img src={match.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05081d] via-transparent" />
                
                {/* شارة المستضيف */}
                <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} flex flex-col gap-2`}>
                   <span className="bg-cyan-500 text-[#0a0f3c] px-4 py-2 rounded-2xl text-[9px] font-[1000] uppercase shadow-lg border border-cyan-400">
                     {t('hosted_by')}: {match.host_name}
                   </span>
                </div>

                <div className={`absolute bottom-6 ${dir === 'rtl' ? 'right-8' : 'left-8'} flex gap-4`}>
                    <div className="flex items-center gap-2 text-white/80 text-[10px] font-black bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl">
                      <Calendar size={14} className="text-cyan-400" /> {match.match_date}
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-[10px] font-black bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl">
                      <Clock size={14} className="text-cyan-400" /> {match.match_time}
                    </div>
                </div>
              </div>

              <div className={`p-10 pt-6 relative ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white">{match.court_name}</h3>
                  <div className="bg-white/5 p-4 rounded-[24px] border border-white/10 text-center shadow-inner">
                    <span className="block text-[8px] text-gray-500 font-black mb-1">SAR</span>
                    <span className="text-xl font-black text-cyan-400 italic">{match.price}</span>
                  </div>
                </div>

                {activeTab === 'my' ? (
                  <button onClick={() => deleteMatch(match.id)} className="w-full mt-8 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[28px] font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Trash2 size={18} /> {lang === 'ar' ? 'حذف الإعلان' : 'Delete Match'}
                  </button>
                ) : (
                  <button className="w-full mt-8 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-[#0a0f3c] rounded-[28px] font-black text-xs uppercase shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {t('join_match')} <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white/5 rounded-[50px] border border-dashed border-white/10">
               <Zap size={40} className="mx-auto mb-4 text-gray-600" />
               <p className="font-black text-gray-500 uppercase italic">{t('no_matches')}</p>
            </div>
          )}
        </div>
      </main>

      {/* نموذج الإضافة (مطابق لأسلوب الحجز) */}
      {showHostForm && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-[#05081d]/90 backdrop-blur-md" onClick={() => setShowHostForm(false)} />
          <div className="relative bg-[#0a0f3c] border-t border-white/10 rounded-t-[50px] p-10 space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-[1000] italic uppercase text-cyan-400">{t('host_match')}</h2>
              <button onClick={() => setShowHostForm(false)} className="p-3 bg-white/5 rounded-full text-gray-400"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_court')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {COURTS.map(c => (
                    <button key={c.name} onClick={() => setNewMatch({...newMatch, court: c.name})} className={`py-4 rounded-[20px] text-xs font-black border transition-all ${newMatch.court === c.name ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_date')}</p>
                    <input type="date" className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] text-xs font-black outline-none focus:border-cyan-500/50" onChange={(e) => setNewMatch({...newMatch, date: e.target.value})} />
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_time')}</p>
                    <input type="time" className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] text-xs font-black outline-none focus:border-cyan-500/50" onChange={(e) => setNewMatch({...newMatch, time: e.target.value})} />
                 </div>
              </div>

              <button onClick={handleCreate} className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] italic uppercase shadow-xl shadow-cyan-500/30 active:scale-95 transition-all">
                {t('create_match')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}