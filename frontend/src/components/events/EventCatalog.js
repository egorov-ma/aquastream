import React, { useState, useEffect } from 'react';
import { Box, Grid, Alert, CircularProgress, Pagination, useMediaQuery } from '@mui/material';
import { Typography } from '../ui';
import EventCard, { EventCardSkeleton } from './EventCard';
import EventFilters from './EventFilters';
import { useTheme } from '@mui/material/styles';

// Мок регионов для фильтров
const REGIONS = [
  'Алтай', 
  'Карелия', 
  'Кавказ', 
  'Урал', 
  'Сибирь', 
  'Камчатка', 
  'Байкал', 
  'Крым'
];

// Мок данных для тестирования
const mockEvents = [
  {
    id: 1,
    title: 'Сплав по реке Катунь',
    date: '2024-06-15',
    location: 'Алтай, река Катунь',
    description: 'Трехдневный сплав по реке Катунь с опытными инструкторами. Живописные пейзажи, пороги разной сложности, ночевки в палатках на берегу.',
    imageUrl: 'https://images.unsplash.com/photo-1626519464786-85cdb0bea1e2',
    totalSpots: 15,
    bookedSpots: 8,
    userParticipation: false
  },
  {
    id: 2,
    title: 'Байдарочный поход по Ладожским шхерам',
    date: '2024-07-10',
    location: 'Карелия, Ладожское озеро',
    description: 'Путешествие на байдарках по заливам Ладожского озера. Гранитные острова, сосновые леса и чистейшая вода.',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    totalSpots: 12,
    bookedSpots: 10,
    userParticipation: false
  },
  {
    id: 3,
    title: 'Рафтинг по реке Белая',
    date: '2024-05-25',
    location: 'Кавказ, река Белая',
    description: 'Активный рафтинг по горной реке Белая. Захватывающие моменты преодоления порогов категории 3-4, потрясающие виды кавказских гор.',
    imageUrl: 'https://images.unsplash.com/photo-1496545672447-f699b503d270',
    totalSpots: 20,
    bookedSpots: 18,
    userParticipation: true
  },
  {
    id: 4,
    title: 'Сплав по реке Чусовая',
    date: '2024-06-05',
    location: 'Урал, река Чусовая',
    description: 'Пятидневный сплав по одной из самых живописных рек Урала. Скалы-бойцы, изумрудная тайга, исторические достопримечательности.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-92ab472cad5d',
    totalSpots: 15,
    bookedSpots: 7,
    userParticipation: false
  },
  {
    id: 5,
    title: 'Сплав по реке Бия с рыбалкой',
    date: '2024-08-20',
    location: 'Алтай, река Бия',
    description: 'Комбинированный тур: спокойный сплав и рыбалка на хариуса. Идеально для начинающих любителей активного отдыха и рыбной ловли.',
    imageUrl: 'https://images.unsplash.com/photo-1563299796-17596ed6b017',
    totalSpots: 10,
    bookedSpots: 4,
    userParticipation: false
  },
  {
    id: 6,
    title: 'Морской каякинг в Тихой бухте',
    date: '2024-09-05',
    location: 'Крым, Тихая бухта',
    description: 'Однодневный тур по морским пещерам и гротам на каяках. Купание в чистейшей воде, исследование недоступных с берега мест.',
    imageUrl: 'https://images.unsplash.com/photo-1519309621146-2a47d1f7103a',
    totalSpots: 8,
    bookedSpots: 8,
    userParticipation: false
  }
];

const EventCatalog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    query: '',
    dateFrom: '',
    dateTo: '',
    regions: [],
    hasAvailableSpots: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 1,
    perPage: 6
  });
  const [error, setError] = useState(null);

  // Эффект для имитации загрузки данных с сервера
  useEffect(() => {
    setLoading(true);
    
    // Имитация задержки сети
    const timer = setTimeout(() => {
      try {
        // В реальном приложении здесь был бы запрос к API
        setEvents(mockEvents);
        setLoading(false);
      } catch (err) {
        setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Эффект для фильтрации мероприятий
  useEffect(() => {
    if (events.length) {
      let result = [...events];
      
      // Фильтрация по поисковому запросу
      if (filters.query) {
        const query = filters.query.toLowerCase();
        result = result.filter(event => 
          event.title.toLowerCase().includes(query) || 
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
        );
      }
      
      // Фильтрация по дате начала
      if (filters.dateFrom) {
        result = result.filter(event => new Date(event.date) >= new Date(filters.dateFrom));
      }
      
      // Фильтрация по дате окончания
      if (filters.dateTo) {
        result = result.filter(event => new Date(event.date) <= new Date(filters.dateTo));
      }
      
      // Фильтрация по регионам
      if (filters.regions.length > 0) {
        result = result.filter(event => 
          filters.regions.some(region => event.location.includes(region))
        );
      }
      
      // Фильтрация по наличию свободных мест
      if (filters.hasAvailableSpots) {
        result = result.filter(event => event.bookedSpots < event.totalSpots);
      }
      
      // Обновление результатов и пагинации
      setFilteredEvents(result);
      setPagination(prev => ({
        ...prev,
        total: Math.ceil(result.length / prev.perPage),
        page: 1 // Сбрасываем на первую страницу при изменении фильтров
      }));
    }
  }, [filters, events]);

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Обработчик изменения страницы пагинации
  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
    // Прокрутка к началу результатов
    window.scrollTo({ top: document.getElementById('results-top').offsetTop - 100, behavior: 'smooth' });
  };

  // Получение мероприятий для текущей страницы
  const getCurrentPageEvents = () => {
    const startIndex = (pagination.page - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;
    return filteredEvents.slice(startIndex, endIndex);
  };

  return (
    <Box>
      {/* Фильтры */}
      <EventFilters 
        onFilterChange={handleFilterChange}
        activeFilters={filters}
        regions={REGIONS}
      />
      
      {/* Индикатор загрузки или ошибка */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
      ) : (
        <>
          {/* Заголовок и количество результатов */}
          <Box id="results-top" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              Каталог мероприятий
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Найдено: {filteredEvents.length}
            </Typography>
          </Box>
          
          {/* Результаты поиска */}
          {filteredEvents.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {getCurrentPageEvents().map(event => (
                  <Grid item xs={12} sm={6} key={event.id}>
                    <EventCard event={event} />
                  </Grid>
                ))}
              </Grid>
              
              {/* Пагинация */}
              {pagination.total > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={pagination.total} 
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ my: 4 }}>
              По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.
            </Alert>
          )}
        </>
      )}
      
      {/* Скелетон для загрузки */}
      {loading && (
        <Grid container spacing={3}>
          {Array.from(new Array(pagination.perPage)).map((_, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <EventCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EventCatalog; 