import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Typography, Button } from '@/components/ui';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Typography variant="h1" className="text-6xl font-bold mb-4">
        404
      </Typography>
      <Typography variant="h4" className="mb-8">
        Страница не найдена
      </Typography>
      <Typography variant="body-1" className="mb-8">
        Запрашиваемая страница не существует или была перемещена.
      </Typography>
      <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
    </div>
  );
};

export default NotFoundPage;
