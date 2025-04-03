import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

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
      options: ['primary', 'secondary', 'outline', 'danger', 'accent', 'ghost'],
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
    loading: {
      control: { type: 'boolean' },
      description: 'Состояние загрузки кнопки',
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика',
    },
    children: {
      control: { type: 'text' },
      description: 'Содержимое кнопки (текст, иконки)',
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
    variant: 'outline',
    children: 'Кнопка',
  },
};

// Добавляем истории для новых вариантов
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Опасная кнопка',
  },
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Акцентная кнопка',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Призрачная кнопка',
  },
};

// Размеры кнопок
export const Small: Story = {
  args: {
    size: 'small',
    children: 'Маленькая кнопка',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    children: 'Средняя кнопка',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
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

// Добавляем историю для loading
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Загрузка...',
  },
};

// Пример с иконками (в Storybook будут отображены строки вместо иконок)
export const WithIcons: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <span role="img" aria-label="rocket" style={{ marginRight: '8px' }}>
          🚀
        </span>
        Кнопка с иконками
        <span role="img" aria-label="thumbs up" style={{ marginLeft: '8px' }}>
          👍
        </span>
      </>
    ),
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
