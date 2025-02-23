# User Service

Сервис управления пользователями и аутентификацией с использованием JWT.

## Функциональность

- Регистрация и авторизация пользователей
- Управление профилем
- REST API для управления пользователями (доступ через Swagger UI)

## Конфигурация

Конфигурация определяется в следующих файлах:
- **Локальный запуск:** [application.yml](src/main/resources/application.yml) – настройки для подключения к базе на localhost.
- **Запуск через Docker:** [application-docker.yml](src/main/resources/application-docker.yml) – настройки с параметризацией через переменные окружения.

## Запуск

См. [README.md](../../README.md) в корне проекта для инструкций по запуску.

## API

- POST /api/users/register
- POST /api/users/login
- GET /api/users/profile 