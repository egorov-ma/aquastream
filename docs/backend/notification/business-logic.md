# Notification — бизнес-логика

Статус: as-is

## Каналы и категории
- Telegram (первый канал), далее e-mail/SMS при необходимости
- Обязательные: BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER
- Опциональные: WAITLIST_AVAILABLE, EVENT_NEWS

## Telegram бот
- Webhook (`/telegram/webhook`), deep link `/start <code>` для привязки аккаунта
- Проверка подлинности апдейтов, защита от повторов

## Preferences
- `notification_prefs` управляет включением каналов по категориям
- Опция отписки от опциональных категорий

## Outbox и доставляемость
- Шаблонизация сообщения → запись в `outbox`
- Воркер отправки: retry с backoff, дедупликация по `correlationId`
- Метрики ошибок и таймаутов

## Чек‑лист
- [ ] Подтверждение привязки Telegram (verification)
- [ ] Outbox‑модель с ретраями и дедупликацией
- [ ] Rate limiting и защита от флуд‑атак
