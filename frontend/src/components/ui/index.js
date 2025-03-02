import React from 'react';
import { 
  Typography as MuiTypography, 
  Button as MuiButton, 
  TextField as MuiTextField,
  Card as MuiCard,
  CardContent as MuiCardContent,
  CardActions as MuiCardActions,
  CardMedia as MuiCardMedia,
  styled
} from '@mui/material';

// Стилизованные компоненты с применением тем и требований дизайн-системы

// Типография
export const Typography = styled(MuiTypography)(({ theme, color, fontSize }) => ({
  fontFamily: theme.typography.fontFamily,
  ...(color === 'white' && {
    color: '#FFFFFF',
  }),
}));

// Кнопка
export const Button = styled(MuiButton)(({ theme, size, variant }) => ({
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: variant === 'contained' ? theme.shadows[2] : 'none',
  borderRadius: '8px',
  padding: size === 'large' ? '10px 24px' : '8px 16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: variant === 'contained' ? theme.shadows[4] : 'none',
    transform: 'translateY(-2px)'
  }
}));

// Текстовое поле
export const TextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
  }
}));

// Карточка
export const Card = styled(MuiCard)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  }
}));

export const CardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const CardActions = styled(MuiCardActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
}));

export const CardMedia = styled(MuiCardMedia)(({ theme }) => ({
  borderTopLeftRadius: '12px', 
  borderTopRightRadius: '12px'
}));

// Другие компоненты UI можно добавить по мере необходимости 