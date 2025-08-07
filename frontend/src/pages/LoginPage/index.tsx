import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Typography, Input, Button } from '@/components/ui';
import { login } from '@/modules/auth/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useAppSelector } from '@/store/hooks';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login({ username: data.username, password: data.password })).unwrap();
      navigate('/');
    } catch {
      // Ошибка обрабатывается через состояние auth.error
    }
  };

  const validateUsername = (value: string) => {
    if (!value) return 'Введите имя пользователя';
    if (value.length < 3) return 'Имя пользователя должно содержать минимум 3 символа';
    if (!/^[a-zA-Z0-9_.-]+$/.test(value)) return 'Имя пользователя может содержать только буквы, цифры и знаки _.-';
    return true;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-start justify-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8 space-y-6 border border-secondary-200 dark:border-secondary-700"
        >
          {/* Заголовок с приветствием */}
          <div className="text-center mb-8">
            <Typography variant="h3" className="text-secondary-900 dark:text-secondary-100 font-bold">
              Добро пожаловать!
            </Typography>
            <Typography variant="body-1" className="mt-2 text-secondary-600 dark:text-secondary-400">
              Войдите в свой аккаунт
            </Typography>
          </div>
          {/* Поле username */}
          <Input
            label="Имя пользователя"
            placeholder="Введите ваше имя пользователя"
            {...register('username', {
              required: 'Введите имя пользователя',
              validate: validateUsername,
            })}
            error={errors.username?.message}
            fullWidth
          />
          {/* Поле password */}
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Пароль"
            placeholder="Введите ваш пароль"
            {...register('password', { 
              required: 'Введите пароль',
              minLength: { value: 6, message: 'Пароль должен содержать минимум 6 символов' }
            })}
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors focus:outline-none"
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l9.88 9.88z"></path>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.75-6.75z"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            }
            fullWidth
          />
          {/* Сообщение об ошибке */}
          {error && (
            <div className="rounded-md bg-error-50 dark:bg-error-900/50 p-4 border border-error-200 dark:border-error-800">
              <Typography variant="body-2" className="text-error-600 dark:text-error-400">
                {error}
              </Typography>
            </div>
          )}
          {/* Кнопка входа */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 text-base font-medium bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? 'Вход...' : 'Войти в аккаунт'}
          </Button>
          {/* Ссылки */}
          <div className="flex items-center justify-between pt-4">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Забыли пароль?
            </Link>
            <Link 
              to="/register" 
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
