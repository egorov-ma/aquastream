import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card'; // Импортируем компонент и его части
import { Button } from '../Button'; // Импортируем Button для примера действий
import { Typography } from '../Typography/Typography'; // Импортируем Typography для контента

const meta = {
  title: 'UI/Card',
  component: Card,
  subcomponents: { CardHeader, CardTitle, CardContent, CardFooter }, // Указываем подкомпоненты
  parameters: {
    layout: 'padded', // Используем padded для лучшего вида карточек с тенью
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated', 'flat', 'primary', 'accent'],
      description: 'Вариант отображения карточки',
    },
    noPadding: {
      control: 'boolean',
      description: 'Убрать внутренние отступы',
    },
    hoverEffect: {
      control: 'select',
      options: ['none', 'lift', 'glow', 'scale'],
      description: 'Эффект анимации при наведении',
    },
    appearEffect: {
      control: 'select',
      options: ['none', 'fade-in', 'slide-up', 'scale'],
      description: 'Эффект анимации при появлении',
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика по карточке',
    },
    children: {
      control: false, // Управляем через составные истории
      description: 'Содержимое карточки (обычно CardHeader, CardContent, CardFooter)',
    },
  },
  args: {
    variant: 'default',
    noPadding: false,
    hoverEffect: 'none',
    appearEffect: 'none',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Функция рендера для составных историй
const renderCardContent = (title: string, content: React.ReactNode, actions?: React.ReactNode) => (
  <>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{content}</CardContent>
    {actions && <CardFooter>{actions}</CardFooter>}
  </>
);

export const Default: Story = {
  args: {
      children: renderCardContent(
        'Стандартная карточка',
        <Typography>Это содержимое стандартной карточки.</Typography>,
        <Button variant="default" size="sm">Действие</Button>
      ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: renderCardContent(
      'Обведенная карточка',
      <Typography>Карточка с рамкой.</Typography>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: renderCardContent(
      'Приподнятая карточка',
      <Typography>Карточка с тенью и эффектом при наведении.</Typography>
    ),
  },
};

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: renderCardContent(
      'Плоская карточка',
      <Typography>Карточка без теней и рамок, с фоном.</Typography>
    ),
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: renderCardContent(
      'Основная карточка',
      <Typography>Карточка основного цвета.</Typography>,
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 dark:hover:bg-white/20">Действие</Button>
    ),
  },
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: renderCardContent(
      'Акцентная карточка',
      <Typography>Карточка акцентного цвета.</Typography>
    ),
  },
};

export const WithoutPadding: Story = {
  args: {
    noPadding: true,
    children: (
      // Пример без стандартных Card* компонентов
      <img 
        src="https://via.placeholder.com/400x200" 
        alt="Placeholder" 
        className="block w-full"
      />
    ),
  },
};

export const Clickable: Story = {
  args: {
    onClick: () => alert('Card clicked!'),
    hoverEffect: 'lift', // Добавим эффект для интерактивности
    children: renderCardContent(
      'Кликабельная карточка',
      <Typography>Нажмите на эту карточку.</Typography>
    ),
  },
};

export const WithHoverEffect: Story = {
  args: {
    hoverEffect: 'glow',
    children: renderCardContent(
      'Карточка с Glow эффектом',
      <Typography>Наведите курсор для эффекта свечения.</Typography>
    ),
  },
};

export const WithAppearEffect: Story = {
  args: {
    appearEffect: 'slide-up',
    children: renderCardContent(
      'Карточка с анимацией появления',
      <Typography>Эта карточка появилась с анимацией.</Typography>
    ),
  },
}; 