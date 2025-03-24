import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Вариант стиля кнопки
   */
  variant?: ButtonVariant;

  /**
   * Размер кнопки
   */
  size?: ButtonSize;

  /**
   * Растянуть кнопку на всю ширину контейнера
   */
  fullWidth?: boolean;
}
