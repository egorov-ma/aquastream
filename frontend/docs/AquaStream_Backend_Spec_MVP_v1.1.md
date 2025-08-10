# AquaStream — Бэкенд: спецификация (MVP) v1.1

---

## 0. Технологический стек
- **Язык:** Java 21 LTS
- **Фреймворк:** Spring Boot 3.2+ (Spring 6.1)
- **Сборка:** Gradle (Kotlin DSL)
- **Web:** Spring Web MVC, Jackson
- **Безопасность:** Spring Security, **OAuth2** (Spring Authorization Server) + JWT; HttpOnly Secure cookie для фронта (опц. PKCE)
- **Хранение:** PostgreSQL 16 (один инстанс; отдельные схемы: `user`, `event`, `crew`, `payment`, `notification`, `media`)
- **Миграции:** Liquibase (SQL/YAML changelog per‑schema)
- **Кэш/очереди/лимиты/метрики:** Redis 7 (pub/sub, короткий кеш, rate‑limit counters, time‑series для мини‑метрик)
- **Rate‑limit:** Bucket4j (фильтр на gateway и при необходимости локально)
- **Метрики/актуаторы:** Spring Boot Actuator + Micrometer (без Prometheus; собственный облегченный агрегатор через Redis)
- **Упаковка:** Docker, Buildpacks/Jib; оркестрация — Docker Compose (одна VM)
- **Логи:** JSON, `X‑Request‑Id`/`traceparent`

Профили окружений: `dev` (моки, локально), `stage` (compose‑стенд), `prod` (боевая).

---

## 1. Архитектура сервисов (REST‑шина)

**Сервисы:**
- **backend‑gateway** — TLS/CORS/rate‑limit/прокси; агрегатор health/metrics для админки.
- **backend‑user** — пользователи/роли/профиль, восстановление, Telegram‑линковка, **OAuth2 Authorization Server**.
- **backend‑event** — организаторы/события/контент (публичные чтения + приватный CRUD).
- **backend‑crew** — экипажи/лодки/палатки; ручные назначения.
- **backend‑payment** — платёжный адаптер: виджет/QR, вебхуки, статусы.
- **backend‑notification** — Telegram‑бот (webhook) + рассылка, prefs подписок.
- **backend‑media** — presigned‑URL для приватных файлов (лого/фото/пруфы).
- **backend‑common** — общая библиотека (DTO/ошибки/утилиты/константы).

**Парадигма:** REST‑только. Межсервисные вызовы — через HTTP (RestClient). Очереди/сигналы — Redis Pub/Sub.

---

## 2. Common (общая библиотека)
- DTO + Jakarta Validation, error‑модель **Problem Details** (RFC 7807‑подобная).
- Константы: роли, статусы брони/оплаты/уведомлений, коды ошибок.
- Утилиты: генерация `jti`, idempotency‑ключей, `correlationId`, filters для логов.
- Клиентские интерфейсы: лёгкие `RestClient` для вызовов между сервисами.
- **Нет** общих таблиц БД — только код/контракты.

---

## 3. База данных
Один инстанс **PostgreSQL 16**. Для каждого сервиса — своя **схема**: `user`, `event`, `crew`, `payment`, `notification`, `media`.
Миграции — **Liquibase** (отдельный changelog на схему).

**Схемы (основные таблицы):**
- `user.users(id uuid pk, username unique, password_hash, role enum, active, created_at, updated_at)`
- `user.profiles(user_id pk fk, phone, telegram, is_telegram_verified bool, extra jsonb)`
- `user.refresh_sessions(jti pk, user_id, issued_at, expires_at, ip, user_agent, revoked_at)`
- `user.recovery_codes(user_id, code_hash, used_at)`
- `user.audit_log(id, actor_user_id?, action, target_type, target_id, payload jsonb, created_at)`

- `event.organizers(id, slug unique, name, logo_url, description, contacts jsonb, brand_color, created_at)`
- `event.events(id, organizer_id fk, type, title, date_start, date_end, location, price, capacity, available, cover_url, short_description, tags text[], status enum(draft|published), created_at)`
- `event.team_members(id, organizer_id, name, role, photo_url, bio)`
- `event.faq_items(id, organizer_id, question, answer)`
- `event.favorites(user_id, event_id, created_at)`
- `event.waitlist(id, event_id, user_id, priority, created_at)`

