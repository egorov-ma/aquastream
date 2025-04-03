import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextField } from './TextField';
import { User, Lock } from 'lucide-react';

const meta = {
  title: 'UI/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Метка поля' },
    placeholder: { control: 'text', description: 'Placeholder' },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'filled', 'underlined', 'floating'],
      description: 'Вариант отображения',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent', 'error', 'warning', 'success', 'info'],
      description: 'Цвет акцента',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Размер поля',
    },
    fullWidth: { control: 'boolean', description: 'Растягивать на всю ширину' },
    disabled: { control: 'boolean', description: 'Отключено' },
    error: { control: 'boolean', description: 'Наличие ошибки' },
    errorText: { control: 'text', description: 'Текст ошибки' },
    helperText: { control: 'text', description: 'Текст-подсказка' },
    required: { control: 'boolean', description: 'Обязательное поле' },
    startIcon: { control: false, description: 'Иконка слева (ReactNode)' },
    endIcon: { control: false, description: 'Иконка справа (ReactNode)' },
    type: { control: 'text', description: 'HTML Input type' },
    value: { control: 'text', description: 'Значение (для контролируемого компонента)' },
    onChange: {
      action: 'changed',
      description: 'Обработчик изменения',
      argTypes: {
        event: { control: false },
      }
    },
  },
  args: {
    label: 'Текстовое поле',
    placeholder: 'Введите значение...',
    variant: 'outlined',
    color: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
    error: false,
    helperText: 'Вспомогательный текст',
    required: false,
    type: 'text',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Реализация контролируемого компонента для интерактивного примера
type TextFieldProps = React.ComponentProps<typeof TextField>;

const ControlledTextField = (args: TextFieldProps) => {
  const [value, setValue] = useState(args.value || '');
  return <TextField {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
};

// Основные варианты
export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const Filled: Story = {
  args: { variant: 'filled', label: 'Заполненное поле' },
};

export const Underlined: Story = {
  args: { variant: 'underlined', label: 'Подчеркнутое поле', placeholder: 'Только подчеркивание' },
};

export const FloatingLabel: Story = {
  args: { variant: 'floating', label: 'Плавающая метка', placeholder: ' ' },
};

export const WithError: Story = {
  args: { error: true, errorText: 'Неверное значение', color: 'error' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Отключено' },
};

export const WithStartIcon: Story = {
  args: { startIcon: <User size={18} />, label: 'Имя пользователя' },
};

export const WithEndIcon: Story = {
  args: { endIcon: <Lock size={18} />, label: 'Пароль', type: 'password' },
};

export const SmallSize: Story = {
  args: { size: 'sm', label: 'Маленькое поле' },
};

export const LargeSize: Story = {
  args: { size: 'lg', label: 'Большое поле' },
};
