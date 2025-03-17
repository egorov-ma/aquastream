import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { UserRole } from '@/types/models';
import { APP_ROUTES } from '@/config/config';

// Импорт компонентов макета
import { MainLayout } from '@/components/layout/MainLayout/MainLayout';

// Импорт страниц
import { HomePage } from '@/pages/HomePage/HomePage';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { EventsPage } from '@/pages/EventsPage/EventsPage';
import { EventDetailsPage } from '@/pages/EventDetailsPage/EventDetailsPage';
import { CalendarPage } from '@/pages/CalendarPage/CalendarPage';
import { TeamPage } from '@/pages/TeamPage/TeamPage';
import { ContactsPage } from '@/pages/ContactsPage/ContactsPage';
import { ParticipantPage } from '@/pages/ParticipantPage/ParticipantPage';
import { AdminPage } from '@/pages/AdminPage/AdminPage';
import { CreateEventPage } from '@/pages/CreateEventPage/CreateEventPage';
import { EditEventPage } from '@/pages/EditEventPage/EditEventPage';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage';

/**
 * Интерфейс для компонента защищенного маршрута
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Компонент для защищенных маршрутов, требующих авторизации
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  // Если указаны разрешенные роли и у пользователя нет нужной роли, перенаправляем на главную
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

/**
 * Основной компонент маршрутизации приложения
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Публичные маршруты */}
        <Route index element={<HomePage />} />
        <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={APP_ROUTES.EVENTS} element={<EventsPage />} />
        <Route path={APP_ROUTES.EVENT_DETAILS} element={<EventDetailsPage />} />
        <Route path={APP_ROUTES.CALENDAR} element={<CalendarPage />} />
        <Route path={APP_ROUTES.TEAM} element={<TeamPage />} />
        <Route path={APP_ROUTES.CONTACTS} element={<ContactsPage />} />
        <Route path={APP_ROUTES.PARTICIPANT} element={<ParticipantPage />} />
        
        {/* Защищенные маршруты для авторизованных пользователей */}
        <Route
          path={APP_ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* Защищенные маршруты для администраторов */}
        <Route
          path={APP_ROUTES.ADMIN}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        
        {/* Защищенные маршруты для организаторов и администраторов */}
        <Route
          path={APP_ROUTES.CREATE_EVENT}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ORGANIZER]}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={APP_ROUTES.EDIT_EVENT}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ORGANIZER]}>
              <EditEventPage />
            </ProtectedRoute>
          }
        />
        
        {/* Маршрут для страницы 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}; 