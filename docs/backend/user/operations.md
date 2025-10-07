# User Service — Operations

## Обзор

**Порт**: 8101
**Схема БД**: `user`
**Контейнер**: `aquastream-backend-user`

## Конфигурация

### Environment Variables

| Переменная | Значение | Описание |
|------------|----------|----------|
| `JWT_SECRET` | Strong secret | Ключ для подписи JWT (HS512) |
| `JWT_ACCESS_TTL_MINUTES` | 15 | TTL Access Token |
| `JWT_REFRESH_TTL_DAYS` | 30 | TTL Refresh Token |
| `POSTGRES_DB` | aquastream | База данных |
| `NOTIFICATION_SERVICE_URL` | http://backend-notification:8105 | Notification Service |

### Application Profiles

| Параметр | dev | prod |
|----------|-----|------|
| `bcrypt.strength` | 10 | 12 |
| `recovery.code-ttl-minutes` | 30 | 15 |
| `audit.retain-days` | 30 | 90 |
| `session-cleanup.interval` | daily | daily |

## JWT и Refresh Sessions

| Параметр | Значение | Хранение |
|----------|----------|----------|
| **Access TTL** | 15 минут | In-memory (JWT) |
| **Refresh TTL** | 30 дней | БД (`refresh_sessions`) |
| **Алгоритм** | HS512 | - |
| **Revoke** | `revoked=true` | БД |
| **Rotation** | Каждый refresh | - |

**Payload Access Token**: `sub` (user_id), `username`, `role`, `jti`, `exp`

**Принудительная ревокация**:
```sql
UPDATE user.refresh_sessions SET revoked = true WHERE user_id = '<uuid>';
```

## Password Recovery

| Шаг | Endpoint | Действие | TTL |
|-----|----------|----------|-----|
| 1. Инициация | `POST /api/auth/recovery/init` | Генерация кода → Telegram/Email | - |
| 2. Верификация | `POST /api/auth/recovery/verify` | Проверка кода → временный токен | 15 минут |
| 3. Сброс | `POST /api/auth/recovery/reset` | Новый пароль, revoke всех sessions | - |

**Recovery codes**: таблица `recovery_codes`, one-time use, TTL 15 минут.

## Мониторинг

### Health Check

```bash
curl http://localhost:8101/actuator/health
docker logs aquastream-backend-user
```

### Метрики

```bash
# Auth metrics
curl http://localhost:8101/actuator/metrics/user.auth.success
curl http://localhost:8101/actuator/metrics/user.auth.failure

# Refresh metrics
curl http://localhost:8101/actuator/metrics/user.refresh.revoked

# DB connections
curl http://localhost:8101/actuator/metrics/hikaricp.connections.active
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **JWT validation fails** | 1. Проверить `JWT_SECRET` синхронизирован с Gateway<br>2. Проверить timestamp сервера<br>3. Логи: `docker logs backend-user \| grep JWT` |
| **Recovery code expired** | TTL 15 минут, проверить: `SELECT * FROM user.recovery_codes WHERE user_id='<uuid>' AND expires_at > NOW()` |
| **Telegram link не работает** | 1. Проверить Notification Service health<br>2. Проверить: `SELECT * FROM user.profiles WHERE user_id='<uuid>'`<br>3. Telegram должен быть привязан через `/start` команду бота |
| **Sessions не ревокуются** | Проверить `revoked` flag: `SELECT jti, revoked, expires_at FROM user.refresh_sessions WHERE user_id='<uuid>'` |
| **High auth failures** | 1. Проверить audit log: `SELECT * FROM user.audit_log WHERE action='USER_LOGIN_FAILED' ORDER BY created_at DESC LIMIT 20`<br>2. Возможна атака brute-force → применить rate limit |

## Диагностика

### Проверка токена

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8101/api/users/me
```

### Проверка Telegram привязки

```sql
SELECT p.user_id, p.telegram, p.is_telegram_verified
FROM user.profiles p
WHERE p.user_id = '<uuid>';
```

### Audit log

```sql
SELECT action, target_id, created_at, ip_address
FROM user.audit_log
WHERE actor_user_id = '<uuid>'
ORDER BY created_at DESC
LIMIT 20;
```

## Incident Response Checklist

- [ ] Ревокировать refresh-токены пользователя: `UPDATE user.refresh_sessions SET revoked = true WHERE user_id = '<uuid>'`
- [ ] Принудительно сбросить пароль (через admin endpoint)
- [ ] Проверить `audit_log` на подозрительную активность (login attempts, IP addresses)
- [ ] Проверить rate limit для auth endpoints
- [ ] Уведомить пользователя через Notification Service

---

См. [Business Logic](business-logic.md), [API](api.md), [README](README.md), [Authentication](../authentication.md).