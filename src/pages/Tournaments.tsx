import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Trophy, Calendar, Users, MapPin, Loader2, Zap, Medal, ChevronLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// بيانات الملاعب الثلاثة الحالية كفعاليات (Mock Data)
const MOCK_EVENTS = [
  {
    id: 1,
    name: 'بطولة الشتاء الكبرى',
    description: 'أقوى بطولة بادل في الرياض بنظام خروج المغلوب. جوائز مالية ضخمة للمراكز الأولى.',
    court_name: 'Padel Pro Riyadh',
    start_date: '2024-05-20',
    time: '08:00 PM',
    max_participants: 32,
    current_participants: 28,
    prize: '10,000 SAR + كبوس ذهبي',
    image_url: 'https://images.unsplash.com/photo-1626225443592-d6776899450c?q=80&w=800',
    status: 'upcoming'
  },
  {
    id: 2,
    name: 'تحدي الملوك (KING)',
    description: 'تحدي خاص للفئات المتقدمة (Legend & Hyper). اللعب بملعبين متجاورين لسرعة الأداء.',
    court_name: 'HYPE Court',
    start_date: '2024-05-22',
    time: '09:30 PM',
    max_participants: 16,
    current_participants: 15,
    prize: 'ساعات لعب مجانية لمدة شهر',
    image_url: 'https://images.unsplash.com/photo-1592910129881-892a72f92469?q=80&w=800',
    status: 'upcoming'
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
    status: 'upcoming'
  }
];

export default function Tournaments() {
  const [loading, setLoading] = useState(true);
  const { t, dir } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative" dir="rtl">
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="text-right">
            <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
              الفعاليات <span className="text-cyan-400 text-2xl block mt-1">EVENTS</span>
            </h1>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : (
          <div className="grid gap-10">
            {MOCK_EVENTS.map(event => {
              const spotsLeft = event.max_participants - event.current_participants;
              const isFull = spotsLeft === 0;

              return (
                <div
                  key={event.id}
                  className="group relative bg-[#0a0f3c]/60 backdrop-blur-2xl border border-white/10 rounded-[45px] overflow-hidden transition-all duration-500 shadow-2xl hover:border-cyan-500/30"
                >
                  {/* Image Section - تصميم طولي مرتفع */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f3c] via-transparent to-transparent" />
                    
                    {/* Badge الملعب */}
                    <div className="absolute top-6 left-6">
                      <div className="bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic shadow-lg border border-cyan-400/50">
                        {event.court_name}
                      </div>
                    </div>

                    {/* عداد المقاعد المتبقية */}
                    <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                      <Users size={14} className="text-cyan-400" />
                      <span className="text-[10px] font-black text-white italic">
                        {isFull ? 'اكتمل العدد' : `متبقي ${spotsLeft} لاعبين`}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 space-y-5">
                    <div className="flex justify-between items-start">
                       <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                        <Trophy size={20} />
                      </div>
                      <h3 className="text-2xl font-[1000] italic tracking-tighter text-white uppercase leading-none">
                        {event.name}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-400 font-bold leading-relaxed opacity-80 text-right">
                      {event.description}
                    </p>

                    {/* تفاصيل الوقت والمكان */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5">
                      <div className="flex items-center gap-2 justify-end text-gray-400">
                        <span className="text-[10px] font-black">{event.start_date}</span>
                        <Calendar size={14} className="text-cyan-500" />
                      </div>
                      <div className="flex items-center gap-2 justify-end text-gray-400">
                        <span className="text-[10px] font-black">{event.time}</span>
                        <Clock size={14} className="text-cyan-500" />
                      </div>
                    </div>

                    {/* Prize Highlight */}
                    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-yellow-400/5 border border-yellow-400/10">
                      <Medal size={18} className="text-yellow-400" />
                      <span className="text-yellow-400 text-[11px] font-[1000] uppercase italic tracking-tighter truncate">
                        {event.prize}
                      </span>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => toast.success(`كفو! تم تسجيل طلب انضمامك لـ ${event.name} 🔥`)}
                      disabled={isFull}
                      className={`w-full py-5 rounded-[28px] font-[1000] text-sm uppercase italic transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl ${
                        isFull
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                        : 'bg-cyan-500 text-[#0a0f3c] hover:bg-cyan-400 shadow-cyan-500/30'
                      }`}
                    >
                      {isFull ? 'نراكم في الفعالية القادمة 🛑' : (
                        <> انضم معنا الآن <Zap size={18} fill="currentColor" /> </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}