import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';

// إعداد بسيط جداً بدون ملفات خارجية
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: {
          // يمكنك تركها فارغة أو إضافة كلمات بسيطة هنا مستقبلاً
        }
      }
    },
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default i18n;