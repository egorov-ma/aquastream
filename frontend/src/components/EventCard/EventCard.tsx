import React from 'react';
import { Link } from 'react-router-dom';

import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';


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
    <Card className={cn('p-10', className)} data-testid={`event-card-${id}`}>
      <div className="flex flex-col h-full gap-4">
        <h3 className="text-2xl font-bold line-clamp-2" data-testid="event-title">
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

        <div className="flex items-center gap-2" data-testid="difficulty-section">
          <span className="text-sm">Сложность:</span>
          <DifficultyIndicator level={difficulty} size="sm" showLabel={false} />
        </div>

        {/* Особенности события */}
        {features.length > 0 && (
          <div>
            <FeaturesList features={features} />
          </div>
        )}

        {/* Кнопка действия - радиус изменен на md */}
        <div className="mt-auto pt-4 border-t">
          {path ? (
            <Link to={path} onClick={handleClick} className="w-full" data-testid="event-link-button">
              <Button
                variant="primary"
                size="md"
                className="w-full rounded-md"
                data-testid="event-button"
              >
                {buttonText}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="w-full rounded-md"
              onClick={handleClick}
              data-testid="event-action-button"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

// Отображаемое имя для отладки в React DevTools
EventCard.displayName = 'EventCard';

export default EventCard; 