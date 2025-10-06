# Frontend — обзор

Статус: as-is

## Технологический стек
- Next.js 15.5 (App Router), React 18, TypeScript strict
- Tailwind CSS 3.4 (3.4.18), shadcn/ui (Radix), next-themes
- RHF + Zod (формы), fetch/React Query стратегии
- Playwright e2e smoke

## Структура проекта (упрощённо)
```
frontend/
├── app/                 # App Router, страницы и layout
├── components/          # Переиспользуемые компоненты (shadcn/ui + примитивы)
├── hooks/               # Пользовательские хуки
├── shared/              # Клиент/сервер утилиты, store, API слой
├── tests/               # Тесты (e2e/unit)
└── public/              # Статика
```

Ключевые страницы (см. routing.md):
- `/`, `/org/:slug`, `/org/:slug/events`, `/events/:id`, `/checkout/:bookingId`
- `/auth/login|register|recovery`, `/dashboard`

## Документы
- [Setup](setup.md)
- [Components](components.md)
- [Routing](routing.md)
- [State Management](state-management.md)
- [API Integration](api-integration.md)
- [Deployment](deployment.md)
- [Security](security.md)
