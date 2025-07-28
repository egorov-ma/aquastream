import React from 'react';

import { EmailIcon, PhoneIcon } from './SocialIcons';
import { ContactInfo as ContactInfoType } from './types';

/**
 * Свойства компонента контактной информации
 */
interface ContactInfoProps {
  /**
   * Заголовок блока
   */
  title?: string;
  /**
   * Контактная информация
   */
  contactInfo: ContactInfoType;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Компонент для отображения контактной информации
 */
const ContactInfo: React.FC<ContactInfoProps> = React.memo(({
  title = 'Контакты',
  contactInfo,
  className,
}) => {
  const { email, phone, address } = contactInfo;

  if (!email && !phone && !address) {
    return null;
  }

  return (
    <div className={className} data-testid="contact-info">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {email && (
          <li className="flex items-center" data-testid="contact-email">
            <EmailIcon />
            {email}
          </li>
        )}
        
        {phone && (
          <li className="flex items-center" data-testid="contact-phone">
            <PhoneIcon />
            {phone}
          </li>
        )}
        
        {address && (
          <li className="flex items-start" data-testid="contact-address">
            <svg
              className="w-4 h-4 mr-2 mt-1 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            {address}
          </li>
        )}
      </ul>
    </div>
  );
});

ContactInfo.displayName = 'ContactInfo';

export default ContactInfo; 