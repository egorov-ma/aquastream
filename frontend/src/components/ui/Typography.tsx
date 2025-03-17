import React from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';

/**
 * Расширенный интерфейс пропсов Typography
 */
export interface CustomTypographyProps extends Omit<MuiTypographyProps, 'color'> {
  /** Вариант типографики */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  /** Цвет текста */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'textPrimary' | 'textSecondary' | 'inherit';
  /** Выравнивание текста */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  /** Содержимое компонента */
  children: React.ReactNode;
}

/**
 * Типографика - компонент для отображения текста
 */
const Typography: React.FC<CustomTypographyProps> = ({
  variant = 'body1',
  color = 'inherit',
  align = 'inherit',
  children,
  ...props
}) => {
  return (
    <MuiTypography
      variant={variant}
      color={color}
      align={align}
      {...props}
    >
      {children}
    </MuiTypography>
  );
};

export default Typography; 