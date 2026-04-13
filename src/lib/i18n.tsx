import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector) // يكتشف لغة المتصفح تلقائياً إذا لم توجد لغة محفوظة
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en.translation || en },
      ar: { translation: ar.translation || ar }
    },
    lng: localStorage.getItem('i18nextLng') || 'ar',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// ✅ تصدير الـ Provider الذي يستخدمه App.tsx
export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default i18n;