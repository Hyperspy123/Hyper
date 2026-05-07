import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. اللغات المدعومة
export type Language = 'ar' | 'en';

// 2. الكلمات اللي بنترجمها (القاموس)
interface Translations {
  app_name: string;
  profile: string;
  payment: string;
  notifications: string;
  language: string;
  logout: string;
  change_lang: string;
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
  },
  en: {
    app_name: 'HYPE',
    profile: 'Profile',
    payment: 'Payment Info',
    notifications: 'Notifications',
    language: 'Language',
    logout: 'Log Out',
    change_lang: 'العربية',
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
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('hype_lang', lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const toggleLang = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  const t = (key: keyof Translations) => dictionary[lang][key];

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