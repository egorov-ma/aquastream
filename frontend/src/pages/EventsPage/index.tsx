import React from 'react';

import { Typography, Card, CardContent } from '@/components/ui';

const EventsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6">
        Список событий
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body-1">Список доступных событий (заглушка)</Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsPage;
