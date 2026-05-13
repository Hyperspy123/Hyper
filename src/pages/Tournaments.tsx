import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '../LLL'; 
import { toast } from 'sonner';
import { Trophy, Calendar, ChevronLeft, Clock, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext'; 

export default function Tournaments() {
  const { t, dir, lang } = useLanguage(); 
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [joinedEvents, setJoinedEvents] = useState<string[]>(() => {
    const saved = localStorage.getItem('hype_joined_events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('tournaments-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tournaments' },
        (payload) => {
          setEvents((prev) =>
            prev.map((ev) => (ev.id === payload.new.id ? { ...ev, ...payload.new } : ev))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('hype_joined_events', JSON.stringify(joinedEvents));
  }, [joinedEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast.error(lang === 'ar' ? "فشل في جلب الفعاليات" : "Failed to fetch tournaments");
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleJoin = async (tournamentId: string, current: number, max: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error(lang === 'ar' ? "سجل دخولك أولاً يا وحش! 🎾" : "Login first! 🎾");
      return;
    }

    if (joinedEvents.includes(tournamentId) || current >= max) return;

    try {
      const { error: participantError } = await supabase
        .from('tournament_participants')
        .insert([
          { tournament_id: tournamentId, participant_id: user.id }
        ]);

      if (participantError) {
        if (participantError.code === '23505') {
          setJoinedEvents(prev => [...prev, tournamentId]);
          return toast.error(lang === 'ar' ? "أنت مسجل بالفعل في هذه البطولة!" : "You are already registered!");
        }
        throw participantError;
      }

      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ current_participants: current + 1 })
        .eq('id', tournamentId);

      if (updateError) throw updateError;

      setJoinedEvents(prev => [...prev, tournamentId]);

      // 🔥 إرسال إشعار انضمام للبطولة للمستخدم
      await supabase.from('notifications').insert([{
        user_id: user.id,
        translation_key: 'notif_tournament_joined'
      }]);

      toast.success(lang === 'ar' ? "كفو! تم تسجيلك وحفظ بياناتك في السيرفر 🔥" : "Awesome! You are successfully registered 🔥");

    } catch (error) {
      console.error(error);
      toast.error(lang === 'ar' ? "حدث خطأ أثناء التسجيل" : "Registration failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05081d] flex items-center justify-center text-cyan-400 font-black italic uppercase animate-pulse">
        <Loader2 className="animate-spin mr-2" /> HYPE LOADING...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative" dir={dir}>
      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24">
        
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
            <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <div className={dir === 'ltr' ? 'text-right' : 'text-left'}>
            <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none text-white">
              {t('tournaments' as any) || 'Tournaments'}
            </h1>
            <p className="text-[10px] font-black text-cyan-400 mt-1 uppercase tracking-widest opacity-60 italic">HYPE EVENTS HUB</p>
          </div>
        </div>

        <div className="grid gap-10">
          {events.map((event) => {
            const maxParticipants = event.max_participants || 32; 
            const currentParticipants = event.current_participants || 0;
            
            const isFull = currentParticipants >= maxParticipants;
            const progress = (currentParticipants / maxParticipants) * 100;
            const isUserRegistered = joinedEvents.includes(event.id);

            // 🔥 اختيار الاسم والوصف واسم الملعب ديناميكياً بناءً على لغة التطبيق
            const displayTitle = lang === 'ar' ? (event.title_ar || event.name) : (event.title_en || event.title_ar || event.name);
            const displayDesc = lang === 'ar' ? (event.description_ar || event.description) : (event.description_en || event.description_ar || event.description);
            const displayCourtName = lang === 'ar' ? event.court_name : (event.court_name_en || event.court_name);
            const displayDate = event.start_date || event.date;
            const displayTime = event.start_time || event.time;

            return (
              <div key={event.id} className="group relative bg-[#0a0f3c]/80 backdrop-blur-2xl border border-white/10 rounded-[45px] overflow-hidden shadow-2xl transition-all hover:border-cyan-500/30">
                <div className="relative h-64 overflow-hidden">
                  <img src={event.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f3c] via-transparent" />
                  
                  {displayCourtName && (
                    <div className={`absolute top-6 ${dir === 'ltr' ? 'right-6' : 'left-6'} bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg`}>
                      {displayCourtName}
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-6">
                  <div className={`flex justify-between items-start ${dir === 'ltr' ? 'flex-row-reverse text-left' : 'text-right'}`}>
                    <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500 shadow-lg">
                      <Trophy size={20} />
                    </div>
                    <h3 className="text-2xl font-[1000] italic uppercase text-white tracking-tighter leading-none">{displayTitle}</h3>
                  </div>

                  <p className={`text-sm text-gray-400 font-bold leading-relaxed opacity-80 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
                    {displayDesc}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-500 uppercase italic">
                        {lang === 'ar' ? 'اكتمال العدد' : 'COMPLETION'}
                      </span>
                      <span className={`text-sm font-black italic ${isFull ? 'text-red-500' : 'text-cyan-400'}`}>
                        {currentParticipants} / {maxParticipants} {lang === 'ar' ? 'بطل' : 'Player'}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className={`flex gap-4 justify-end text-[10px] font-black text-gray-400 border-t border-white/5 pt-5 ${dir === 'ltr' ? 'flex-row-reverse' : ''}`}>
                    {displayTime && (
                      <div className="flex items-center gap-1.5">
                        {displayTime} <Clock size={14} className="text-cyan-500" />
                      </div>
                    )}
                    {displayDate && (
                      <div className="flex items-center gap-1.5">
                        {displayDate} <Calendar size={14} className="text-cyan-500" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleJoin(event.id, currentParticipants, maxParticipants)}
                    disabled={isUserRegistered || (isFull && !isUserRegistered)}
                    className={`w-full py-5 rounded-[28px] font-[1000] text-sm uppercase italic transition-all flex items-center justify-center gap-2 shadow-xl ${
                      isUserRegistered 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default' 
                      : isFull 
                      ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed opacity-50' 
                      : 'bg-cyan-500 text-[#0a0f3c] hover:bg-cyan-400 active:scale-95'
                    }`}
                  >
                    {isUserRegistered ? (
                      <>
                        {lang === 'ar' ? 'أنت مسجل في هذه الفعالية' : 'Registered successfully'} <CheckCircle2 size={18} />
                      </>
                    ) : isFull ? (
                      lang === 'ar' ? 'نعتذر، اكتملت المقاعد 🛑' : 'Sorry, Seats Full 🛑'
                    ) : (
                      <>
                        {lang == 'ar' ? 'انضم الآن' : 'JOIN NOW'} <Zap size={18} fill="currentColor" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}