// Переменные стилей для использования в компонентах

// Цветовая палитра в соответствии с дизайном
export const colors = {
  primary: '#00A8E8',  // основной цвет (бирюзово-синий)
  primaryLight: '#33B5EC',
  primaryDark: '#0086BA',
  
  secondary: '#FF6F3D',  // вторичный/акцентный цвет (оранжевый)
  secondaryLight: '#FF8F63',
  secondaryDark: '#E55A28',
  
  success: '#4CAF50',  // успех (зеленый)
  successLight: '#6FBF72',
  successDark: '#3D8C40',
  
  error: '#F44336',  // ошибка (красный)
  errorLight: '#F6685E',
  errorDark: '#D32F2F',
  
  warning: '#FF9800',  // предупреждение (оранжевый)
  warningLight: '#FFAC33',
  warningDark: '#E68900',
  
  grey50: '#FAFAFA',
  grey100: '#F7F7F7',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
  
  textPrimary: '#212121',   // основной текст
  textSecondary: '#666666', // вторичный текст
  textDisabled: '#9E9E9E',  // отключенный текст
  
  background: '#FFFFFF',    // основной фон
  backgroundPaper: '#F7F7F7', // фон карточек
  divider: '#E0E0E0',       // разделители
};

// Тени
export const shadows = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
  large: '0 8px 16px rgba(0, 0, 0, 0.1)',
};

// Скругления
export const borderRadius = {
  small: '4px',
  medium: '6px',
  large: '8px',
  extraLarge: '12px',
  pill: '24px',
};

// Размеры шрифтов
export const fontSize = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '24px',
  xxl: '32px',
};

// Толщина шрифта
export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

// Межсимвольный интервал
export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

// Отступы
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Переходы/анимации
export const transitions = {
  quick: 'all 0.15s ease',
  default: 'all 0.3s ease',
  slow: 'all 0.5s ease',
};

// Другие переменные
export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
}; 