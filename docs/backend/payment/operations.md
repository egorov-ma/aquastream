# Payment Service — Operations

## Обзор

**Порт**: 8104
**Схема БД**: `payment`
**Env**: `YOOKASSA_*`, `CLOUDPAYMENTS_*`, `STRIPE_*`, `PAYMENT_WEBHOOK_BASE_URL`

## Запуск

```bash
make up-dev
curl http://localhost:8104/actuator/health

# Инициализация платежа (dev mock)
curl http://localhost:8104/api/payments/{bookingId}/init \
  -H "Authorization: Bearer ..."
```

## Мониторинг

| Метрика | Описание |
|---------|----------|
| `payment.provider.requests` | Запросы к провайдерам |
| `payment.webhook.failures` | Ошибки обработки вебхуков |
| **Grafana**: Payments Overview | Успех/ошибки, время подтверждения |

**Логи**: `docker logs backend-payment | grep webhook`

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **Платеж завис в PENDING** | Проверить webhook в логах, повторно отправить через провайдера |
| **`signature invalid`** | Сравнить секреты, синхронизировать `PAYMENT_WEBHOOK_BASE_URL` |
| **Дубликаты платежей** | Проверить `webhook_events` (idempotency), удалить дубли, повторить обработку |

### Повторная доставка webhook

1. Найти `webhook_events` по `idempotency_key`
2. Убедиться `status=failed` и ошибка исправлена
3. В провайдере инициировать повторную отправку
4. Проверить статус: `GET /api/payments/{id}`

## Release Checklist

- [ ] Обновлены ключи и webhook URLs
- [ ] Тестовое бронирование + платеж
- [ ] Event подтверждение работает автоматически
- [ ] Мониторинг `FAILED/REFUNDED` операций

---

См. [Business Logic](business-logic.md), [API](api.md), [README](README.md).