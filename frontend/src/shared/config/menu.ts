import {
  Home,
  Info,
  BarChart2,
  Droplet,
  UserCircle,
  LogIn,
  Settings,
  Calendar,
} from 'lucide-react';

/**
 * Список доступных ролей пользователей в системе
 */
export enum UserRole {
  GUEST = 'guest', // Неавторизованный пользователь
  USER = 'user', // Обычный пользователь
  MANAGER = 'manager', // Менеджер (доступ к управлению мероприятиями)
  ADMIN = 'admin', // Администратор (полный доступ)
}

/**
 * Тип элемента меню с поддержкой локализации и прав доступа
 */
export interface MenuItem {
  /** Ключ для локализации названия пункта */
  labelKey: string;
  /** Текст пункта меню (если нет локализации) */
  name: string;
  /** Путь для маршрутизации */
  path: string;
  /** Иконка пункта меню */
  icon?: React.FC<{ className?: string }>;
  /** Роли, которым разрешен доступ к этому пункту */
  roles?: UserRole[];
  /** Метка (бейдж) на пункте меню */
  badge?: {
    content: string | number;
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  /** Выделить как активный для этих путей (для вложенных маршрутов) */
  activeFor?: string[];
}

/**
 * Главное меню приложения
 */
export const MAIN_MENU: MenuItem[] = [
  {
    name: 'Главная',
    labelKey: 'nav.home',
    path: '/',
    icon: Home,
    roles: [UserRole.GUEST, UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    name: 'О нас',
    labelKey: 'nav.about',
    path: '/about',
    icon: Info,
    roles: [UserRole.GUEST, UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    name: 'Мероприятия',
    labelKey: 'nav.events',
    path: '/events',
    icon: Calendar,
    activeFor: ['/events', '/event-details'],
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    name: 'Мониторинг',
    labelKey: 'nav.monitoring',
    path: '/monitoring',
    icon: BarChart2,
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    name: 'Устройства',
    labelKey: 'nav.devices',
    path: '/devices',
    icon: Droplet,
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
    badge: {
      content: 3,
      color: 'primary',
    },
  },
  {
    name: 'Профиль',
    labelKey: 'nav.profile',
    path: '/profile',
    icon: UserCircle,
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    name: 'Управление',
    labelKey: 'nav.management',
    path: '/management',
    icon: Settings,
    roles: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    name: 'Администрирование',
    labelKey: 'nav.admin',
    path: '/admin',
    icon: Settings,
    roles: [UserRole.ADMIN],
  },
  {
    name: 'Войти',
    labelKey: 'nav.login',
    path: '/login',
    icon: LogIn,
    roles: [UserRole.GUEST],
  },
];

/**
 * Функция фильтрации пунктов меню по роли пользователя
 */
export const getMenuItemsByRole = (
  items: MenuItem[],
  role: UserRole = UserRole.GUEST
): MenuItem[] => {
  return items.filter(
    (item) =>
      !item.roles || // Если ролей нет - показываем всем
      item.roles.includes(role) // Показываем только пункты, доступные для роли пользователя
  );
};
