import React from 'react';
import TextField from '../../components/ui/TextField';

export default {
  title: 'UI/TextField',
  component: TextField,
  argTypes: {
    variant: {
      options: ['outlined', 'filled', 'standard'],
      control: { type: 'radio' },
    },
    color: {
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      control: { type: 'select' },
    },
    size: {
      options: ['small', 'medium'],
      control: { type: 'radio' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    required: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    error: {
      control: { type: 'boolean' },
    },
    helperText: {
      control: { type: 'text' },
    },
    label: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    type: {
      options: ['text', 'password', 'number', 'email', 'tel', 'url'],
      control: { type: 'select' },
    },
    onChange: { action: 'changed' },
  },
};

// Шаблон для создания текстового поля
const Template = (args) => <TextField {...args} />;

// Стандартное текстовое поле
export const Default = Template.bind({});
Default.args = {
  label: 'Имя',
  placeholder: 'Введите ваше имя',
};

// Текстовое поле с подсказкой
export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Email',
  placeholder: 'example@mail.com',
  helperText: 'Мы никогда не передадим ваш email третьим лицам',
};

// Обязательное поле
export const Required = Template.bind({});
Required.args = {
  label: 'Телефон',
  placeholder: '+7 (___) ___-__-__',
  required: true,
};

// Поле с ошибкой
export const WithError = Template.bind({});
WithError.args = {
  label: 'Пароль',
  placeholder: 'Введите пароль',
  type: 'password',
  error: true,
  helperText: 'Пароль должен содержать не менее 8 символов',
};

// Отключенное поле
export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Логин',
  placeholder: 'Введите логин',
  disabled: true,
};

// Поле для чисел
export const NumberField = Template.bind({});
NumberField.args = {
  label: 'Возраст',
  placeholder: 'Введите ваш возраст',
  type: 'number',
};

// Filled вариант
export const Filled = Template.bind({});
Filled.args = {
  label: 'Заметки',
  placeholder: 'Введите заметки',
  variant: 'filled',
};

// Standard вариант
export const Standard = Template.bind({});
Standard.args = {
  label: 'Город',
  placeholder: 'Введите город',
  variant: 'standard',
}; 