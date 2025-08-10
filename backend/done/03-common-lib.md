# T03. Общая библиотека `backend-common` (DTO/ошибки/утилиты)

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Вынести базовые DTO, модель ошибок RFC 7807, константы домена, утилиты ids/correlationId и общий лог‑фильтр.

## Результат (Deliverables)
- Модуль `backend-common`
- `ProblemDetails` + сериализация `application/problem+json`
- `ErrorCodes`, `DomainConstants` (роли, статусы, ошибки)
- `Ids` утилита (`jti`, idempotency), фильтр логов с `X-Request-Id`

## Шаги
1. Создай модуль и подключи зависимости (validation/Jackson).
2. Реализуй класс `ProblemDetails` и `@JsonInclude` правила.
3. Добавь константы (enum/класс) для ролей, статусов брони/оплаты.
4. Напиши фильтр логов: генерировать/прокидывать `X-Request-Id`.
5. Опубликуй локально `publishToMavenLocal` и подключи в сервисах.

## Критерии приёмки (AC)
- Любой сервис использует `backend-common` без конфликтов зависимостей.
- Юниты на сериализацию Problem Details и фильтр логов зелёные.

## Definition of Done (DoD)
- Лог‑формат JSON с полями `timestamp, service, correlationId`.


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
