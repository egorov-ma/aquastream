import React from 'react';
import { Grid, Box, Alert } from '@mui/material';
import EventCard from './EventCard';
import EventCardSkeleton from './EventCardSkeleton';
import { Typography } from '../ui';

const EventsList = ({ 
  events, 
  isLoading, 
  error, 
  isAuthenticated,
  userParticipation = {} // Объект с id мероприятий в качестве ключей и статусами в качестве значений
}) => {
  // Если загрузка
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <EventCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }
  
  // Если ошибка
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Произошла ошибка при загрузке мероприятий: {error}
      </Alert>
    );
  }
  
  // Если нет мероприятий
  if (!events || events.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 5,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Мероприятия не найдены
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Попробуйте изменить параметры поиска или вернитесь позже
        </Typography>
      </Box>
    );
  }
  
  // Отображаем список мероприятий
  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} key={event.id}>
          <EventCard 
            event={event} 
            isAuthenticated={isAuthenticated}
            userStatus={userParticipation[event.id]} 
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default EventsList; 