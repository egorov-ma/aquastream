import React from 'react';

import { Typography, Card, CardContent } from '@/components/ui';

const ProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6">
        Профиль пользователя
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body-1">Страница профиля пользователя (заглушка)</Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
