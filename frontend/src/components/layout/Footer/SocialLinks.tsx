import React from 'react';
import { SocialLink } from './types';

/**
 * Свойства компонента социальных ссылок
 */
interface SocialLinksProps {
  /**
   * Список социальных ссылок
   */
  links: SocialLink[];
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
  /**
   * Заголовок для группы ссылок
   */
  title?: string;
  /**
   * Скрыть заголовок
   */
  hideTitle?: boolean;
}

/**
 * Компонент для отображения ссылок на социальные сети
 */
const SocialLinks: React.FC<SocialLinksProps> = React.memo(({
  links,
  className,
  title = 'Мы в социальных сетях',
  hideTitle = false,
}) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={`${className || ''}`} data-testid="social-links">
      {!hideTitle && (
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
      )}
      <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6 md:gap-4">
        {links.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[250px] md:w-auto text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 group transition-colors"
            aria-label={social.name}
            data-testid={`social-link-${social.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-3 group-hover:bg-primary-50 dark:group-hover:bg-gray-600 transition-colors">
              <social.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {social.name}
              </div>
              {social.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {social.description}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

SocialLinks.displayName = 'SocialLinks';

export default SocialLinks; 