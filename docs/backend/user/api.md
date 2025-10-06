# User API

User API покрывает регистрацию, аутентификацию, обновление профиля и восстановление доступа.

## Аутентификация

- `POST /api/v1/auth/register` — создаёт пользователя и возвращает пару `access/refresh` токенов.
- `POST /api/v1/auth/login` — проверяет учётные данные, выдаёт новые токены.
- `POST /api/v1/auth/refresh` — обновляет пару токенов, ревокуя предыдущий refresh.
- `POST /api/v1/auth/logout` — аннулирует refresh-токен.
- `POST /api/v1/auth/recovery/init` — запуск восстановления (через Telegram/Email), TTL кода 15 минут.

## Профиль

- `GET /api/v1/profile/me` — возвращает профиль и роль пользователя.
- `PUT /api/v1/profile` — обновление контактов, ФИО, доп. полей (требуется phone или telegram для бронирования).
- `POST /api/v1/profile/telegram/link` — выдаёт ссылку для привязки Telegram.

## Безопасность

- Все методы (кроме `register/login/recovery`) требуют Access JWT.
- Пароли валидируются по правилу: ≥12 символов, верхний/нижний регистр, цифры, спецсимвол.
- Refresh-токены хранятся в таблице `refresh_sessions` и ревокуются при logout/refresh.

## Документация API
- Полная спецификация: [`../../api/redoc/root/backend-user-api.html`](../../api/redoc/root/backend-user-api.html)
