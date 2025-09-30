# User — бизнес-логика

Статус: as-is

## Домены
- Аутентификация и токены (access/refresh)
- Профиль пользователя
- RBAC роли: Guest, User, Organizer, Admin

## Основные кейсы
- Регистрация → создание пользователя (роль USER), выдача JWT
- Логин → проверка, выдача JWT/refresh
- Refresh → ротация refresh по jti
- Профиль → чтение/обновление (phone/telegram)
- Восстановление → инициация через Telegram

## Интеграции
- JWT для всех сервисов (см. backend/common/authentication.md)

## Чек‑лист
- [ ] Определены TTL токенов (access 15m, refresh 30d)
- [ ] Включён revoke/rotation для refresh
- [ ] RFC 7807 для ошибок (валидация, конфликт)
