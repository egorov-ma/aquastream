import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Метка поля ввода
   */
  label?: string;
  /**
   * Сообщение об ошибке
   */
  error?: string;
  /**
   * Флаг, растягивающий поле на всю ширину контейнера
   */
  fullWidth?: boolean;
  /**
   * Дополнительный класс
   */
  className?: string;
  /**
   * Иконка для отображения внутри поля
   */
  icon?: React.ReactNode;
  /**
   * Позиция иконки (слева или справа)
   */
  iconPosition?: 'left' | 'right';
}

/**
 * Компонент поля ввода для использования во всем приложении
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    fullWidth = false, 
    className = '', 
    icon, 
    iconPosition = 'right',
    ...props 
  }, ref) => {
    return (
      <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          {icon && iconPosition === 'left' && (
            <span className={`${styles.icon} ${styles.iconLeft}`}>{icon}</span>
          )}
          <input
            ref={ref}
            className={`
              ${styles.input} 
              ${error ? styles.error : ''} 
              ${icon ? (iconPosition === 'left' ? styles.withIconLeft : styles.withIconRight) : ''}
              ${className}
            `}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className={`${styles.icon} ${styles.iconRight}`}>{icon}</span>
          )}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input'; 