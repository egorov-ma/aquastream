import { clsx, type ClassValue } from 'clsx';

/**
 * Объединяет классы с помощью clsx
 * Использует clsx для обработки условных классов
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
