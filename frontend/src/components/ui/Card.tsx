import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  CardActions,
  CardHeader,
  CardProps as MuiCardProps,
} from '@mui/material';
import React from 'react';

/**
 * Интерфейс пропсов карточки
 */
export interface CustomCardProps extends MuiCardProps {
  /** Заголовок карточки */
  cardTitle?: string;
  /** Подзаголовок карточки */
  cardSubheader?: string;
  /** Аватар в заголовке карточки */
  cardAvatar?: React.ReactNode;
  /** Действие в заголовке карточки */
  cardAction?: React.ReactNode;
  /** URL изображения для медиа-контента */
  cardMedia?: string;
  /** Высота медиа-контента */
  cardMediaHeight?: number;
  /** Alt-текст для медиа-контента */
  cardMediaAlt?: string;
  /** Контент карточки */
  cardContent?: React.ReactNode;
  /** Действия карточки (кнопки и т.д.) */
  cardActions?: React.ReactNode;
}

/**
 * Карточка - компонент для отображения информации в карточном формате
 */
const Card: React.FC<CustomCardProps> = ({
  cardTitle,
  cardSubheader,
  cardAvatar,
  cardAction,
  cardMedia,
  cardMediaHeight = 140,
  cardMediaAlt = '',
  cardContent,
  cardActions,
  children,
  ...props
}) => {
  return (
    <MuiCard {...props}>
      {(cardTitle || cardSubheader || cardAvatar || cardAction) && (
        <CardHeader
          title={cardTitle}
          subheader={cardSubheader}
          avatar={cardAvatar}
          action={cardAction}
        />
      )}

      {cardMedia && (
        <CardMedia component="img" height={cardMediaHeight} image={cardMedia} alt={cardMediaAlt} />
      )}

      {cardContent && <CardContent>{cardContent}</CardContent>}

      {children}

      {cardActions && <CardActions>{cardActions}</CardActions>}
    </MuiCard>
  );
};

export default Card;
