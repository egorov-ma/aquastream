import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';

// Заглушки для страниц
const About = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>О нас</h1>
    <p>Страница о компании находится в разработке.</p>
  </Box>
);

const Team = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Наша команда</h1>
    <p>Информация о команде находится в разработке.</p>
  </Box>
);

const Journal = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Журнал</h1>
    <p>Наш блог находится в разработке.</p>
  </Box>
);

const Contacts = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Контакты</h1>
    <p>Контактная информация находится в разработке.</p>
  </Box>
);

const Terms = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Условия использования</h1>
    <p>Условия использования сервиса находятся в разработке.</p>
  </Box>
);

const Privacy = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Политика конфиденциальности</h1>
    <p>Политика конфиденциальности находится в разработке.</p>
  </Box>
);

const FAQ = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Часто задаваемые вопросы</h1>
    <p>Раздел ЧаВо находится в разработке.</p>
  </Box>
);

const EventDetail = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Детальная информация о мероприятии</h1>
    <p>Эта страница находится в разработке.</p>
  </Box>
);

const Login = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Вход в систему</h1>
    <p>Страница входа находится в разработке.</p>
  </Box>
);

const Register = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Регистрация</h1>
    <p>Страница регистрации находится в разработке.</p>
  </Box>
);

const Profile = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>Профиль пользователя</h1>
    <p>Страница профиля находится в разработке.</p>
  </Box>
);

const NotFound = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h1>404 - Страница не найдена</h1>
    <p>Запрашиваемая страница не существует.</p>
  </Box>
);

// Защищенный маршрут
const ProtectedRoute = ({ children }) => {
  // Здесь будет использоваться контекст авторизации
  const isAuthenticated = false; // Заглушка, реально будет проверяться авторизация
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Защищенные маршруты */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/events/:id/book" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        
        {/* 404 страница */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App; 