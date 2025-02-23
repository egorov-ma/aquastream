# Notification Service

Сервис уведомлений с использованием Apache Kafka.

## Функциональность

- Отправка уведомлений через REST API
- Интеграция с Apache Kafka для обмена сообщениями
- Документация API доступна через Swagger UI

## Конфигурация

Конфигурация задается в файлах:
- **Локальный запуск:** [application.yml](src/main/resources/application.yml) – настройки для подключения к базе и Kafka на localhost.
- **Запуск через Docker:** [application-docker.yml](src/main/resources/application-docker.yml) – настройки с параметризацией через переменные окружения.

## Запуск

См. [README.md](../../README.md) в корне проекта для полной инструкции по запуску.

## Kafka Topics

- user-notifications
- system-notifications
- alerts 