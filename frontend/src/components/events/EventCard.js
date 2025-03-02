import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia, 
  Box, 
  Chip, 
  LinearProgress,
  useTheme,
  Tooltip,
  Skeleton
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon, 
  LocationOn as LocationIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Typography, Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

// Компонент-скелетон для загрузки
export const EventCardSkeleton = () => (
  <Card sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%',
    boxShadow: 3,
    transition: 'transform 0.3s, box-shadow 0.3s', 
  }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent sx={{ flexGrow: 1, pb: 0 }}>
      <Skeleton variant="text" height={24} width="80%" animation="wave" />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Skeleton variant="circular" width={20} height={20} animation="wave" />
        <Skeleton variant="text" height={20} width="60%" sx={{ ml: 1 }} animation="wave" />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Skeleton variant="circular" width={20} height={20} animation="wave" />
        <Skeleton variant="text" height={20} width="70%" sx={{ ml: 1 }} animation="wave" />
      </Box>
      <Skeleton variant="text" height={80} animation="wave" sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" height={8} width="100%" animation="wave" sx={{ mt: 2 }} />
    </CardContent>
    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
      <Skeleton variant="rectangular" height={36} width={100} animation="wave" />
      <Skeleton variant="rectangular" height={36} width={120} animation="wave" />
    </CardActions>
  </Card>
);

const EventCard = ({ event, loading }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  if (loading) {
    return <EventCardSkeleton />;
  }
  
  const { 
    id, 
    title, 
    date, 
    location, 
    description, 
    imageUrl, 
    totalSpots, 
    bookedSpots,
    userParticipation 
  } = event;
  
  // Расчет процента заполненности
  const occupancyPercent = (bookedSpots / totalSpots) * 100;
  
  // Определение цвета индикатора заполненности
  let occupancyColor = theme.palette.success.main;
  if (occupancyPercent > 70) {
    occupancyColor = theme.palette.warning.main;
  }
  if (occupancyPercent > 90) {
    occupancyColor = theme.palette.error.main;
  }
  
  // Проверка участия пользователя
  const isParticipating = userParticipation && user;
  
  // Проверка доступности мест
  const isFull = bookedSpots >= totalSpots;
  
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      boxShadow: 3,
      transition: 'transform 0.3s, box-shadow 0.3s', 
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: 6,
      }
    }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl || 'https://source.unsplash.com/random?river'}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
        <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CalendarIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {date}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <LocationIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2, minHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {description}
        </Typography>
        
        <Box sx={{ mt: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon fontSize="small" sx={{ color: occupancyColor, mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {bookedSpots} из {totalSpots} мест
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {occupancyPercent.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={occupancyPercent} 
            sx={{ 
              height: 8, 
              borderRadius: 1,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: occupancyColor,
              }
            }}
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button
          component={Link}
          to={`/events/${id}`}
          variant="outlined"
          color="primary"
          size="small"
        >
          Подробнее
        </Button>
        
        {isParticipating ? (
          <Tooltip title="Вы участвуете в этом мероприятии">
            <Chip 
              label="Вы записаны" 
              color="success" 
              variant="filled"
            />
          </Tooltip>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={isFull}
            component={user ? Link : 'button'}
            to={user ? `/events/${id}/book` : undefined}
            onClick={!user ? () => window.location.href = '/login' : undefined}
          >
            {isFull ? 'Мест нет' : 'Записаться'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default EventCard; 