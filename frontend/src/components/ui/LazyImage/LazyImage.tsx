import clsx from 'clsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';

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

/**
 * Компонент для ленивой загрузки изображений.
 * Изображение загружается только когда попадает в область видимости.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholderColor = '#f0f0f0',
  className = '',
  style = {},
  lowQualityPreview = false,
  previewSrc,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
  rounded = 'md',
  shadow = 'none',
  fadeAnimation = 'fade',
  animationDuration = 500,
  hoverEffect = 'none',
  showPreloader = true,
  fallbackSrc,
}) => {
  // Состояния для отслеживания загрузки и видимости
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading !== 'lazy');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Наблюдаем за появлением элемента в области видимости
  useEffect(() => {
    if (loading !== 'lazy') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading]);

  // Обработчик загрузки изображения
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Обработчик ошибки загрузки
  const handleImageError = useCallback(
    (_: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      if (onError) {
        onError(new Error(`Failed to load image: ${src}`));
      }
    },
    [onError, src]
  );

  // Классы для скругления
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Классы для тени
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Классы для анимации
  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `opacity ${animationDuration}ms ease-out`,
    };

    if (!isLoaded) return baseStyles;

    switch (fadeAnimation) {
      case 'none':
        return {};
      case 'zoom':
        return {
          ...baseStyles,
          transform: 'scale(1)',
          transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
        };
      case 'blur':
        return {
          ...baseStyles,
          filter: 'blur(0)',
          transition: `opacity ${animationDuration}ms ease-out, filter ${animationDuration}ms ease-out`,
        };
      case 'slide-up':
        return {
          ...baseStyles,
          transform: 'translateY(0)',
          transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
        };
      case 'fade':
      default:
        return baseStyles;
    }
  };

  // Классы для эффекта наведения
  const hoverClasses = {
    none: '',
    zoom: 'group-hover:scale-110 transition-transform duration-300',
    brightness: 'group-hover:brightness-110 transition-all duration-300',
    scale: 'group-hover:scale-[1.02] transition-transform duration-300',
    lift: 'group-hover:-translate-y-1 transition-transform duration-300',
  };

  // Составляем стили для контейнера и изображения
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: !isLoaded ? placeholderColor : 'transparent',
    overflow: 'hidden',
    position: 'relative',
    ...style,
  };

  // Начальные стили для обычного изображения
  let initialImageStyles: React.CSSProperties = {
    objectFit,
    opacity: isLoaded ? 1 : 0,
    width: '100%',
    height: '100%',
  };

  // Применяем анимационные стили
  if (fadeAnimation !== 'none') {
    switch (fadeAnimation) {
      case 'zoom':
        initialImageStyles = {
          ...initialImageStyles,
          transform: isLoaded ? 'scale(1)' : 'scale(1.1)',
        };
        break;
      case 'blur':
        initialImageStyles = {
          ...initialImageStyles,
          filter: isLoaded ? 'blur(0)' : 'blur(10px)',
        };
        break;
      case 'slide-up':
        initialImageStyles = {
          ...initialImageStyles,
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        };
        break;
    }
  }

  const imageStyles = {
    ...initialImageStyles,
    ...getAnimationStyles(),
  };

  // Отображаем заглушку, если произошла ошибка загрузки
  if (hasError && fallbackSrc) {
    return (
      <div
        ref={imgRef}
        className={clsx(className, roundedClasses[rounded], shadowClasses[shadow], 'group')}
        style={containerStyle}
      >
        <img
          src={fallbackSrc}
          alt={alt}
          className={clsx('w-full h-full', hoverClasses[hoverEffect])}
          style={{ objectFit }}
        />
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={clsx(className, roundedClasses[rounded], shadowClasses[shadow], 'group')}
      style={containerStyle}
    >
      {/* Изображение с низким разрешением (превью) */}
      {lowQualityPreview && previewSrc && !isLoaded && (
        <img
          src={previewSrc}
          alt={alt}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            objectFit,
            filter: 'blur(8px)',
            transform: 'scale(1.05)',
            opacity: 0.5,
          }}
        />
      )}

      {/* Прелоадер */}
      {showPreloader && !isLoaded && isInView && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
        </div>
      )}

      {/* Основное изображение */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={clsx('transition-all duration-300 ease-out', hoverClasses[hoverEffect])}
          style={imageStyles}
          loading={loading}
        />
      )}
    </div>
  );
};
