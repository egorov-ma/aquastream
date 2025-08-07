import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input'; // Импортируем компонент
import { User } from 'lucide-react'; // Пример иконки

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Лейбл поля ввода',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder поля ввода',
    },
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
      description: 'Размер поля ввода',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растягивать на всю ширину',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключено ли поле',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки (если есть, поле считается ошибочным)',
    },
    helperText: {
      control: 'text',
      description: 'Текст-подсказка под полем',
    },
    leftIcon: {
      control: false,
      description: 'Иконка слева (ReactNode)',
    },
    rightIcon: {
      control: false,
      description: 'Иконка справа (ReactNode)',
    },
    // Другие стандартные Input атрибуты
    type: {
      control: 'text',
      description: 'HTML Input type (text, password, email, etc.)',
    },
    value: {
      control: 'text',
      description: 'Значение поля ввода (для контролируемого компонента)',
    },
    onChange: {
      action: 'changed',
      description: 'Обработчик изменения значения',
    },
  },
  args: {
    label: 'Поле ввода',
    placeholder: 'Введите текст...',
    variant: 'outlined',
    color: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
    error: '',
    helperText: 'Это вспомогательный текст',
    type: 'text',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  args: {
    label: '',
    placeholder: 'Поле без лейбла',
  },
};

export const WithError: Story = {
  args: {
    label: 'Поле с ошибкой',
    error: 'Это обязательное поле',
    helperText: '', // Ошибка перекрывает helperText
  },
};

export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    disabled: true,
    value: 'Нельзя изменить',
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Маленькое поле',
    size: 'sm',
    placeholder: 'Small',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Большое поле',
    size: 'lg',
    placeholder: 'Large',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Поле с иконкой слева',
    leftIcon: <User size={18} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Поле с иконкой справа',
    type: 'password',
    rightIcon: <span>👁️</span>,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Поле с двумя иконками',
    leftIcon: <User size={18} />,
    rightIcon: <span>🔒</span>,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Поле на всю ширину',
    fullWidth: true,
  },
};

export const Filled: Story = {
  args: {
    label: 'Заполненное поле',
    variant: 'filled',
  },
};

export const Underlined: Story = {
  args: {
    label: 'Подчеркнутое поле',
    variant: 'underlined',
    placeholder: 'Только подчеркивание',
  },
};

export const FloatingLabel: Story = {
  args: {
    label: 'Плавающая метка',
    variant: 'floating',
    placeholder: ' ',
  },
};
