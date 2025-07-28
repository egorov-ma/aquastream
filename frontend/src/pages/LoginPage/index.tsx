import React from 'react';
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

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login({ username: data.username, password: data.password })).unwrap();
      navigate('/');
    } catch (err) {
      // Ошибка обрабатывается через состояние auth.error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Typography variant="h4" className="mb-6 text-center">
        Вход
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 space-y-4"
      >
        <Input
          label="Логин"
          {...register('username', { required: 'Введите логин' })}
          error={errors.username?.message}
        />
        <Input
          type="password"
          label="Пароль"
          {...register('password', { required: 'Введите пароль' })}
          error={errors.password?.message}
        />
        {error && (
          <Typography variant="caption" className="text-error-500">
            {error}
          </Typography>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Войти
        </Button>
        <div className="text-center">
          <span className="text-sm text-secondary-600 dark:text-secondary-400 mr-1">
            Нет аккаунта?
          </span>
          <Link to="/register" className="text-primary-600 hover:underline text-sm">
            Зарегистрироваться
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
