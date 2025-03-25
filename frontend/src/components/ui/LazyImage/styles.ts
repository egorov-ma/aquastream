import React from 'react';

import { FadeInAnimation, ObjectFitMode } from './types';

/**
 * Возвращает стиль для режима отображения изображения
 * @param objectFit Режим отображения
 */
export function getObjectFitStyle(objectFit: ObjectFitMode): React.CSSProperties {
  return {
    objectFit,
  };
}

/**
 * Возвращает стиль для скругления углов
 * @param rounded Тип скругления
 */
export function getRoundedStyle(rounded: string): React.CSSProperties {
  const borderRadiusMap: Record<string, string> = {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  };

  return {
    borderRadius: borderRadiusMap[rounded] || borderRadiusMap.md,
  };
}

/**
 * Возвращает стиль для тени
 * @param shadow Тип тени
 */
export function getShadowStyle(shadow: string): React.CSSProperties {
  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  };

  return {
    boxShadow: shadowMap[shadow] || shadowMap.none,
  };
}

/**
 * Возвращает стиль для анимации
 * @param animation Тип анимации
 * @param duration Длительность анимации
 * @param isLoaded Флаг загрузки изображения
 */
export function getAnimationStyles(
  animation: FadeInAnimation,
  duration: number,
  isLoaded: boolean
): React.CSSProperties {
  const baseTransition = `opacity ${duration}ms ease-out`;

  switch (animation) {
    case 'none':
      return {};

    case 'zoom':
      return {
        transform: isLoaded ? 'scale(1)' : 'scale(1.1)',
        transition: `${baseTransition}, transform ${duration}ms ease-out`,
      };

    case 'blur':
      return {
        filter: isLoaded ? 'blur(0)' : 'blur(10px)',
        transition: `${baseTransition}, filter ${duration}ms ease-out`,
      };

    case 'slide-up':
      return {
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: `${baseTransition}, transform ${duration}ms ease-out`,
      };

    case 'fade':
    default:
      return {
        transition: baseTransition,
      };
  }
}

/**
 * Возвращает стиль для эффекта при наведении
 * @param effect Тип эффекта
 */
export function getHoverEffect(effect: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    transition: 'transform 300ms ease, filter 300ms ease',
  };

  switch (effect) {
    case 'zoom':
      return {
        ...baseStyle,
        '&:hover img': {
          transform: 'scale(1.1)',
        },
      };

    case 'brightness':
      return {
        ...baseStyle,
        '&:hover img': {
          filter: 'brightness(1.1)',
        },
      };

    case 'scale':
      return {
        ...baseStyle,
        '&:hover': {
          transform: 'scale(1.02)',
        },
      };

    case 'lift':
      return {
        ...baseStyle,
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      };

    case 'none':
    default:
      return {};
  }
}
