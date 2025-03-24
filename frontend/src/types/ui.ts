import {
  ButtonAppearEffect,
  ButtonHoverEffect,
  ButtonSize,
  ButtonVariant,
} from '@/components/ui/Button/Button';
import { TextFieldColor, TextFieldSize, TextFieldVariant } from '@/components/ui/TextField';
import { TypographyAlign, TypographyColor, TypographyVariant } from '@/components/ui/Typography';

/**
 * Общие типы для компонентов UI
 */

// Основные типы размеров
export type Size = 'sm' | 'md' | 'lg';

// Основные типы вариантов
export type Variant = 'primary' | 'secondary' | 'outlined' | 'text' | 'filled' | 'gradient';

// Основные типы цветов
export type Color =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'text-primary'
  | 'text-secondary'
  | 'inherit';

// Типы выравнивания
export type Align = 'left' | 'center' | 'right' | 'justify' | 'inherit';

// Типы эффектов появления
export type AppearEffect = 'none' | 'fade' | 'slide' | 'scale';

// Типы эффектов наведения
export type HoverEffect = 'none' | 'lift' | 'pulse' | 'glow';

// Реэкспорт типов компонентов
export type {
  ButtonVariant,
  ButtonSize,
  ButtonHoverEffect,
  ButtonAppearEffect,
  TextFieldColor,
  TextFieldSize,
  TextFieldVariant,
  TypographyAlign,
  TypographyColor,
  TypographyVariant,
};
