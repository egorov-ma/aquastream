import React from 'react';
import { Skeleton, Box, Card as MuiCard, CardContent, CardActions } from '@mui/material';

const EventCardSkeleton = () => {
  return (
    <MuiCard variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Заглушка для изображения */}
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={200} 
        animation="wave" 
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Заголовок */}
        <Skeleton variant="text" height={32} width="80%" animation="wave" sx={{ mb: 1 }} />
        
        {/* Дата */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={20} height={20} animation="wave" sx={{ mr: 1 }} />
          <Skeleton variant="text" width="60%" height={20} animation="wave" />
        </Box>
        
        {/* Местоположение */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={20} height={20} animation="wave" sx={{ mr: 1 }} />
          <Skeleton variant="text" width="40%" height={20} animation="wave" />
        </Box>
        
        {/* Описание */}
        <Skeleton variant="text" height={20} animation="wave" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" height={20} animation="wave" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" height={20} width="80%" animation="wave" sx={{ mb: 2 }} />
        
        {/* Индикатор заполненности */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={20} height={20} animation="wave" sx={{ mr: 1 }} />
              <Skeleton variant="text" width={80} height={20} animation="wave" />
            </Box>
            <Skeleton variant="text" width={40} height={20} animation="wave" />
          </Box>
          <Skeleton variant="rectangular" height={8} animation="wave" sx={{ borderRadius: 4 }} />
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="rectangular" height={36} width="100%" animation="wave" sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={36} width="100%" animation="wave" sx={{ borderRadius: 1 }} />
        </Box>
      </CardActions>
    </MuiCard>
  );
};

export default EventCardSkeleton; 