import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. اللغات المدعومة
export type Language = 'ar' | 'en';

// 2. القالب الصارم للكلمات (شامل كل شيء من البداية لليوم)
interface Translations {
  // الأساسيات
  app_name: string;
  profile: string;
  payment: string;
  notifications: string;
  language: string;
  logout: string;
  change_lang: string;
  
  // الصفحة الرئيسية
  welcome: string;
  book_now: string;
  featured_courts: string;
  view_all: string;
  
  // الملف الشخصي
  rank: string;
  matches: string;
  level: string;
  save_changes: string;
  phone: string;
  email: string;
  gender: string;
  birth_date: string;
  remaining_to_rank: string;
  current_progress: string;
  max_level: string;
  
  // المجتمع والتحديات
  community: string;
  players: string;
  lobbies: string;
  challenge: string;
  open_matches: string;
  join_match: string;
  spots_left: string;
  hosted_by: string;
  match_details: string;
  my_matches: string; 
  no_matches: string; 
  
  // إنشاء مباراة جديدة
  host_match: string;
  select_court: string;
  select_date: string;
  select_time: string;
  create_match: string;
  cancel: string;
  
  // الحجوزات، المكافآت، الفعاليات
  my_bookings: string;
  rewards: string;
  tournaments: string;
  upcoming: string;
  previous: string;
  cancelled: string;
  points_balance: string;
  redeem: string;
  active_events: string;
}

const dictionary: Record<Language, Translations> = {
  ar: {
    app_name: 'هايب', profile: 'الملف الشخصي', payment: 'الدفع', notifications: 'الإشعارات', language: 'اللغة', logout: 'خروج', change_lang: 'English',
    welcome: 'أهلاً بك في هايب', book_now: 'احجز ملعبك الآن', featured_courts: 'الملاعب المميزة', view_all: 'عرض الكل',
    rank: 'التصنيف', matches: 'مباراة', level: 'المستوى', save_changes: 'حفظ التغييرات', phone: 'الجوال', email: 'الإيميل', gender: 'الجنس', birth_date: 'الميلاد', remaining_to_rank: 'للترقية', current_progress: 'تقدمك الحالي', max_level: 'أعلى رتبة',
    community: 'المجتمع', players: 'اللاعبين', lobbies: 'لوحة التنسيق', challenge: 'تحدي', open_matches: 'مباريات مفتوحة', join_match: 'انضمام', spots_left: 'شاغر', hosted_by: 'بواسطة', match_details: 'التفاصيل', 
    my_matches: 'مبارياتي', no_matches: 'لا توجد مباريات متاحة حالياً',
    host_match: 'استضافة مباراة', select_court: 'اختر الملعب', select_date: 'اختر التاريخ', select_time: 'اختر الوقت', create_match: 'إنشاء التحدي الآن', cancel: 'إلغاء',
    my_bookings: 'حجوزاتي', rewards: 'مكافآتي', tournaments: 'فعاليات', upcoming: 'القادمة', previous: 'السابقة', cancelled: 'الملغاة', points_balance: 'رصيد النقاط', redeem: 'استبدال', active_events: 'الفعاليات الحالية'
  },
  en: {
    app_name: 'HYPE', profile: 'Profile', payment: 'Payment', notifications: 'Alerts', language: 'Language', logout: 'Logout', change_lang: 'العربية',
    welcome: 'Welcome to Hype', book_now: 'Book Now', featured_courts: 'Featured Courts', view_all: 'View All',
    rank: 'Rank', matches: 'Matches', level: 'Level', save_changes: 'Save', phone: 'Phone', email: 'Email', gender: 'Gender', birth_date: 'Birth Date', remaining_to_rank: 'To Rank', current_progress: 'Progress', max_level: 'Max Level',
    community: 'Community', players: 'Players', lobbies: 'Lobbies', challenge: 'Challenge', open_matches: 'Open Matches', join_match: 'Join', spots_left: 'Left', hosted_by: 'By', match_details: 'Details', 
    my_matches: 'My Matches', no_matches: 'No matches available right now',
    host_match: 'Host a Match', select_court: 'Select Court', select_date: 'Select Date', select_time: 'Select Time', create_match: 'Create Challenge Now', cancel: 'Cancel',
    my_bookings: 'My Bookings', rewards: 'My Rewards', tournaments: 'Tournaments', upcoming: 'Upcoming', previous: 'Previous', cancelled: 'Cancelled', points_balance: 'Points Balance', redeem: 'Redeem', active_events: 'Active Events'
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
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('hype_lang');
    return (saved === 'en' || saved === 'ar') ? (saved as Language) : 'ar';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('hype_lang', lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const toggleLang = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  
  const t = (key: keyof Translations): string => {
    return dictionary[lang][key] || key;
  };

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