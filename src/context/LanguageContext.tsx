import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface Translations {
  app_name: string; profile: string; payment: string; notifications: string;
  language: string; logout: string; change_lang: string;
  welcome: string; book_now: string; featured_courts: string; view_all: string;
  rank: string; matches: string; level: string; save_changes: string;
  phone: string; email: string; gender: string; birth_date: string;
  remaining_to_rank: string; current_progress: string; max_level: string;
  community: string; players: string; lobbies: string; challenge: string;
  open_matches: string; join_match: string; spots_left: string; hosted_by: string; match_details: string;
  my_matches: string; no_matches: string;
  host_match: string; select_court: string; select_date: string; select_time: string; create_match: string; cancel: string;
  my_bookings: string; rewards: string; tournaments: string; upcoming: string; previous: string; cancelled: string;
  points_balance: string; redeem: string; active_events: string;
  
  // 🔥 كلمات الشريط السفلي (Bottom Nav)
  home: string;
  courts: string;
  support: string;

  // 🔥 الكلمات الخاصة بالمجتمع
  how_many_missing: string;
  players_count_label: string;
  login_first: string;
  joining: string;
  already_joined: string;
  slots_full: string;
  match_full: string;
  slot_taken: string;
  joined_players_list: string;
  host_info: string;
  you_are_in: string;

  // 🔥 كلمات الإشعارات الجديدة
  notification_title: string;
  notif_booking_confirmed: string;
  notif_join_success: string;
  notif_match_cancelled: string;
  notif_slot_taken: string;
  notif_new_player_joined: string;
  notif_login_required: string;
  notif_match_now_full: string; // 👈 الإشعار الجديد

  // 🔥 كلمات تفاصيل الحجز والمدة
  duration: string;
  price: string;
  sar: string;
  mins_60: string;
  mins_90: string;
  mins_120: string;
  court_features: string;
}

