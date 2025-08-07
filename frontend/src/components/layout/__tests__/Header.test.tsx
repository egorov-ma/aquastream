import '@testing-library/jest-dom';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';


import Header from '../Header/Header';
import { ThemeProvider } from '@/providers/ThemeProvider';

import { renderWithProviders } from '@/test/utils';

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
    localStorage.clear();
  });

  it('renders with navigation items and theme toggle button', () => {
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider>
          <Header navItems={mockNavItems} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Проверяем, что логотип (ссылка) есть на странице
    expect(screen.getByTestId('logo-link')).toBeInTheDocument();

    // Проверяем, что все пункты меню отображаются с переведенными названиями
    expect(screen.getByText('Домой')).toBeInTheDocument();
    expect(screen.getByText('Мероприятия')).toBeInTheDocument();

    // Проверяем, что кнопка смены темы есть на странице
    const themeToggleButton = screen.getAllByTestId('theme-switcher')[0];
    expect(themeToggleButton).toBeInTheDocument();
  });

  it('renders correct theme icon based on theme prop', () => {
    // Проверяем темную тему
    const { unmount } = renderWithProviders(
      <MemoryRouter>
        <ThemeProvider defaultTheme="dark">
          <Header navItems={mockNavItems} />
        </ThemeProvider>
      </MemoryRouter>
    );

    const lightIcon = screen.getAllByTestId('light-icon')[0];
    expect(lightIcon).toBeInTheDocument();

    // Размонтируем компонент и очищаем DOM
    unmount();
    cleanup();
    localStorage.clear();

    // Проверяем светлую тему
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider>
          <Header navItems={mockNavItems} />
        </ThemeProvider>
      </MemoryRouter>
    );

    const darkIcon = screen.getAllByTestId('dark-icon')[0];
    expect(darkIcon).toBeInTheDocument();
  });

  it('toggles theme when theme button is clicked', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider>
          <Header navItems={mockNavItems} />
        </ThemeProvider>
      </MemoryRouter>
    );

    const themeToggleButton = screen.getAllByTestId('theme-switcher')[0];
    await userEvent.click(themeToggleButton);

    const lightIcon = screen.getAllByTestId('light-icon')[0];
    expect(lightIcon).toBeInTheDocument();
  });

  it('renders correct navigation links with href attributes', () => {
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider>
          <Header navItems={mockNavItems} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Проверяем, что ссылки имеют правильные атрибуты href
    const homeLink = screen.getByText('Домой');
    expect(homeLink).toHaveAttribute('href', '/');

    const eventsLink = screen.getByText('Мероприятия');
    expect(eventsLink).toHaveAttribute('href', '/events');
  });
});
