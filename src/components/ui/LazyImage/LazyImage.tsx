import React, { useState, useEffect, useRef } from 'react';

/**
 * Пропсы для компонента LazyImage
 */
interface LazyImageProps {
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
  onLoad
}) => {
  // Состояния для отслеживания загрузки и видимости
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  // Наблюдаем за появлением элемента в области видимости
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Обработчик загрузки изображения
  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };
  
  // Составляем стили для контейнера и изображения
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: placeholderColor,
    overflow: 'hidden',
    position: 'relative',
    ...style
  };
  
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s',
    opacity: isLoaded ? 1 : 0
  };
  
  // Стили для превью с низким качеством
  const previewImageStyle: React.CSSProperties = {
    ...imageStyle,
    position: 'absolute',
    top: 0,
    left: 0,
    filter: 'blur(10px)',
    transform: 'scale(1.1)',
    opacity: isLoaded ? 0 : 1,
    zIndex: 1
  };
  
  return (
    <div
      ref={imgRef}
      className={`lazy-image ${className}`}
      style={containerStyle}
      aria-label={alt}
    >
      {/* Блюр-эффект или превью с низким качеством */}
      {lowQualityPreview && isInView && (
        <img
          src={previewSrc || src}
          alt=""
          style={previewImageStyle}
          aria-hidden="true"
        />
      )}
      
      {/* Основное изображение */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          style={{...imageStyle, zIndex: 2}}
          loading="lazy"
        />
      )}
    </div>
  );
}; 