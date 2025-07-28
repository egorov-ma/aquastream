import { TelegramIcon, GitHubIcon, EmailIcon } from './SocialIcons';
import { NavLink, SocialLink, ContactInfo } from './types';

/**
 * Стандартные навигационные ссылки для футера
 */
export const DEFAULT_NAV_LINKS: NavLink[] = [
  { name: 'Главная', path: '/' },
  { name: 'О нас', path: '/about' },
  { name: 'UI Kit', path: '/ui-kit' },
];

/**
 * Стандартные социальные ссылки для футера
 */
export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Email',
    icon: EmailIcon,
    url: 'mailto:info@aquastream.ru',
    description: 'Связаться с нами'
  },
  { 
    name: 'Telegram AquaStream', 
    icon: TelegramIcon, 
    url: 'https://t.me/aquastreamdev',
    description: 'Команда разработки'
  },
  { 
    name: 'Telegram NeoSplav', 
    icon: TelegramIcon, 
    url: 'https://t.me/neosplav',
    description: 'Канал сообщества'
  },
  { 
    name: 'GitHub', 
    icon: GitHubIcon, 
    url: 'https://github.com/egorov-ma/aquastream',
    description: 'Исходный код'
  },
];

/**
 * Стандартная контактная информация для футера
 */
export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: 'info@aquastream.ru',
};

/**
 * Стандартное описание для футера
 */
export const DEFAULT_COMPANY_DESCRIPTION = 'Опенсорс агрегатор событий: Организации публикуют свои сплавы, а участники выбирают что им интересно.'; 