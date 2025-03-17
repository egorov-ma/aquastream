/**
 * Конфигурация маршрутов приложения
 */

/**
 * Маршруты приложения
 */
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  EVENTS: '/events',
  EVENT_DETAILS: '/events/:id',
  CALENDAR: '/calendar',
  TEAM: '/team',
  CONTACTS: '/contacts',
  PARTICIPANT: '/participant',
  ADMIN: '/admin',
  CREATE_EVENT: '/events/create',
  EDIT_EVENT: '/events/edit/:id',
  NOT_FOUND: '*',
};
