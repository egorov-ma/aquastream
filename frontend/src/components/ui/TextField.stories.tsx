import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import TextField from './TextField';

const meta = {
  title: 'UI/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['standard', 'outlined', 'filled', 'floating'],
      description: 'Вариант стиля поля ввода',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Размер поля ввода',
    },
    label: {
      control: 'text',
      description: 'Метка поля ввода',
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер',
    },
    helperText: {
      control: 'text',
      description: 'Вспомогательный текст под полем',
    },
    error: {
      control: 'boolean',
      description: 'Отображение ошибки',
    },
    errorText: {
      control: 'text',
      description: 'Текст ошибки',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растягивать поле на всю ширину контейнера',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключение поля ввода',
    },
    startIcon: {
      control: { type: 'text' },
      description: 'Иконка в начале поля (React-компонент)',
    },
    endIcon: {
      control: { type: 'text' },
      description: 'Иконка в конце поля (React-компонент)',
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
      description: 'Тип поля ввода',
    },
    required: {
      control: 'boolean',
      description: 'Обязательное поле',
    },
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
export const Standard: Story = {
  args: {
    variant: 'outlined',
    label: 'Стандартный инпут',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Обведенное поле',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Заполненное поле',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Floating: Story = {
  args: {
    variant: 'floating',
    label: 'Плавающая метка',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

// Размеры полей
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Маленькое поле',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Среднее поле',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Большое поле',
    placeholder: 'Введите текст',
  },
  render: (args) => <ControlledTextField {...args} />,
};

// Состояния
export const WithHelperText: Story = {
  args: {
    label: 'Поле с подсказкой',
    placeholder: 'Введите текст',
    helperText: 'Это вспомогательный текст',
  },
  render: (args: JSX.IntrinsicAttributes) => <ControlledTextField {...args} />,
};

export const WithError: Story = {
  args: {
    label: 'Поле с ошибкой',
    placeholder: 'Введите текст',
    error: true,
    errorText: 'Это поле обязательно для заполнения',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Required: Story = {
  args: {
    label: 'Обязательное поле',
    placeholder: 'Введите текст',
    required: true,
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    placeholder: 'Недоступно для ввода',
    disabled: true,
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const FullWidth: Story = {
  args: {
    label: 'Поле на всю ширину',
    placeholder: 'Введите текст',
    fullWidth: true,
  },
  render: (args) => <ControlledTextField {...args} />,
  parameters: {
    layout: 'padded',
  },
};

// Типы полей
export const Password: Story = {
  args: {
    label: 'Пароль',
    placeholder: 'Введите пароль',
    type: 'password',
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const Email: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@example.com',
    type: 'email',
  },
  render: (args) => <ControlledTextField {...args} />,
};

// Поле с иконками
export const WithIcons: Story = {
  args: {
    label: 'Поле с иконками',
    placeholder: 'Введите текст',
    startIcon: <span>🔍</span>,
    endIcon: <span>❌</span>,
  },
  render: (args) => <ControlledTextField {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Поле с иконками в начале и конце. В реальном приложении используйте компоненты иконок.',
      },
    },
  },
};

// Используем компонент в истории для отображения лимита
export const WithCharacterLimit: Story = {
  args: {
    label: 'Комментарий (макс. 100 символов)',
    maxLength: 100,
    placeholder: 'Введите ваш комментарий...',
    helperText: 'Введите до 100 символов',
  },
};
