# User Service

## Обзор

User Service управляет пользователями: регистрация, аутентификация, профили, JWT sessions.

**Порт**: 8101
**Схема БД**: `user`

## Основные функции

| Функция | Возможности |
|---------|-------------|
| **Аутентификация** | Регистрация, login (email/password), JWT + refresh tokens, password recovery |
| **Профили** | CRUD профиля, настройки, аватары, верификация email |
| **Авторизация** | Роли (USER, ORGANIZER, ADMIN), проверка прав |

## Ключевые endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/refresh` | Обновление токенов |
| POST | `/api/auth/logout` | Выход (revoke refresh) |
| GET | `/api/users/me` | Получить профиль |
| PUT | `/api/users/me` | Обновить профиль |

## Внешние зависимости

- **Notification Service**: Email/Telegram для recovery
- **Media Service**: Аватары пользователей

---

См. [Business Logic](business-logic.md), [API](api.md), [Operations](operations.md).