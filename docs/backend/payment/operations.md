# Payment — операции

## Обзор

Payment Service зависит от внешних провайдеров. Все секреты хранятся в `.env.<env>` (`YOOKASSA_*`, `CLOUDPAYMENTS_*`, `STRIPE_*`).

**Порт**: 8104  
**Схема БД**: `payment`

## Запуск и проверка

```bash
make up-dev
curl http://localhost:8104/actuator/health

# Проверка доступности провайдера (dev mock)
curl http://localhost:8104/api/v1/payments/{bookingId}/init -H "Authorization: Bearer ..."
```

## Конфигурация провайдеров

- `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`
- `CLOUDPAYMENTS_PUBLIC_ID`, `CLOUDPAYMENTS_API_SECRET`
- `STRIPE_API_KEY`
- `PAYMENT_WEBHOOK_BASE_URL` — публичный URL, который передаём в провайдера

## Мониторинг

- Actuator metrics: `payment.provider.requests`, `payment.webhook.failures`.
- Логи `make logs SERVICE=backend-payment` — смотреть статусы webhook.
- Grafana панели: *Payments Overview* (успех/ошибки, время подтверждения).

## Диагностика

| Ситуация | Что делать |
|----------|------------|
| Платёж завис в `PENDING` | Проверить webhook в логах, при необходимости повторно отправить через интерфейс провайдера |
| Ошибка webhooks `signature invalid` | Сравнить секреты, синхронизировать `PAYMENT_WEBHOOK_BASE_URL` |
| Дубликаты платежей | Проверить `webhook_events` (idempotency), удалить дубликаты и повторить обработку |

## Повторная доставка webhook

1. Найти запись в `webhook_events` по `idempotency_key`.
2. Убедиться, что статус `failed` и ошибка исправлена.
3. В провайдере инициировать повторную отправку события.
4. Проверить, что статус платежа обновился (`GET /api/v1/payments/{id}`).

## Чек-лист перед релизом провайдера

- [ ] Обновлены ключи и URL вебхуков.
- [ ] Проведено тестовое бронирование + платеж.
- [ ] В `Event` подтверждение пришло автоматически.
- [ ] Отчёты позволят отследить `FAILED/REFUNDED` операции.

## См. также

- [Payment Overview](README.md)
- [Payment API](api.md)
- [Database Maintenance](../../operations/runbooks/database-maintenance.md)
