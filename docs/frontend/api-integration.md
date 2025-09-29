# Интеграция с API (Frontend)

Статус: to-be

- Базовый URL: `NEXT_PUBLIC_API_BASE_URL`
- Авторизация: cookie HttpOnly (JWT as-is), планируется OAuth2 (to-be)
- Ретрай/ошибки: единый слой запросов

## Чекаут и платежи
- Виджет эквайринга (YooKassa/CloudPayments/Stripe) — обновление статуса через вебхук
- QR-оплата — загрузка пруфа и модерация

## Моки (dev)
- MSW включается при `NEXT_PUBLIC_USE_MOCKS=true`
