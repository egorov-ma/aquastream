import { screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Header from '../Header/Header';

import { renderWithProviders } from '@/test/utils';
import { lightTheme, darkTheme } from '@/theme';

// Создаем mockTranslate перед использованием
const mockTranslate = vi.fn((key) => {
  const translations: Record<string, string> = {
    'menu.home': 'Домой',
    'menu.events': 'Мероприятия',
  };
  return translations[key] || key;
});

// Мокаем хук useTranslate перед тестами
vi.mock('@/hooks', () => ({
  useTranslate: () => mockTranslate,
}));

describe('Header Component', () => {
  const mockNavItems = [
    { id: 'home', name: 'Главная', path: '/', labelKey: 'menu.home' },
    { id: 'events', name: 'События', path: '/events', labelKey: 'menu.events' },
  ];

  // Очищаем DOM после каждого теста
  afterEach(() => {
    cleanup();
  });

  it('renders with navigation items and theme toggle button', () => {
    renderWithProviders(
      <MemoryRouter>
        <Header navItems={mockNavItems} theme="light" />
      </MemoryRouter>
    );

    // Проверяем, что логотип есть на странице
    expect(screen.getByText('AquaStream')).toBeInTheDocument();

    // Проверяем, что все пункты меню отображаются с переведенными названиями
    expect(screen.getByText('Домой')).toBeInTheDocument();
    expect(screen.getByText('Мероприятия')).toBeInTheDocument();

    // Проверяем, что кнопка смены темы есть на странице
    const themeToggleButton = screen.getByLabelText('Toggle theme');
    expect(themeToggleButton).toBeInTheDocument();
  });

  it('applies correct theme classes based on theme prop', () => {
    // Сначала проверяем темную тему
    const { unmount } = renderWithProviders(
      <MemoryRouter>
        <Header navItems={mockNavItems} theme="dark" />
      </MemoryRouter>
    );

    // Проверяем, что шапка имеет правильные классы для темной темы
    const darkHeader = screen.getByRole('banner');
    expect(darkHeader).toHaveClass(darkTheme.header);

    // Размонтируем компонент и очищаем DOM
    unmount();
    cleanup();

    // Проверяем светлую тему
    renderWithProviders(
      <MemoryRouter>
        <Header navItems={mockNavItems} theme="light" />
      </MemoryRouter>
    );

    const lightHeader = screen.getByRole('banner');
    expect(lightHeader).toHaveClass(lightTheme.header);
  });

  it('calls onThemeToggle when theme button is clicked', () => {
    const handleThemeToggle = vi.fn();

    renderWithProviders(
      <MemoryRouter>
        <Header navItems={mockNavItems} theme="light" onThemeToggle={handleThemeToggle} />
      </MemoryRouter>
    );

    // Находим кнопку смены темы
    const themeToggleButton = screen.getByLabelText('Toggle theme');

    // Используем fireEvent вместо user.click
    fireEvent.click(themeToggleButton);

    // Проверяем, что обработчик был вызван
    expect(handleThemeToggle).toHaveBeenCalledTimes(1);
  });

  it('renders correct navigation links with href attributes', () => {
    renderWithProviders(
      <MemoryRouter>
        <Header navItems={mockNavItems} theme="light" />
      </MemoryRouter>
    );

    // Проверяем, что ссылки имеют правильные атрибуты href
    const homeLink = screen.getByText('Домой');
    expect(homeLink).toHaveAttribute('href', '/');

    const eventsLink = screen.getByText('Мероприятия');
    expect(eventsLink).toHaveAttribute('href', '/events');
  });
});
