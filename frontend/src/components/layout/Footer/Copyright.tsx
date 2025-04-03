import React from 'react';

/**
 * Свойства компонента копирайта
 */
interface CopyrightProps {
  /**
   * Текст копирайта
   */
  text?: string;
  /**
   * Название компании
   */
  companyName?: string;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения копирайта
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
const Copyright: React.FC<CopyrightProps> = React.memo(({
  text,
  companyName = 'AquaStream',
  className,
}) => {
  const currentYear = new Date().getFullYear();
  const copyrightText = text || `© ${currentYear} ${companyName}. Все права защищены`;

  return (
    <div 
      className={`border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-sm text-gray-500 dark:text-gray-400 ${className || ''}`} 
      data-testid="copyright"
    >
      <p>{copyrightText}</p>
    </div>
  );
});

Copyright.displayName = 'Copyright';

export default Copyright; 