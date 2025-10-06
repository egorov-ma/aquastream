# Payment Service — Overview

## Назначение

Payment Service интегрируется с YooKassa, CloudPayments и Stripe, инициирует платежи, принимает вебхуки и синхронизирует статусы броней.

**Порт**: 8104  
**База данных**: PostgreSQL схема `payment`

## Архитектура модуля

```
backend-payment/
├── backend-payment-api/       # REST API (инициализация платежа, webhooks)
├── backend-payment-service/   # Бизнес-логика, адаптеры провайдеров
└── backend-payment-db/        # Entities, Liquibase миграции, outbox
```

## Основные процессы

1. **Инициализация платежа** — создание записи `payment`, выбор провайдера, подготовка виджета/QR.
2. **Обработка вебхуков** — проверка подписи, идемпотентность (`webhook_events`), обновление статуса.
3. **Сопоставление с Booking** — публикация доменного события, подтверждение/отмена брони в Event Service.
4. **Модерация доказательств** (QR) — загрузка скриншотов, ручное подтверждение организатором.

## Интеграции

- **YooKassa** (основной провайдер) — redirect/widget.
- **CloudPayments**, **Stripe** — адаптеры через интерфейс `PaymentProvider`.
- **Event Service** — подтверждение/отмена брони в зависимости от статуса платежа.

## Дополнительно

- Бизнес-логика: [`business-logic.md`](business-logic.md)
- REST API: [`api.md`](api.md)
- Эксплуатация: [`operations.md`](operations.md)
