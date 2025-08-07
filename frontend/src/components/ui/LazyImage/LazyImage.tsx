import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { LazyImageProps, ObjectFitMode, FadeInAnimation, RoundedSize, ShadowSize, HoverEffect } from './types';

// Маппинги пропсов на классы Tailwind
const roundedClasses: Record<RoundedSize, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const shadowClasses: Record<ShadowSize, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const objectFitClasses: Record<ObjectFitMode, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

// Анимации появления
const fadeAnimationClasses: Record<FadeInAnimation, string> = {
  none: '',
  fade: 'transition-opacity duration-500 ease-in-out',
  zoom: 'transition-transform duration-500 ease-in-out scale-95 opacity-0',
  blur: 'transition-all duration-500 ease-in-out filter blur-sm opacity-0',
  'slide-up': 'transition-all duration-500 ease-in-out transform translate-y-4 opacity-0',
};

// Эффекты при наведении
const hoverEffectClasses: Record<HoverEffect, string> = {
  none: '',
  zoom: 'transition-transform duration-300 hover:scale-110',
  brightness: 'transition-all duration-300 hover:brightness-110',
  scale: 'transition-transform duration-300 hover:scale-[1.02]',
  lift: 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg',
};

/**
 * Улучшенный компонент для "ленивой" загрузки изображений с различными эффектами
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderColor = 'bg-secondary-200 dark:bg-secondary-700',
  className = '',
  lowQualityPreview = false,
  previewSrc,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
  rounded = 'md',
  shadow = 'none',
  fadeAnimation = 'fade',
  hoverEffect = 'none',
  showPreloader = true,
  fallbackSrc,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(loading === 'lazy');
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    lowQualityPreview ? previewSrc : undefined
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Обработчик успешной загрузки изображения
  const handleImageLoaded = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    if (onLoad) onLoad();
  }, [onLoad]);

  // Обработчик ошибки загрузки изображения
  const handleImageError = useCallback(() => {
    setIsError(true);
    setIsLoading(false);
    if (onError) onError(new Error(`Failed to load image: ${src}`));
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      // Если fallback загрузился успешно, считаем isLoaded = true, чтобы убрать плейсхолдер/лоадер
      const img = document.createElement('img');
      img.src = fallbackSrc;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsLoaded(true); // Даже если fallback не загрузился, убираем лоадер
    } else {
      setIsLoaded(true); // Убираем лоадер, даже если картинки нет
    }
  }, [fallbackSrc, onError, src]);

  // Настройка Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (loading !== 'lazy') {
      setIsLoading(true);
      setCurrentSrc(src);
      return;
    }
    if (!imageRef.current) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsLoading(true); // Начинаем загрузку
        setCurrentSrc(src);
        observer.current?.disconnect();
      }
    }, {
      rootMargin: '200px 0px', // Предзагрузка изображений, которые в пределах 200px от видимой области
      threshold: 0.01, // Загружать, когда хотя бы 1% изображения видим
    });

    observer.current.observe(imageRef.current);

    return () => {
      observer.current?.disconnect();
    };
  }, [loading, src]);

  // Обновление источника изображения при изменении src
  useEffect(() => {
    if (loading === 'eager') {
      setCurrentSrc(src);
      setIsLoading(true);
    }
    setIsLoaded(false);
    setIsError(false);
  }, [src, loading]);

  // Определяем классы для контейнера
  const containerClasses = cn(
    'relative inline-block overflow-hidden align-top',
    placeholderColor,
    roundedClasses[rounded],
    shadowClasses[shadow],
    hoverEffect === 'lift' && hoverEffectClasses[hoverEffect],
    className,
    {
      'cursor-pointer': onClick,
    }
  );

  // Определяем классы для изображения
  const imageClasses = cn(
    'block w-full h-full',
    objectFitClasses[objectFit],
    fadeAnimationClasses[fadeAnimation],
    (hoverEffect === 'zoom' || hoverEffect === 'brightness' || hoverEffect === 'scale') && hoverEffectClasses[hoverEffect],
    isLoaded ? 'opacity-100 scale-100 blur-0 translate-y-0' : 'opacity-0'
  );

  // Классы для прелоадера
  const preloaderClasses = cn(
    'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
    isLoaded || isError ? 'opacity-0 pointer-events-none' : 'opacity-100'
  );

  // Классы для информации о состоянии ошибки
  const errorClasses = cn(
    'absolute inset-0 flex flex-col items-center justify-center bg-secondary-100 dark:bg-secondary-800 transition-opacity duration-300',
    isError && !fallbackSrc ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  // Обработчик клавиш для доступности (Enter или Space нажаты)
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      className={containerClasses}
      data-testid="lazy-image-container"
      onClick={onClick}
      onKeyDown={handleKeyPress}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Прелоадер с кастомным спиннером */}
      {showPreloader && isLoading && (
        <div className={preloaderClasses} data-testid="lazy-image-preloader">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 dark:border-primary-400 border-t-transparent dark:border-t-transparent"></div>
            <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">Загрузка...</div>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке загрузки */}
      <div className={errorClasses} data-testid="lazy-image-error">
        <svg 
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-error-500 dark:text-error-400 mb-2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span className="text-sm text-secondary-700 dark:text-secondary-300">Не удалось загрузить изображение</span>
      </div>

      {/* Изображение */}  
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        onLoad={handleImageLoaded}
        onError={handleImageError}
        loading={loading === 'lazy' ? 'lazy' : undefined}
        data-testid="lazy-image-img"
      />
    </div>
  );
};

export default LazyImage;
