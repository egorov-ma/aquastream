# T04. Единая обработка ошибок (RFC 7807) во всех сервисах

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Внедрить глобальный `@ControllerAdvice` и единый формат ошибок Problem Details.

## Результат (Deliverables)
- Базовый советник + наследники в каждом сервисе
- Коды: 400/401/403/404/409/422/429/500, `Retry-After` для 429
- Поля: `type/title/status/detail/instance/code/correlationId`, `errors[]`

## Шаги
1. Реализуй базовый советник, добавь маппинг валидаций (Bean Validation) → `errors[]` (field, message, code).
2. Прокидывай `correlationId` из фильтра в ответ.
3. Подключи во всех сервисах и добавь минимальные юниты.

## Критерии приёмки (AC)
- Любая ошибка REST возвращается в формате RFC 7807.
- Для 429 есть заголовок `Retry-After` и код `rate.limit-exceeded`.

## Definition of Done (DoD)
- Список типов/URI `type` описан в документации сервиса.


### Ссылки
- Spring Boot Actuator: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
- Liveness/Readiness: https://spring.io/blog/2020/03/25/liveness-and-readiness-probes-with-spring-boot
- RFC 7807: https://datatracker.ietf.org/doc/html/rfc7807
- Liquibase update-sql/update: https://docs.liquibase.com/commands/update/update-sql.html • https://docs.liquibase.com/commands/update/update.html
- Redis Pub/Sub: https://redis.io/docs/latest/develop/pubsub/
- Telegram Bot API: https://core.telegram.org/bots/api • https://core.telegram.org/bots/webhooks
- Bucket4j (Spring): https://www.baeldung.com/spring-bucket4j
- Docker Compose: https://docs.docker.com/compose/ • https://docs.docker.com/reference/
- PostgreSQL pg_dump/pg_restore: https://www.postgresql.org/docs/current/app-pgdump.html • https://www.postgresql.org/docs/current/app-pgrestore.html
