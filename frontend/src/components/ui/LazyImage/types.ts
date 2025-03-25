import React from 'react';

/**
 * Доступные методы загрузки изображений
 */
export type LoadingMethod = 'lazy' | 'eager';

/**
 * Доступные режимы отображения изображений
 */
export type ObjectFitMode = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/**
 * Тип анимации появления изображения
 */
export type FadeInAnimation = 'none' | 'fade' | 'zoom' | 'blur' | 'slide-up';

/**
 * Пропсы для компонента LazyImage
 */
export interface LazyImageProps {
  /** URL изображения */
  src: string;
  /** Альтернативный текст */
  alt: string;
  /** Ширина изображения */
  width?: number | string;
  /** Высота изображения */
  height?: number | string;
  /** Цвет placeholder'а до загрузки изображения */
  placeholderColor?: string;
  /** CSS-класс */
  className?: string;
  /** Инлайн-стили */
  style?: React.CSSProperties;
  /** Загружать изображение с низким разрешением */
  lowQualityPreview?: boolean;
  /** URL изображения с низким разрешением */
  previewSrc?: string;
  /** Обработчик завершения загрузки */
  onLoad?: () => void;
  /** Обработчик ошибки загрузки */
  onError?: (error: Error) => void;
  /** Метод загрузки изображения */
  loading?: LoadingMethod;
  /** Режим отображения изображения */
  objectFit?: ObjectFitMode;
  /** Радиус скругления углов */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Применить тень */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Тип анимации появления */
  fadeAnimation?: FadeInAnimation;
  /** Длительность анимации в мс */
  animationDuration?: number;
  /** Эффект при наведении */
  hoverEffect?: 'none' | 'zoom' | 'brightness' | 'scale' | 'lift';
  /** Показывать прелоадер */
  showPreloader?: boolean;
  /** Заменяющее изображение при ошибке */
  fallbackSrc?: string;
}
