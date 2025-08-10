# T18. Media: presigned‑URL (MinIO/S3), лимиты и ретенция

_Обновлено: 2025-08-10 12:03 UTC_

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Сделать presigned‑URL для загрузки; enforce лимиты и ретенцию.

## Результат (Deliverables)
- `POST /media/presign` → `{ url, key, expires }`
- Лимиты: `app.files.max-photo-mb=5`, `app.files.max-proof-mb=5`
- Ретенция пруфов: `app.retention.proofs-days=90`

## Шаги
1. Интеграция с MinIO SDK; пресайн upload.
2. Валидация типов и размера (413/415 при нарушении).
3. Планировщик удаления пруфов после истечения срока.

## Критерии приёмки (AC)
- Невалидные типы/размеры отбрасываются с правильными кодами.

## Definition of Done (DoD)
- Примеры ключей и сроков жизни URL.


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
