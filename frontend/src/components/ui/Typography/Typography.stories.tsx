import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography'; // Импортируем компонент

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
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'subtitle-1', 'subtitle-2',
        'body-1', 'body-2',
        'caption', 'button', 'overline',
      ],
      description: 'Вариант типографики',
    },
    color: {
      control: { type: 'select' },
      options: [
        'primary', 'secondary', 'accent', 'error', 'warning', 'success', 'info',
        'text-primary', 'text-secondary', 'inherit',
      ],
      description: 'Цвет текста',
    },
    align: {
      control: { type: 'select' },
      options: ['inherit', 'left', 'center', 'right', 'justify'],
      description: 'Выравнивание текста',
    },
    children: {
      control: 'text',
      description: 'Текстовое содержимое',
    },
    component: {
      control: 'text',
      description: 'HTML тег (например, h1, p, span)',
    },
  },
  args: {
    children: 'Пример текста',
    variant: 'body-1',
    color: 'text-primary',
    align: 'left',
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Heading1: Story = {
  args: {
    variant: 'h1',
    children: 'Заголовок H1',
  },
};

export const Body2Secondary: Story = {
  args: {
    variant: 'body-2',
    color: 'text-secondary',
    children: 'Вторичный текст body-2',
  },
};

export const ErrorCaption: Story = {
  args: {
    variant: 'caption',
    color: 'error',
    align: 'center',
    children: 'Текст ошибки caption по центру',
  },
};

export const PrimarySubtitle: Story = {
  args: {
    variant: 'subtitle-1',
    color: 'primary',
    children: 'Подзаголовок основного цвета',
  },
};

export const CustomComponent: Story = {
  args: {
    variant: 'body-1',
    component: 'span',
    children: 'Текст внутри span',
  },
};
