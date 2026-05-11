import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Calendar, Plus, X, Zap, Loader2, ChevronRight, Trash2, Users, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

const getUpcomingDates = (lang: string) => {
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = lang === 'ar' ? daysAr : daysEn;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    let dayName = days[d.getDay()];
    if (i === 0) dayName = lang === 'ar' ? 'اليوم' : 'Today';
    if (i === 1) dayName = lang === 'ar' ? 'غداً' : 'Tomorrow';
    return { value: d.toISOString().split('T')[0], dayName, dateNum: d.getDate() };
  });
};

const TIMES = ['04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM', '12:00 AM'];

export default function Community() {
  const { t, dir, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'open' | 'my'>('open');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  const DATES = getUpcomingDates(lang);
  const [selectedCourt, setSelectedCourt] = useState('Court 1');
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedTime, setSelectedTime] = useState(TIMES[2]);
  const [neededPlayers, setNeededPlayers] = useState(3); // التحكم بالعدد (1 إلى 3)

  const COURTS = [
    { name: 'Court 1', img: 'https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=1000', price: '100' },
    { name: 'Court 2', img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000', price: '120' },
    { name: 'VIP Court', img: 'https://images.unsplash.com/photo-1626225453016-8344555034a7?q=80&w=1000', price: '200' }
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
    if (!user) return toast.error(lang === 'ar' ? "سجل دخولك أولاً" : "Login first");
    const courtData = COURTS.find(c => c.name === selectedCourt);
    const { error } = await supabase.from('open_matches').insert([{
      host_id: user.id,
      host_name: user.user_metadata?.first_name || 'Hype Player',
      court_name: selectedCourt,
      match_date: selectedDate,
      match_time: selectedTime,
      image_url: courtData?.img,
      price: courtData?.price,
      needed_players: neededPlayers
    }]);
    if (!error) {
      toast.success(lang === 'ar' ? "تم نشر حجزك في المجتمع! 🔥" : "Booking live in community! 🔥");
      setShowHostForm(false);
      fetchMatches();
    }
  };

  const deleteMatch = async (id: string) => {
    await supabase.from('open_matches').delete().eq('id', id);
    fetchMatches();
    toast.info(lang === 'ar' ? "تم الحذف" : "Deleted");
  };

  const filteredMatches = activeTab === 'open' 
    ? matches.filter(m => m.host_id !== user?.id) 
    : matches.filter(m => m.host_id === user?.id);

  return (
    <div className="min-h-screen bg-[#05081d] text-white pb-32" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-10">
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[28px] border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('open')} className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase transition-all ${activeTab === 'open' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>{t('open_matches')}</button>
          <button onClick={() => setActiveTab('my')} className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase transition-all ${activeTab === 'my' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>{t('my_matches')}</button>
        </div>

        <button onClick={() => setShowHostForm(true)} className="w-full py-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-dashed border-cyan-500/30 rounded-[35px] flex items-center justify-center gap-3 text-cyan-400 font-black italic uppercase transition-all shadow-lg active:scale-95"><Plus size={20} /> {t('host_match')}</button>

        <div className="grid gap-12">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : filteredMatches.length > 0 ? filteredMatches.map(match => (
            <div key={match.id} className="relative group bg-[#0a0f3c]/40 backdrop-blur-xl rounded-[50px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-cyan-500/40">
              {/* الترويسة الفخمة (Image Section) */}
              <div className="h-64 overflow-hidden relative">
                <img src={match.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05081d] via-transparent" />
                
                {/* شارة المستضيف */}
                <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'}`}>
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                     <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black text-white uppercase">{match.host_name}</span>
                   </div>
                </div>

                {/* عداد اللاعبين المطلوبين - فخم */}
                <div className={`absolute top-6 ${dir === 'rtl' ? 'right-6' : 'left-6'}`}>
                    <div className="bg-cyan-500 text-[#0a0f3c] px-4 py-2 rounded-2xl text-[9px] font-[1000] uppercase shadow-xl flex items-center gap-2">
                        <UserPlus size={14} /> {lang === 'ar' ? `مطلوب ${match.needed_players}` : `Needs ${match.needed_players}`}
                    </div>
                </div>

                <div className={`absolute bottom-6 ${dir === 'rtl' ? 'right-8' : 'left-8'} flex gap-3`}>
                    <div className="flex items-center gap-2 text-white text-[10px] font-black bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10"><Calendar size={14} className="text-cyan-400" /> {match.match_date}</div>
                    <div className="flex items-center gap-2 text-white text-[10px] font-black bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10"><Clock size={14} className="text-cyan-400" /> {match.match_time}</div>
                </div>
              </div>

              {/* تفاصيل البطاقة */}
              <div className={`p-10 pt-6 relative z-10 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white leading-none">{match.court_name}</h3>
                  <div className="flex flex-col items-center bg-white/5 p-3 rounded-[24px] border border-white/10 min-w-[80px]">
                    <span className="text-[8px] text-gray-500 font-black uppercase">SAR</span>
                    <span className="text-xl font-black text-cyan-400 italic">{match.price}</span>
                  </div>
                </div>

                {activeTab === 'my' ? (
                  <button onClick={() => deleteMatch(match.id)} className="w-full py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[28px] font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><Trash2 size={18} /> {lang === 'ar' ? 'حذف الحجز' : 'Delete Booking'}</button>
                ) : (
                  <button className="w-full py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-[#0a0f3c] rounded-[28px] font-black text-xs uppercase shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-3 hover:shadow-cyan-400/50 active:scale-95 transition-all">
                    {t('join_match')} <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white/5 rounded-[50px] border border-dashed border-white/10"><Zap size={40} className="mx-auto mb-4 text-gray-700" /><p className="font-black text-gray-500 uppercase italic">{t('no_matches')}</p></div>
          )}
        </div>
      </main>

      {/* لوحة إنشاء حجز - تحكم كامل بالعدد */}
      {showHostForm && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-[#05081d]/95 backdrop-blur-xl" onClick={() => setShowHostForm(false)} />
          <div className="relative bg-[#0a0f3c] border-t border-cyan-500/20 rounded-t-[50px] p-8 space-y-8 animate-in slide-in-from-bottom duration-500 border-x border-cyan-500/5">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-[1000] italic uppercase text-white tracking-tighter">{t('host_match')}</h2>
              <button onClick={() => setShowHostForm(false)} className="p-3 bg-white/5 rounded-full text-gray-400"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className={`text-[10px] font-black text-gray-500 uppercase tracking-widest ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>{t('select_court')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {COURTS.map(c => (
                    <button key={c.name} onClick={() => setSelectedCourt(c.name)} className={`py-4 rounded-[20px] text-[10px] font-black border transition-all ${selectedCourt === c.name ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-400'}`}>{c.name}</button>
                  ))}
                </div>
              </div>

              {/* التحكم بعدد اللاعبين المطلوبين */}
              <div className="space-y-4">
                <p className={`text-[10px] font-black text-gray-500 uppercase tracking-widest ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>{t('needed_players')}</p>
                <div className="flex gap-3">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setNeededPlayers(num)} className={`flex-1 py-4 rounded-[20px] font-black text-sm border transition-all ${neededPlayers === num ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {num} {t('player_count')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className={`text-[10px] font-black text-gray-500 uppercase tracking-widest ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>{t('select_date')}</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {DATES.map(date => (
                    <button key={date.value} onClick={() => setSelectedDate(date.value)} className={`flex-none w-[70px] py-4 rounded-[20px] flex flex-col items-center gap-1 transition-all border ${selectedDate === date.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}><span className="text-[10px] font-bold">{date.dayName}</span><span className="text-lg font-black">{date.dateNum}</span></button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className={`text-[10px] font-black text-gray-500 uppercase tracking-widest ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>{t('select_time')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIMES.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={`py-4 rounded-[18px] text-[10px] font-black transition-all border ${selectedTime === time ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-lg' : 'bg-white/5 text-gray-400 border-white/10'}`}>{time}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleCreate} className="w-full py-6 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-[1000] italic uppercase shadow-xl shadow-cyan-500/30 active:scale-95 transition-all">{t('create_match')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}