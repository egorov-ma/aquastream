## Покрытие кода тестами

![Statements](https://img.shields.io/badge/Statements-17%25-red) ![Branches](https://img.shields.io/badge/Branches-9%25-red) ![Functions](https://img.shields.io/badge/Functions-13%25-red) ![Lines](https://img.shields.io/badge/Lines-17%25-red)

![Frontend CI](https://github.com/egorov-ma/aquastream/actions/workflows/frontend-ci.yml/badge.svg)

# AquaStream Frontend

Полная документация переехала в [infra/docs/frontend](../infra/docs/frontend/README.md). Ниже сохранена краткая справка.

Сведения о структуре темизации и плагинах Tailwind доступны в [docs/theming.md](docs/theming.md).

## Структура проекта

```
frontend/
├── config/                 # Конфигурация приложения
│   └── vite/               # Конфигурация Vite для разных окружений
├── public/                 # Статические файлы
├── scripts/                # Скрипты для сборки, запуска и обслуживания
├── src/                    # Исходный код
│   ├── assets/             # Статические ресурсы (изображения, иконки и т.д.)
│   ├── components/         # Переиспользуемые компоненты
│   │   ├── ui/             # UI компоненты (кнопки, инпуты и т.д.)
│   │   └── layout/         # Компоненты макета (заголовок, подвал и т.д.)
│   ├── hooks/              # Пользовательские хуки React
│   ├── layouts/            # Макеты страниц
│   ├── lib/                # Библиотеки и утилиты
│   ├── modules/            # Функциональные модули (Feature Slices)
│   ├── pages/              # Компоненты страниц
│   ├── routes/             # Конфигурация маршрутизации
│   ├── services/           # Сервисы для API и внешних взаимодействий
│   ├── shared/             # Общие компоненты и типы
│   ├── store/              # Управление состоянием (Redux)
│   ├── styles/             # Глобальные стили
│   ├── theme/              # Настройки темы
│   ├── types/              # TypeScript типы и интерфейсы
│   ├── utils/              # Вспомогательные функции
│   ├── App.tsx             # Корневой компонент приложения
│   ├── main.tsx            # Точка входа
│   ├── global.d.ts         # Глобальные определения типов
│   └── index.css           # Глобальные стили
├── test/                   # Тесты
│   ├── e2e/                # E2E тесты (Playwright)
│   ├── integration/        # Интеграционные тесты
│   ├── unit/               # Модульные тесты
│   ├── utils/              # Утилиты для тестирования
│   ├── fixtures/           # Фикстуры для тестов
│   └── setup.ts            # Настройка тестового окружения
├── .eslintrc.json          # Конфигурация ESLint
├── .prettierrc             # Конфигурация Prettier
├── index.html              # HTML шаблон
├── package.json            # Зависимости и скрипты npm
├── playwright.config.ts    # Конфигурация Playwright
├── postcss.config.js       # Конфигурация PostCSS
├── tailwind.config.js      # Конфигурация Tailwind CSS
├── tsconfig.json           # Конфигурация TypeScript
├── vite.config.ts          # Основная конфигурация Vite
└── vitest.config.ts        # Конфигурация Vitest (тестирование)
```

## Модульная архитектура (Feature-Sliced Design)

Проект организован по принципам Feature-Sliced Design, что обеспечивает четкое разделение ответственности и упрощает навигацию по коду.

### Модули (modules/)

Модули представляют собой бизнес-функциональность приложения:

```
modules/
├── auth/                # Модуль аутентификации и авторизации
│   ├── api/             # API-клиенты для работы с аутентификацией
│   ├── components/      # Компоненты, связанные с аутентификацией
│   ├── hooks/           # Хуки для работы с аутентификацией
│   ├── store/           # Управление состоянием модуля (redux слайсы)
│   ├── types/           # Типы, связанные с аутентификацией
│   └── index.ts         # Публичное API модуля
├── events/              # Модуль управления сплавами
│   ├── api/
│   ├── components/
│   └── ...
└── ...
```

### Добавление нового модуля

1. Создайте директорию модуля в `src/modules/`
2. Создайте необходимые поддиректории (api, components, hooks, store, types)
3. Реализуйте функциональность модуля
4. Создайте файл `index.ts` для экспорта публичного API модуля
5. При необходимости интегрируйте модуль с глобальным состоянием в `src/store/`

### Компоненты UI

UI компоненты следуют принципам Atomic Design и располагаются в `src/components/ui/`:

```
components/ui/
├── Button/              # Кнопки
├── TextField/           # Поля ввода
├── Modal/               # Модальные окна
└── ...
```

Подробная документация по UI компонентам доступна в [Storybook](./.docs/storybook-guidelines.md).

## Стиль кода и конвенции

### Основные правила

- **Форматирование**: Prettier с 2 пробелами для отступов
- **Кавычки**: Одинарные кавычки для строк
- **Компоненты**: Функциональные компоненты с хуками
- **TypeScript**: Строгая типизация для всех компонентов и функций
- **Импорты**: Используем абсолютные пути с алиасами (`@/components`, `@/services`)
- **Именование**: PascalCase для компонентов, camelCase для функций, UPPER_CASE для констант

Полные правила описаны в [Стандартах кодирования](./.docs/CODING_STANDARDS.md).

### ESLint и Prettier

Проект настроен с ESLint и Prettier для обеспечения согласованности стиля кода:

```bash
# Проверка кода
npm run lint

# Автоматическое исправление
npm run lint:fix

# Форматирование
npm run format
```

## Тестирование

### Виды тестов

- **Модульные тесты**: Тестирование отдельных компонентов и функций (Vitest + Testing Library)
- **Интеграционные тесты**: Тестирование взаимодействия компонентов (Vitest + Testing Library)
- **E2E тесты**: Тестирование приложения в браузере (Playwright)

### Запуск тестов

```bash
# Запуск всех тестов
npm run test

# Запуск с покрытием кода
npm run test:coverage

# Запуск модульных тестов
npm run test:unit

# Запуск E2E тестов
npm run test:e2e
```

Подробная информация о тестировании доступна в [Стратегии тестирования](./.docs/testing-strategy.md).

## Требования

- Node.js >= 18.0.0
- npm >= 9.0.0

## Быстрый старт

1. Установка зависимостей:
```bash
npm install
```

2. Запуск в режиме разработки:
```bash
npm run dev
```

3. Сборка для продакшена:
```bash
npm run build
```

4. Запуск в Docker-контейнере:
```bash
npm run docker:rebuild
```

## Деплой

### Docker-образ

Приложение собирается и развертывается в виде Docker-образа. Сборка образа использует многоступенчатый процесс:

1. Сборка приложения в Node.js окружении
2. Копирование собранных файлов в Nginx-образ с настроенным GZIP и Brotli сжатием

### Настройка Nginx

Конфигурация Nginx расположена в файле `nginx.conf` и включает:
- Оптимизацию статических файлов (кеширование, сжатие)
- Поддержку SPA-роутинга (перенаправление на index.html)
- Проксирование API-запросов на бекенд

### Переменные окружения

Для настройки окружения используйте файл `.env` или передавайте переменные при запуске контейнера:

```bash
docker run -p 3000:80 -e API_URL=https://api.example.com aquastream-frontend
```

Список доступных переменных окружения:
- `API_URL` - URL API-сервера
- `NODE_ENV` - Окружение (`development`, `production`)

## Документация

Дополнительная документация доступна в директории `.docs/`:

- [Архитектура](./.docs/ARCHITECTURE.md)
- [Стандарты кодирования](./.docs/CODING_STANDARDS.md)
- [UI компоненты](./.docs/ui-components.md)
- [Стратегия тестирования](./.docs/testing-strategy.md)
- [Оптимизация производительности](./.docs/performance-optimization.md)
- [Доступность (a11y)](./.docs/accessibility.md)

## Технологии

- React 18
- TypeScript
- Redux Toolkit
- React Router v7
- Tailwind CSS
- Vite
- Vitest
- Playwright
- ESLint
- Prettier
- Husky
- Framer Motion 
