import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Trophy, Calendar, Users, Medal, ChevronLeft, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// بيانات الملاعب (أضفت حالة 'isJoined' لكل فعالية للتحكم بالزر)
const INITIAL_EVENTS = [
  {
    id: 1,
    name: 'بطولة الشتاء الكبرى',
    description: 'أقوى بطولة بادل في الرياض بنظام خروج المغلوب. جوائز مالية ضخمة للمراكز الأولى.',
    court_name: 'Padel Pro Riyadh',
    start_date: '2024-05-20',
    time: '08:00 PM',
    max_participants: 32,
    current_participants: 31, // خليته 31 عشان تجرب كيف يمتلئ
    prize: '10,000 SAR + كبوس ذهبي',
    image_url: 'https://images.unsplash.com/photo-1626225443592-d6776899450c?q=80&w=800',
    isJoined: false
  },
  {
    id: 2,
    name: 'تحدي الملوك (KING)',
    description: 'تحدي خاص للفئات المتقدمة. اللعب بملعبين متجاورين لضمان سرعة الأداء.',
    court_name: 'HYPE Court',
    start_date: '2024-05-22',
    time: '09:30 PM',
    max_participants: 16,
    current_participants: 16, // هذا ممتلئ جاهز عشان أخوك يشيك عليه
    prize: 'ساعات لعب مجانية لمدة شهر',
    image_url: 'https://images.unsplash.com/photo-1592910129881-892a72f92469?q=80&w=800',
    isJoined: false
  },
  {
    id: 3,
    name: 'فعالية المبتدئين 🥚',
    description: 'فرصة رائعة للمستجدين لدخول عالم المنافسات. نركز على المتعة وتعلم القوانين.',
    court_name: 'Arena Padel',
    start_date: '2024-05-25',
    time: '04:00 PM',
    max_participants: 20,
    current_participants: 8,
    prize: 'مضرب بادل احترافي للفائز',
    image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800',
    isJoined: false
  }
];

export default function Tournaments() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const { dir } = useI18n();
  const navigate = useNavigate();

  const handleJoin = (id: number) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === id && !event.isJoined && event.current_participants < event.max_participants) {
        toast.success(`تم تسجيلك بنجاح في ${event.name}! 🔥`);
        return { 
          ...event, 
          isJoined: true, 
          current_participants: event.current_participants + 1 
        };
      }
      return event;
    }));
  };

  return (
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase">الفعاليات</h1>
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>

        <div className="grid gap-10">
          {events.map(event => {
            const isFull = event.current_participants >= event.max_participants;
            const progress = (event.current_participants / event.max_participants) * 100;

            return (
              <div key={event.id} className="bg-[#0a0f3c]/80 backdrop-blur-2xl border border-white/10 rounded-[45px] overflow-hidden shadow-2xl">
                
                {/* Image Section */}
                <div className="relative h-60">
                  <img src={event.image_url} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f3c] via-transparent" />
                  <div className="absolute top-6 left-6 bg-cyan-500 text-[#0a0f3c] px-4 py-1 rounded-full text-[10px] font-black italic">
                    {event.court_name}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  <h3 className="text-2xl font-[1000] italic uppercase">{event.name}</h3>
                  <p className="text-xs text-gray-400 font-bold leading-relaxed">{event.description}</p>

                  {/* العداد (Progress Counter) */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-500 uppercase italic">اكتمال العدد</span>
                      <span className={`text-sm font-black italic ${isFull ? 'text-red-500' : 'text-cyan-400'}`}>
                        {event.current_participants} / {event.max_participants} لاعب
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* تفاصيل سريعة */}
                  <div className="flex gap-4 justify-end text-[10px] font-black text-gray-400 border-t border-white/5 pt-4">
                    <span className="flex items-center gap-1">{event.time} <Clock size={12}/></span>
                    <span className="flex items-center gap-1">{event.start_date} <Calendar size={12}/></span>
                  </div>

                  {/* زر الانضمام الذكي */}
                  <button
                    onClick={() => handleJoin(event.id)}
                    disabled={isFull && !event.isJoined}
                    className={`w-full py-5 rounded-[28px] font-[1000] text-sm uppercase italic transition-all flex items-center justify-center gap-2 shadow-xl ${
                      event.isJoined 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : isFull 
                      ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed' 
                      : 'bg-cyan-500 text-[#0a0f3c] active:scale-95'
                    }`}
                  >
                    {event.isJoined ? (
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