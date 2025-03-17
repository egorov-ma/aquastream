import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Добро пожаловать в Aquastream
        </Typography>
        <Typography variant="body1" paragraph>
          Это базовый шаблон приложения с оптимизированной загрузкой страниц.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage; 