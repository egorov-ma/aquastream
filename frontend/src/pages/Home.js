import React from 'react';
import { Box, Container, Grid, Paper } from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FeaturedEvents from '../components/events/FeaturedEvents';
import EventCatalog from '../components/events/EventCatalog';
import { Typography, Button } from '../components/ui';
import heroImage from '../assets/images/hero.jpg';

const Home = () => {
  return (
    <>
      <Header />
      
      {/* Hero секция */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography
                variant="h1"
                color="white"
                fontWeight="bold"
                mb={2}
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                Исследуйте Россию с AquaStream
              </Typography>
              
              <Typography
                variant="h5"
                color="white"
                mb={4}
                sx={{
                  fontWeight: 400,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  maxWidth: '800px',
                  mx: 'auto'
                }}
              >
                Эксклюзивные сплавы по самым живописным рекам страны. 
                Незабываемые приключения и впечатления для любителей активного отдыха.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                component="a"
                href="#catalog"
                sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
              >
                Исследовать направления
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component="a"
                href="/about"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white',
                  }
                }}
              >
                О компании
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        {/* Рекомендуемые мероприятия */}
        <FeaturedEvents />
        
        {/* Секция каталога */}
        <Box id="catalog" sx={{ pt: 4 }}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, bgcolor: 'background.default' }}>
            <EventCatalog />
          </Paper>
        </Box>
      </Container>
      
      {/* О нас секция */}
      <Box sx={{ bgcolor: 'primary.lightest', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                Почему выбирают AquaStream?
              </Typography>
              
              <Typography variant="body1" paragraph>
                Мы специализируемся на организации водных путешествий по России уже более 10 лет. 
                За это время мы разработали десятки уникальных маршрутов и помогли тысячам людей 
                открыть для себя красоту российских рек и озер.
              </Typography>
              
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Безопасность:</strong> Все маршруты разработаны с учетом требований безопасности, 
                    а инструкторы обладают многолетним опытом и необходимыми сертификатами.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Разнообразие:</strong> От спокойных семейных сплавов до экстремальных рафтинг-туров — 
                    у нас есть маршруты для любого уровня подготовки.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Комфорт:</strong> Качественное снаряжение, продуманная логистика и внимание к деталям — 
                    мы заботимся о вашем комфорте даже в дикой природе.
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                component="a"
                href="/about"
                sx={{ mt: 2 }}
              >
                Узнать больше
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1517214989859-7fc24871b743"
                alt="Рафтинг команда AquaStream"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 10
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Footer />
    </>
  );
};

export default Home; 