import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import { Typography, Input, Button, Form, FormField, FormError, Card, CardContent, CardHeader, CardTitle, CardFooter, Label } from '@/components/ui';
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
  const methods = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

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
      <Card className="w-full max-w-md">
        <Form methods={methods} onSubmit={onSubmit} className="space-y-6">
          <CardHeader className="text-center">
            <CardTitle>
              <Typography variant="h3">Создать аккаунт</Typography>
            </CardTitle>
            <Typography variant="body-1" color="muted" className="mt-2">
              Заполните форму для регистрации
            </Typography>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              name="name"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя пользователя</Label>
                  <Input id="name" placeholder="Введите ваше имя" {...field} error={fieldState.error?.message} fullWidth />
                </div>
              )}
            />
            <FormField
              name="username"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="username">Логин</Label>
                  <Input
                    id="username"
                    placeholder="Введите логин для входа в систему"
                    {...field}
                    error={fieldState.error?.message}
                    helperText="Будет использоваться для входа в систему"
                    fullWidth
                  />
                </div>
              )}
            />
            <FormField
              name="email"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Введите ваш email"
                    type="email"
                    {...field}
                    error={fieldState.error?.message}
                    fullWidth
                  />
                </div>
              )}
            />
            <FormField
              name="password"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    {...field}
                    error={fieldState.error?.message}
                    fullWidth
                    rightIcon={
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="p-1 focus:outline-none"
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
                  />
                </div>
              )}
            />
            <FormField
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Повторите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Повторите пароль"
                    {...field}
                    error={fieldState.error?.message}
                    fullWidth
                    rightIcon={
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="p-1 focus:outline-none"
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
                  />
                </div>
              )}
            />
            <FormError message={error} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" disabled={methods.formState.isSubmitting} className="w-full">
              {methods.formState.isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <div className="text-center pt-4">
              <Typography variant="body-2">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="underline underline-offset-4">
                  Войти
                </Link>
              </Typography>
            </div>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
