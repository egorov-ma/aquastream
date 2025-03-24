import type { Meta, StoryObj } from '@storybook/react';

import Button from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outlined'],
      description: 'Вариант стиля кнопки',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Размер кнопки',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Растягивать кнопку на всю ширину контейнера',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Отключение кнопки',
    },
    startIcon: {
      control: { type: 'text' },
      description: 'Иконка в начале кнопки (React-компонент)',
    },
    endIcon: {
      control: { type: 'text' },
      description: 'Иконка в конце кнопки (React-компонент)',
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Основные варианты кнопок
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Кнопка',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Кнопка',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Кнопка',
  },
};

// Размеры кнопок
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Маленькая кнопка',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Средняя кнопка',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Большая кнопка',
  },
};

// Дополнительные варианты
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Кнопка на всю ширину',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Отключенная кнопка',
  },
};

// Пример с иконками (в Storybook будут отображены строки вместо иконок)
export const WithIcons: Story = {
  args: {
    children: 'Кнопка с иконками',
    startIcon: <span>🚀</span>,
    endIcon: <span>👍</span>,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Кнопка с иконками в начале и конце. В реальном приложении используйте компоненты иконок.',
      },
    },
  },
};
