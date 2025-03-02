import React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Текстовое поле для ввода информации
 */
const TextField = ({
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
  type = 'text',
  value,
  onChange,
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
      type={type}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

TextField.propTypes = {
  /** Вариант отображения */
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  /** Цвет */
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  /** Размер */
  size: PropTypes.oneOf(['small', 'medium']),
  /** Растягивать на всю ширину контейнера */
  fullWidth: PropTypes.bool,
  /** Обязательное поле */
  required: PropTypes.bool,
  /** Отключено ли поле */
  disabled: PropTypes.bool,
  /** Наличие ошибки */
  error: PropTypes.bool,
  /** Текст-подсказка под полем */
  helperText: PropTypes.string,
  /** Метка поля */
  label: PropTypes.string,
  /** Плейсхолдер */
  placeholder: PropTypes.string,
  /** Тип поля ввода */
  type: PropTypes.string,
  /** Значение поля */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Обработчик изменения */
  onChange: PropTypes.func,
};

export default TextField; 