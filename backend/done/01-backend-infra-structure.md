# T01. Backend-Infra: структура репозитория и окружения

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Задать структуру инфраструктуры проекта: Docker Compose для `dev/stage/prod`, шаблоны `.env`, скрипты бэкапов/восстановления, Makefile-цели.

## Результат (Deliverables)
- `/infra/compose/docker-compose.yml` с профилями `dev|stage|prod`
- `.env.example` с документированными переменными
- `/infra/backup/backup.sh`, `/infra/backup/restore.sh`, `/infra/backup/README.md`
- `/make/Makefile` с целями: `up-dev`, `up-stage`, `down`, `logs`, `backup`, `restore`
- Документация по портам/сетям/volume/секретам

## Шаги
1. Создай `/infra/compose/docker-compose.yml`:
   - Сервисы: postgres, redis, minio, gateway, user, event, crew, payment, notification, media.
   - Сети: `aquastream-net`. Volume: `pgdata`, `redisdata`, `miniodata`.
   - Профили: `dev` (с моками), `stage`, `prod` (реальные интеграции).
2. Добавь `.env.example` (POSTGRES_USER/PASSWORD/DB, REDIS_HOST, MINIO_* и т. п.).
3. Напиши `backup.sh` с nightly `pg_dump` по схемам (`-n user -n event ...`) → gzip с датой. Ротация: 7 дневных, 4 недельных, 3 месячных.
4. Напиши `restore.sh` с примерами `psql`/`pg_restore` для восстановления отдельной схемы.
5. В `Makefile` опиши команды запуска/остановки, сбор логов, бэкапов, восстановления.
6. В `/infra/backup/README.md` опиши чеклист восстановления (pre-check, команды, валидация).

## Критерии приёмки (AC)
- `docker compose --profile stage up -d` поднимает всё без ошибок.
- `backup.sh` создаёт архивы; `restore.sh` восстанавливает схему на тестовой БД.
- Документация в `/infra/backup/README.md` полная и воспроизводимая.

## Definition of Done (DoD)
- Переменные окружения описаны, секреты не коммитятся.
- Прогон smoke: все контейнеры в `healthy`, порты проброшены как в спецификации.


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
