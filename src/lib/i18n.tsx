import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'ar' | 'en';

interface Translations {
  [key: string]: string;
}

const ar: Translations = {
  // Header
  'login': 'دخول',
  'logout': 'خروج',
  'myAccount': 'حسابي',
  'contactUs': 'تواصل معنا',
  'language': 'English',
  'notifications': 'الإشعارات',

  // Bottom Nav
  'home': 'الرئيسية',
  'myBookings': 'حجوزاتي',
  'faz3a': 'الفزعة',
  'myRewards': 'مكافآتي',
  'myTournaments': 'بطولاتي',

  // Index
  'bestCourts': 'أفضل ملاعب البادل في المملكة',
  'bookYourCourt': 'احجز ملعبك',
  'withEase': 'بكل سهولة',
  'discoverBest': 'اكتشف أفضل ملاعب البادل واحجز وقتك المفضل بضغطة زر واحدة',
  'browseCourts': 'تصفح الملاعب',
  'availableCourts': 'الملاعب المتاحة',
  'sort': 'فرز',
  'all': 'الكل',
  'men': 'رجالي',
  'women': 'نسائي',
  'tournaments': 'بطولات',
  'indoor': 'داخلي',
  'outdoor': 'خارجي',
  'noCourts': 'لا توجد ملاعب',
  'tryFilter': 'جرب تغيير الفلتر للعثور على ملاعب',
  'bookNow': 'احجز الآن',
  'sarPerHour': 'ر.س / ساعة',
  'notAvailable': 'غير متاح حالياً',
  'allRights': '© 2026 HYPER. جميع الحقوق محفوظة',

  // BookCourt
  'backToCourts': 'العودة للملاعب',
  'courtNotFound': 'الملعب غير موجود',
  'backToHome': 'العودة للرئيسية',
  'selectDate': 'اختر التاريخ',
  'selectTime': 'اختر الوقت',
  'bookingDuration': 'مدة الحجز',
  'min60': '60 دقيقة',
  'min90': '90 دقيقة',
  'min120': '120 دقيقة',
  'bookingSummary': 'ملخص الحجز',
  'court': 'الملعب',
  'date': 'التاريخ',
  'time': 'الوقت',
  'duration': 'المدة',
  'total': 'الإجمالي',
  'confirmBooking': 'تأكيد الحجز',
  'booking': 'جاري الحجز...',
  'bookingSuccess': 'تم الحجز بنجاح! 🎉',
  'bookingFailed': 'فشل في إتمام الحجز، يرجى المحاولة مرة أخرى',
  'selectDateTime': 'يرجى اختيار التاريخ والوقت',
  'loginRequired': 'يرجى تسجيل الدخول أولاً',
  'today': 'اليوم',
  'tomorrow': 'غداً',
  'sar': 'ر.س',
  'perHour': '/ ساعة',
  'booked': 'محجوز',
  'joinWaitlist': 'انضم لقائمة الانتظار',
  'waitlistJoined': 'تم إضافتك لقائمة الانتظار! سيتم إشعارك عند إلغاء الحجز 🔔',
  'waitlistFailed': 'فشل في الانضمام لقائمة الانتظار',
  'alreadyOnWaitlist': 'أنت مسجل بالفعل في قائمة الانتظار لهذا الموعد',
  'waitlistLabel': 'قائمة انتظار',

  // MyBookings
  'myBookingsTitle': 'حجوزاتي',
  'manageBookings': 'إدارة جميع حجوزاتك',
  'newBooking': 'حجز جديد',
  'currentTab': 'الحالية',
  'pastTab': 'السابقة',
  'cancelledTab': 'الملغية',
  'waitlistTab': 'قائمة الانتظار',
  'noUpcomingBookings': 'لا توجد حجوزات حالية',
  'noUpcomingDesc': 'لم تقم بأي حجز بعد، تصفح الملاعب واحجز الآن',
  'noPastBookings': 'لا توجد حجوزات سابقة',
  'noPastDesc': 'لا توجد حجوزات مكتملة بعد',
  'noCancelledBookings': 'لا توجد حجوزات ملغية',
  'noCancelledDesc': 'لم تقم بإلغاء أي حجز',
  'noWaitlistBookings': 'لا توجد حجوزات في قائمة الانتظار',
  'noWaitlistDesc': 'لم تنضم لأي قائمة انتظار بعد',
  'browseCourtsBtn': 'تصفح الملاعب',
  'cancelBooking': 'إلغاء الحجز',
  'cancelWaitlist': 'إلغاء الانتظار',
  'bookingCancelled': 'تم إلغاء الحجز بنجاح',
  'cancelFailed': 'فشل في إلغاء الحجز',
  'waitlistCancelled': 'تم إلغاء الانتظار بنجاح',
  'statusConfirmed': 'مؤكد',
  'statusCompleted': 'مكتمل',
  'statusCancelled': 'ملغي',
  'statusWaiting': 'في الانتظار',
  'hour': 'ساعة',
  'hours': 'ساعات',
  'loginRequiredBookings': 'تسجيل الدخول مطلوب',
  'loginRequiredBookingsDesc': 'يرجى تسجيل الدخول لعرض حجوزاتك',

  // Rewards
  'rewardsTitle': 'مكافآتي',
  'rewardsSubtitle': 'اكتشف العروض والمكافآت الحصرية لكل ملعب',
  'rewardsBannerTitle': 'احصل على مكافآت مع كل حجز!',
  'rewardsBannerDesc': 'كل ملعب يقدم عروض ومكافآت خاصة',
  'availableOffers': 'عرض متاح',
  'highestDiscount': 'أعلى خصم',
  'participatingCourts': 'ملعب مشارك',
  'readyRewards': 'مكافأة جاهزة',
  'allCourts': 'جميع الملاعب',
  'noRewards': 'لا توجد مكافآت حالياً',
  'noRewardsDesc': 'ترقب العروض والمكافآت الجديدة قريباً',
  'offer': 'عرض',
  'offers': 'عروض',
  'claimReward': 'احصل على المكافأة',
  'rewardClaimed': 'تم تفعيل مكافأة',
  'progress': 'التقدم',
  'oneBookingLeft': 'باقي حجز واحد فقط!',
  'bookingsLeft': 'باقي {count} حجوزات',
  'loginForProgress': 'سجل دخولك لتتبع تقدمك في المكافآت',
  'progressAfterLogin': 'شريط التقدم يظهر بعد تسجيل الدخول',

  // Tournaments
  'tournamentsTitle': 'بطولاتي',
  'tournamentsSubtitle': 'اكتشف وسجل في أحدث البطولات',
  'allTab': 'الكل',
  'upcomingTab': 'قادمة',
  'ongoingTab': 'جارية',
  'completedTab': 'منتهية',
  'statusUpcoming': 'قادمة',
  'statusOngoing': 'جارية',
  'statusCompletedTournament': 'منتهية',
  'menCategory': 'رجالي',
  'womenCategory': 'نسائي',
  'noTournaments': 'لا توجد بطولات',
  'noTournamentsDesc': 'ترقب البطولات الجديدة قريباً',
  'registered': 'المسجلين',
  'seatsLeft': 'مقعد متبقي',
  'fullCapacity': 'مكتمل',
  'registerNow': 'سجل الآن',
  'tournamentEnded': 'انتهت البطولة',
  'tournamentFull': 'مكتمل العدد',
  'tournamentFullError': 'عذراً، البطولة مكتملة العدد',
  'tournamentEndedError': 'هذه البطولة انتهت',
  'registeredSuccess': 'تم التسجيل بنجاح!',
  'player': 'لاعب',

  // Faz3a
  'faz3aTitle': 'الفزعة',
  'findPlayers': 'ابحث عن لاعبين أو انضم لمباراة',
  'requestPlayers': 'طلب لاعبين',
  'needPlayers': 'ناقصك لاعبين؟ الفزعة هنا!',
  'needPlayersDesc': 'انشر طلبك وخل اللاعبين ينضمون لك، أو انضم لمباراة تناسب مستواك',
  'openRequests': 'طلب مفتوح',
  'availableSpots': 'مكان متاح',
  'courtsCount': 'ملعب',
  'easy': 'سهل',
  'medium': 'متوسط',
  'hard': 'صعب',
  'noRequests': 'لا توجد طلبات حالياً',
  'beFirst': 'كن أول من ينشر طلب لاعبين!',
  'playersJoined': 'لاعبين انضموا',
  'spotsLeft': 'باقي',
  'spot': 'مكان',
  'spots': 'أماكن',
  'joinNow': 'انضم الآن',
  'full': 'اكتمل العدد',
  'newRequest': 'طلب لاعبين جدد',
  'courtName': 'اسم الملعب',
  'courtNamePlaceholder': 'مثال: ملعب الرياض بادل',
  'matchDate': 'تاريخ المباراة',
  'matchTime': 'الوقت',
  'matchTimePlaceholder': 'مثال: 6:00 PM - 8:00 PM',
  'matchLevel': 'مستوى المباراة',
  'playersNeeded': 'عدد اللاعبين المطلوبين',
  'descriptionOptional': 'وصف (اختياري)',
  'descriptionPlaceholder': 'اكتب تفاصيل إضافية عن المباراة...',
  'publishRequest': 'نشر الطلب',
  'joinSuccess': 'تم الانضمام بنجاح! 🎉',
  'joinError': 'حدث خطأ أثناء الانضمام',
  'youAreOwner': 'أنت صاحب هذا الطلب',
  'publishSuccess': 'تم نشر طلبك بنجاح! 🎉',
  'publishError': 'حدث خطأ أثناء النشر',
  'fillRequired': 'يرجى ملء جميع الحقول المطلوبة',

  // Account
  'loginRequiredTitle': 'تسجيل الدخول مطلوب',
  'loginRequiredDesc': 'يرجى تسجيل الدخول لعرض حسابك',
  'welcomeBack': 'مرحباً بك',
  'hyperMember': 'عضو في HYPER',
  'emailNotSet': 'لم يتم تحديد البريد',
  'phoneNotSet': 'لم يتم تحديد الهاتف',
  'tournamentRanking': 'تصنيف البطولات',
  'tournamentsCount': 'بطولات',
  'ranking': 'التصنيف',
  'wins': 'انتصارات',

  // Contact
  'contactTitle': 'تواصل معنا',
  'hereToHelp': 'نحن هنا لمساعدتك',
  'email': 'البريد الإلكتروني',
  'phone': 'الهاتف',
  'workingHours': 'ساعات العمل',
  'workingHoursValue': '6:00 صباحاً - 12:00 مساءً',
  'sendMessage': 'أرسل لنا رسالة',
  'name': 'الاسم',
  'namePlaceholder': 'أدخل اسمك',
  'emailPlaceholder': 'example@email.com',
  'message': 'الرسالة',
  'messagePlaceholder': 'اكتب رسالتك هنا...',
  'send': 'إرسال',
  'fillAllFields': 'يرجى ملء جميع الحقول',
  'messageSent': 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً',

  // Notifications
  'notificationsTitle': 'الإشعارات',
  'notificationsSubtitle': 'تابع آخر التحديثات والتنبيهات',
  'noNotifications': 'لا توجد إشعارات',
  'noNotificationsDesc': 'ستظهر هنا الإشعارات الجديدة',
  'markAllRead': 'تحديد الكل كمقروء',
  'justNow': 'الآن',
  'minutesAgo': 'منذ {count} دقيقة',
  'hoursAgo': 'منذ {count} ساعة',
  'daysAgo': 'منذ {count} يوم',

  // Days
  'sunday': 'الأحد',
  'monday': 'الإثنين',
  'tuesday': 'الثلاثاء',
  'wednesday': 'الأربعاء',
  'thursday': 'الخميس',
  'friday': 'الجمعة',
  'saturday': 'السبت',
};

