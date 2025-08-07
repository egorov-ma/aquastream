import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

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

  /**
   * Показать состояние загрузки
   */
  loading?: boolean;
}
