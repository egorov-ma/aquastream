import React from 'react';
import { 
  TextField as MuiTextField, 
  TextFieldProps as MuiTextFieldProps,
  InputAdornment 
} from '@mui/material';

/**
 * Расширенный интерфейс пропсов TextField
 */
export interface CustomTextFieldProps {
  /** Иконка в начале поля ввода */
  startIcon?: React.ReactNode;
  /** Иконка в конце поля ввода */
  endIcon?: React.ReactNode;
  /** Вариант отображения */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Цвет */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /** Размер */
  size?: 'small' | 'medium';
  /** Растягивать на всю ширину контейнера */
  fullWidth?: boolean;
  /** Обязательное поле */
  required?: boolean;
  /** Отключено ли поле */
  disabled?: boolean;
  /** Наличие ошибки */
  error?: boolean;
  /** Текст-подсказка под полем */
  helperText?: React.ReactNode;
  /** Метка поля */
  label?: string;
  /** Плейсхолдер */
  placeholder?: string;
  /** Значение поля */
  value?: unknown;
  /** Обработчик изменения */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Дополнительные свойства для InputProps */
  InputProps?: MuiTextFieldProps['InputProps'];
  [key: string]: any;
}

/**
 * Текстовое поле - компонент для ввода текста
 */
const TextField: React.FC<CustomTextFieldProps> = ({
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  fullWidth = true,
  required = false,
  disabled = false,
  error = false,
  helperText,
  label,
  placeholder,
  value,
  onChange,
  startIcon,
  endIcon,
  InputProps = {},
  ...props
}) => {
  return (
    <MuiTextField
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      InputProps={{
        ...InputProps,
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : InputProps.startAdornment,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : InputProps.endAdornment,
      }}
      {...props}
    />
  );
};

export default TextField; 