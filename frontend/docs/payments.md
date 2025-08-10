# Платежи и вебхуки (dev)

## Виджет и QR

- Виджет: `components/checkout/PaymentWidget.tsx`
- QR‑пруф: `components/checkout/QrSection.tsx`
- Страница: `app/(routes)/checkout/[bookingId]/page.tsx`

## Моковые эндпоинты

- Создание брони: `POST /api/bookings` → `{ id }`
- Детали брони: `GET /api/bookings/:id`
- QR пруф: `POST /api/payments/qr` → статус `submitted`
- Вебхуки провайдеров: `POST /api/webhooks/payment/:provider` (`yookassa|cloudpayments|stripe`) → статус `paid|canceled`
- Универсальный мок вебхука: `POST /api/payments/webhook` (dev)

## Модерация оплат (организатор)

- Очередь: `GET /api/organizer/moderation/queue` (возвращает `submitted`, при отсутствии — сид заглушки)
- Действие: `PATCH /api/organizer/moderation/queue` body `{ id, action: "accept"|"reject", comment? }`

## Замечания

- Состояние хранится in‑memory в `shared/bookings-store.ts`.
- Для SSR используйте абсолютные URL через `NEXT_PUBLIC_API_BASE_URL`.
