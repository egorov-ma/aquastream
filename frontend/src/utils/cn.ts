import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет Tailwind CSS классы с помощью clsx и tailwind-merge
 * @param inputs Классы, которые нужно объединить
 * @returns Строка с объединенными CSS классами
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