const dictionary: Record<Language, Translations> = {
  ar: {
    app_name: 'هايب', profile: 'الملف الشخصي', payment: 'الدفع', notifications: 'الإشعارات', language: 'اللغة', logout: 'خروج', change_lang: 'English',
    welcome: 'أهلاً بك في هايب', book_now: 'احجز ملعبك الآن', featured_courts: 'الملاعب المميزة', view_all: 'عرض الكل',
    rank: 'التصنيف', matches: 'مباراة', level: 'المستوى', save_changes: 'حفظ التغييرات', phone: 'الجوال', email: 'الإيميل', gender: 'الجنس', birth_date: 'الميلاد', remaining_to_rank: 'للترقية', current_progress: 'تقدمك الحالي', max_level: 'أعلى رتبة',
    community: 'المجتمع', players: 'اللاعبين', lobbies: 'لوحة التنسيق', challenge: 'تحدي', open_matches: 'مباريات مفتوحة', join_match: 'انضمام', spots_left: 'شاغر', hosted_by: 'بواسطة', match_details: 'التفاصيل', 
    my_matches: 'مبارياتي', no_matches: 'لا توجد مباريات متاحة حالياً',
    host_match: 'إنشاء حجز', select_court: 'اختر الملعب', select_date: 'اختر التاريخ', select_time: 'اختر الوقت', create_match: 'تأكيد الحجز', cancel: 'إلغاء',
    my_bookings: 'حجوزاتي', rewards: 'مكافآتي', tournaments: 'فعاليات', upcoming: 'القادمة', previous: 'السابقة', cancelled: 'الملغاة', points_balance: 'رصيد النقاط', redeem: 'استبدال', active_events: 'الفعاليات الحالية',
    
    // كلمات الشريط السفلي
    home: 'الرئيسية', courts: 'الملاعب', support: 'الدعم',

    // كلمات المجتمع
    how_many_missing: 'كم ناقصك لاعب؟', players_count_label: 'لاعبين', login_first: 'سجل دخولك أولاً',
    joining: 'جاري الانضمام...', already_joined: 'تم الانضمام بنجاح ✅', slots_full: 'اكتمل العدد 🛑', match_full: 'هذه المباراة مكتملة',
    slot_taken: 'هذا الوقت محجوز مسبقاً 🛑', joined_players_list: 'اللاعبين المنضمين', host_info: 'صاحب الحجز', you_are_in: 'أنت منضم بالفعل',
    
    // كلمات الإشعارات
    notification_title: 'الإشعارات',
    notif_booking_confirmed: 'تم تأكيد حجزك بنجاح! 🔥🎾',
    notif_join_success: 'تم انضمامك للمباراة بنجاح! 🚀',
    notif_match_cancelled: 'تم إلغاء الحجز بنجاح 🗑️',
    notif_slot_taken: 'عذراً، هذا الوقت تم حجزه للتو 🛑',
    notif_new_player_joined: 'انضم لاعب جديد لتحديك! 👤',
    notif_login_required: 'يجب تسجيل الدخول أولاً 🔐',
    notif_match_now_full: 'اكتمل عدد اللاعبين والمباراة جاهزة! 🎾🔥', // 👈 إضافة الترجمة

    // كلمات تفاصيل الحجز
    duration: 'المدة',
    price: 'السعر الإجمالي',
    sar: 'ريال',
    mins_60: '60 دقيقة',
    mins_90: '90 دقيقة',
    mins_120: '120 دقيقة',
    court_features: 'مميزات الملعب',
  },
  en: {
    app_name: 'HYPE', profile: 'Profile', payment: 'Payment', notifications: 'Alerts', language: 'Language', logout: 'Logout', change_lang: 'العربية',
    welcome: 'Welcome to Hype', book_now: 'Book Now', featured_courts: 'Featured Courts', view_all: 'View All',
    rank: 'Rank', matches: 'Matches', level: 'Level', save_changes: 'Save', phone: 'Phone', email: 'Email', gender: 'Gender', birth_date: 'Birth Date', remaining_to_rank: 'To Rank', current_progress: 'Progress', max_level: 'Max Level',
    community: 'Community', players: 'Players', lobbies: 'Lobbies', challenge: 'Challenge', open_matches: 'Open Matches', join_match: 'Join', spots_left: 'Left', hosted_by: 'By', match_details: 'Details', 
    my_matches: 'My Matches', no_matches: 'No matches available right now',
    host_match: 'Create Booking', select_court: 'Select Court', select_date: 'Select Date', select_time: 'Select Time', create_match: 'Confirm Booking', cancel: 'Cancel',
    my_bookings: 'My Bookings', rewards: 'My Rewards', tournaments: 'Tournaments', upcoming: 'Upcoming', previous: 'Previous', cancelled: 'Cancelled', points_balance: 'Points Balance', redeem: 'Redeem', active_events: 'Active Events',
    
    // كلمات الشريط السفلي
    home: 'Home', courts: 'Courts', support: 'Support',

    // كلمات المجتمع
    how_many_missing: 'How many players missing?', players_count_label: 'Players', login_first: 'Please login first',
    joining: 'Joining...', already_joined: 'Joined Successfully ✅', slots_full: 'Full Capacity 🛑', match_full: 'This match is full',
    slot_taken: 'This slot is already booked 🛑', joined_players_list: 'Joined Players', host_info: 'Host', you_are_in: 'You are already in',
    
    // كلمات الإشعارات
    notification_title: 'Notifications',
    notif_booking_confirmed: 'Booking confirmed successfully! 🔥🎾',
    notif_join_success: 'You have joined the match! 🚀',
    notif_match_cancelled: 'Match cancelled successfully 🗑️',
    notif_slot_taken: 'Sorry, this slot was just taken 🛑',
    notif_new_player_joined: 'A new player joined your challenge! 👤',
    notif_login_required: 'Please login first 🔐',
    notif_match_now_full: 'Match is full and ready to go! 🎾🔥', // 👈 إضافة الترجمة

    // كلمات تفاصيل الحجز
    duration: 'Duration',
    price: 'Total Price',
    sar: 'SAR',
    mins_60: '60 Mins',
    mins_90: '90 Mins',
    mins_120: '120 Mins',
    court_features: 'Court Features',
  }
};

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: keyof Translations) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('hype_lang') as Language) || 'ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  useEffect(() => {
    localStorage.setItem('hype_lang', lang);
    document.documentElement.dir = dir;
  }, [lang, dir]);
  
  const toggleLang = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  const t = (key: keyof Translations): string => dictionary[lang][key] || key;
  
  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage error');
  return context;
};