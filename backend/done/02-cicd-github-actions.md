# T02. CI/CD: GitHub Actions (build → unit → liquibase dry-run → image → push)

**Контекст (важно):**
- Работать строго по спецификации: `/backend/docs/aquastream-backend-spec-complete.md` (SHA-256 первых 12 символов: `33aada7a5254`). 
- Архитектура: REST-only, Java 21 + Spring Boot, PostgreSQL (один инстанс, схемы на сервис), Liquibase, Redis, Docker Compose, GitHub Actions, Actuator, RFC 7807, мягкие rate-limit.

---

## Цель
Настроить минимальные пайплайны для сервисов: сборка, юнит‑тесты, Liquibase dry‑run, сборка образа и публикация.

## Результат (Deliverables)
- `.github/workflows/<service>.yml` (шаблон-переиспользуемый workflow)
- Кэш Gradle, шаг Liquibase `update-sql` (без применения)
- Сборка Docker image (Buildpacks/Jib) + push (main: `latest`, теги: `vX.Y.Z`)
- README с секретами/переменными для CI (реестр, JDBC строки и т. п.)

## Шаги
1. Подготовь reusable workflow `ci-service.yml` с параметрами (`service_name`, `image_name`).
2. Этапы: checkout → setup JDK 21 → gradle build → юниты → `liquibase update-sql` → build image → push.
3. Настрой публикацию по тегам `v*` (SemVer).
4. Добавь бейджи статуса в README монорепозитория.

## Критерии приёмки (AC)
- Запуск по push в main собирает и публикует образы в реестр.
- По тегу `v*` создаётся релизный образ с версией и релиз GH.

## Definition of Done (DoD)
- Никаких интеграционных тестов; только юниты и Liquibase dry‑run.
- Все секреты через GitHub Secrets.


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
