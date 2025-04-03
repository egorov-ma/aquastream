import { cn } from '../../utils/cn';
import { MapPinIcon } from 'lucide-react';

/**
 * Свойства компонента временной шкалы
 */
interface TimelineInfoProps {
  /**
   * Дата начала события
   */
  startDate: string;
  /**
   * Время начала события
   */
  startTime: string;
  /**
   * Дата окончания события
   */
  endDate: string;
  /**
   * Время окончания события
   */
  endTime: string;
  /**
   * Место проведения события
   */
  location?: string;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения дат, времени и места проведения события
 */
const TimelineInfo = ({
  startDate,
  startTime,
  endDate,
  endTime,
  location,
  className,
}: TimelineInfoProps) => {
  // Форматируем строки даты и времени
  const startDateTime = `${startDate} ${startTime}`;
  const endDateTime = `${endDate} ${endTime}`;

  return (
    <div className={cn("space-y-2", className)} data-testid="timeline-info">
      {/* Блок времени - цвет изменен на 700 */}
      <div 
        className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300"
        data-testid="time-info"
      >
        <span data-testid="start-datetime">{startDateTime}</span>
        <div className="flex-grow mx-2 h-0.5 bg-primary-500 rounded-full"></div>
        <span data-testid="end-datetime">{endDateTime}</span>
      </div>
      {/* Блок местоположения (если есть) - цвет оставлен 500 */}
      {location && (
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400" data-testid="location-info">
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
};

export default TimelineInfo; 