import { ButtonSize, ButtonVariant } from '@/components/ui/Button';
import { TypographyAlign, TypographyColor, TypographyVariant } from '@/components/ui/Typography';

/**
 * Общие типы для компонентов UI
 */

// Основные типы размеров
export type Size = 'sm' | 'md' | 'lg';

// Основные типы вариантов
export type Variant = 'primary' | 'secondary' | 'outlined' | 'outline' | 'text' | 'filled' | 'gradient';

// Основные типы цветов
export type Color =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'text-primary'
  | 'text-secondary'
  | 'default'
  | 'muted'
  | 'inherit';

// Типы выравнивания
export type Align = 'left' | 'center' | 'right' | 'justify' | 'inherit';

// Типы эффектов появления
export type AppearEffect = 'none' | 'fade' | 'slide' | 'scale';

// Типы эффектов наведения
export type HoverEffect = 'none' | 'lift' | 'pulse' | 'glow';

// Реэкспорт типов компонентов
export type { ButtonVariant, ButtonSize, TypographyAlign, TypographyColor, TypographyVariant };
