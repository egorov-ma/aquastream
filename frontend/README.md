# AquaStream Frontend

Фронтенд для платформы планирования сплавов AquaStream. Проект построен на React, TypeScript, Redux Toolkit и Tailwind CSS.

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
│   ├── modules/            # Функциональные модули
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
├── run_frontend.sh         # Основной скрипт управления проектом
├── tailwind.config.js      # Конфигурация Tailwind CSS
├── tsconfig.json           # Конфигурация TypeScript
├── vite.config.ts          # Основная конфигурация Vite
└── vitest.config.ts        # Конфигурация Vitest (тестирование)
```

## Требования

- Node.js >= 18.0.0
- npm >= 9.0.0

## Быстрый старт

1. Установка зависимостей:
```bash
./run_frontend.sh install
```

2. Запуск в режиме разработки:
```bash
./run_frontend.sh dev
```

3. Сборка для продакшена:
```bash
./run_frontend.sh build
```

4. Запуск в Docker-контейнере:
```bash
./run_frontend.sh docker
```

## Тестирование

1. Запуск всех тестов:
```bash
./run_frontend.sh test-all
```

2. Запуск модульных тестов:
```bash
./run_frontend.sh test:unit
```

3. Запуск интеграционных тестов:
```bash
./run_frontend.sh test:integration
```

4. Запуск E2E тестов:
```bash
./run_frontend.sh test:e2e
```

## Линтинг и форматирование

```bash
# Проверка линтером
./run_frontend.sh lint

# Автоматическое исправление ошибок линтера
./run_frontend.sh lint:fix

# Форматирование кода
./run_frontend.sh format
```

## Обновление структуры проекта

Для миграции на новую структуру проекта:
```bash
./scripts/update-structure.sh
```

## Мониторинг

```bash
# Проверить статус приложения
./run_frontend.sh status

# Просмотр логов
./run_frontend.sh logs
```

## Анализ сборки

```bash
./run_frontend.sh analyze
```

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