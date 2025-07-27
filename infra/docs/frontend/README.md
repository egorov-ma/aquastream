# AquaStream Frontend – Документация

> Версия: 0.1 (draft)

Веб-клиент AquaStream построен на React 18 и TypeScript, использует **Feature-Sliced Design (FSD)** для организации кода и **Tailwind CSS** для стилизации.

---

## Стек технологий

| Категория | Инструменты |
|-----------|-------------|
| Бандлер   | Vite 5 |
| UI        | React 18, Tailwind CSS |
| Управление состоянием | Redux Toolkit, RTK Query |
| Тесты     | Vitest, React Testing Library, Playwright |
| Документация UI | Storybook 8 |
| Качество кода | ESLint, Prettier, Husky + lint-staged |

---

## Архитектура кода

Проект следует принципам **Feature-Sliced Design** (FSD) и **Atomic Design** для UI.

```
src/
├── components/          # Общие UI (atoms, molecules, organisms)
├── modules/             # Фичи домена (auth, events, ui)
├── pages/               # Страницы маршрутов
├── hooks/               # Переиспользуемые хуки
├── services/            # API-клиенты, utils для fetch
├── store/               # Redux store + слайсы
├── styles/              # Tailwind theme & globals
└── routes/              # React-Router config
```

FSD уровни:
* `shared/` — переиспользуемые константы, types.
* `entities/` — бизнес-сущности (пока не выделены, планируется).
* `features/` — законченные пользовательские функции.
* `widgets/` — блоки страниц (например, "EventCardList").
* `pages/` — конечные страницы и маршруты.

---

## Сборка и запуск

```bash
# Установка зависимостей
npm ci

# Dev-сервер на http://localhost:3000
npm run dev

# Прод-сборка (dist/)
npm run build

# Превью собранного кода
npm run preview
```

### Скрипт `run_frontend.sh`
Оборачивает типовые команды (`install`, `dev`, `build`, `docker`).

---

## Конфигурация окружения

| Переменная | Значение по умолчанию | Описание |
|------------|-----------------------|----------|
| `API_URL`  | `/api` | Базовый URL API Gateway |
| `NODE_ENV` | `development` | Режим работы Vite |

Создайте `.env.local` для локальных настроек.

---

## Тестирование

| Команда | Описание |
|---------|----------|
| `npm run test` | Юнит/интеграционные тесты Vitest |
| `npm run test:coverage` | Отчёт покрытия + бейджи |
| `npm run test:e2e` | E2E тесты Playwright |

Файл `vitest.config.ts` содержит алиасы и jsdom-окружение.

---

## Storybook

```bash
npm run storybook
```

Компоненты расположены в `src/components/ui/*`. Док-я генерируется в `storybook-static/`.

---

## Линтинг и форматирование

```bash
npm run lint     # ESLint
npm run format   # Prettier
```

Husky прерывает коммит при ошибке линтинга.

---

## Путь к импортам

В `tsconfig.json` настроен алиас `@/` на `src/`.

```ts
import { Button } from '@/components/ui';
```

---

## CI/CD

Workflow `frontend-ci.yml` выполняет:
* Установка зависимостей
* Линтинг + type-check
* Тесты с покрытием
* Генерацию бейджей
* Сборку прод-версии

Детали в [инструкции CI/CD](../ci-cd/README.md).

---

## Docker

Мульти-стадийный `Dockerfile.backend-frontend` (см. `infra/docker/images`) собирает статику и запускает Nginx с включённым gzip/brotli.

```bash
docker build -t aquastream-frontend -f infra/docker/images/Dockerfile.backend-frontend .
```

---

## TODO
- [ ] Выделить слой `entities/`.
- [ ] Добавить Lighthouse-аудит в CI.

---

© AquaStream, 2024 