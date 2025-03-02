import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Typography, Button } from '../ui';

const EventSlider = ({ events = [] }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Функции для переключения слайдов
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  // Автоматическое переключение слайдов
  useEffect(() => {
    let interval;
    if (autoplay && events.length > 1) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay, events.length, activeSlide]);

  // Приостанавливаем автоматическое переключение при наведении
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  // Если нет событий для показа
  if (!events.length) return null;

  const currentEvent = events[activeSlide];

  return (
    <Box 
      sx={{ 
        position: 'relative',
        mb: 4,
        height: isMobile ? 300 : 500,
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Фоновое изображение */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${currentEvent.imageUrl || 'https://source.unsplash.com/random/1200x800?nature,water'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)'
          },
          transition: 'all 0.5s ease'
        }}
      />

      {/* Содержимое слайда */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          color: 'white',
          zIndex: 2
        }}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h3'} 
          sx={{ 
            color: 'white', 
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {currentEvent.title}
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2, 
            maxWidth: '800px',
            display: { xs: 'none', sm: 'block' },
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {currentEvent.description.length > 200 
            ? `${currentEvent.description.substring(0, 200)}...` 
            : currentEvent.description}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          component={Link}
          to={`/events/${currentEvent.id}`}
          sx={{ 
            mt: 1,
            px: 3, 
            py: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Подробнее
        </Button>
      </Box>

      {/* Индикаторы слайдов */}
      {events.length > 1 && (
        <Box 
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            zIndex: 2
          }}
        >
          {events.map((_, index) => (
            <Box
              key={index}
              onClick={() => setActiveSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === activeSlide ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}

      {/* Стрелки навигации - отображаем только если слайдов больше одного */}
      {events.length > 1 && (
        <>
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)'
              },
              zIndex: 2,
              display: { xs: 'none', md: 'flex' }
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          
          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)'
              },
              zIndex: 2,
              display: { xs: 'none', md: 'flex' }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default EventSlider; 