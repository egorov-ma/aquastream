import React from 'react';
import { Button as MuiButton } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Кнопка - основной компонент для действий пользователя
 */
const Button = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  children,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

Button.propTypes = {
  /** Вариант кнопки */
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  /** Цвет кнопки */
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  /** Размер кнопки */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Растягивать на всю ширину контейнера */
  fullWidth: PropTypes.bool,
  /** Отключена ли кнопка */
  disabled: PropTypes.bool,
  /** Иконка в начале */
  startIcon: PropTypes.node,
  /** Иконка в конце */
  endIcon: PropTypes.node,
  /** Обработчик клика */
  onClick: PropTypes.func,
  /** Содержимое кнопки */
  children: PropTypes.node.isRequired,
};

export default Button; 