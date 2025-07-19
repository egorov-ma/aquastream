import React from 'react';

import { EventCard } from '@/components';
import { Typography } from '@/components/ui';

// Тестовые данные для отображения событий
const upcomingEvents = [
  {
    id: '1',
    title: 'Медведица: июньский сплав',
    startDate: '13 июн',
    startTime: '10:00',
    endDate: '15 июн',
    endTime: '18:00',
    registeredParticipants: 15,
    maxParticipants: 40,
    difficulty: 2 as const,
    features: [
      'Маршрут 25 км',
      'Живописные скалы',
      'Опытные инструкторы',
      'Трехразовое питание',
    ],
    location: 'р. Медведица, Саратовская обл.',
    path: '/events/1',
    buttonText: 'Подробнее',
  },
  {
    id: '2',
    title: 'Байдарки на Вуоксе: однодневное путешествие по островам',
    startDate: '22 июн',
    startTime: '09:00',
    endDate: '22 июн',
    endTime: '19:00',
    registeredParticipants: 8,
    maxParticipants: 16,
    difficulty: 1 as const,
    features: [
      'Маршрут 15 км',
      'Посещение 3 островов',
      'Обед на берегу',
      'Фотосессия на воде',
    ],
    location: 'оз. Вуокса, Ленинградская обл.',
    path: '/events/2',
    buttonText: 'Подробнее',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-6 text-gray-800 dark:text-gray-100">
        Главная страница
      </Typography>
      
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-10">
        <Typography variant="body-1" className="mb-4 text-gray-800 dark:text-gray-100">
          Добро пожаловать в систему управления водными мероприятиями AquaStream!
        </Typography>
        <Typography variant="body-1" className="text-gray-800 dark:text-gray-100">Используйте меню для навигации по разделам сайта.</Typography>
      </div>
      
      <section className="mb-10">
        <div className="text-center mb-8">
          <Typography variant="h5" className="mb-2 text-gray-800 dark:text-gray-100">
            Предстоящие события
          </Typography>
          <Typography variant="body-2" className="text-secondary-600 dark:text-secondary-400">
            Присоединяйтесь к нашим мероприятиям и получите незабываемые впечатления
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
