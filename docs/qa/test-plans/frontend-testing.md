# Frontend Testing Plan

## Обзор

План тестирования frontend приложения AquaStream.

## Технологический стек

- **Framework**: Next.js 14.2.33 (App Router)
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui
- **Testing**: Playwright, Node test runner

## Уровни тестирования

### 1. Unit Tests

**Цель**: тестирование отдельных функций и утилит

**Охват**:
- Утилиты (cn, validators, formatters)
- Хуки (useAuth, useToast)
- Изолированные компоненты

**Инструменты**: Node test runner

**Команда**: `pnpm test:unit`

**Критерий успеха**: покрытие утилит 100%

### 2. Component Tests

**Цель**: тестирование React компонентов

**Охват**:
- UI компоненты (Button, Input, Card)
- Композитные компоненты (Form, Table)
- Layout компоненты (Header, Sidebar)

**Инструменты**: React Testing Library (планируется)

### 3. E2E Tests

**Цель**: тестирование пользовательских сценариев

**Охват**:
- Аутентификация (login, register)
- Навигация
- Формы и валидация
- Критичные пользовательские пути

**Инструменты**: Playwright

**Команда**: `pnpm test:e2e`

**Критерий успеха**: smoke-тесты для всех страниц

## Типы тестов

### Функциональное тестирование
- Корректность отображения данных
- Работа форм и валидация
- Навигация между страницами
- Обработка ошибок

### Визуальное тестирование
- Responsive design (mobile, tablet, desktop)
- Тёмная/светлая тема
- Консистентность UI компонентов

### Доступность (A11y)
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Контрастность цветов

### Производительность
- Lighthouse score ≥90
- First Contentful Paint <1.5s
- Time to Interactive <3s
- Core Web Vitals

## Тестовые сценарии

### Критичные пути

#### Аутентификация
1. Регистрация нового пользователя
2. Вход в систему
3. Восстановление пароля
4. Выход из системы

#### Управление событиями
1. Просмотр списка событий
2. Фильтрация событий
3. Просмотр деталей события
4. Создание события (для организаторов)

#### Бронирование
1. Выбор события
2. Выбор мест
3. Оформление заказа
4. Подтверждение бронирования

## Проверки качества

### Линтеры
```bash
# ESLint
pnpm lint

# TypeScript
pnpm typecheck
```

### Сборка
```bash
# Production build
pnpm build

# Проверка ошибок сборки
```

## Браузеры и устройства

### Поддерживаемые браузеры
- Chrome (последние 2 версии)
- Firefox (последние 2 версии)
- Safari (последние 2 версии)
- Edge (последние 2 версии)

### Разрешения экрана
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

## Метрики

### KPI
- E2E Test Success Rate: 100%
- Lighthouse Performance: ≥90
- Lighthouse Accessibility: ≥95
- Build Success Rate: 100%

### Отчетность
- Playwright HTML reports
- Lighthouse reports (lighthouse.report.json)
- TypeScript/ESLint errors

## CI Integration

```yaml
# Frontend CI Pipeline
1. Install dependencies
2. Lint (ESLint)
3. Type check (TypeScript)
4. Unit tests
5. Build
6. E2E tests (Playwright)
7. Lighthouse audit
```

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Нестабильные E2E тесты | Средняя | Высокое | waitForLoadState, retry logic |
| Медленная сборка | Низкая | Среднее | Кэширование, оптимизация |
| Регрессии UI | Средняя | Среднее | Visual regression tests |

## График

- **Lint + TypeCheck**: при каждом коммите
- **Unit tests**: при каждом PR
- **E2E tests**: при каждом PR
- **Full regression + Lighthouse**: перед релизом
