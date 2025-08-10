# T08. User: профиль и линковка Telegram (deeplink + webhook)

_Обновлено: 2025-08-10 12:03 UTC_

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Добавить профиль и процесс верификации Telegram через бота (deep-link + `linkCode`).

## Результат (Deliverables)
- `GET/PUT /profile`, `POST /telegram/link/init`, `POST /telegram/link/confirm`
- Поле `is_telegram_verified`

## Шаги
1. `link/init` генерирует одноразовый code + deeplink.
2. Бот по `/start <code>` вызывает `link/confirm`.
3. Ограничить доступ к записи на событие без подтверждённого профиля.

## Критерии приёмки (AC)
- `/me` отражает `isTelegramVerified=true` после успешной линковки.

## Definition of Done (DoD)
- Dev-моки: фальшивые апдейты и эмуляция подтверждения.


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
