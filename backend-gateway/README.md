# Backend-Gateway

API Gateway на базе Spring Cloud Gateway.

Подпроекты:

| Подпроект | Назначение |
|-----------|-----------|
| `backend-gateway-api`     | контракты, DTO, схемы (при необходимости) |
| `backend-gateway-db`      | конфигурация хранения маршрутов (если требуется) |
| `backend-gateway-service` | конфигурация Gateway, фильтры, маршруты |

Порт по умолчанию — `8080`.