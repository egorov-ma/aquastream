import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Кастомный хук для использования переводов
 * Расширяет стандартный хук useTranslation из react-i18next
 * @returns Объект с функциями для работы с переводами
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  /**
   * Изменяет язык приложения
   * @param lang Код языка ('ru', 'en', etc.)
   */
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  /**
   * Получает текущий язык
   * @returns Код текущего языка
   */
  const getCurrentLanguage = () => {
    return i18n.language;
  };
  
  /**
   * Проверяет, является ли указанный язык текущим
   * @param lang Код языка для проверки
   * @returns true, если указанный язык является текущим
   */
  const isCurrentLanguage = (lang: string) => {
    return i18n.language === lang;
  };
  
  /**
   * Получает список доступных языков
   * @returns Массив кодов доступных языков
   */
  const getAvailableLanguages = () => {
    return Object.keys(i18n.options.resources || {});
  };
  
  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    isCurrentLanguage,
    getAvailableLanguages
  };
}; 