- `crew.crews(id, event_id, name, capacity)`
- `crew.crew_assignments(crew_id, user_id, seat?, notes?)`
- `crew.boats(id, event_id, type, capacity, name)`
- `crew.tent_groups(id, event_id, name, capacity)`
- `crew.team_preferences(user_id, event_id, prefers_with_user_ids text[], avoids_user_ids text[], sleep_preference jsonb)`

- `payment.payments(id, booking_id, method enum(widget|qr_manual), amount, currency, status enum(pending|succeeded|rejected|canceled|submitted), provider, provider_payload jsonb, created_at)`
- `payment.payment_receipts(id, payment_id, proof_url, reviewed_by?, reviewed_at?)`
- `payment.webhook_events(idempotency_key pk, provider, raw_payload jsonb, status, processed_at, attempt_count)`

- `notification.notification_prefs(user_id, category, required bool, subscribed bool)`
- `notification.telegram_subscriptions(user_id, telegram, verified_at)`
- `notification.outbox(id, user_id, category, payload jsonb, status, attempts, last_error)`

- `media.files(id, owner_type, owner_id, key, checksum, content_type, size, created_at)`

---

## 4. Сервисы (REST, модули, профили, системные требования)

### 4.0 Общие требования ко всем сервисам
- **Мультимодули:** `backend-<name>-api`, `backend-<name>-service`, `backend-<name>-db` (Liquibase).
- **Версионирование API:** публичные маршруты под `/api/v1/...`.
- **Actuator:** `/actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`, `/actuator/info`.
- **Метрики:** минутные агрегаты в Redis: `metrics:<service>:<metric>:YYYYMMDDHHmm` (TTL = 48 ч).
- **Ошибки:** **RFC 7807 Problem Details**. Для валидаций — `errors[]` (field/message/code). Для rate‑limit — **429** + `Retry‑After`.
- **Безопасность:** Spring Security; OAuth2/OIDC (Authorization Code + PKCE) в **backend‑user**; Resource Server JWT на остальных.
- **Rate‑limit:** Bucket4j (значения из `application-*.yml`).
- **Профили:**
  - `dev` — **моки** (in‑memory репозитории), фикстуры, эмуляция интеграций.
  - `stage` — Compose‑стенд: реальные Postgres/Redis/MinIO, тестовые ключи провайдеров.
  - `prod` — боевая конфигурация, HSTS, строгие лимиты, журналы в JSON.

**Общая конфигурация (переопределяется per‑service):**
```yaml
app:
  rate-limit:
    login:
      per-minute: 10
    recovery:
      per-minute: 5
    default:
      per-minute: 60
  notifications:
    window-minutes: 30     # TTL окна на бронь из waitlist
  files:
    max-photo-mb: 5        # лимит фото
    max-proof-mb: 5        # лимит пруфов
  retention:
    proofs-days: 90        # автоудаление пруфов после события
```

---

### 4.1 backend‑gateway
**Назначение:** TLS/HTTPS, CORS, rate‑limit, прокси к внутренним сервисам; агрегатор health/metrics для админки.

**Модули:** `gateway-api` (фильтры/маршрутизация), `gateway-service` (агрегатор).

**REST (внешнее):**
- Прокси: `/api/v1/...` → целевой сервис.
- Админ‑агрегация:
  - `GET /api/v1/admin/health` — сводный статус сервисов (up/partial/down).
  - `GET /api/v1/admin/metrics/series?service=X&metric=errors&range=h24` — таймсерии для графиков (из Redis).

**Конфиг (пример):**
```yaml
gateway:
  cors:
    allowed-origins: ["https://aquastream.app"]
  rate-limit:
    enabled: true
security:
  headers:
    hsts: max-age=31536000; includeSubDomains
```

**Ошибки:** `503 gateway.service-unavailable` при недоступности бэка; отдавать `service`, `correlationId`.

---

### 4.2 backend‑user (+ OAuth2 Authorization Server)
**Назначение:** пользователи/роли/профиль, восстановление, линковка Telegram; **OAuth2** (Authorization Code + **PKCE**), выпуск JWT/JWK.

