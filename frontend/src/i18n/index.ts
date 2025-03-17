import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import ru from './locales/ru';

// Инициализация i18next
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      ru
    },
    fallbackLng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // не нужно экранировать для React
    },
    
    // Устанавливаем опции определения языка
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    }
  });

export default i18n; 