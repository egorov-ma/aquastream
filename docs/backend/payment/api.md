# Payment API

Статус: as-is

## Инициализация и подтверждение
```yaml
POST /api/v1/payments/init        # {bookingId, method} -> {paymentId, widgetConfig?, qrCode?}
POST /api/v1/payments/{id}/proof  # {proofUrl} -> {success}
PUT  /api/v1/payments/{id}/review # (ORGANIZER) {action:'approve'|'reject', comment?} -> {payment}
POST /api/v1/webhooks/{provider}  # X-Webhook-Signature + providerPayload
```

Документация API (ReDoc): ../../api/redoc/root/backend-payment-api.html
