# Моки (MSW)

- SSR/RSC инициализация: `frontend/instrumentation.ts` (MSW Node server.listen()).
- Браузер: `src/mocks/browser.ts` + `components/msw-provider.tsx`.
- Хэндлеры: `src/mocks/handlers.ts` (any-origin паттерны), а также dev API‑роуты в `app/api/**`.

См. также: [README](../README.md), [бизнес‑спека](./AquaStream_Business_Spec_v1.1.md).

## Запуск с моками

```bash
NEXT_PUBLIC_USE_MOCKS=true NEXT_PUBLIC_API_BASE_URL=http://localhost:3101 PORT=3101 pnpm dev
```

## Основные эндпоинты (dev)

- Организатор: `/organizers`, `/organizers/:slug`, `/organizers/:slug/events`
- Профиль: `/api/profile`
- Панель организатора: `/api/organizer/*` (brand/team/faq/events)
- Бронирования/оплаты: `/api/bookings`, `/api/payments/*`, `/api/webhooks/payment/:provider`
- Модерация оплат: `/api/organizer/moderation/queue`
- Группы/участники: `/api/organizer/events/:id/(groups|participants)`
- Лист ожидания: `/api/events/:id/waitlist`
