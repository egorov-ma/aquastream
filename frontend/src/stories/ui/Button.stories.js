import React from 'react';
import Button from '../../components/ui/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['contained', 'outlined', 'text'],
      control: { type: 'radio' },
    },
    color: {
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'],
      control: { type: 'select' },
    },
    size: {
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    onClick: { action: 'clicked' },
  },
};

// Шаблон для создания кнопки
const Template = (args) => <Button {...args} />;

// Основная кнопка
export const Primary = Template.bind({});
Primary.args = {
  variant: 'contained',
  color: 'primary',
  children: 'Основная кнопка',
};

// Второстепенная кнопка
export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'contained',
  color: 'secondary',
  children: 'Второстепенная кнопка',
};

// Контурная кнопка
export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
  color: 'primary',
  children: 'Контурная кнопка',
};

// Текстовая кнопка
export const Text = Template.bind({});
Text.args = {
  variant: 'text',
  color: 'primary',
  children: 'Текстовая кнопка',
};

// Кнопка с иконкой в начале
export const WithStartIcon = Template.bind({});
WithStartIcon.args = {
  variant: 'contained',
  color: 'error',
  startIcon: <DeleteIcon />,
  children: 'Удалить',
};

// Кнопка с иконкой в конце
export const WithEndIcon = Template.bind({});
WithEndIcon.args = {
  variant: 'contained',
  color: 'success',
  endIcon: <CloudUploadIcon />,
  children: 'Загрузить',
};

// Большая кнопка
export const Large = Template.bind({});
Large.args = {
  variant: 'contained',
  color: 'primary',
  size: 'large',
  children: 'Большая кнопка',
};

// Маленькая кнопка
export const Small = Template.bind({});
Small.args = {
  variant: 'contained',
  color: 'primary',
  size: 'small',
  children: 'Маленькая кнопка',
};

// Отключенная кнопка
export const Disabled = Template.bind({});
Disabled.args = {
  variant: 'contained',
  color: 'primary',
  disabled: true,
  children: 'Отключенная кнопка',
};

// Кнопка на всю ширину
export const FullWidth = Template.bind({});
FullWidth.args = {
  variant: 'contained',
  color: 'primary',
  fullWidth: true,
  children: 'Кнопка на всю ширину',
}; 