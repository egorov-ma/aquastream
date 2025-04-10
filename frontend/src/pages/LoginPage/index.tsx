import React from 'react';

import { Typography } from '@/components/ui';

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6 text-gray-800 dark:text-gray-100">
        Вход в аккаунт
      </Typography>
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
        <Typography variant="body-1" className='text-gray-800 dark:text-gray-100'>Страница входа в систему (заглушка)</Typography>
      </div>
    </div>
  );
};

export default LoginPage;
