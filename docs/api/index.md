---
title: API
summary: Автоматически сгенерированные страницы API (ReDoc) и интерактивный Swagger UI.
---

# API

Эта страница собирается автоматически из OpenAPI спецификаций, расположенных в `docs/api/specs/`. Для каждого файла создаются две HTML-версии:

- **ReDoc** — удобный режим чтения спецификации.
- **Swagger UI** — интерактивное тестирование и проверка контрактов.

## Обновление

```bash
python3 docs/_internal/docs-tools/tools/generate_api_docs.py
```

Команда копирует актуальные спецификации, пересобирает HTML и индекс.

## Список API

| API | Спецификация | ReDoc | Swagger UI |
|---|---|---|---|
| backend-crew-api | [backend-crew-api.yaml](specs/backend-crew-api.yaml) | [Открыть](redoc/backend-crew-api.html) | [Открыть](swagger/backend-crew-api.html) |
| backend-event-api | [backend-event-api.yaml](specs/backend-event-api.yaml) | [Открыть](redoc/backend-event-api.html) | [Открыть](swagger/backend-event-api.html) |
| backend-gateway-admin-api | [backend-gateway-admin-api.yaml](specs/backend-gateway-admin-api.yaml) | [Открыть](redoc/backend-gateway-admin-api.html) | [Открыть](swagger/backend-gateway-admin-api.html) |
| backend-gateway-metrics-api | [backend-gateway-metrics-api.yaml](specs/backend-gateway-metrics-api.yaml) | [Открыть](redoc/backend-gateway-metrics-api.html) | [Открыть](swagger/backend-gateway-metrics-api.html) |
| backend-media-api | [backend-media-api.yaml](specs/backend-media-api.yaml) | [Открыть](redoc/backend-media-api.html) | [Открыть](swagger/backend-media-api.html) |
| backend-notification-api | [backend-notification-api.yaml](specs/backend-notification-api.yaml) | [Открыть](redoc/backend-notification-api.html) | [Открыть](swagger/backend-notification-api.html) |
| backend-payment-api | [backend-payment-api.yaml](specs/backend-payment-api.yaml) | [Открыть](redoc/backend-payment-api.html) | [Открыть](swagger/backend-payment-api.html) |
| backend-user-api | [backend-user-api.yaml](specs/backend-user-api.yaml) | [Открыть](redoc/backend-user-api.html) | [Открыть](swagger/backend-user-api.html) |
| frontend-api | [frontend-api.yaml](specs/frontend-api.yaml) | [Открыть](redoc/frontend-api.html) | [Открыть](swagger/frontend-api.html) |
| payment-webhook-api | [payment-webhook-api.yaml](specs/payment-webhook-api.yaml) | [Открыть](redoc/payment-webhook-api.html) | [Открыть](swagger/payment-webhook-api.html) |
| service-health-api | [service-health-api.yaml](specs/service-health-api.yaml) | [Открыть](redoc/service-health-api.html) | [Открыть](swagger/service-health-api.html) |
| telegram-bot-api | [telegram-bot-api.yaml](specs/telegram-bot-api.yaml) | [Открыть](redoc/telegram-bot-api.html) | [Открыть](swagger/telegram-bot-api.html) |
| user-admin-api | [user-admin-api.yaml](specs/user-admin-api.yaml) | [Открыть](redoc/user-admin-api.html) | [Открыть](swagger/user-admin-api.html) |
