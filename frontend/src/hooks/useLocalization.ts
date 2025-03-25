import { useMemo } from 'react';

import { ru } from '@/shared/localization/ru';

// Тип для словаря локализации
type LocalizationDictionary = typeof ru;

// Тип для функции перевода
export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Хук для локализации текстов в приложении
 * @param locale Код языка (по умолчанию 'ru')
 * @returns Функция для получения переведенного текста
 */
export const useLocalization = (locale = 'ru'): TranslateFunction => {
  // Получаем словарь в зависимости от локали
  const dictionary = useMemo<LocalizationDictionary>(() => {
    // В будущем здесь можно добавить другие локали
    switch (locale) {
      case 'ru':
      default:
        return ru;
    }
  }, [locale]);

  // Функция для получения переведенного текста по ключу
  const translate: TranslateFunction = (key, params) => {
    // Получаем значение по пути в объекте (например, "common.buttons.save")
    const getValue = (obj: Record<string, unknown>, path: string): string => {
      const keys = path.split('.');
      let current = obj;

      for (const k of keys) {
        if (current[k] === undefined) {
          return key; // Возвращаем исходный ключ если перевод не найден
        }
        current = current[k] as Record<string, unknown>;
      }

      return current as unknown as string;
    };

    // Получаем текст
    let text = getValue(dictionary, key);

    // Заменяем параметры если они есть
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }

    return text;
  };

  return translate;
};

export default useLocalization;