**Модули:** `backend-user-api`, `backend-user-service`, `backend-user-db`, `backend-user-auth` (Spring Authorization Server).

**REST (`/api/v1/user`)**
- Аутентификация: `POST /auth/register | /auth/login | /auth/logout | /auth/refresh`
- OAuth2/SAS: `GET /oauth2/authorize`, `POST /oauth2/token`, `GET /.well-known/openid-configuration`, `GET /oauth2/jwks`
- Профиль: `GET /me`, `GET/PUT /profile`
- Telegram: `POST /telegram/link/init`, `POST /telegram/link/confirm` (вызов ботом)
- Восстановление: `GET /recovery/options`, `POST /auth/recovery/{init|verify|reset}`
- Админ: `GET /admin/users`, `POST /admin/users/{id}/role`

**Конфиг (пример):**
```yaml
security:
  oauth2:
    authorizationserver:
      issuer: https://api.aquastream.app
      token:
        access-ttl: 15m
        refresh-ttl: 30d
app:
  telegram:
    bot-token: ${TELEGRAM_BOT_TOKEN}
    deeplink-base: "https://t.me/aquastream_bot?start="
  rate-limit:
    login:
      per-minute: 10
    recovery:
      per-minute: 5
```

**Профили:** `dev` — фикстуры, моки Telegram; `stage/prod` — Postgres+Redis, реальные OAuth2/JWK.

---

### 4.3 backend‑event
**Назначение:** организаторы/события/контент (публичные чтения, приватный CRUD).

**Модули:** `backend-event-api`, `backend-event-service`, `backend-event-db`.

**REST (`/api/v1`)**
- Публично: `GET /organizers`, `GET /organizers/{slug}`, `GET /organizers/{slug}/events`, `GET /events/{id}`
- Организатор: `POST /events`, `PUT /events/{id}`, `POST /events/{id}/publish`

**Конфиг:** 
```yaml
app:
  notifications:
    window-minutes: 30    # окно на бронь из waitlist (FIFO)
```

**Ошибки:** `404 event.not-found`, `409 event.publish-conflict` и т. п.

---

### 4.4 backend‑crew
**Назначение:** экипажи/лодки/палатки, ручные назначения участников.

**Модули:** `backend-crew-api`, `backend-crew-service`, `backend-crew-db`.

**REST (`/api/v1/crew`)**
- `GET /events/{eventId}/crews | /boats | /tents`
- `POST /events/{eventId}/crews` (CRUD)
- `POST /assignments` (назначение/снятие участника)

**Ошибки:** `422 crew.capacity-exceeded`, `404 crew.not-found`.

---

### 4.5 backend‑payment
**Назначение:** платёжный виджет/провайдер, вебхуки, QR‑пруфы и модерация статусов.

**Модули:** `backend-payment-api`, `backend-payment-service`, `backend-payment-db`.

**REST (`/api/v1/payments`)**
- `POST /{bookingId}/init` — конфиг виджета (провайдер по ENV)
- `POST /webhook/{provider}` — приём вебхука (идемпотентность по событию)
- `POST /{paymentId}/receipt` — загрузка пруфа (через `backend-media` presigned‑URL)

**Конфиг:**
```yaml
payments:
  provider: yookassa
  provider-keys:
    secret: ${PAYMENT_SECRET}
app:
  files:
    max-proof-mb: 5
  retention:
    proofs-days: 90
```

**Ошибки:** `409 payment.duplicate-webhook`, `422 payment.proof-invalid` и пр.

---

### 4.6 backend‑notification (содержит Telegram‑бота)
**Назначение:** Telegram‑бот (webhook), рассылка обязательных/опциональных уведомлений, prefs.

**Где реализован бот?** В этом сервисе (`backend-notification-api` → пакет `bot`).

**Модули:** `backend-notification-api` (webhook/REST), `backend-notification-service` (шаблоны/правила), `backend-notification-db`.

**REST (`/api/v1/notify`)**
- `POST /telegram/webhook` — входящие апдейты Bot API
- `POST /send` — внутренний вызов от сервисов (или Redis Pub/Sub `notify:*`)
- `GET/PUT /prefs` — управление подписками

