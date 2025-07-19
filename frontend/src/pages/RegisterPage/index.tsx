import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { register as registerThunk } from '@/modules/auth/store/authSlice';
import { Typography, Input, Button } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  telegramUser?: string;
}

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    await dispatch(
      registerThunk({
        username: data.username,
        password: data.password,
        name: data.name,
      } as any)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Typography variant="h4" className="mb-6 text-center">
        Регистрация
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 space-y-4"
      >
        <Input
          label="Имя пользователя"
          {...register('username', { required: 'Введите логин' })}
          error={errors.username?.message}
          clearable
          helperText="Не менее 3 символов, уникально"
        />
        <Input
          label="Полное имя"
          {...register('name', { required: 'Введите имя' })}
          error={errors.name?.message}
          clearable
        />
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Пароль"
          {...register('password', {
            required: 'Введите пароль',
            minLength: { value: 6, message: 'Минимум 6 символов' },
          })}
          error={errors.password?.message}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          helperText="Минимум 6 символов"
        />
        <Input
          type={showConfirm ? 'text' : 'password'}
          label="Повтор пароля"
          {...register('confirmPassword', {
            validate: (value) =>
              value === watch('password') || 'Пароли не совпадают',
          })}
          error={errors.confirmPassword?.message}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm((v) => !v)}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Input
          label="Телефон"
          {...register('phone')}
          clearable
          helperText="Формат: +7 (xxx) xxx-xx-xx"
        />
        <Input
          label="Telegram ник"
          {...register('telegramUser')}
          clearable
          helperText="Без символа @"
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Создать аккаунт
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
