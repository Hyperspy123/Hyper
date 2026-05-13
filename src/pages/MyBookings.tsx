import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Calendar, Clock, ChevronLeft, Loader2, Trash2, Swords, QrCode, Ticket, CheckCircle2, XCircle, MapPin, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext'; 

export default function MyBookings() {
  const { t, dir, lang } = useLanguage(); 
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'previous' | 'cancelled'>('current');
  const [currentUser, setCurrentUser] = useState<any>(null); // 🔥 حفظ بيانات المستخدم للإشعارات
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUser(user); // 🔥 حفظ المستخدم

      // 1. جلب الحجوزات العادية
      const { data: normalBookings, error: normalError } = await supabase
        .from('bookings')
        .select(`*, courts (name, image_url, location)`)
        .eq('user_id', user.id);

      if (normalError) throw normalError;

      // 2. جلب التحديات المقبولة
      const { data: challengeBookings, error: challengeError } = await supabase
        .from('challenges')
        .select(`*, challenger:challenger_id(id, first_name), challenged:challenged_id(id, first_name)`)
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`);

      if (challengeError) throw challengeError;

      // 3. جلب بيانات الملاعب عشان نعرضها للتحديات
      const { data: courtsData } = await supabase.from('courts').select('name, image_url, location');

      // 4. توحيد ودمج البيانات في مصفوفة واحدة
      const mergedBookings: any[] = [];

      normalBookings?.forEach(b => {
        mergedBookings.push({
          id: b.id,
          type: 'normal',
          court_name: b.courts?.name || (lang === 'ar' ? 'ملعب هايب الأساسي' : 'Hype Main Court'),
          location: b.courts?.location || (lang === 'ar' ? 'الرياض، مجمع البادل' : 'Riyadh, Padel Complex'),
          image_url: b.courts?.image_url,
          start_time: b.start_time,
          status: b.status,
        });
      });

      challengeBookings?.forEach(c => {
        const court = courtsData?.find(crt => crt.name === c.court_name);
        const isChallenger = c.challenger_id === user.id;
        const opponentName = isChallenger ? c.challenged?.first_name : c.challenger?.first_name;
        const opponentId = isChallenger ? c.challenged?.id : c.challenger?.id; // 🔥 جلب ID الخصم عشان نرسل له إشعار لو انلغى التحدي

        const mappedStatus = c.status === 'accepted' ? 'confirmed' : (c.status === 'rejected' || c.status === 'cancelled') ? 'cancelled' : c.status;

        mergedBookings.push({
          id: c.id,
          type: 'challenge',
          court_name: c.court_name || (lang === 'ar' ? 'ملعب هايب الأساسي' : 'Hype Main Court'),
          location: court?.location || (lang === 'ar' ? 'الرياض، مجمع البادل' : 'Riyadh, Padel Complex'),
          image_url: court?.image_url,
          start_time: c.match_time,
          status: mappedStatus,
          opponent_name: opponentName,
          opponent_id: opponentId // 🔥 حفظ ID الخصم
        });
      });

      // 5. ترتيب الكل من الأقرب للأبعد زمنياً
      mergedBookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      setBookings(mergedBookings);
    } catch (error: any) {
      console.error(error);
      toast.error(lang === 'ar' ? "فشل في جلب الحجوزات" : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: any) => {
    const confirmMsg = lang === 'ar' ? "هل أنت متأكد من إلغاء هذا الموعد؟" : "Are you sure you want to cancel this booking?";
    const confirmCancel = window.confirm(confirmMsg);
    if (!confirmCancel || !currentUser) return;

    try {
      if (booking.type === 'challenge') {
        const { error } = await supabase.from('challenges').update({ status: 'cancelled' }).eq('id', booking.id);
        if (error) throw error;
        
        // 🔥 إرسال إشعار لك وإشعار لخصمك
        const notificationsToInsert = [
          { user_id: currentUser.id, translation_key: 'notif_booking_cancelled' }
        ];
        if (booking.opponent_id) {
          notificationsToInsert.push({ user_id: booking.opponent_id, translation_key: 'notif_booking_cancelled' });
        }
        await supabase.from('notifications').insert(notificationsToInsert);

        toast.success(lang === 'ar' ? "تم إلغاء التحدي وإشعار الخصم 🛑" : "Challenge cancelled and opponent notified 🛑");
      } else {
        const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
        if (error) throw error;

        // 🔥 إرسال إشعار لك بعد إلغاء حجزك
        await supabase.from('notifications').insert([{
          user_id: currentUser.id,
          translation_key: 'notif_booking_cancelled'
        }]);

        toast.success(lang === 'ar' ? "تم إلغاء الحجز بنجاح 🛑" : "Booking successfully cancelled 🛑");
      }
      
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
    } catch (error: any) {
      console.error("تفاصيل الخطأ الدقيقة من قاعدة البيانات:", error);
      toast.error(lang === 'ar' ? `الخطأ: ${error.message}` : `Error: ${error.message}`);
    }
  };

  // 🔥 دالة توليد رمز الحجز
  const generateBookingCode = (id: string, type: string) => {
    if (!id) return 'HYP-00000';
    const prefix = type === 'challenge' ? 'CHL' : 'HYP';
    return `${prefix}-${id.substring(0, 5).toUpperCase()}`;
  };

  const filteredBookings = bookings.filter(b => {
    const now = new Date();
    const bookingDate = new Date(b.start_time);
    
    if (activeTab === 'current') return bookingDate >= now && b.status === 'confirmed';
    if (activeTab === 'previous') return bookingDate < now && b.status === 'confirmed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return false;
  });

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative" dir={dir}>
      <Header />
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        
        {/* العنوان وزر العودة */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
            <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <div className={dir === 'ltr' ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-[1000] italic uppercase leading-none tracking-tighter">
              {t('my_bookings' as any)}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {lang === 'ar' ? 'تذاكر الملاعب والتحديات' : 'Court Tickets & Challenges'}
            </p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex bg-[#0a0f3c]/60 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
          {(['current', 'previous', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 flex justify-center items-center gap-1 ${
                activeTab === tab ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'current' ? (lang === 'ar' ? 'القادمة' : 'Upcoming') : 
               tab === 'previous' ? (lang === 'ar' ? 'السابقة' : 'Previous') : 
               (lang === 'ar' ? 'الملغاة' : 'Cancelled')}
            </button>
          ))}
        </div>

        {/* قائمة الحجوزات */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
              <div key={booking.id} className={`bg-[#0a0f3c] border ${booking.type === 'challenge' ? 'border-purple-500/40' : 'border-white/10'} rounded-[30px] p-1 relative overflow-hidden group shadow-2xl transition-all`}>
                
                {/* تأثير الإضاءة الفخمة في الخلفية */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-40 ${booking.type === 'challenge' ? 'from-purple-500/20 to-pink-500/10' : 'from-cyan-500/10 to-purple-500/10'}`} />

                <div className="bg-[#05081d] rounded-[28px] p-5 relative z-10">
                  
                  {/* 🎟️ الهيدر: رمز الحجز والحالة */}
                  <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4 border-dashed">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${booking.type === 'challenge' ? 'bg-purple-500/10' : 'bg-white/5'}`}>
                        <QrCode size={16} className={booking.type === 'challenge' ? 'text-purple-400' : 'text-cyan-400'} />
                      </div>
                      <div className={dir === 'ltr' ? 'text-left' : 'text-right'}>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">
                          {lang === 'ar' ? 'رمز التذكرة' : 'TICKET ID'}
                        </p>
                        <span className="font-[1000] text-sm tracking-wider text-gray-200">
                          {generateBookingCode(booking.id, booking.type)}
                        </span>
                      </div>
                    </div>
                    
                    {/* شارة الحالة والنوع */}
                    <div className={`flex flex-col gap-1 ${dir === 'rtl' ? 'items-end' : 'items-start'}`}>
                      {booking.type === 'challenge' && (
                        <span className="text-[8px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                          <Swords size={10} /> {t('challenge' as any)}
                        </span>
                      )}
                      
                      {activeTab === 'current' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                            {lang === 'ar' ? 'مؤكد' : 'CONFIRMED'}
                          </span>
                        </div>
                      )}
                      {activeTab === 'cancelled' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                          <XCircle size={10} className="text-red-400" />
                          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">
                            {lang === 'ar' ? 'ملغى' : 'CANCELLED'}
                          </span>
                        </div>
                      )}
                      {activeTab === 'previous' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded-md">
                          <History size={10} className="text-gray-400" />
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            {lang === 'ar' ? 'مكتمل' : 'COMPLETED'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 📍 معلومات الملعب */}
                  <div className={`space-y-2 mb-6 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
                    <h3 className="text-xl font-[1000] italic uppercase text-white flex items-center gap-2">
                      {booking.court_name}
                    </h3>
                    {booking.type === 'challenge' ? (
                      <div className="flex items-center gap-2">
                         <Swords size={14} className="text-purple-400" />
                         <span className="text-xs font-bold text-gray-300">
                           {lang === 'ar' ? 'مباراة ضد ' : 'Match vs '}
                           <span className="text-purple-400 font-[1000]">{booking.opponent_name}</span>
                         </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={14} className="text-cyan-400" />
                        <span className="text-xs font-bold">{booking.location}</span>
                      </div>
                    )}
                  </div>

                  {/* ⏰ الوقت والتاريخ */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                      <Calendar size={18} className={booking.type === 'challenge' ? 'text-purple-400' : 'text-cyan-400'} />
                      <div className={dir === 'ltr' ? 'text-left' : 'text-right'}>
                        <p className="text-[8px] font-black text-gray-500 uppercase">{lang === 'ar' ? 'التاريخ' : 'DATE'}</p>
                        <p className="text-xs font-bold text-gray-200" dir="ltr">
                          {new Date(booking.start_time).toLocaleDateString(lang === 'ar' ? 'en-GB' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                      <Clock size={18} className="text-emerald-400" />
                      <div className={dir === 'ltr' ? 'text-left' : 'text-right'}>
                        <p className="text-[8px] font-black text-gray-500 uppercase">{lang === 'ar' ? 'الوقت' : 'TIME'}</p>
                        <p className="text-xs font-bold text-gray-200" dir="ltr">
                          {new Date(booking.start_time).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* زر الإلغاء (يظهر فقط في التبويب الحالي) */}
                  {activeTab === 'current' && (
                    <div className="pt-2 border-t border-white/5 border-dashed">
                      <button 
                        onClick={() => handleCancelBooking(booking)}
                        className="w-full mt-3 py-3.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-[1000] text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Trash2 size={15} /> 
                        {booking.type === 'challenge' 
                          ? (lang === 'ar' ? 'إلغاء التحدي' : 'CANCEL CHALLENGE') 
                          : (lang === 'ar' ? 'إلغاء التذكرة' : 'CANCEL TICKET')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center mt-20 opacity-50 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Ticket size={32} className="text-gray-500" />
                  </div>
                  <p className="font-bold text-gray-400">
                    {lang === 'ar' ? 'لا توجد تذاكر في هذا القسم' : 'No tickets in this section'}
                  </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}