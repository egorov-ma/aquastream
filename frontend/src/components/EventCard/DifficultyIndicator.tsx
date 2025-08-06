import { useState } from 'react';

import { cn } from '../../utils/cn';

/**
 * Свойства индикатора сложности
 */
interface DifficultyIndicatorProps {
  /**
   * Уровень сложности от 1 до 5
   */
  level: 1 | 2 | 3 | 4 | 5;
  /**
   * Размер индикаторов
   */
  size?: 'sm' | 'md';
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
  /**
   * Показывать ли подпись
   */
  showLabel?: boolean;
}

/**
 * Компонент для отображения уровня сложности события
 */
const DifficultyIndicator = ({
  level,
  size = 'sm',
  className,
  showLabel = true,
}: DifficultyIndicatorProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Определяем размеры индикаторов
  const dotSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  
  // Функция для определения цвета индикатора
  const getDotColor = (index: number) => {
    const isActive = index < level;
    const isHovered = hoveredIndex !== null && index <= hoveredIndex;
    const activeColor = 'bg-primary-500'; // Используем основной цвет primary
    const inactiveColor = 'bg-gray-200';
    const hoverColor = 'bg-blue-500'; // Оставляем цвет при наведении (можно изменить)

    if (isHovered) return hoverColor;
    if (isActive) return activeColor;
    
    // Убрана логика смены цвета в зависимости от level
    // if (isActive) {
    //   switch (level) {
    //     case 1: return 'bg-green-500';
    //     case 2: return 'bg-green-400';
    //     case 3: return 'bg-yellow-400';
    //     case 4: return 'bg-orange-400';
    //     case 5: return 'bg-red-500';
    //     default: return 'bg-gray-300';
    //   }
    // }
    return inactiveColor;
  };

  // Текстовое описание сложности
  const difficultyLabel = () => {
    switch (level) {
      case 1: return 'Очень легко';
      case 2: return 'Легко';
      case 3: return 'Средне';
      case 4: return 'Сложно';
      case 5: return 'Очень сложно';
      default: return '';
    }
  };

  return (
    <div 
      className={cn("flex flex-col gap-1", className)}
      data-testid="difficulty-indicator"
    >
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={`dot-${index}`}
            className={cn(
              dotSize,
              "rounded-full transition-all duration-200",
              getDotColor(index),
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            role="presentation"
            data-testid={`difficulty-dot-${index + 1}`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600" data-testid="difficulty-label">
          {difficultyLabel()}
        </span>
      )}
    </div>
  );
};

export default DifficultyIndicator; 