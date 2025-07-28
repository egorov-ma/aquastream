import { CheckIcon } from 'lucide-react';

import { cn } from '../../utils/cn';

/**
 * Свойства списка особенностей
 */
interface FeaturesListProps {
  /**
   * Список особенностей
   */
  features: string[];
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения списка особенностей события
 */
const FeaturesList = ({ features, className }: FeaturesListProps) => {
  if (!features.length) return null;

  return (
    <ul className={cn("space-y-1", className)} data-testid="features-list">
      {features.map((feature, index) => (
        <li 
          key={`feature-${index}`} 
          className="flex items-center text-sm text-gray-700 dark:text-gray-300"
          data-testid={`feature-item-${index}`}
        >
          <CheckIcon className="w-4 h-4 mr-2 text-amber-500" />
          {feature}
        </li>
      ))}
    </ul>
  );
};

export default FeaturesList; 