import React from 'react';
import { Container, Grid, Box, Divider } from '@mui/material';
import { Button, TextField, Card, Typography } from '../components/ui';

/**
 * Демонстрационная страница компонентов UI-кита
 */
const UIKitDemo = () => {
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h2" gutterBottom align="center">
        AquaStream UI Kit
      </Typography>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Демонстрация типографики */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Типографика
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h1">H1: Заголовок первого уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h2">H2: Заголовок второго уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3">H3: Заголовок третьего уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4">H4: Заголовок четвертого уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5">H5: Заголовок пятого уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">H6: Заголовок шестого уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Subtitle1: Подзаголовок первого уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Subtitle2: Подзаголовок второго уровня</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              Body1: Основной текст. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">
              Body2: Дополнительный текст. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">Caption: Подпись</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="overline">OVERLINE: ТЕКСТ В ВЕРХНЕМ РЕГИСТРЕ</Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Демонстрация кнопок */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Кнопки
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Основные цвета</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary">
              Primary
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success">
              Success
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error">
              Error
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="warning">
              Warning
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="info">
              Info
            </Button>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>Варианты кнопок</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained">Contained</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined">Outlined</Button>
          </Grid>
          <Grid item>
            <Button variant="text">Text</Button>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>Размеры кнопок</Typography>
          </Grid>
          <Grid item>
            <Button size="small">Small</Button>
          </Grid>
          <Grid item>
            <Button size="medium">Medium</Button>
          </Grid>
          <Grid item>
            <Button size="large">Large</Button>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>Состояния кнопок</Typography>
          </Grid>
          <Grid item>
            <Button disabled>Disabled</Button>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Демонстрация текстовых полей */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Текстовые поля
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField label="Стандартное поле" placeholder="Введите текст" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="С подсказкой" helperText="Поле с подсказкой" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="С ошибкой" error helperText="Ошибка в поле" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Обязательное поле" required />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Отключенное поле" disabled />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Пароль" type="password" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Многострочное" multiline rows={4} />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Демонстрация карточек */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Карточки
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              variant="outlined"
              header={{
                title: "Карточка с заголовком",
                subheader: "Подзаголовок"
              }}
              media={{
                image: "https://source.unsplash.com/random/800x450?water",
                title: "Водный пейзаж"
              }}
              actions={
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', p: 1 }}>
                  <Button size="small" variant="text">Отмена</Button>
                  <Button size="small">Подтвердить</Button>
                </Box>
              }
            >
              <Typography variant="body2">
                Содержимое карточки с примером текста, который может быть любой длины и содержать любую информацию о сплавах по рекам.
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card
              variant="elevation"
              elevation={3}
              header={{
                title: "Карточка с тенью",
              }}
            >
              <Typography variant="body2">
                Карточка с эффектом поднятия (тени) для выделения важной информации.
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <Typography variant="h6" gutterBottom>
                Простая карточка
              </Typography>
              <Typography variant="body2">
                Минималистичная карточка без дополнительных элементов.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UIKitDemo; 