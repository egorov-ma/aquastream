import React from 'react';

import { Typography } from '@/components/ui';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6">
        Главная страница
      </Typography>
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
        <Typography variant="body-1" className="mb-4">
          Добро пожаловать в систему управления водными мероприятиями AquaStream!
        </Typography>
        <Typography variant="body-1">Используйте меню для навигации по разделам сайта.</Typography>
      </div>
    </div>
  );
};

export default HomePage;
