import type { InputColor } from './Input.types';

export const inputColorStyles: Record<InputColor, { focus: string; text: string }> = {
  primary: {
    focus: 'focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
    text: 'text-primary-600 dark:text-primary-400',
  },
  secondary: {
    focus: 'focus:border-secondary-700 focus:ring-secondary-700 dark:focus:border-secondary-600 dark:focus:ring-secondary-600',
    text: 'text-secondary-800 dark:text-secondary-400',
  },
  accent: {
    focus: 'focus:border-accent-500 focus:ring-accent-500 dark:focus:border-accent-400 dark:focus:ring-accent-400',
    text: 'text-accent-600 dark:text-accent-400',
  },
  success: {
    focus: 'focus:border-success-500 focus:ring-success-500 dark:focus:border-success-400 dark:focus:ring-success-400',
    text: 'text-success-600 dark:text-success-400',
  },
  warning: {
    focus: 'focus:border-warning-500 focus:ring-warning-500 dark:focus:border-warning-400 dark:focus:ring-warning-400',
    text: 'text-warning-600 dark:text-warning-400',
  },
  info: {
    focus: 'focus:border-info-500 focus:ring-info-500 dark:focus:border-info-400 dark:focus:ring-info-400',
    text: 'text-info-600 dark:text-info-400',
  },
  error: {
    focus: 'focus:border-error-500 focus:ring-error-500 dark:focus:border-error-400 dark:focus:ring-error-400',
    text: 'text-error-600 dark:text-error-400',
  },
};

