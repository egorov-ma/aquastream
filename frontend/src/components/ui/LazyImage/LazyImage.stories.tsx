import type { Meta, StoryObj } from '@storybook/react';
import { LazyImage } from './LazyImage';

const meta = {
  title: 'UI/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text', description: 'URL основного изображения' },
    alt: { control: 'text', description: 'Альтернативный текст' },
    width: { control: 'text', description: 'Ширина (e.g., 400, "100%")' },
    height: { control: 'text', description: 'Высота (e.g., 300, "auto")' },
    placeholderColor: { control: 'text', description: 'CSS класс цвета плейсхолдера (Tailwind)' },
    previewSrc: { control: 'text', description: 'URL превью низкого качества' },
    lowQualityPreview: { control: 'boolean', description: 'Загружать изображение с низким разрешением' },
    loading: { 
      control: { type: 'select' },
      options: ['lazy', 'eager'],
      description: 'Метод загрузки изображения'
    },
    objectFit: {
      control: { type: 'select' },
      options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
      description: 'Режим отображения изображения'
    },
    rounded: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Радиус скругления углов'
    },
    shadow: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Применить тень'
    },
    fadeAnimation: {
      control: { type: 'select' },
      options: ['none', 'fade', 'zoom', 'blur', 'slide-up'],
      description: 'Тип анимации появления'
    },
    animationDuration: { control: 'number', description: 'Длительность анимации в мс' },
    hoverEffect: {
      control: { type: 'select' },
      options: ['none', 'zoom', 'brightness', 'scale', 'lift'],
      description: 'Эффект при наведении'
    },
    showPreloader: { control: 'boolean', description: 'Показывать прелоадер' },
    fallbackSrc: { control: 'text', description: 'Заменяющее изображение при ошибке' },
    className: { control: 'text', description: 'CSS-класс' }
  },
  args: {
    src: 'https://via.placeholder.com/400x300/3498db/FFFFFF?text=Lazy+Image',
    alt: 'Демонстрационное изображение',
    width: 400,
    height: 300,
    placeholderColor: 'bg-gray-200 dark:bg-gray-700',
    loading: 'lazy',
    objectFit: 'cover',
    rounded: 'md',
    shadow: 'md',
    fadeAnimation: 'fade',
    animationDuration: 500,
    hoverEffect: 'none',
    showPreloader: true
  },
} satisfies Meta<typeof LazyImage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Основные примеры
export const Default: Story = {
  args: {},
};

export const WithPreview: Story = {
  args: {
    lowQualityPreview: true,
    previewSrc: 'https://via.placeholder.com/40x30/3498db/FFFFFF?text=Preview',
  },
};

export const WithRoundedFull: Story = {
  args: {
    rounded: 'full',
    src: 'https://via.placeholder.com/300x300/3498db/FFFFFF?text=Avatar',
    width: 200,
    height: 200,
  },
};

export const WithShadow: Story = {
  args: {
    shadow: 'xl',
  },
};

export const WithZoomAnimation: Story = {
  args: {
    fadeAnimation: 'zoom',
  },
};

export const WithHoverEffect: Story = {
  args: {
    hoverEffect: 'zoom',
  },
};

export const WithCustomFallback: Story = {
  args: {
    src: 'https://invalid-url.com/image.jpg',
    fallbackSrc: 'https://via.placeholder.com/400x300/e74c3c/FFFFFF?text=Error+Loading+Image',
  },
};

export const WithContainFit: Story = {
  args: {
    objectFit: 'contain',
    placeholderColor: 'bg-slate-100',
  },
};
