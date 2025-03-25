import type { Meta, StoryObj } from '@storybook/react';
import { Home, Info, BarChart2, Droplet, Settings, UserCircle } from 'lucide-react';
import { BrowserRouter } from 'react-router-dom';

import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Компонент заголовка (шапки) приложения с гибкими настройками и анимацией',
      },
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    toggleTheme: { action: 'toggleTheme' },
    alignment: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    appearEffect: {
      control: 'select',
      options: ['none', 'fade-in', 'slide-up', 'slide-down'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

// Стандартный заголовок с текстовыми пунктами меню
export const Default: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/' },
      { name: 'О нас', path: '/about' },
      { name: 'Мониторинг', path: '/monitoring' },
      { name: 'Устройства', path: '/devices' },
    ],
  },
};

// Заголовок с иконками
export const WithIcons: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/', icon: Home },
      { name: 'О нас', path: '/about', icon: Info },
      { name: 'Мониторинг', path: '/monitoring', icon: BarChart2 },
      { name: 'Устройства', path: '/devices', icon: Droplet },
      { name: 'Настройки', path: '/settings', icon: Settings },
    ],
  },
};

// Заголовок с бейджами
export const WithBadges: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/', icon: Home },
      {
        name: 'Уведомления',
        path: '/notifications',
        icon: Info,
        badge: {
          content: 5,
          color: 'error',
        },
      },
      {
        name: 'Сообщения',
        path: '/messages',
        icon: BarChart2,
        badge: {
          content: 'Новое',
          color: 'primary',
        },
      },
      { name: 'Устройства', path: '/devices', icon: Droplet },
    ],
  },
};

// Заголовок с анимацией появления
export const WithAppearEffect: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/', icon: Home },
      { name: 'О нас', path: '/about', icon: Info },
      { name: 'Мониторинг', path: '/monitoring', icon: BarChart2 },
      { name: 'Устройства', path: '/devices', icon: Droplet },
    ],
    appearEffect: 'slide-down',
  },
};

// Прозрачный заголовок
export const Transparent: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/', icon: Home },
      { name: 'О нас', path: '/about', icon: Info },
      { name: 'Профиль', path: '/profile', icon: UserCircle },
    ],
    transparent: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Мобильный заголовок (имитация)
export const Mobile: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/', icon: Home },
      { name: 'О нас', path: '/about', icon: Info },
      { name: 'Мониторинг', path: '/monitoring', icon: BarChart2 },
      { name: 'Устройства', path: '/devices', icon: Droplet },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Мобильное меню внизу экрана
export const MobileAsFooter: Story = {
  args: {
    items: [
      { name: 'Главная', path: '/', icon: Home },
      { name: 'Поиск', path: '/search', icon: Info },
      { name: 'Добавить', path: '/add', icon: BarChart2 },
      { name: 'Профиль', path: '/profile', icon: UserCircle },
    ],
    mobileMenuAsFooter: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
