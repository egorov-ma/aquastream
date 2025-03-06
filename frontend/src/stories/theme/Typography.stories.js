import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';
import theme from '../../theme/theme';

export default {
  title: 'Theme/Typography',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

// Компонент для отображения образца типографики
const TypographySample = ({ variant, description }) => {
  // Получение свойств текущего варианта из темы
  const variantStyles = theme.typography[variant];
  const fontPropertiesString = Object.entries(variantStyles)
    .filter(([key]) => !['fontFamily'].includes(key))
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 1 }}>
      <Typography variant={variant} gutterBottom>
        {variant}: Пример текста на русском языке
      </Typography>
      <Box sx={{ pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
        <Typography variant="body2" color="text.secondary">
          {description || variant}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          {fontPropertiesString}
        </Typography>
      </Box>
    </Paper>
  );
};

// История для всех вариантов типографики
export const AllVariants = () => (
  <Box>
    <Typography variant="h2" gutterBottom>
      Варианты типографики
    </Typography>
    
    <Divider sx={{ mb: 3 }} />
    
    <TypographySample 
      variant="h1" 
      description="Главный заголовок. Используется для основного заголовка страницы." 
    />
    
    <TypographySample 
      variant="h2" 
      description="Подзаголовок. Используется для разделов страницы."
    />
    
    <TypographySample 
      variant="h3" 
      description="Заголовок раздела. Используется для основных разделов содержимого."
    />
    
    <TypographySample 
      variant="h4" 
      description="Заголовок подраздела. Используется для подразделов содержимого."
    />
    
    <TypographySample 
      variant="h5" 
      description="Мелкий заголовок. Используется для небольших разделов и карточек."
    />
    
    <TypographySample 
      variant="h6" 
      description="Заголовок для элементов интерфейса."
    />
    
    <TypographySample 
      variant="subtitle1" 
      description="Подзаголовок 1. Используется для акцентирования информации."
    />
    
    <TypographySample 
      variant="subtitle2" 
      description="Подзаголовок 2. Более мелкий подзаголовок."
    />
    
    <TypographySample 
      variant="body1" 
      description="Основной текст. Используется для большинства текстового содержимого."
    />
    
    <TypographySample 
      variant="body2" 
      description="Дополнительный текст. Используется для второстепенного содержимого."
    />
    
    <TypographySample 
      variant="button" 
      description="Текст для кнопок. Обычно отображается в верхнем регистре."
    />
    
    <TypographySample 
      variant="caption" 
      description="Мелкий текст. Используется для подписей и пояснений."
    />
    
    <TypographySample 
      variant="overline" 
      description="Надстрочный текст. Обычно используется для меток и заголовков разделов."
    />
  </Box>
); 