**Конфиг:**
```yaml
app:
  telegram:
    bot-token: ${TELEGRAM_BOT_TOKEN}
    webhook-url: https://api.aquastream.app/api/v1/notify/telegram/webhook
  notifications:
    window-minutes: 30
```

**Dev‑моки:** webhook не подключаем; `/send` логгирует доставку; `/telegram/webhook` принимает фиктивные апдейты.

---

### 4.7 backend‑media
**Назначение:** presigned‑URL для приватных файлов (лого/фото/пруфы), удаление по ретенции.

**Модули:** `backend-media-api`, `backend-media-service`, `backend-media-db` (опц.).

**REST (`/api/v1/media`)**
- `POST /presign` — {{ purpose, contentType, checksum }} → {{ url, key, expires }}
- (опц.) `DELETE /files/{key}` — ручное удаление

**Конфиг:**
```yaml
s3:
  endpoint: http://minio:9000
  access-key: ${S3_ACCESS_KEY}
  secret-key: ${S3_SECRET_KEY}
  bucket: aquastream-private
app:
  files:
    max-photo-mb: 5
    max-proof-mb: 5
  retention:
    proofs-days: 90
```

---

## 5. Telegram‑бот: план реализации
1) Зарегистрировать бота в @BotFather → получить токен; настроить **webhook** на `backend-notification /api/v1/notify/telegram/webhook`.
2) **Линковка аккаунта:** `backend-user` генерирует одноразовый `linkCode` и deep‑link (`https://t.me/<bot>?start=<code>`). Пользователь жмёт **Start** → бот читает параметр и вызывает `backend-user /telegram/link/confirm`.
3) **Восстановление доступа:** по запросу восстановления `backend-user` отправляет в Telegram одноразовый код; пользователь вводит его в веб‑форме (`verify`) → `reset`.
4) **Уведомления:** сервисы вызывают `backend-notification /send` либо публикуют в Redis канал `notify:*`; сообщения доставляются в Telegram. Обязательные категории — без opt‑out; опциональные — по prefs.
5) **Dev‑моки:** webhook не подключаем; `/send` логгирует/эмулирует доставку; `/verify` принимает искусственные коды.

---

## 6. Безопасность
- Пароли — **Argon2id**; JWT в HttpOnly Secure cookie, SameSite=Lax; refresh‑ротация по `jti`.
- OAuth2: Authorization Code + **PKCE**; Authorization Server — в `backend-user`. Остальные — Resource Server (валидация по `issuer-uri` / `jwk-set-uri`).
- CSRF‑токены на небезопасных методах.
- Rate‑limit: мягкие значения из конфига; при превышении — **429** + `Retry‑After`.
- Файлы — приватные бакеты; доступ только по presigned‑URL с коротким TTL.
- Логирование входов/ошибок/смены ролей; маскирование PII.

### 6.1 Обработка исключений (единый стиль)
Глобальный `@ControllerAdvice` → **RFC 7807 Problem Details**:

| Статус | Код                         | Назначение                                  |
|--------|-----------------------------|---------------------------------------------|
| 400    | `validation.failed`         | Ошибки валидации (поле `errors[]`)          |
| 401    | `auth.invalid-credentials`  | Неверные креды/проср. токен                 |
| 403    | `auth.forbidden`            | Нет прав                                    |
| 404    | `*.not-found`               | Не найдено                                  |
| 409    | `*.conflict`                | Конфликт/гонка                              |
| 422    | `*.unprocessable`           | Семантическая ошибка                        |
| 429    | `rate.limit-exceeded`       | Превышен лимит; указывать `Retry-After`     |
| 500    | `server.error`              | Внутренняя ошибка (с `correlationId`)       |

**Формат JSON (пример):**
```json
{{
  "type": "https://aquastream.app/problems/auth/invalid-credentials",
  "title": "Invalid credentials",
  "status": 401,
  "detail": "Wrong username or password",
  "instance": "/api/v1/user/auth/login",
  "code": "auth.invalid-credentials",
  "correlationId": "req-123",
  "errors": [ {{ "field": "password", "message": "Incorrect password", "code": "password.mismatch" }} ]
}}
```

---

