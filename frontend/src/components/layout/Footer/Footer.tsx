import React from 'react';

import CompanyInfo from './CompanyInfo';
import { 
  DEFAULT_NAV_LINKS,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_COMPANY_DESCRIPTION 
} from './constants';
import Copyright from './Copyright';
import QuickLinks from './QuickLinks';
import SocialLinks from './SocialLinks';
import { FooterProps } from './types';

/**
 * Компонент Footer - подвал сайта с навигацией, контактами и информацией
 * Адаптивный дизайн с mobile-first подходом
 */
export const Footer: React.FC<FooterProps> = React.memo(({
  className = '',
  companyName = 'AquaStream',
  description = DEFAULT_COMPANY_DESCRIPTION,
  navLinks = DEFAULT_NAV_LINKS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  copyrightText,
}) => {
  return (
    <footer 
      className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto py-8 md:py-12 ${className}`} 
      data-testid="footer"
    >
      <div className="container max-w-full md:max-w-screen-md mx-auto px-4">
        {/* Две колонки (на мобильных - столбик) */}
        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 mb-10">
          {/* Информация о компании */}
          <div className="w-full md:w-5/12 text-center md:text-left">
            <CompanyInfo 
              companyName={companyName} 
              description={description} 
              className="mb-6 md:mb-0"
            />
          </div>
          
          {/* Быстрые ссылки */}
          <div className="w-full md:w-5/12 text-center md:text-left">
            <QuickLinks 
              links={navLinks} 
              title="Быстрые ссылки" 
            />
          </div>
        </div>
        
        {/* Социальные ссылки по центру (на мобильных - столбиком) */}
        <div className="mb-8 md:mb-10">
          <SocialLinks 
            links={socialLinks} 
            hideTitle={true}
            className="flex justify-center"
          />
        </div>

        {/* Копирайт */}
        <Copyright 
          companyName={companyName} 
          text={copyrightText} 
        />
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
