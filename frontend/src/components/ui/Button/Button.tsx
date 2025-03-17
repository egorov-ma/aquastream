import React, { forwardRef, ButtonHTMLAttributes } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Вариант кнопки
   */
  variant?: ButtonVariant;
  /**
   * Размер кнопки
   */
  size?: ButtonSize;
  /**
   * Флаг, растягивающий кнопку на всю ширину контейнера
   */
  fullWidth?: boolean;
  /**
   * Флаг, показывающий состояние загрузки
   */
  isLoading?: boolean;
  /**
   * Дополнительный класс
   */
  className?: string;
  /**
   * Флаг, делающий кнопку скругленной
   */
  rounded?: boolean;
  /**
   * Содержимое кнопки
   */
  children: React.ReactNode;
}

/**
 * Кнопка - основной компонент для действий пользователя
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      rounded = false,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      rounded ? styles.rounded : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || isLoading} {...props}>
        {isLoading ? (
          <span className={styles.loader}>
            <span className={styles.loaderDot}></span>
            <span className={styles.loaderDot}></span>
            <span className={styles.loaderDot}></span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