const en: Translations = {
  // Header
  'login': 'Login',
  'logout': 'Logout',
  'myAccount': 'My Account',
  'contactUs': 'Contact Us',
  'language': 'العربية',
  'notifications': 'Notifications',

  // Bottom Nav
  'home': 'Home',
  'myBookings': 'Bookings',
  'faz3a': 'Join Match',
  'myRewards': 'Rewards',
  'myTournaments': 'Tournaments',

  // Index
  'bestCourts': 'Best Padel Courts in the Kingdom',
  'bookYourCourt': 'Book Your Court',
  'withEase': 'With Ease',
  'discoverBest': 'Discover the best padel courts and book your favorite time with one click',
  'browseCourts': 'Browse Courts',
  'availableCourts': 'Available Courts',
  'sort': 'Sort',
  'all': 'All',
  'men': 'Men',
  'women': 'Women',
  'tournaments': 'Tournaments',
  'indoor': 'Indoor',
  'outdoor': 'Outdoor',
  'noCourts': 'No Courts Found',
  'tryFilter': 'Try changing the filter to find courts',
  'bookNow': 'Book Now',
  'sarPerHour': 'SAR / hour',
  'notAvailable': 'Not Available',
  'allRights': '© 2026 HYPER. All Rights Reserved',

  // BookCourt
  'backToCourts': 'Back to Courts',
  'courtNotFound': 'Court Not Found',
  'backToHome': 'Back to Home',
  'selectDate': 'Select Date',
  'selectTime': 'Select Time',
  'bookingDuration': 'Booking Duration',
  'min60': '60 Minutes',
  'min90': '90 Minutes',
  'min120': '120 Minutes',
  'bookingSummary': 'Booking Summary',
  'court': 'Court',
  'date': 'Date',
  'time': 'Time',
  'duration': 'Duration',
  'total': 'Total',
  'confirmBooking': 'Confirm Booking',
  'booking': 'Booking...',
  'bookingSuccess': 'Booking Successful! 🎉',
  'bookingFailed': 'Booking failed, please try again',
  'selectDateTime': 'Please select date and time',
  'loginRequired': 'Please login first',
  'today': 'Today',
  'tomorrow': 'Tomorrow',
  'sar': 'SAR',
  'perHour': '/ hour',
  'booked': 'Booked',
  'joinWaitlist': 'Join Waitlist',
  'waitlistJoined': 'Added to waitlist! You will be notified when the slot becomes available 🔔',
  'waitlistFailed': 'Failed to join waitlist',
  'alreadyOnWaitlist': 'You are already on the waitlist for this slot',
  'waitlistLabel': 'Waitlist',

  // MyBookings
  'myBookingsTitle': 'My Bookings',
  'manageBookings': 'Manage all your bookings',
  'newBooking': 'New Booking',
  'currentTab': 'Current',
  'pastTab': 'Past',
  'cancelledTab': 'Cancelled',
  'waitlistTab': 'Waitlist',
  'noUpcomingBookings': 'No Current Bookings',
  'noUpcomingDesc': 'You haven\'t made any bookings yet, browse courts and book now',
  'noPastBookings': 'No Past Bookings',
  'noPastDesc': 'No completed bookings yet',
  'noCancelledBookings': 'No Cancelled Bookings',
  'noCancelledDesc': 'You haven\'t cancelled any bookings',
  'noWaitlistBookings': 'No Waitlist Entries',
  'noWaitlistDesc': 'You haven\'t joined any waitlists yet',
  'browseCourtsBtn': 'Browse Courts',
  'cancelBooking': 'Cancel Booking',
  'cancelWaitlist': 'Cancel Waitlist',
  'bookingCancelled': 'Booking cancelled successfully',
  'cancelFailed': 'Failed to cancel booking',
  'waitlistCancelled': 'Waitlist entry cancelled successfully',
  'statusConfirmed': 'Confirmed',
  'statusCompleted': 'Completed',
  'statusCancelled': 'Cancelled',
  'statusWaiting': 'Waiting',
  'hour': 'hour',
  'hours': 'hours',
  'loginRequiredBookings': 'Login Required',
  'loginRequiredBookingsDesc': 'Please login to view your bookings',

  // Rewards
  'rewardsTitle': 'My Rewards',
  'rewardsSubtitle': 'Discover exclusive offers and rewards for each court',
  'rewardsBannerTitle': 'Earn rewards with every booking!',
  'rewardsBannerDesc': 'Each court offers special deals and rewards',
  'availableOffers': 'Available Offers',
  'highestDiscount': 'Highest Discount',
  'participatingCourts': 'Participating Courts',
  'readyRewards': 'Ready to Claim',
  'allCourts': 'All Courts',
  'noRewards': 'No Rewards Available',
  'noRewardsDesc': 'Stay tuned for new offers and rewards coming soon',
  'offer': 'offer',
  'offers': 'offers',
  'claimReward': 'Claim Reward',
  'rewardClaimed': 'Reward activated',
  'progress': 'Progress',
  'oneBookingLeft': 'Just 1 booking left!',
  'bookingsLeft': '{count} bookings left',
  'loginForProgress': 'Login to track your reward progress',
  'progressAfterLogin': 'Progress bar appears after login',

  // Tournaments
  'tournamentsTitle': 'Tournaments',
  'tournamentsSubtitle': 'Discover and register for the latest tournaments',
  'allTab': 'All',
  'upcomingTab': 'Upcoming',
  'ongoingTab': 'Ongoing',
  'completedTab': 'Completed',
  'statusUpcoming': 'Upcoming',
  'statusOngoing': 'Ongoing',
  'statusCompletedTournament': 'Completed',
  'menCategory': 'Men',
  'womenCategory': 'Women',
  'noTournaments': 'No Tournaments',
  'noTournamentsDesc': 'Stay tuned for new tournaments coming soon',
  'registered': 'Registered',
  'seatsLeft': 'seats left',
  'fullCapacity': 'Full',
  'registerNow': 'Register Now',
  'tournamentEnded': 'Tournament Ended',
  'tournamentFull': 'Full Capacity',
  'tournamentFullError': 'Sorry, this tournament is full',
  'tournamentEndedError': 'This tournament has ended',
  'registeredSuccess': 'Registered successfully!',
  'player': 'player',

  // Faz3a
  'faz3aTitle': 'Join Match',
  'findPlayers': 'Find players or join a match',
  'requestPlayers': 'Request Players',
  'needPlayers': 'Need players? We got you!',
  'needPlayersDesc': 'Post your request and let players join you, or join a match that fits your level',
  'openRequests': 'Open Requests',
  'availableSpots': 'Available Spots',
  'courtsCount': 'Courts',
  'easy': 'Easy',
  'medium': 'Medium',
  'hard': 'Hard',
  'noRequests': 'No Requests Available',
  'beFirst': 'Be the first to request players!',
  'playersJoined': 'players joined',
  'spotsLeft': 'Left',
  'spot': 'spot',
  'spots': 'spots',
  'joinNow': 'Join Now',
  'full': 'Full',
  'newRequest': 'Request New Players',
  'courtName': 'Court Name',
  'courtNamePlaceholder': 'e.g. Riyadh Padel Court',
  'matchDate': 'Match Date',
  'matchTime': 'Time',
  'matchTimePlaceholder': 'e.g. 6:00 PM - 8:00 PM',
  'matchLevel': 'Match Level',
  'playersNeeded': 'Players Needed',
  'descriptionOptional': 'Description (Optional)',
  'descriptionPlaceholder': 'Write additional details about the match...',
  'publishRequest': 'Publish Request',
  'joinSuccess': 'Joined Successfully! 🎉',
  'joinError': 'Error joining match',
  'youAreOwner': 'You are the owner of this request',
  'publishSuccess': 'Request published successfully! 🎉',
  'publishError': 'Error publishing request',
  'fillRequired': 'Please fill all required fields',

  // Account
  'loginRequiredTitle': 'Login Required',
  'loginRequiredDesc': 'Please login to view your account',
  'welcomeBack': 'Welcome Back',
  'hyperMember': 'HYPER Member',
  'emailNotSet': 'Email not set',
  'phoneNotSet': 'Phone not set',
  'tournamentRanking': 'Tournament Ranking',
  'tournamentsCount': 'Tournaments',
  'ranking': 'Ranking',
  'wins': 'Wins',

  // Contact
  'contactTitle': 'Contact Us',
  'hereToHelp': 'We are here to help',
  'email': 'Email',
  'phone': 'Phone',
  'workingHours': 'Working Hours',
  'workingHoursValue': '6:00 AM - 12:00 AM',
  'sendMessage': 'Send us a message',
  'name': 'Name',
  'namePlaceholder': 'Enter your name',
  'emailPlaceholder': 'example@email.com',
  'message': 'Message',
  'messagePlaceholder': 'Write your message here...',
  'send': 'Send',
  'fillAllFields': 'Please fill all fields',
  'messageSent': 'Message sent successfully! We will contact you soon',

  // Notifications
  'notificationsTitle': 'Notifications',
  'notificationsSubtitle': 'Stay updated with the latest alerts',
  'noNotifications': 'No Notifications',
  'noNotificationsDesc': 'New notifications will appear here',
  'markAllRead': 'Mark all as read',
  'justNow': 'Just now',
  'minutesAgo': '{count} min ago',
  'hoursAgo': '{count} hours ago',
  'daysAgo': '{count} days ago',

  // Days
  'sunday': 'Sun',
  'monday': 'Mon',
  'tuesday': 'Tue',
  'wednesday': 'Wed',
  'thursday': 'Thu',
  'friday': 'Fri',
  'saturday': 'Sat',
};

const translations: Record<Lang, Translations> = { ar, en };

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType>({
  lang: 'ar',
  setLang: () => {},
  t: (key: string) => key,
  dir: 'rtl',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('hyper-lang');
    return (saved === 'en' ? 'en' : 'ar') as Lang;
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('hyper-lang', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[lang][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Helper: convert 24h time to AM/PM
export function toAmPm(time24: string): string {
  const [hStr] = time24.split(':');
  const h = parseInt(hStr);
  if (h === 0) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}