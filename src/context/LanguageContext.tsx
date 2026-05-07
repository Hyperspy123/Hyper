import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. اللغات المدعومة
export type Language = 'ar' | 'en';

// 2. القالب الصارم للكلمات (أضفت لك كل كلمات التطبيق المتوقعة)
interface Translations {
  app_name: string;
  profile: string;
  payment: string;
  notifications: string;
  language: string;
  logout: string;
  change_lang: string;
  // كلمات الصفحة الرئيسية والمجتمع
  welcome: string;
  book_now: string;
  featured_courts: string;
  community: string;
  players: string;
  lobbies: string;
  challenge: string;
  rank: string;
  matches: string;
  level: string;
  view_all: string;
  save_changes: string;
  phone: string;
  email: string;
  gender: string;
  birth_date: string;
}

const dictionary: Record<Language, Translations> = {
  ar: {
    app_name: 'هايب',
    profile: 'الملف الشخصي',
    payment: 'معلومات الدفع',
    notifications: 'الإشعارات',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    change_lang: 'English',
    welcome: 'أهلاً بك في هايب',
    book_now: 'احجز ملعبك الآن',
    featured_courts: 'الملاعب المميزة',
    community: 'المجتمع',
    players: 'اللاعبين',
    lobbies: 'لوحة التنسيق',
    challenge: 'تحدى',
    rank: 'التصنيف',
    matches: 'المباريات',
    level: 'مستوى اللعب',
    view_all: 'عرض الكل',
    save_changes: 'حفظ التغييرات',
    phone: 'رقم الجوال',
    email: 'البريد الإلكتروني',
    gender: 'الجنس',
    birth_date: 'تاريخ الميلاد',
  },
  en: {
    app_name: 'HYPE',
    profile: 'My Profile',
    payment: 'Payment Info',
    notifications: 'Notifications',
    language: 'Language',
    logout: 'Log Out',
    change_lang: 'العربية',
    welcome: 'Welcome to Hype',
    book_now: 'Book Your Court Now',
    featured_courts: 'Featured Courts',
    community: 'Community',
    players: 'Players',
    lobbies: 'Lobbies',
    challenge: 'Challenge',
    rank: 'Rank',
    matches: 'Matches',
    level: 'Play Level',
    view_all: 'View All',
    save_changes: 'Save Changes',
    phone: 'Phone Number',
    email: 'Email Address',
    gender: 'Gender',
    birth_date: 'Birth Date',
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
  
  // دالة الترجمة الآمنة
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