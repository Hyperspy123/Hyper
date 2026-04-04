import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '../LLL'; 
import { toast } from 'sonner';
import { Trophy, Calendar, Users, Medal, ChevronLeft, Clock, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tournaments() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // قراءة الفعاليات المسجلة من ذاكرة الجهاز (localStorage) لضمان بقاء حالة الزر حتى بعد التحديث
  const [joinedEvents, setJoinedEvents] = useState<string[]>(() => {
    const saved = localStorage.getItem('hype_joined_events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();

    // نظام التحديث اللحظي (Real-time) للعداد
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

  // حفظ التغييرات في ذاكرة الجهاز
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
      toast.error("فشل في جلب الفعاليات");
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleJoin = async (tournamentId: string, current: number, max: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("سجل دخولك أولاً يا وحش! 🎾");
      return;
    }

    // التأكد إنه مو مسجل أصلاً والعدد مو كامل
    if (joinedEvents.includes(tournamentId) || current >= max) return;

    try {
      // 1. تسجيل بيانات المستخدم في جدول المشاركين (عشان تظهر لك في Supabase)
      const { error: participantError } = await supabase
        .from('tournament_participants')
        .insert([
          { tournament_id: tournamentId, participant_id: user.id }
        ]);

      if (participantError) {
        // إذا كان الشخص مسجل مسبقاً في قاعدة البيانات
        if (participantError.code === '23505') {
          setJoinedEvents(prev => [...prev, tournamentId]);
          return toast.error("أنت مسجل بالفعل في هذه البطولة!");
        }
        throw participantError;
      }

      // 2. تحديث عداد الفعالية في جدول البطولات
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ current_participants: current + 1 })
        .eq('id', tournamentId);

      if (updateError) throw updateError;

      // 3. تحديث الحالة المحلية
      setJoinedEvents(prev => [...prev, tournamentId]);
      toast.success("كفو! تم تسجيلك وحفظ بياناتك في السيرفر 🔥");

    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء التسجيل");
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
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-right">
            <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none text-white">الفعاليات</h1>
            <p className="text-[10px] font-black text-cyan-400 mt-1 uppercase tracking-widest opacity-60 italic">HYPE EVENTS HUB</p>
          </div>
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>

        <div className="grid gap-10">
          {events.map((event) => {
            const isFull = event.current_participants >= event.max_participants;
            const progress = (event.current_participants / event.max_participants) * 100;
            const isUserRegistered = joinedEvents.includes(event.id);

            return (
              <div key={event.id} className="group relative bg-[#0a0f3c]/80 backdrop-blur-2xl border border-white/10 rounded-[45px] overflow-hidden shadow-2xl transition-all hover:border-cyan-500/30">
                <div className="relative h-64 overflow-hidden">
                  <img src={event.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f3c] via-transparent" />
                  <div className="absolute top-6 left-6 bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg">
                    {event.court_name}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start text-right">
                    <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500 shadow-lg">
                      <Trophy size={20} />
                    </div>
                    <h3 className="text-2xl font-[1000] italic uppercase text-white tracking-tighter leading-none">{event.name}</h3>
                  </div>

                  <p className="text-sm text-gray-400 font-bold leading-relaxed opacity-80 text-right">{event.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-500 uppercase italic">اكتمال العدد</span>
                      <span className={`text-sm font-black italic ${isFull ? 'text-red-500' : 'text-cyan-400'}`}>
                        {event.current_participants} / {event.max_participants} بطل
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end text-[10px] font-black text-gray-400 border-t border-white/5 pt-5">
                    <div className="flex items-center gap-1.5">{event.start_time} <Clock size={14} className="text-cyan-500" /></div>
                    <div className="flex items-center gap-1.5">{event.start_date} <Calendar size={14} className="text-cyan-500" /></div>
                  </div>

                  <button
                    onClick={() => handleJoin(event.id, event.current_participants, event.max_participants)}
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
                      <>أنت مسجل في هذه الفعالية <CheckCircle2 size={18} /></>
                    ) : isFull ? (
                      'نعتذر، اكتملت المقاعد 🛑'
                    ) : (
                      <>انضم الآن <Zap size={18} fill="currentColor" /></>
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