## 7. Версионирование API и релизов
- **API:** путь `/api/v1/...`. При breaking‑change — `/api/v2/...` с параллельной поддержкой по необходимости.
- **Релизы:** **SemVer** (`MAJOR.MINOR.PATCH`). Docker‑теги: `vX.Y.Z` и `vX.Y.Z-<sha>`. Git‑теги + CHANGELOG (Conventional Commits).

---

## 8. CI/CD (минимум, GitHub Actions)
- На сервис: `build → unit (актуатор/валидации) → liquibase updateSQL (dry-run) → build image → push`.
- Build через Buildpacks/Jib; без интеграционных тестов (выделены в отдельный проект автотестов).
- Релиз‑job: по тегу `v*` — пуш образов с версией.

---

## 9. Профиль dev: моки
- Контроллеры отвечают фикстурами из in‑memory репозиториев; валидируют входы и формируют корректные статусы/ошибки.
- Переключение моков профилем `dev` и/или заголовком `X‑Use‑Mocks` (от gateway).
- Эмуляция платёжного виджета и webhook‑ов, лог‑доставка Telegram.

---

## 10. Health/Info/Метрики и графики (без Prometheus)
- Каждый сервис: `/actuator/health`, `/actuator/health/{liveness|readiness}`, `/actuator/info`.
- Мини‑метрики: `requests_total`, `errors_total`, `latency_p95_ms` — агрегируются каждую минуту и пишутся в Redis (TTL 48 ч).
- **Gateway** отдаёт серии для админки: `GET /api/v1/admin/metrics/series?service=X&metric=errors&range=h24`.

---

## 11. Резервное копирование (одна VM)
- Ночной `pg_dump` по схемам → gzip → каталог backup. Ротация: 7 дневных, 4 недельных, 3 месячных.
- (Опц.) Копия бэкапов в MinIO/S3.
- Док‑скрипты восстановления: примеры `pg_restore`/`psql` и чеклист.

---

## 12. Бизнес‑кейсы (MVP)
1) **Регистрация/логин/профиль:** без заполненного профиля (телефон+telegram) — запись на событие запрещена.
2) **Бронирование + оплата (виджет):** `init` → оплата → вебхук → `succeeded` → уведомление Telegram.
3) **Оплата QR (ручная):** загрузка пруфа → `submitted` → модерация → `accepted/rejected` → уведомление; автоудаление пруфа через 90 дней.
4) **Экипажи/палатки:** создание групп/вместимостей; ручные назначения; предупреждения при переполнении.
5) **Лист ожидания (FIFO):** при освобождении места — уведомляем **первого** с окном `app.notifications.window-minutes` на бронь; затем следующего. От опциональных уведомлений можно отписаться.
6) **Контент организатора:** загрузка лого/цвета/FAQ/команда, публикация; публичная страница обновляется (фронт — ISR).

---

## 13. Infra (Docker Compose; одна VM)
- Профили: `dev` (порталом), `stage` (интеграционный стенд), `prod`.
- Сервисы: gateway, user, event, crew, payment, notification, media, postgres, redis, minio.
- Порты по умолчанию: gateway 8080, user 8101, event 8102, crew 8103, payment 8104, notification 8105, media 8106.
- Сети/секреты: внутренняя сеть `aquastream-net`, секреты через `env_file`/Docker secrets (prod).

---

## 14. ENV (минимальный перечень)
- **gateway:** `GATEWAY_RATE_LIMIT_*`, `CORS_ALLOWED_ORIGINS`
- **user:** `JWT_PRIVATE_KEY`/`JWK_SET`, `OAUTH_ISSUER`, `ARGON2_*`, `POSTGRES_*`, `REDIS_*`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_DEEPLINK_BASE`
- **event:** `POSTGRES_*`
- **crew:** `POSTGRES_*`
- **payment:** `POSTGRES_*`, `PROVIDER`, `PROVIDER_SECRET`, `WEBHOOK_SECRET`
- **notification:** `POSTGRES_*`, `REDIS_*`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_URL`
- **media:** `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`

---

## 15. Тесты (минимум)
- Юниты: актуатор (`/health|/info` 200), базовые валидации DTO, маппинг ошибок в Problem Details.
- Интеграционных тестов **нет** (будет отдельный проект автотестов).

---