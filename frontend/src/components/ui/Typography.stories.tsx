import type { Meta, StoryObj } from '@storybook/react';

import Typography from './Typography';

const meta = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'body-1',
        'body-2',
        'subtitle-1',
        'subtitle-2',
        'caption',
      ],
      description: 'Вариант типографики',
    },
    color: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'success',
        'error',
        'warning',
        'info',
        'text-primary',
        'text-secondary',
      ],
      description: 'Цвет текста',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right', 'justify'],
      description: 'Выравнивание текста',
    },
    component: {
      control: 'text',
      description: 'HTML элемент, который будет использоваться',
    },
    children: {
      control: 'text',
      description: 'Текстовое содержимое',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS-классы',
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// Заголовки
export const H1: Story = {
  args: {
    variant: 'h1',
    children: 'Заголовок H1',
  },
};

export const H2: Story = {
  args: {
    variant: 'h2',
    children: 'Заголовок H2',
  },
};

export const H3: Story = {
  args: {
    variant: 'h3',
    children: 'Заголовок H3',
  },
};

export const H4: Story = {
  args: {
    variant: 'h4',
    children: 'Заголовок H4',
  },
};

export const H5: Story = {
  args: {
    variant: 'h5',
    children: 'Заголовок H5',
  },
};

export const H6: Story = {
  args: {
    variant: 'h6',
    children: 'Заголовок H6',
  },
};

// Основной текст
export const Body1: Story = {
  args: {
    variant: 'body-1',
    children:
      'Основной текст размера 1. Используется для большинства текстового содержимого на странице.',
  },
};

export const Body2: Story = {
  args: {
    variant: 'body-2',
    children: 'Основной текст размера 2. Используется для второстепенной информации.',
  },
};

// Подзаголовки
export const Subtitle1: Story = {
  args: {
    variant: 'subtitle-1',
    children: 'Подзаголовок 1. Используется для подзаголовков и важной информации.',
  },
};

export const Subtitle2: Story = {
  args: {
    variant: 'subtitle-2',
    children: 'Подзаголовок 2. Используется для второстепенных подзаголовков.',
  },
};

// Цвета
export const Primary: Story = {
  args: {
    variant: 'body-1',
    color: 'primary',
    children: 'Текст с основным цветом',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'body-1',
    color: 'secondary',
    children: 'Текст с дополнительным цветом',
  },
};

export const Success: Story = {
  args: {
    variant: 'body-1',
    color: 'success',
    children: 'Текст с цветом успеха',
  },
};

export const Error: Story = {
  args: {
    variant: 'body-1',
    color: 'error',
    children: 'Текст с цветом ошибки',
  },
};

export const Warning: Story = {
  args: {
    variant: 'body-1',
    color: 'warning',
    children: 'Текст с цветом предупреждения',
  },
};

export const Info: Story = {
  args: {
    variant: 'body-1',
    color: 'info',
    children: 'Текст с информационным цветом',
  },
};

// Выравнивание
export const Left: Story = {
  args: {
    variant: 'body-1',
    align: 'left',
    children: 'Текст с выравниванием по левому краю',
  },
};

export const Center: Story = {
  args: {
    variant: 'body-1',
    align: 'center',
    children: 'Текст с выравниванием по центру',
  },
};

export const Right: Story = {
  args: {
    variant: 'body-1',
    align: 'right',
    children: 'Текст с выравниванием по правому краю',
  },
};

export const Justify: Story = {
  args: {
    variant: 'body-1',
    align: 'justify',
    children:
      'Текст с выравниванием по ширине. Это длинный текст, который должен быть разделен на несколько строк, чтобы продемонстрировать эффект выравнивания по ширине.',
  },
};
