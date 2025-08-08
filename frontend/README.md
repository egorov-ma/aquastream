

## Технический стек и стандарты
- **Node.js 22 LTS**, **pnpm**, Docker base `node:22-alpine`.
- **Next.js 15 (App Router, RSC/ISR, Route Handlers)**, **React 19**.
- **TypeScript** strict, **ESLint 9 (flat)**, **Prettier 3**.
- **Tailwind v4**, плагин `@tailwindcss/forms` по необходимости.
- **TanStack Query**, **react-hook-form** + **zod**, **lucide-react**, **msw** (dev).
- **Sentry** (prod only).

## Запуск фронтенда локально
- Требования: Node.js 22 LTS, pnpm.

1) Установка зависимостей

```bash
pnpm install
```

2) Режим разработки (по умолчанию: http://localhost:3000)

```bash
pnpm dev
# опционально использовать порт 3100
# PORT=3100 pnpm dev
```

3) Продакшен‑сборка и запуск

```bash
pnpm build
pnpm start  # http://localhost:3000
```

4) Проверки качества

```bash
pnpm lint
pnpm typecheck
```

## Запуск в Docker
Из корня репозитория:

5) Dev-профиль (моки включены, порт 3100)

```bash
docker compose -f infra/docker/compose/docker-compose.frontend.yml --profile dev up --build
# открыть http://localhost:3100
```

6) Prod-профиль (standalone, порт 3000)

```bash
docker compose -f infra/docker/compose/docker-compose.frontend.yml --profile prod up --build
# открыть http://localhost:3000
```

Остановка:

```bash
docker compose -f infra/docker/compose/docker-compose.frontend.yml --profile dev down
```

## Conventional Commits
- Типы: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Формат: `<type>(<scope>): <subject>` — пример: `feat(T02): добавить CI workflow`.