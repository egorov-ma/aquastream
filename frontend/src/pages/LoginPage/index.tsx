import React from 'react';

import { Typography } from '@/components/ui';

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6">
        Вход в аккаунт
      </Typography>
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
        <Typography variant="body-1">Страница входа в систему (заглушка)</Typography>
      </div>
    </div>
  );
};

export default LoginPage;
