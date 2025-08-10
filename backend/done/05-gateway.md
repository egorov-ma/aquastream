# T05. Gateway: TLS/CORS/HSTS, проксирование, rate-limit, админ‑агрегация health/metrics

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Сделать входную точку API: безопасные заголовки, CORS, прокси, лимиты, админ‑эндпойнты для health/metrics.

## Результат (Deliverables)
- Прокси `/api/v1/*` к внутренним сервисам
- HSTS, secure headers, CORS whitelist
- Bucket4j лимиты: login 10/min, recovery 5/min, default 60/min (из YAML)
- `GET /api/v1/admin/health` агрегирует `/actuator/health` сервисов
- `GET /api/v1/admin/metrics/series?service=X&metric=errors&range=h24` из Redis

## Шаги
1. Добавь фильтр безопасных заголовков и CORS (конфигурируемый список доменов).
2. Подключи Bucket4j, правила в `application-*.yml`.
3. Реализуй агрегатор health с таймаутом и статусом up/partial/down.
4. Реализуй чтение таймсерий ключей `metrics:*` из Redis.

## Критерии приёмки (AC)
- 429 возвращается с Problem Details + Retry-After.
- Админ‑эндпойнты отдают корректный JSON, фронт их визуализирует.

## Definition of Done (DoD)
- Роутинг и конфиги описаны в README `gateway`.


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
