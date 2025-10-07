# User API

API для регистрации, аутентификации, управления профилями и восстановления доступа.

## Обзор

**Base URL**: `http://localhost:8101/api/v1`
**Аутентификация**: JWT (кроме auth endpoints)
**Формат**: JSON
**Ошибки**: RFC 7807 Problem Details

## Endpoints

### Authentication

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/auth/register` | Регистрация пользователя (username, password) | PUBLIC |
| POST | `/auth/login` | Вход (возвращает access + refresh tokens) | PUBLIC |
| POST | `/auth/refresh` | Обновление токенов (ревокация старого refresh) | PUBLIC |
| POST | `/auth/logout` | Выход (ревокация refresh token) | USER |
| POST | `/auth/recovery/init` | Инициация восстановления (код через Telegram/Email, TTL 15 мин) | PUBLIC |
| POST | `/auth/recovery/verify` | Проверка кода восстановления | PUBLIC |
| POST | `/auth/recovery/reset` | Сброс пароля (ревокация всех sessions) | PUBLIC |

### Profile

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/users/me` | Получить свой профиль и роль | USER |
| PUT | `/users/me` | Обновить профиль (phone, telegram, firstName, lastName, birthDate) | USER |
| POST | `/users/me/telegram/link` | Получить deep-link для привязки Telegram | USER |

### Admin

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/admin/users/{id}/role` | Изменить роль пользователя | ADMIN |
| GET | `/admin/users/{id}/audit` | Audit log пользователя | ADMIN |

## JWT Токены

| Тип | TTL | Алгоритм | Хранение |
|-----|-----|----------|----------|
| **Access** | 15 минут | HS512 | In-memory (клиент) |
| **Refresh** | 30 дней | - | БД (`refresh_sessions`) |

**Payload Access Token**: `sub` (user_id), `username`, `role`, `jti`, `exp`

## Валидация

| Поле | Требования |
|------|------------|
| `username` | Email формат, уникальный |
| `password` | ≥12 символов, uppercase + lowercase + digit + special char |
| `phone` | E.164 формат (опционально) |
| `telegram` | @username (опционально) |

**Для бронирования**: требуется `phone` ИЛИ `telegram` (проверяется в Event Service).

## Безопасность

- ✅ BCrypt (strength 12) для паролей
- ✅ JWT secret из environment variable
- ✅ Refresh rotation: новый токен при каждом refresh
- ✅ Rate limiting: 10 req/min для auth, 5 req/5min для recovery
- ✅ Audit logging всех критичных операций

---

См. [Business Logic](business-logic.md), [Operations](operations.md), [README](README.md), [Authentication](../authentication.md).
