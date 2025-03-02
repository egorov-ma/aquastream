import React from 'react';
import { Typography as MuiTypography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Компонент для отображения текста с разными стилями
 */
const Typography = ({
  variant = 'body1',
  component,
  color = 'textPrimary',
  align = 'inherit',
  gutterBottom = false,
  noWrap = false,
  children,
  ...props
}) => {
  return (
    <MuiTypography
      variant={variant}
      component={component}
      color={color}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      {...props}
    >
      {children}
    </MuiTypography>
  );
};

Typography.propTypes = {
  /** Вариант типографики */
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2',
    'body1', 'body2',
    'caption', 'button', 'overline'
  ]),
  /** HTML-элемент, который будет использован */
  component: PropTypes.elementType,
  /** Цвет текста */
  color: PropTypes.oneOfType([
    PropTypes.oneOf([
      'initial',
      'inherit',
      'primary',
      'secondary',
      'textPrimary',
      'textSecondary',
      'error'
    ]),
    PropTypes.string
  ]),
  /** Выравнивание текста */
  align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']),
  /** Добавляет отступ снизу */
  gutterBottom: PropTypes.bool,
  /** Текст в одну строку с многоточием при переполнении */
  noWrap: PropTypes.bool,
  /** Содержимое компонента */
  children: PropTypes.node,
};

export default Typography; 