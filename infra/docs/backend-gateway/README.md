# Backend-Gateway – Документация

> Версия: 0.1 (draft)

**Backend-Gateway** – это шлюз API, построенный на Spring Cloud Gateway. Он выполняет роль единой входной точки для всех клиентских запросов, маршрутизируя их к соответствующим микросервисам AquaStream.

---

## Цели и задачи

1. **Маршрутизация HTTP** – проксирование запросов на backend-сервисы (`user-service`, `crew-service`, `planning-service`, `notification-service`).
2. **Безопасность** – централизованная проверка JWT-токенов.
3. **Кросс-сервисные функции** – CORS, rate-limiting, глобальные фильтры логирования, трассировки, circuit-breaker.
4. **Агрегация API-документации** – прокси для Swagger-UI / OpenAPI, единая точка `/api-docs`, `/swagger-ui.html`.
5. **Service Discovery** – (опционально) Eureka/Consul для динамических маршрутов.
6. **Конфигурируемые маршруты** – хранение маршрутов в PostgreSQL (`backend-gateway-db`) и динамическая перезагрузка без рестарта.

---

## Подпроектная структура

| Подпроект | Описание |
|-----------|----------|
| `backend-gateway-api`     | Контракты / DTO, общие фильтры. |
| `backend-gateway-db`      | Liquibase-миграции для таблицы `gateway_routes`. |
| `backend-gateway-service` | Spring Cloud Gateway приложение, кастомные фильтры, конфигурация маршрутов. |

---

## Конфигурация (application.yml)

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lowerCaseServiceId: true
      routes:
        - id: user
          uri: http://localhost:8081
          predicates:
            - Path=/api/v1/users/**
          filters:
            - StripPrefix=1
            - JwtAuthentication
            - RequestRateLimiter=redis-rate-limiter
```

Полный файл – `backend-gateway-service/src/main/resources/application.yml`.

### Динамические маршруты

Маршруты могут храниться в таблице `gateway_routes` и подгружаться при помощи `RouteDefinitionLocator`.

```sql
CREATE TABLE gateway_routes (
  id UUID PRIMARY KEY,
  route_id VARCHAR(100) NOT NULL,
  uri VARCHAR(255) NOT NULL,
  predicates TEXT NOT NULL,
  filters TEXT,
  order_num INT DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE
);
```

Сервисный эндпоинт `/actuator/gateway/routes` позволяет просмотреть активные маршруты.

---

## Фильтры Gateway

| Фильтр | Назначение |
|--------|-----------|
| `JwtAuthenticationFilter` | Проверка и валидация JWT-токена, установка `Principal`. |
| `RequestRateLimiter` | Ограничение запросов (Redis). |
| `LoggingFilter` | Логирование входящих/исходящих запросов. |
| `CircuitBreaker` | Резервирование (Resilience4j) для микросервисов. |

---

## Интеграция со Swagger

Gateway проксирует OpenAPI-спецификации микросервисов и публикует их под единым путём:

| Микросервис | Путь через Gateway |
|-------------|-------------------|
| User Service | `/user/swagger-ui.html` |
| Crew Service | `/crew/swagger-ui.html` |
| Notification | `/notification/swagger-ui.html` |

Дополнительно настроен **Swagger-UI Aggregator** (при помощи springdoc-openapi-gateway) для объединённого списка.

---

## Безопасность

- Алгоритм подписи JWT: RS256.
- Публичный ключ хранится в `JWKS` endpoint `https://idp.example.com/.well-known/jwks.json` и кешируется.
- В случае отсутствия/невалидности токена Gateway отвечает `401 Unauthorized`.

---

## Метрики и мониторинг

- `Actuator` endpoint `/actuator/gateway/**` – статистика маршрутов.
- Prometheus scrape `/actuator/prometheus`.
- Grafana Dashboard: `infra/monitoring/grafana-dashboard.json` содержит виджеты RPS, latency, 5xx.

---

## Тестирование

- Contract-тесты маршрутизации (WebTestClient + WireMock).
- Integration-тесты фильтров с Testcontainers (Redis, Keycloak).

---

## Запуск

```bash
# Локальный run
./gradlew :backend-gateway-service:bootRun

# Проверка здоровья
curl http://localhost:8080/actuator/health
```

Dockerfile находится в `infra/docker/images/Dockerfile.backend-gateway`.

---

## TODO
- [ ] Реализовать хранение маршрутов в БД + API для администрирования.
- [ ] Включить Resilience4j circuit-breaker.
- [ ] Добавить OAuth2 client-credentials flow для внутренних вызовов.

---

## Связь с общей документацией

- Архитектура платформы: [`PROJECT_DOCUMENTATION.md`](../PROJECT_DOCUMENTATION.md)
- CI/CD: [`../ci-cd`](../ci-cd)

---

© AquaStream, 2024 