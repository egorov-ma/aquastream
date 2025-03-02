import React from 'react';
import { Card as MuiCard, CardContent, CardActions, CardMedia, CardHeader } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Карточка для отображения информации
 */
const Card = ({
  variant = 'outlined',
  elevation = 1,
  header,
  headerProps = {},
  media,
  mediaProps = {},
  children,
  actions,
  ...props
}) => {
  return (
    <MuiCard variant={variant} elevation={elevation} {...props}>
      {header && <CardHeader {...headerProps} {...header} />}
      
      {media && (
        <CardMedia
          component="img"
          height="140"
          {...mediaProps}
          {...media}
        />
      )}
      
      <CardContent>{children}</CardContent>
      
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};

Card.propTypes = {
  /** Вариант отображения */
  variant: PropTypes.oneOf(['outlined', 'elevation']),
  /** Величина тени (только для elevation) */
  elevation: PropTypes.number,
  /** Данные для заголовка карточки */
  header: PropTypes.shape({
    title: PropTypes.node,
    subheader: PropTypes.node,
    avatar: PropTypes.node,
    action: PropTypes.node,
  }),
  /** Дополнительные свойства для CardHeader */
  headerProps: PropTypes.object,
  /** Данные для медиа-контента */
  media: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
  }),
  /** Дополнительные свойства для CardMedia */
  mediaProps: PropTypes.object,
  /** Основное содержимое карточки */
  children: PropTypes.node,
  /** Действия карточки (кнопки и т.п.) */
  actions: PropTypes.node,
};

export default Card; 