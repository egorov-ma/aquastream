import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'floating';
export type InputColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'success'
  | 'info';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Лейбл поля ввода */
  label?: string;
  /** Сообщение об ошибке */
  error?: string;
  /** Подсказка под полем ввода */
  helperText?: string;
  /** Вариант отображения */
  variant?: InputVariant;
  /** Цвет акцента */
  color?: InputColor;
  /** Размер поля ввода */
  size?: InputSize;
  /** Растягивать на всю ширину */
  fullWidth?: boolean;
  /** Иконка слева */
  leftIcon?: React.ReactNode;
  /** Иконка справа */
  rightIcon?: React.ReactNode;
  /** Дополнительный класс для обёртки */
  wrapperClassName?: string;
  /** Дополнительный класс для input */
  inputClassName?: string;
  /** Отображать кнопку очистки */
  clearable?: boolean;
  /** Обработчик очистки */
  onClear?: () => void;
  /** Эффект появления */
  appearEffect?: 'none' | 'fade' | 'slide' | 'scale';
}

