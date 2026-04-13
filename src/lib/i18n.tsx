import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ✅ دمج الترجمة مباشرة داخل الكود لتجنب مشاكل المسارات في Vercel
const resources = {
  en: {
    translation: {
      "community": "COMMUNITY",
      "players": "PLAYERS",
      "book_now": "BOOK NOW",
      "my_bookings": "MY BOOKINGS",
      "profile": "PROFILE",
      "language": "LANGUAGE",
      "support": "SUPPORT",
      "logout": "LOGOUT",
      "change_lang_desc": "The entire app interface will change"
    }
  },
  ar: {
    translation: {
      "community": "المجتمع",
      "players": "اللاعبين",
      "book_now": "احجز الآن",
      "my_bookings": "حجوزاتي",
      "profile": "الملف الشخصي",
      "language": "اللغة",
      "support": "الدعم الفني",
      "logout": "تسجيل الخروج",
      "change_lang_desc": "سيتم تغيير واجهة التطبيق بالكامل"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? (localStorage.getItem('i18nextLng') || 'ar') : 'ar',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default i18n;