import clsx from 'clsx';
import React from 'react';

// Типы для типографики
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle-1'
  | 'subtitle-2'
  | 'body-1'
  | 'body-2'
  | 'caption'
  | 'button'
  | 'overline';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'text-primary'
  | 'text-secondary'
  | 'inherit';

export type TypographyAlign = 'inherit' | 'left' | 'center' | 'right' | 'justify';

/**
 * Интерфейс пропсов Typography
 */
export interface TypographyProps {
  /** Вариант типографики */
  variant?: TypographyVariant;
  /** Цвет текста */
  color?: TypographyColor;
  /** Выравнивание текста */
  align?: TypographyAlign;
  /** Дополнительные классы */
  className?: string;
  /** HTML тег, используемый для рендеринга */
  component?: React.ElementType;
  /** Содержимое компонента */
  children: React.ReactNode;
}

/**
 * Типографика - компонент для отображения текста с использованием Tailwind CSS
 */
const Typography: React.FC<TypographyProps> = ({
  variant = 'body-1',
  color = 'inherit',
  align = 'inherit',
  className = '',
  component,
  children,
  ...props
}) => {
  // Маппинг вариантов к классам Tailwind
  const variantClasses = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-bold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    'subtitle-1': 'text-lg font-medium',
    'subtitle-2': 'text-base font-medium',
    'body-1': 'text-base',
    'body-2': 'text-sm',
    caption: 'text-xs',
    button: 'text-sm font-medium',
    overline: 'text-xs font-medium uppercase tracking-wider',
  };

  // Маппинг цветов к классам Tailwind
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-800 dark:text-secondary-400',
    accent: 'text-accent-600 dark:text-accent-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    'text-primary': 'text-secondary-900 dark:text-white',
    'text-secondary': 'text-secondary-700 dark:text-secondary-300',
    inherit: '',
  };

  // Маппинг выравнивания к классам Tailwind
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
    inherit: '',
  };

  // Объединение всех классов
  const classes = clsx(
    variantClasses[variant],
    colorClasses[color],
    alignClasses[align === 'inherit' ? 'inherit' : align],
    className
  );

  // Выбор компонента в зависимости от варианта, если не указан явно
  const Component =
    component ||
    (variant === 'h1'
      ? 'h1'
      : variant === 'h2'
        ? 'h2'
        : variant === 'h3'
          ? 'h3'
          : variant === 'h4'
            ? 'h4'
            : variant === 'h5'
              ? 'h5'
              : variant === 'h6'
                ? 'h6'
                : 'p');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Typography;
