import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем контекст
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем сохраненное состояние аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем наличие токена в localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // В реальном приложении здесь будет запрос к API для проверки токена
          // и получения данных пользователя
          // const response = await fetch('/api/auth/me', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // const userData = await response.json();
          
          // Для демонстрации просто используем моковые данные
          const userData = {
            id: 1,
            username: 'user',
            name: 'Иван Иванов',
            email: 'user@example.com'
          };
          
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed', error);
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Функция для входа пользователя
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // В реальном приложении здесь будет запрос к API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();
      
      // Для демонстрации просто используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки сети
      
      const mockToken = 'mock_token_123456';
      const userData = {
        id: 1,
        username: credentials.username || 'user',
        name: 'Иван Иванов',
        email: 'user@example.com'
      };
      
      localStorage.setItem('authToken', mockToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      return { success: false, error: error.message || 'Ошибка входа' };
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода пользователя
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Функция для регистрации пользователя
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // В реальном приложении здесь будет запрос к API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // const data = await response.json();
      
      // Для демонстрации просто используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки сети
      
      const mockToken = 'mock_token_123456';
      const newUser = {
        id: 1,
        username: userData.username,
        name: userData.name,
        email: userData.email
      };
      
      localStorage.setItem('authToken', mockToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed', error);
      return { success: false, error: error.message || 'Ошибка регистрации' };
    } finally {
      setIsLoading(false);
    }
  };

  // Значение контекста
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 