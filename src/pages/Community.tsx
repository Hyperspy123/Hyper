import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Calendar, Plus, X, Zap, Loader2, ChevronRight, Trash2, Users, UserPlus, ShieldCheck, Timer, Info, Sparkles } from 'lucide-react';
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
  const [courts, setCourts] = useState<any[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  const DATES = getUpcomingDates(lang);
  
  // حالات الفورم
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedTime, setSelectedTime] = useState(TIMES[2]);
  const [neededPlayers, setNeededPlayers] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // 🔥 المدة الافتراضية 60 دقيقة

  // خيارات المدة
  const DURATIONS = [
    { value: 60, label: t('mins_60' as any) },
    { value: 90, label: t('mins_90' as any) },
    { value: 120, label: t('mins_120' as any) }
  ];

  // 🔥 الحسبة الديناميكية للسعر
  const basePrice = selectedCourt?.price_per_hour || 150;
  const totalPrice = (basePrice * (selectedDuration / 60)).toFixed(2);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchCourts();
    fetchMatches();

    const channel = supabase.channel('community_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'open_matches' }, () => fetchMatches())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchCourts = async () => {
    const { data } = await supabase.from('courts').select('*');
    if (data && data.length > 0) {
      setCourts(data);
      setSelectedCourt(data[0]);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    const { data } = await supabase.from('open_matches').select('*').order('created_at', { ascending: false });
    if (data) setMatches(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) return toast.error(t('notif_login_required' as any));
    if (!selectedCourt) return toast.error(lang === 'ar' ? "الرجاء اختيار ملعب" : "Please select a court");

    const { data: existingMatch } = await supabase
      .from('open_matches')
      .select('id')
      .eq('court_name', selectedCourt.name)
      .eq('match_date', selectedDate)
      .eq('match_time', selectedTime)
      .single();

    if (existingMatch) {
      return toast.error(t('notif_slot_taken' as any)); 
    }

    try {
      const { error } = await supabase.from('open_matches').insert([{
        host_id: user.id,
        host_name: user.user_metadata?.first_name || 'Hype Player',
        court_name: selectedCourt.name,
        match_date: selectedDate,
        match_time: selectedTime,
        duration_minutes: selectedDuration, // 🔥 إرسال المدة
        image_url: selectedCourt.image_url,
        price: totalPrice, // 🔥 إرسال السعر المحسوب
        needed_players: neededPlayers,
        joined_count: 0,
        joined_users: [] 
      }]);

      if (error) throw error;
      
      toast.success(t('notif_booking_confirmed' as any));
      setShowHostForm(false);
      fetchMatches();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleJoin = async (match: any) => {
    if (!user) return toast.error(t('notif_login_required' as any));
    if (match.joined_count >= match.needed_players) return toast.error(t('match_full'));
    
    const joinedList = match.joined_users || [];
    const isAlreadyIn = joinedList.some((u: any) => u.id === user.id);
    if (isAlreadyIn) return toast.error(t('you_are_in'));

    const currentUserData = { id: user.id, name: user.user_metadata?.first_name || 'Hype Player' };
    const updatedUsersList = [...joinedList, currentUserData];

    const { error } = await supabase.from('open_matches')
      .update({ 
        joined_count: match.joined_count + 1,
        joined_users: updatedUsersList
      })
      .eq('id', match.id);

    if (!error) {
      toast.success(t('notif_join_success' as any));
      fetchMatches();
    }
  };

  const deleteMatch = async (id: string) => {
    await supabase.from('open_matches').delete().eq('id', id);
    fetchMatches();
    toast.info(t('notif_match_cancelled' as any));
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
          ) : filteredMatches.length > 0 ? filteredMatches.map(match => {
            const isFull = match.joined_count >= match.needed_players;
            const joinedList = match.joined_users || [];
            const amIJoined = joinedList.some((u: any) => u.id === user?.id);

            return (
              <div key={match.id} className="relative group bg-[#0a0f3c]/40 backdrop-blur-xl rounded-[50px] overflow-hidden border border-white/10 shadow-2xl transition-all hover:border-cyan-500/40">
                <div className="h-64 overflow-hidden relative">
                  <img src={match.image_url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05081d] via-transparent" />
                  
                  <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'}`}>
                    <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg">
                      <ShieldCheck size={14} className="text-purple-400" />
                      <span className="text-[9px] font-black text-gray-300">{t('host_info')}:</span>
                      <span className="text-[10px] font-black text-white uppercase">{match.host_name}</span>
                    </div>
                  </div>

                  <div className={`absolute top-6 ${dir === 'rtl' ? 'right-6' : 'left-6'}`}>
                      <div className={`${isFull ? 'bg-red-500' : 'bg-cyan-500'} text-[#0a0f3c] px-4 py-2 rounded-2xl text-[9px] font-[1000] uppercase shadow-xl flex items-center gap-2`}>
                          <UserPlus size={14} /> 
                          {isFull ? t('slots_full') : lang === 'ar' ? `متبقي ${match.needed_players - match.joined_count}` : `${match.needed_players - match.joined_count} Slots Left`}
                      </div>
                  </div>
                </div>

                <div className={`p-10 pt-6 relative z-10 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white leading-none">{match.court_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-gray-400 font-bold text-xs bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="flex items-center gap-1"><Calendar size={12} className="text-cyan-400" /> {match.match_date}</span>
                        <span className="w-px h-3 bg-white/20"></span>
                        <span className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" /> {match.match_time}</span>
                        {/* 🔥 عرض المدة في كرت المباراة */}
                        {match.duration_minutes && (
                          <>
                            <span className="w-px h-3 bg-white/20"></span>
                            <span className="flex items-center gap-1"><Timer size={12} className="text-purple-400" /> {match.duration_minutes} {lang === 'ar' ? 'د' : 'Mins'}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-[24px] border border-white/10 text-center flex-shrink-0">
                      <span className="block text-[8px] text-gray-500 font-black mb-1 uppercase">{t('sar' as any)}</span>
                      <span className="text-xl font-black text-cyan-400 italic">{match.price}</span>
                    </div>
                  </div>

                  {joinedList.length > 0 && (
                    <div className="mb-6 p-4 bg-white/5 rounded-[20px] border border-white/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <Users size={12} /> {t('joined_players_list')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {joinedList.map((u: any, idx: number) => (
                          <div key={idx} className="bg-[#05081d] px-3 py-1.5 rounded-lg border border-cyan-500/30 text-[10px] font-black text-cyan-300">
                            {u.name} {u.id === user?.id && '(أنت)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'my' ? (
                    <button onClick={() => deleteMatch(match.id)} className="w-full mt-2 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[28px] font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><Trash2 size={18} /> {lang === 'ar' ? 'إلغاء الإعلان' : 'Cancel Match'}</button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(match)}
                      disabled={isFull || amIJoined}
                      className={`w-full mt-2 py-5 rounded-[28px] font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isFull ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : amIJoined ? 'bg-purple-600 text-white cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-[#0a0f3c] hover:shadow-cyan-500/40'}`}
                    >
                      {isFull ? t('slots_full') : amIJoined ? t('you_are_in') : <>{t('join_match')} <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /></>}
                    </button>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-20 bg-white/5 rounded-[50px] border border-dashed border-white/10"><Zap size={40} className="mx-auto mb-4 text-gray-700" /><p className="font-black text-gray-500 uppercase italic">{t('no_matches')}</p></div>
          )}
        </div>
      </main>

      {/* مودال إنشاء الحجز */}
      {showHostForm && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-[#05081d]/95 backdrop-blur-xl" onClick={() => setShowHostForm(false)} />
          <div className="relative bg-[#0a0f3c] border-t border-cyan-500/20 rounded-t-[50px] p-8 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-[1000] italic uppercase text-white tracking-tighter">{t('host_match')}</h2>
              <button onClick={() => setShowHostForm(false)} className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              
              {/* 1. اختيار الملعب */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_court')}</p>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {courts.map(c => (
                    <button key={c.id} onClick={() => setSelectedCourt(c)} className={`flex-none w-32 h-32 rounded-3xl overflow-hidden border-2 transition-all relative ${selectedCourt?.id === c.id ? 'border-cyan-500 scale-105 shadow-lg shadow-cyan-500/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                      <img src={c.image_url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 flex flex-col justify-end p-3">
                        <span className="text-xs font-black text-left text-white leading-tight">{c.name}</span>
                        {/* عرض السعر الأساسي للملعب */}
                        <span className="text-[9px] font-bold text-cyan-400 mt-1">{c.price_per_hour || 150} {t('sar' as any)}/h</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* 🔥 تفاصيل الملعب المختار */}
                {selectedCourt && (selectedCourt.description || (selectedCourt.features && selectedCourt.features.length > 0)) && (
                  <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 mt-2 animate-in fade-in">
                    {selectedCourt.description && (
                      <p className="text-xs text-gray-300 mb-3 flex items-start gap-2">
                        <Info size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        {selectedCourt.description}
                      </p>
                    )}
                    {selectedCourt.features && selectedCourt.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCourt.features.map((feature: string, idx: number) => (
                          <span key={idx} className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded-md text-[9px] font-bold uppercase flex items-center gap-1">
                            <Sparkles size={10} /> {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. اختيار المدة 🔥 */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{t('duration' as any)}</p>
                <div className="flex gap-3">
                  {DURATIONS.map(dur => (
                    <button 
                      key={dur.value} 
                      onClick={() => setSelectedDuration(dur.value)} 
                      className={`flex-1 py-4 rounded-[22px] font-black text-xs transition-all border flex flex-col items-center gap-1 ${selectedDuration === dur.value ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                    >
                      <Timer size={16} className={selectedDuration === dur.value ? 'text-white' : 'text-gray-600'} />
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. اختيار عدد اللاعبين الناقصين */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{t('how_many_missing')}</p>
                <div className="flex gap-3">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setNeededPlayers(num)} className={`flex-1 py-4 rounded-[22px] font-black border transition-all ${neededPlayers === num ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg shadow-cyan-500/30' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>{num} {t('players_count_label')}</button>
                  ))}
                </div>
              </div>

              {/* 4. اختيار التاريخ */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_date')}</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {DATES.map(date => (
                    <button key={date.value} onClick={() => setSelectedDate(date.value)} className={`flex-none w-[70px] py-4 rounded-[20px] flex flex-col items-center gap-1 transition-all border ${selectedDate === date.value ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'}`}><span className="text-[10px] font-bold">{date.dayName}</span><span className="text-lg font-black">{date.dateNum}</span></button>
                  ))}
                </div>
              </div>

              {/* 5. اختيار الوقت */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('select_time')}</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {TIMES.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={`flex-none min-w-[80px] py-4 rounded-[18px] text-[10px] font-black transition-all border ${selectedTime === time ? 'bg-cyan-500 text-[#0a0f3c] border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'}`}>{time}</button>
                  ))}
                </div>
              </div>

              {/* 🔥 التسعيرة النهائية وزر التأكيد */}
              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('price' as any)}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-[1000] italic text-cyan-400">{totalPrice}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase">{t('sar' as any)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleCreate} className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-[30px] font-[1000] italic uppercase shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 transition-all flex justify-center items-center gap-2">
                  <Sparkles size={18} />
                  {t('create_match')}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}