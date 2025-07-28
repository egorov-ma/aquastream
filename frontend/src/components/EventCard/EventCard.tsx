import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button/Button';
import { cn } from '../../utils/cn';


// Импорт компонентов
import DifficultyIndicator from './DifficultyIndicator';
import FeaturesList from './FeaturesList';
import ParticipantsProgress from './ParticipantsProgress';
import TimelineInfo from './TimelineInfo';
import { EventCardProps } from './types';

/**
 * Компонент карточки события
 * @param props Свойства компонента EventCard
 * @returns React компонент
 */
const EventCard: React.FC<EventCardProps> = React.memo(({
  id,
  title,
  startDate,
  startTime,
  endDate,
  endTime,
  registeredParticipants,
  maxParticipants,
  difficulty,
  features,
  location,
  path,
  buttonText = 'Подробнее',
  onClick,
  className,
}) => {
  // Обработчик клика по карточке
  const handleClick = React.useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div 
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-10 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800",
        className
      )}
      data-testid={`event-card-${id}`}
    >
      <div className="flex flex-col h-full gap-4">
        {/* Заголовок - цвет изменен на 800, ограничение строк */}
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 line-clamp-2" data-testid="event-title">
          {title}
        </h3>

        {/* Информация о времени и месте */}
        <TimelineInfo
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          location={location}
        />

        {/* Прогресс регистрации участников */}
        <ParticipantsProgress
          registered={registeredParticipants}
          max={maxParticipants}
        />

        {/* Индикатор сложности - цвет текста изменен на 700 */}
        <div className="flex items-center gap-2" data-testid="difficulty-section">
          <span className="text-sm text-gray-700 dark:text-gray-300">Сложность:</span>
          <DifficultyIndicator level={difficulty} size="sm" showLabel={false} />
        </div>

        {/* Особенности события */}
        {features.length > 0 && (
          <div>
            <FeaturesList features={features} />
          </div>
        )}

        {/* Кнопка действия - радиус изменен на md */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          {path ? (
            <Link to={path} onClick={handleClick} className="w-full" data-testid="event-link-button">
              <Button
                variant="primary"
                size="medium"
                className="w-full rounded-md"
                data-testid="event-button"
              >
                {buttonText}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="medium"
              className="w-full rounded-md"
              onClick={handleClick}
              data-testid="event-action-button"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

// Отображаемое имя для отладки в React DevTools
EventCard.displayName = 'EventCard';

export default EventCard; 