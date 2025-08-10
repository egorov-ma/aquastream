# Индекс задач (Backend, MVP) — версия под AquaStream Backend - Техническая спецификация v2.1

_Обновлено: 2025-08-10 12:01 UTC

Эти задачи покрывают полный объём работ для реализации бекэнда по спецификации `/backend/docs/aquastream-backend-spec-complete.md` (hash 33aada7a5254).
Каждая задача самодостаточна: включает контекст, входы/выходы, шаги, критерии приёмки (AC) и Definition of Done (DoD).

## Порядок выполнения (рекомендуемый)
1. backend-infra: структура папок, Compose, env, бэкапы, Makefile
2. CI/CD GitHub Actions (скелет на все сервисы)
3. Общая библиотека `backend-common` (DTO/ошибки/утилиты)
4. Единая обработка ошибок (RFC 7807)
5. Gateway (TLS/CORS/HSTS, прокси, rate-limit, админ‑агрегация health/metrics)
6. User (БД, аутентификация/логин, JWT, профиль, линковка Telegram, восстановление, роли)
7. Event (БД, публичное API, CRUD, публикация, waitlist FIFO+окно)
8. Crew (БД, API, вместимость, назначения)
9. Media (presigned‑URL, лимиты, ретенция)
10. Payment (БД, init виджета, webhook идемпотентность, пруфы/модерация)
11. Notification (БД, Telegram‑бот [webhook], отправка, prefs, Redis Pub/Sub)
12. Метрики в Redis (service‑side writer) + агрегатор в gateway
13. Профили `dev/stage/prod`, мок‑интеграции, фикстуры
14. Релизы SemVer, CHANGELOG

## Замечания по качеству
- Код чистый и лаконичный; настройки — в `application-*.yml` (лимиты 5MB, ретенция 90 дней, окно waitlist, rate‑limits). 
- Все REST‑ошибки — в формате Problem Details (RFC 7807). 
- Actuator `/actuator/health`, `/actuator/health/{{liveness|readiness}}`, `/actuator/info` доступны и возвращают 200. 


### Ссылки
- Spring Boot Actuator — список эндпойнтов (health/info): https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
- Liveness/Readiness в Spring Boot: https://spring.io/blog/2020/03/25/liveness-and-readiness-probes-with-spring-boot
- RFC 7807 (Problem Details): https://datatracker.ietf.org/doc/html/rfc7807
- Liquibase `update-sql` и `update`: https://docs.liquibase.com/commands/update/update-sql.html • https://docs.liquibase.com/commands/update/update.html
- Redis Pub/Sub (at-most-once): https://redis.io/docs/latest/develop/pubsub/
- Telegram Bot API (webhook): https://core.telegram.org/bots/api • https://core.telegram.org/bots/webhooks
- Bucket4j и лимиты для Spring: https://www.baeldung.com/spring-bucket4j
- Docker Compose (reference): https://docs.docker.com/compose/ • https://docs.docker.com/reference/
- PostgreSQL бэкапы/восстановление: https://www.postgresql.org/docs/current/app-pgdump.html • https://www.postgresql.org/docs/current/app-pgrestore.html
