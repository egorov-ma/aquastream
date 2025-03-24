import React from 'react';
import { useParams } from 'react-router-dom';

import { Typography } from '@/components/ui';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6">
        Информация о событии
      </Typography>
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
        <Typography variant="body-1">Страница с деталями события ID: {id} (заглушка)</Typography>
      </div>
    </div>
  );
};

export default EventDetailsPage;
