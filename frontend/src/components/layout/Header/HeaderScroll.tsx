import React, { useState, useEffect, useRef, useCallback, createContext } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Контекст состояния меню
 */
export interface MenuContextType {
  isMenuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
}

export const MenuContext = createContext<MenuContextType>({
  isMenuOpen: false,
  setMenuOpen: () => {},
});

/**
 * Настройки скролла
 */
interface ScrollSettings {
  /**
   * Начальная зона, где хедер всегда виден
   */
  initialVisibilityThreshold: number;
  /**
   * Минимальное изменение скролла для реакции
   */
  scrollDeltaThreshold: number;
  /**
   * Задержка перед скрытием хедера (мс)
   */
  hideDelay: number;
}

/**
 * Настройки анимации
 */
interface AnimationSettings {
  /**
   * Жесткость пружины
   */
  stiffness: number;
  /**
   * Демпфирование
   */
  damping: number;
  /**
   * Масса
   */
  mass: number;
  /**
   * Продолжительность анимации прозрачности
   */
  opacityDuration: number;
}

/**
 * Свойства компонента HeaderScroll
 */
interface HeaderScrollProps {
  /**
   * Дочерние элементы
   */
  children: React.ReactNode;
  /**
   * Настройки скролла
   */
  scrollSettings?: Partial<ScrollSettings>;
  /**
   * Настройки анимации
   */
  animationSettings?: Partial<AnimationSettings>;
  /**
   * Референс на заголовок
   */
  headerRef?: React.RefObject<HTMLDivElement>;
  /**
   * Стиль для заголовка
   */
  style?: React.CSSProperties;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для управления скроллом Header
 */
const HeaderScroll: React.FC<HeaderScrollProps> = React.memo(({
  children,
  scrollSettings: customScrollSettings,
  animationSettings: customAnimationSettings,
  headerRef: externalHeaderRef,
  style,
  className,
}) => {
  // Состояние видимости заголовка
  const [isVisible, setIsVisible] = useState(true);
  
  // Состояние открытого меню
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Референс для последней позиции скролла
  const lastScrollY = useRef(0);
  
  // Референс для таймаута скрытия
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Внутренний референс для заголовка, если внешний не предоставлен
  const internalHeaderRef = useRef<HTMLDivElement>(null);
  
  // Используем внешний референс, если он предоставлен, иначе внутренний
  const headerRef = externalHeaderRef || internalHeaderRef;
  
  // Текущий путь страницы
  const location = useLocation();
  
  // Настройки скролла по умолчанию
  const defaultScrollSettings: ScrollSettings = {
    initialVisibilityThreshold: 60,
    scrollDeltaThreshold: 50,
    hideDelay: 800,
  };
  
  // Объединяем пользовательские настройки с настройками по умолчанию
  const scrollSettings = {
    ...defaultScrollSettings,
    ...customScrollSettings,
  };
  
  // Настройки анимации по умолчанию
  const defaultAnimationSettings: AnimationSettings = {
    stiffness: 300,
    damping: 30,
    mass: 0.8,
    opacityDuration: 0.15,
  };
  
  // Объединяем пользовательские настройки анимации с настройками по умолчанию
  const animationSettings = {
    ...defaultAnimationSettings,
    ...customAnimationSettings,
  };
  
  // Функция для установки состояния isMenuOpen (для использования в дочерних компонентах)
  const setMenuOpen = useCallback((value: boolean) => {
    setIsMenuOpen(value);
  }, []);
  
  // Обработчик скролла
  const handleScroll = useCallback(() => {
    // Не реагируем на скролл, если открыто мобильное меню
    if (isMenuOpen) return;
    
    const currentScrollY = window.scrollY;
    
    // Всегда показываем хедер в верхней части страницы
    if (currentScrollY < scrollSettings.initialVisibilityThreshold) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setIsVisible(true);
      return;
    }
    
    // Определяем направление скролла
    const delta = currentScrollY - lastScrollY.current;
    
    if (Math.abs(delta) > scrollSettings.scrollDeltaThreshold) {
      if (delta < 0) {
        // Скролл вверх - моментально показываем хедер
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsVisible(true);
      } else if (delta > 0) {
        // Скролл вниз - скрываем хедер с задержкой
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            hideTimeoutRef.current = null;
          }, scrollSettings.hideDelay);
        }
      }
    }
    
    lastScrollY.current = currentScrollY;
  }, [isMenuOpen, scrollSettings]);
  
  // Прослушивание события скролла с throttling для предотвращения слишком частого вызова
  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [handleScroll]);
  
  // При смене страницы скроллим наверх и показываем хедер
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
    lastScrollY.current = 0;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, [location.pathname]);

  // Блокируем прокрутку страницы при открытом мобильном меню
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);
  
  return (
    <MenuContext.Provider value={{ isMenuOpen, setMenuOpen }}>
      <motion.header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 ${className || ''}`}
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : '-100%', 
          opacity: isVisible ? 1 : 0.5,
        }}
        transition={{ 
          y: { 
            type: 'spring', 
            stiffness: animationSettings.stiffness,
            damping: animationSettings.damping,
            mass: animationSettings.mass
          },
          opacity: { 
            duration: animationSettings.opacityDuration
          }
        }}
        style={{
          height: 'var(--header-height, 85px)',
          ...style,
        }}
        data-testid="header-scroll"
      >
        {children}
      </motion.header>
    </MenuContext.Provider>
  );
});

HeaderScroll.displayName = 'HeaderScroll';

export default HeaderScroll; 