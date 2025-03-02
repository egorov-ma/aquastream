import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, useMediaQuery } from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Typography } from '../ui';
import EventCard from './EventCard';
import { useTheme } from '@mui/material/styles';

// Мок данных для рекомендуемых мероприятий
const featuredEventsMock = [
  {
    id: 7,
    title: 'ВИП-сплав по реке Ангара',
    date: '2024-06-20',
    location: 'Байкал, река Ангара',
    description: 'Эксклюзивный сплав по живописной Ангаре с премиальным размещением и индивидуальным шеф-поваром. Наслаждайтесь красотами Байкала в максимальном комфорте.',
    imageUrl: 'https://images.unsplash.com/photo-1632853073412-782bf0279d65',
    totalSpots: 6,
    bookedSpots: 2,
    userParticipation: false
  },
  {
    id: 8,
    title: 'Экспедиция по рекам Камчатки',
    date: '2024-07-15',
    location: 'Камчатка, реки Быстрая и Авача',
    description: 'Уникальное путешествие по диким рекам Камчатки. Природа вулканов, термальные источники, наблюдение за дикими медведями и рыбалка на лосося.',
    imageUrl: 'https://images.unsplash.com/photo-1469125155630-7ed37e065743',
    totalSpots: 8,
    bookedSpots: 4,
    userParticipation: false
  },
  {
    id: 9,
    title: 'Рафтинг-тур для начинающих',
    date: '2024-05-30',
    location: 'Карелия, река Шуя',
    description: 'Идеальный выбор для тех, кто впервые пробует рафтинг. Безопасный маршрут, опытные инструкторы, красивые пейзажи и комфортные условия проживания.',
    imageUrl: 'https://images.unsplash.com/photo-1516544820488-4a99efa70a58',
    totalSpots: 20,
    bookedSpots: 5,
    userParticipation: false
  },
  {
    id: 10,
    title: 'Сап-борд экскурсия по Черному морю',
    date: '2024-08-10',
    location: 'Крым, Балаклава',
    description: 'Увлекательная прогулка на сап-бордах вдоль скалистых берегов Крыма и посещение скрытых пещер, доступных только с воды. Подходит для новичков.',
    imageUrl: 'https://images.unsplash.com/photo-1517176118179-65244903d13c',
    totalSpots: 12,
    bookedSpots: 8,
    userParticipation: false
  },
  {
    id: 11,
    title: 'Семейный сплав выходного дня',
    date: '2024-06-25',
    location: 'Алтай, река Катунь',
    description: 'Идеальное приключение для всей семьи! Безопасный маршрут, специальное детское снаряжение, анимация для детей и шашлыки на привале.',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
    totalSpots: 16,
    bookedSpots: 12,
    userParticipation: false
  }
];

const FeaturedEvents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const sliderRef = useRef(null);
  
  // Определение количества карточек для показа в зависимости от размера экрана
  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const totalSlides = events.length;
  const maxSlideIndex = totalSlides - slidesToShow;
  
  // Эффект для загрузки рекомендуемых мероприятий
  useEffect(() => {
    setLoading(true);
    
    // Имитация задержки загрузки
    const timer = setTimeout(() => {
      setEvents(featuredEventsMock);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Функции для управления слайдером
  const handlePrev = () => {
    setSlideIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setSlideIndex(prev => Math.min(maxSlideIndex, prev + 1));
  };
  
  // Текущие видимые мероприятия
  const visibleEvents = events.slice(slideIndex, slideIndex + slidesToShow);
  
  return (
    <Box sx={{ my: 6 }}>
      {/* Заголовок секции */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Рекомендуемые мероприятия
        </Typography>
        
        {/* Навигация слайдера */}
        {totalSlides > slidesToShow && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={handlePrev} 
              disabled={slideIndex === 0}
              size="small"
              sx={{ 
                color: 'primary.main',
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { backgroundColor: 'grey.100' },
                '&.Mui-disabled': { color: 'grey.300' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton 
              onClick={handleNext} 
              disabled={slideIndex >= maxSlideIndex}
              size="small"
              sx={{ 
                color: 'primary.main',
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { backgroundColor: 'grey.100' },
                '&.Mui-disabled': { color: 'grey.300' }
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      
      {/* Слайдер */}
      <Box
        ref={sliderRef}
        sx={{
          display: 'flex',
          gap: 3,
          transition: 'transform 0.5s ease',
          overflow: 'hidden',
          position: 'relative',
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            transform: `translateX(-${slideIndex * (100 / slidesToShow)}%)`,
            transition: 'transform 0.5s ease',
            width: `${(100 * totalSlides) / slidesToShow}%`
          }}
        >
          {events.map(event => (
            <Box 
              key={event.id} 
              sx={{ 
                width: `calc(${100 / totalSlides}% - ${(3 * (slidesToShow - 1)) / slidesToShow}px)`,
                flexShrink: 0
              }}
            >
              <EventCard event={event} loading={loading} />
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Индикаторы слайдов */}
      {totalSlides > slidesToShow && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
          {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
            <Box
              key={index}
              onClick={() => setSlideIndex(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === slideIndex ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: index === slideIndex ? 'primary.dark' : 'grey.400',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FeaturedEvents; 