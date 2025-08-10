# T23. Notification: отправка сообщений и prefs (Redis Pub/Sub, at‑most‑once)

_Обновлено: 2025-08-10 12:03 UTC_

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Сделать отправку обязательных и опциональных уведомлений с учётом prefs; подписка на Redis Pub/Sub.

## Результат (Deliverables)
- `POST /notify/send` (внутренний), `GET/PUT /notify/prefs`
- Подписка на `notify:*` каналы; at‑most‑once доставка приемлема

## Шаги
1. Реализуй prefs (модель/валидации).
2. Реализуй отправку в Telegram, обработку ошибок (логировать).
3. Подключи Redis Pub/Sub и фильтрацию по категориям.

## Критерии приёмки (AC)
- Обязательные уведомления доходят всегда; опциональные — по prefs.

## Definition of Done (DoD)
- Ограничь скорость исходящих запросов к Bot API (мягкий троттлинг).


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
