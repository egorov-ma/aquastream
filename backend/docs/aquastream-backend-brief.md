# AquaStream Backend - Краткая спецификация

## 1. Обзор системы

**AquaStream** - платформа-агрегатор мероприятий (сплавы, походы, банкеты и т.д.)

**Ключевые особенности:**
- Микросервисная архитектура
- Авторизация через JWT (НЕ OAuth2)
- Только телефон/Telegram (БЕЗ email)
- Все уведомления через Telegram бота

## 2. Роли и права

| Роль | Права |
|------|-------|
| **Guest** | Просмотр публичных страниц |
| **User** | Бронирование, оплата, профиль |
| **Organizer** | + управление своими событиями и бронями компании |
| **Admin** | Полный доступ ко всем данным |

## 3. Архитектура

### Сервисы и порты

```
backend-gateway     :8080  → Точка входа, проверка JWT, rate limiting
backend-user        :8101  → Авторизация, профили, роли
backend-event       :8102  → События, организаторы, БРОНИРОВАНИЯ
backend-crew        :8103  → Группы участников (экипажи, палатки)
backend-payment     :8104  → Платежи, вебхуки
backend-notification:8105  → Telegram бот, уведомления
backend-media       :8106  → Файлы, presigned URLs
backend-infra       :8107  → Инфраструктура, метрики, backups, health
```

### Технологический стек
- Java 21, Spring Boot 3.2+
- PostgreSQL 16 (отдельная схема для каждого сервиса)
- Redis 7 (кэш, pub/sub)
- Liquibase (миграции)
- Docker, Docker Compose

## 4. Авторизация

```
Client → Gateway → Service

1. Login через backend-user → получает JWT
2. Gateway проверяет JWT
3. Gateway добавляет headers: X-User-Id, X-User-Role
4. Сервисы доверяют Gateway (не проверяют JWT сами)
```

## 5. База данных

**Один PostgreSQL, схемы:**
- `user` - пользователи, профили, сессии
- `event` - организаторы, события, **бронирования**, waitlist
- `crew` - группы, назначения
- `payment` - платежи, вебхуки
- `notification` - подписки, очередь
- `media` - файлы

## 6. Критичные бизнес-процессы

### 6.1 Бронирование
```
1. Проверка заполнения профиля (телефон ИЛИ telegram)
2. Проверка доступных мест
3. Создание брони (status=PENDING, expires_at=30 мин)
4. Уменьшение available мест
5. Уведомление через Redis pub/sub
```

**Статусы:** `pending → confirmed → completed/cancelled/expired/no_show`

### 6.2 Оплата
- **Виджет** - YooKassa/CloudPayments/Stripe
- **QR** - загрузка proof → модерация организатором

**Статусы платежа:** `unpaid → processing → paid/refunded`

### 6.3 Waitlist
- При освобождении места → уведомление первому в очереди
- Окно 30 минут на подтверждение
- Затем следующий в очереди

## 7. Интеграции

### Telegram Bot (в backend-notification)
- Верификация аккаунта через deep link
- Восстановление пароля (6-значный код)
- Отправка всех уведомлений
- Webhook: `/api/v1/notifications/telegram/webhook`

### Платежные провайдеры
- Вебхуки с проверкой подписи
- Идемпотентность по ключу события
- Автоматическое обновление статуса брони

## 8. Ключевые endpoints

```yaml
# Auth
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

# Profile (обязателен для бронирования)
GET  /api/v1/profile/me
PUT  /api/v1/profile

# Events (публичные)
GET  /api/v1/organizers
GET  /api/v1/events/{id}

# Bookings (требует auth)
POST /api/v1/bookings          # создать бронь
GET  /api/v1/bookings          # мои брони
PUT  /api/v1/bookings/{id}/confirm
PUT  /api/v1/bookings/{id}/cancel

# Organizer panel
GET  /api/v1/organizers/{id}/bookings  # все брони компании
PUT  /api/v1/bookings/{id}/status      # изменить статус

# Payments
POST /api/v1/payments/init
POST /api/v1/payments/{id}/proof       # загрузка QR proof
PUT  /api/v1/payments/{id}/review      # модерация QR

# Crews
GET  /api/v1/events/{id}/crews
POST /api/v1/crews/{id}/assignments
```

## 9. Критические настройки

```yaml
# Окружения
SPRING_PROFILES_ACTIVE: dev|stage|prod

# Важные таймауты
booking.expiry: 30 минут
waitlist.window: 30 минут
jwt.access-token: 15 минут
jwt.refresh-token: 30 дней

# Rate limits
/api/v1/auth/*: 10 req/min
/api/v1/*: 60 req/min

# Retention
payment.proofs: 90 дней после события
```

## 10. Deployment

### Docker Compose
```bash
# Запуск
docker-compose -f docker-compose.prod.yml up -d

# Сервисы
- postgres:5432
- redis:6379
- minio:9000 (S3 для файлов)
- backend-*:810X
```

### CI/CD (GitHub Actions)
1. PR: test → build → liquibase validate
2. Main: build → push images → deploy

### Миграции БД
```bash
# Порядок важен!
1. backend-user
2. backend-event (включая bookings)
3. backend-crew
4. backend-payment
5. backend-notification
6. backend-media
```

## 11. Мониторинг

- Health: `/actuator/health`
- Метрики: Micrometer → Redis time-series
- Логи: JSON с correlationId и userId
- Alerts: через Telegram админам

## 12. Безопасность

- Пароли: Argon2
- JWT в заголовке Authorization Bearer
- CSRF токены для мутаций
- Rate limiting на всех endpoints
- Файлы только через presigned URLs

## 13. Важные зависимости

**backend-common** - общая библиотека:
- DTO, исключения
- Константы (роли, статусы)
- Problem Details (RFC 7807)
- REST клиенты между сервисами

## 14. Критические сценарии

1. **Истечение брони** - cron job каждую минуту
2. **Двойная оплата** - автоматический refund
3. **Нет мест** - предложение waitlist
4. **Сбой платежа** - retry через вебхук

## 15. Контакты и ресурсы

- Telegram бот: `@aquastream_bot`
- Webhook URL: `https://api.aquastream.app/api/v1/notifications/telegram/webhook`
- S3 bucket: `aquastream-media`
- Backup: ежедневно в 02:00 MSK

---

**⚠️ КРИТИЧНО:**
1. НЕ используем OAuth2 (простой JWT)
2. НЕТ email (только телефон/Telegram)
3. Booking в backend-event (НЕ отдельный сервис)
4. Админ и организатор видят ВСЕ брони своего уровня доступа
5. Профиль ОБЯЗАТЕЛЕН для бронирования