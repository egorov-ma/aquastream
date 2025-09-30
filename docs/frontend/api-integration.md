# Интеграция с API (Frontend)

Статус: as-is/to-be

- Базовый URL: `NEXT_PUBLIC_API_BASE_URL`
- Авторизация: cookie HttpOnly (JWT as-is), планируется OAuth2 (to-be)
- Ретрай/ошибки: единый слой запросов

## Чекаут и платежи
- Виджет эквайринга (YooKassa/CloudPayments/Stripe): вебхук обновляет статус брони (as-is)
- QR-оплата: загрузка пруфа и модерация организатором (as-is)

### Dev эндпоинты (MSW)
- POST /api/bookings — создание брони → { id }
- GET /api/bookings/:id — детали брони
- POST /api/payments/qr — приём пруфа по QR → status=submitted
- POST /api/webhooks/payment/:provider — статусы `succeeded|canceled`

## Моки (dev)
- MSW включается при `NEXT_PUBLIC_USE_MOCKS=true`
 - SSR/RSC инициализация в `frontend/instrumentation.ts`
 - Основные хэндлеры: `src/mocks/handlers.ts`
