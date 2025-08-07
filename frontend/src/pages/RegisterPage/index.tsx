import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import { Typography, Input, Button, Form, FormField, FormItem, FormMessage } from '@/components/ui';
import { register as registerThunk } from '@/modules/auth/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useAppSelector } from '@/store/hooks';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    username: z
      .string()
      .min(3, 'Логин должен содержать минимум 3 символа')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Логин может содержать только буквы, цифры и знаки _.-'),
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const form = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(
        registerThunk({
          username: data.username,
          email: data.email,
          password: data.password,
          name: data.name,
          displayName: data.name,
        })
      ).unwrap();
      navigate('/login');
    } catch {
      // Ошибка обрабатывается в состоянии auth.error
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex items-start justify-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8 space-y-6 border border-secondary-200 dark:border-secondary-700"
          >
          {/* Заголовок */}
          <div className="text-center mb-8">
            <Typography variant="h3" className="text-secondary-900 dark:text-secondary-100 font-bold">
              Создать аккаунт
            </Typography>
            <Typography variant="body-1" className="mt-2 text-secondary-600 dark:text-secondary-400">
              Заполните форму для регистрации
            </Typography>
          </div>
          {/* Поле имени */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Input
                  label="Имя пользователя"
                  placeholder="Введите ваше имя"
                  {...field}
                  fullWidth
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Поле логина */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <Input
                  label="Логин"
                  placeholder="Введите логин для входа в систему"
                  {...field}
                  helperText="Будет использоваться для входа в систему"
                  fullWidth
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Поле email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Input
                  label="Email"
                  placeholder="Введите ваш email"
                  type="email"
                  {...field}
                  fullWidth
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Поле пароля */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Пароль"
                  placeholder="Введите пароль"
                  {...field}
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
                  helperText="Минимум 6 символов"
                  fullWidth
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Поле подтверждения пароля */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Повторите пароль"
                  placeholder="Повторите пароль"
                  {...field}
                  rightIcon={
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors focus:outline-none"
                      title={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showConfirmPassword ? (
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Сообщение об ошибке */}
          {error && (
            <div className="rounded-md bg-error-50 dark:bg-error-900/50 p-4 border border-error-200 dark:border-error-800">
              <p className="text-error-600 dark:text-error-400 text-sm">{error}</p>
            </div>
          )}

          {/* Кнопка регистрации */}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full py-3 text-base font-medium bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {form.formState.isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          {/* Ссылка на вход */}
          <div className="text-center pt-4">
            <Typography variant="body-2" className="text-secondary-600 dark:text-secondary-400">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors underline-offset-4 hover:underline"
              >
                Войти
              </Link>
            </Typography>
          </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
