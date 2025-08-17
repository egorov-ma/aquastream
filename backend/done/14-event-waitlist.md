# T14. Event: waitlist FIFO и окно бронирования

_Обновлено: 2025-08-10 12:03 UTC_

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Реализовать лист ожидания с окном удержания места (30 мин по умолчанию).

## Результат (Deliverables)
- FIFO по `waitlist`, окно удержания слота
- Уведомления через notification‑сервис

## Шаги
1. Операции join/leave; освобождение слота уведомляет первого.
2. Таймер окна → просрочка передаёт право следующему.
3. Аудит событий очереди.

## Критерии приёмки (AC)
- Окно и переходы работают согласно конфигу (минуты из YAML).

## Definition of Done (DoD)
- Юнит‑симуляция таймаута и смены очередника.


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
