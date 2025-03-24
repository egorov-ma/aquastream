import { useState } from 'react';

import { Button, Checkbox, TextField, Typography } from '../../components/ui';

const LoginFormExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      return 'Email обязателен';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Неверный формат email';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Пароль обязателен';
    }
    if (value.length < 6) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValidationResult = validateEmail(email);
    const passwordValidationResult = validatePassword(password);

    setEmailError(emailValidationResult);
    setPasswordError(passwordValidationResult);

    if (!emailValidationResult && !passwordValidationResult) {
      // Здесь был бы код для отправки данных на сервер
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <Typography variant="h4" align="center" className="mb-6">
        Вход в систему AquaStream
      </Typography>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          variant="outlined"
          fullWidth
          placeholder="example@email.com"
          error={!!emailError}
          errorText={emailError}
          required
        />

        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          variant="outlined"
          fullWidth
          error={!!passwordError}
          errorText={passwordError}
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Запомнить меня"
            checked={rememberMe}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
          />

          <Typography variant="body-2" color="primary" className="cursor-pointer">
            Забыли пароль?
          </Typography>
        </div>

        <Button variant="primary" type="submit" fullWidth>
          Войти
        </Button>

        <div className="text-center mt-4">
          <Typography variant="body-2">
            Еще нет аккаунта?{' '}
            <span className="text-indigo-600 cursor-pointer">Зарегистрироваться</span>
          </Typography>
        </div>
      </form>
    </div>
  );
};

export default LoginFormExample;
