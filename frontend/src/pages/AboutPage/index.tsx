import React from 'react';

import { Typography } from '@/components/ui';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6 text-gray-800 dark:text-gray-100">
        О проекте
      </Typography>
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
        <Typography variant="body-1" className="mb-4 text-gray-800 dark:text-gray-100">
          AquaStream — это инновационная платформа для планирования водных мероприятий и сплавов.
        </Typography>
        <Typography variant="body-1" className='text-gray-800 dark:text-gray-100'>
          Наша миссия — сделать водные активности доступными для всех желающих, обеспечивая удобное
          планирование, безопасность и незабываемые впечатления.
        </Typography>
      </div>
    </div>
  );
};

export default AboutPage;
