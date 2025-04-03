import { cn } from '../../utils/cn';

/**
 * Свойства индикатора прогресса участников
 */
interface ParticipantsProgressProps {
  /**
   * Текущее количество зарегистрированных участников
   */
  registered: number;
  /**
   * Максимальное количество участников
   */
  max: number;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения прогресса регистрации участников
 */
const ParticipantsProgress = ({
  registered,
  max,
  className,
}: ParticipantsProgressProps) => {
  // Вычисляем процент заполнения
  const percentage = Math.min(Math.round((registered / max) * 100), 100);
  
  // Убираем функцию определения цвета, используем фиксированный цвет
  // const getProgressColor = () => {
  //   if (percentage < 50) return 'bg-green-500';
  //   if (percentage < 75) return 'bg-yellow-400';
  //   if (percentage < 90) return 'bg-orange-400';
  //   return 'bg-red-500';
  // };
  const progressColor = 'bg-primary-500'; // Используем основной цвет primary

  return (
    <div className={cn("space-y-1", className)} data-testid="participants-progress">
      <div className="flex justify-between text-sm">
        <span data-testid="participants-count">
          {registered} из {max} участников
        </span>
        <span data-testid="participants-percentage">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", progressColor)} // Используем фиксированный цвет
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
};

export default ParticipantsProgress; 