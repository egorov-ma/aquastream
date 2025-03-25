import { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppSelector } from '@/hooks/redux';
import { selectUserState } from '@/store/slices/userSlice';

/**
 * Интерфейс для пункта навигации
 */
export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  labelKey?: string;
}

/**
 * Основные пункты меню приложения
 */
const MAIN_MENU: NavigationItem[] = [
  { id: 'home', title: 'Главная', path: '/', labelKey: 'menu.home' },
  { id: 'events', title: 'События', path: '/events', labelKey: 'menu.events' },
  { id: 'monitoring', title: 'Мониторинг', path: '/monitoring', labelKey: 'menu.monitoring' },
  { id: 'profile', title: 'Профиль', path: '/profile', labelKey: 'menu.profile' },
  { id: 'admin', title: 'Админ', path: '/admin', labelKey: 'menu.admin' },
];

/**
 * Хук для работы с навигацией на основе ролей пользователя
 * @returns Объект с данными для навигации
 */
export default function useNavigation() {
  const location = useLocation();
  const userState = useAppSelector(selectUserState);
  const userRole = userState.currentUser?.role;

  /**
   * Проверяет, активен ли пункт меню на текущей странице
   */
  const isItemActive = useCallback(
    (path: string): boolean => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  /**
   * Отфильтрованные и преобразованные пункты меню, доступные пользователю
   * В текущей версии возвращаем все пункты, так как фильтрация будет добавлена позже
   */
  const filteredMenuItems = useMemo(() => {
    return MAIN_MENU;
  }, []);

  /**
   * Преобразованные пункты меню для компонента Header
   * Конвертирует MenuItem в NavItem для Header, сохраняя ключи локализации
   */
  const navItems = useMemo(() => {
    return filteredMenuItems.map((item) => ({
      id: item.id,
      name: item.title,
      path: item.path,
      labelKey: item.labelKey,
      active: isItemActive(item.path),
    }));
  }, [filteredMenuItems, isItemActive]); // Зависимость от отфильтрованных пунктов и функции проверки активности

  // Возвращаем данные для навигации
  return {
    menuItems: filteredMenuItems,
    navItems,
    isItemActive,
    userRole,
  };
}
