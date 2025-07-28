import React from 'react';
import { Link } from 'react-router-dom';

import { NavLink } from './types';

/**
 * Свойства компонента быстрых ссылок
 */
interface QuickLinksProps {
  /**
   * Заголовок блока
   */
  title?: string;
  /**
   * Навигационные ссылки
   */
  links: NavLink[];
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения быстрых ссылок в футере
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
const QuickLinks: React.FC<QuickLinksProps> = React.memo(({
  title = 'Быстрые ссылки',
  links,
  className,
}) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={className} data-testid="quick-links">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4" data-testid="quick-links-title">
        {title}
      </h3>
      <ul className="space-y-2 flex flex-col items-center md:items-start" data-testid="quick-links-list">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 text-sm transition-colors"
              data-testid={`quick-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

QuickLinks.displayName = 'QuickLinks';

export default QuickLinks; 