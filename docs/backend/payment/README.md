# Payment Service

## Обзор

Payment Service интегрируется с YooKassa, CloudPayments и Stripe. Инициирует платежи, обрабатывает вебхуки, синхронизирует статусы броней.

**Порт**: 8104
**Схема БД**: `payment`

## Архитектура

```
backend-payment/
├── backend-payment-api/       # REST API, webhooks
├── backend-payment-service/   # Бизнес-логика, адаптеры провайдеров
└── backend-payment-db/        # Entities, миграции
```

## Основные процессы

| Процесс | Описание |
|---------|----------|
| **Инициализация** | Создание `payment`, выбор провайдера, подготовка виджета/QR |
| **Вебхуки** | Проверка подписи, idempotency, обновление статуса |
| **Сопоставление с бронью** | Публикация доменного события → Event подтверждает/отменяет бронь |
| **Модерация QR** | Загрузка скриншотов, ручное подтверждение организатором |

## Интеграции

- **YooKassa** (основной), **CloudPayments**, **Stripe** - через adapter pattern
- **Event Service** - подтверждение/отмена броней

---

См. [Business Logic](business-logic.md), [API](api.md), [Operations](operations.md).