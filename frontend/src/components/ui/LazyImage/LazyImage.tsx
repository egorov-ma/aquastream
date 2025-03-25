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
 * Компонент для "ленивой" загрузки изображений с различными эффектами
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
  // Состояния для управления загрузкой и отображением
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    lowQualityPreview ? previewSrc : undefined
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Обработчик успешной загрузки изображения
  const handleImageLoaded = useCallback(() => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  // Обработчик ошибки загрузки изображения
  const handleImageError = useCallback(() => {
    setIsError(true);
    if (onError) onError(new Error(`Failed to load image: ${src}`));
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  }, [fallbackSrc, onError, src]);

  // Устанавливаем наблюдатель за пересечением viewport и изображения
  useEffect(() => {
    if (loading !== 'lazy' || !imageRef.current) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setCurrentSrc(src);
        observer.current?.disconnect();
      }
    });

    observer.current.observe(imageRef.current);

    return () => {
      observer.current?.disconnect();
    };
  }, [loading, src]);

  // Сбрасываем состояния при смене источника изображения
  useEffect(() => {
    if (loading === 'eager') {
      setCurrentSrc(src);
    }
    setIsLoaded(false);
    setIsError(false);
  }, [src, loading]);

  // Определение стилей на основе пропсов
  const getBorderRadius = () => {
    const borderRadiusMap: Record<string, string> = {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    };
    return borderRadiusMap[rounded] || borderRadiusMap.md;
  };

  const getBoxShadow = () => {
    const shadowMap: Record<string, string> = {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    };
    return shadowMap[shadow] || shadowMap.none;
  };

  const getAnimationStyle = () => {
    const baseTransition = `opacity ${animationDuration}ms ease-out`;

    switch (fadeAnimation) {
      case 'none':
        return {};
      case 'zoom':
        return {
          transform: isLoaded ? 'scale(1)' : 'scale(1.1)',
          transition: `${baseTransition}, transform ${animationDuration}ms ease-out`,
        };
      case 'blur':
        return {
          filter: isLoaded ? 'blur(0)' : 'blur(10px)',
          transition: `${baseTransition}, filter ${animationDuration}ms ease-out`,
        };
      case 'slide-up':
        return {
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: `${baseTransition}, transform ${animationDuration}ms ease-out`,
        };
      case 'fade':
      default:
        return {
          transition: baseTransition,
        };
    }
  };

  // Вычисляем стили для контейнера
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    width: width || 'auto',
    height: height || 'auto',
    backgroundColor: isLoaded ? 'transparent' : placeholderColor,
    transition: 'background-color 0.3s ease',
    borderRadius: getBorderRadius(),
    boxShadow: getBoxShadow(),
    ...style,
  };

  // Вычисляем стили для изображения
  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    opacity: isLoaded ? 1 : 0,
    ...getAnimationStyle(),
  };

  // Определяем классы для эффекта при наведении
  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'zoom':
        return 'lazy-image-hover-zoom';
      case 'brightness':
        return 'lazy-image-hover-brightness';
      case 'scale':
        return 'lazy-image-hover-scale';
      case 'lift':
        return 'lazy-image-hover-lift';
      default:
        return '';
    }
  };

  // Определяем классы для контейнера
  const containerClasses = clsx(
    'lazy-image-container',
    className,
    {
      'lazy-image-loaded': isLoaded,
      'lazy-image-error': isError,
    },
    getHoverClass()
  );

  // CSS для анимации лоадера
  const loaderStyle: React.CSSProperties = {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'lazyImageSpin 1s linear infinite',
  };

  return (
    <div className={containerClasses} style={containerStyles}>
      {/* Прелоадер */}
      {!isLoaded && showPreloader && (
        <div
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: placeholderColor,
          }}
        >
          <div className="lazy-image-loader" style={loaderStyle} />
        </div>
      )}

      {/* Изображение */}
      <img
        ref={imageRef}
        src={currentSrc || (loading === 'eager' ? src : undefined)}
        alt={alt}
        className="lazy-image"
        style={imageStyles}
        onLoad={handleImageLoaded}
        onError={handleImageError}
        loading={loading}
      />
    </div>
  );
};
