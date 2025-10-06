# User — операции

## Обзор

User Service обслуживает аутентификацию, refresh-сессии и профили.

**Порт**: 8101  
**Ключевые переменные**: `JWT_SECRET`, `JWT_ACCESS_TTL_MINUTES`, `JWT_REFRESH_TTL_DAYS`

## JWT и refresh-сессии

- Access TTL: 15 минут (`JWT_ACCESS_TTL_MINUTES`).
- Refresh TTL: 30 дней (`JWT_REFRESH_TTL_DAYS`).
- Таблица `refresh_sessions` хранит активные токены (`revoked=false`).
- Принудительная ревокация:
  ```sql
  update refresh_sessions set revoked = true where user_id = '<uuid>';
  ```

## Восстановление через Telegram

1. `POST /api/v1/auth/recovery/init` — отправка кода в Telegram.
2. `POST /api/v1/auth/recovery/verify` — проверка кода, выдача временного токена.
3. `POST /api/v1/auth/recovery/reset` — установка нового пароля и полная ревокация refresh-сессий.

Проверка привязки:
```sql
select * from telegram_link where user_id = '<uuid>';
```

## Диагностика

- Проверка токена: `curl -H "Authorization: Bearer <token>" http://localhost:8101/api/v1/profile/me`.
- Логи: `make logs SERVICE=backend-user | grep JWT` (ошибки аутентификации).
- Метрики: `user.auth.success`, `user.auth.failure`, `user.refresh.revoked` (Actuator -> Prometheus).

## Checklist при инциденте

- [ ] Ревокировать все refresh-токены пользователя.
- [ ] Принудительно сбросить пароль (`POST /auth/recovery/reset`).
- [ ] Проверить `audit_log` на подозрительные активности.

## См. также

- [User Service Business Logic](business-logic.md)
- [User API](api.md)
- [Incident Response](../../operations/runbooks/incident-response.md)
