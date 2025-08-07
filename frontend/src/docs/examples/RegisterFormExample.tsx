import { useState } from 'react';

import { Button, Checkbox, TextField, Typography } from '../../components/ui';

const RegisterFormExample = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  const validate = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: '',
    };
    let isValid = true;

    // Валидация имени
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
      isValid = false;
    }

    // Валидация фамилии
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
      isValid = false;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
      isValid = false;
    }

    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
      isValid = false;
    }

    // Валидация подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
      isValid = false;
    }

    // Валидация согласия с условиями
    if (!agreeTerms) {
      setTermsError('Необходимо согласие с условиями');
      isValid = false;
    } else {
      setTermsError('');
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Проверяем форму перед отправкой
    const newErrors = { ...errors };

    // Проверка email
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!validate()) {
      newErrors.email = 'Введите корректный email';
    } else {
      newErrors.email = '';
    }

    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    } else {
      newErrors.password = '';
    }

    // Проверка подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    } else {
      newErrors.confirmPassword = '';
    }

    // Проверка согласия с условиями
    if (!agreeTerms) {
      newErrors.agreeTerms = 'Вы должны согласиться с условиями';
    } else {
      newErrors.agreeTerms = '';
    }

    setErrors(newErrors);

    // Если нет ошибок, отправляем форму
    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (!hasErrors) {
      // Здесь был бы код для отправки данных на сервер
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <Typography variant="h4" align="center" className="mb-6">
        Регистрация в AquaStream
      </Typography>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Имя"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            error={errors.firstName}
            required
          />

          <TextField
            label="Фамилия"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            error={errors.lastName}
            required
          />
        </div>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          error={errors.email}
          required
        />

        <TextField
          label="Пароль"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          error={errors.password}
          required
        />

        <TextField
          label="Подтвердите пароль"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          error={errors.confirmPassword}
          required
        />

        <div className="mt-4">
          <Checkbox
            label="Я согласен с условиями использования и политикой конфиденциальности"
            checked={agreeTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAgreeTerms(e.target.checked);
              setErrors({
                ...errors,
                agreeTerms: e.target.checked ? '' : 'Вы должны согласиться с условиями',
              });
            }}
            error={!!termsError}
          />
          {termsError && (
            <Typography variant="caption" color="error" className="mt-1 block">
              {termsError}
            </Typography>
          )}
        </div>

        <Button variant="primary" type="submit" fullWidth className="mt-6">
          Зарегистрироваться
        </Button>

        <div className="text-center mt-4">
          <Typography variant="body-2">
            Уже есть аккаунт?{' '}
            <span className="text-primary-600 hover:underline cursor-pointer">Войти</span>
          </Typography>
        </div>
      </form>
    </div>
  );
};

export default RegisterFormExample;
