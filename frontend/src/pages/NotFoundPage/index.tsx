import React from 'react';
import { Link } from 'react-router-dom';

import { Typography } from '@/components/ui';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Typography variant="h1" className="text-6xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        404
      </Typography>
      <Typography variant="h4" className="mb-8 text-gray-800 dark:text-gray-100">
        Страница не найдена
      </Typography>
      <Typography variant="body-1" className="mb-8 text-gray-800 dark:text-gray-100">
        Запрашиваемая страница не существует или была перемещена.
      </Typography>
      <Link
        to="/"
        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
