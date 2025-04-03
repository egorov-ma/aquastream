import React from 'react';

/**
 * Свойства компонента информации о компании
 */
interface CompanyInfoProps {
  /**
   * Название компании
   */
  companyName: string;
  /**
   * Описание компании
   */
  description?: string;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения информации о компании
 * Адаптивный дизайн для мобильных и десктопных устройств
 */
const CompanyInfo: React.FC<CompanyInfoProps> = React.memo(({
  companyName,
  description,
  className,
}) => {
  return (
    <div className={`${className || ''}`} data-testid="company-info">
      <h3 
        className="text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-4" 
        data-testid="company-name"
      >
        {companyName}
      </h3>
      {description && (
        <p 
          className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto md:mx-0" 
          data-testid="company-description"
        >
          {description}
        </p>
      )}
    </div>
  );
});

CompanyInfo.displayName = 'CompanyInfo';

export default CompanyInfo; 