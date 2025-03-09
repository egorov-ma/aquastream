import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import theme from '../../theme/theme';

export default {
  title: 'Theme/Colors',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

// Компонент для отображения образца цвета
const ColorSwatch = ({ colorName, colorValue, textColor = '#fff' }) => (
  <Paper
    elevation={2}
    sx={{
      bgcolor: colorValue,
      width: '100%',
      p: 2,
      mb: 2,
      borderRadius: 1,
    }}
  >
    <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 'bold' }}>
      {colorName}
    </Typography>
    <Typography variant="body2" sx={{ color: textColor }}>
      {colorValue}
    </Typography>
  </Paper>
);

// История для основной палитры цветов
export const PrimaryColors = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Основная палитра цветов
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Primary Main" colorValue={theme.palette.primary.main} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Primary Light" colorValue={theme.palette.primary.light} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Primary Dark" colorValue={theme.palette.primary.dark} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Secondary Main" colorValue={theme.palette.secondary.main} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Secondary Light" colorValue={theme.palette.secondary.light} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Secondary Dark" colorValue={theme.palette.secondary.dark} />
      </Grid>
    </Grid>
  </Box>
);

// История для цветов состояний
export const StateColors = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Цвета состояний
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Success Main" colorValue={theme.palette.success.main} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Error Main" colorValue={theme.palette.error.main} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Warning Main" colorValue={theme.palette.warning.main} textColor="#000" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ColorSwatch colorName="Info Main" colorValue={theme.palette.info.main} />
      </Grid>
    </Grid>
  </Box>
);

// История для серых оттенков
export const GreyShades = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Оттенки серого
    </Typography>
    <Grid container spacing={2}>
      {Object.entries(theme.palette.grey).map(([key, value]) => (
        <Grid item xs={12} sm={6} md={3} key={key}>
          <ColorSwatch 
            colorName={`Grey ${key}`} 
            colorValue={value} 
            textColor={parseInt(key) > 500 ? '#fff' : '#000'} 
          />
        </Grid>
      ))}
    </Grid>
  </Box>
); 