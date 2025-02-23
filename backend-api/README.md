# API Gateway

API Gateway на базе Spring Cloud Gateway для маршрутизации запросов к микросервисам.

## Функциональность

- Маршрутизация запросов к микросервисам
- Балансировка нагрузки
- Возможность реализации аутентификации, авторизации, rate limiting и circuit breaking

## Конфигурация

Маршруты задаются централизованно в файлах конфигурации:
- **Локальный запуск:** [application.yml](src/main/resources/application.yml)
- **Запуск через Docker:** [application-docker.yml](src/main/resources/application-docker.yml)

> Примечание: Java-конфигурация маршрутов в классе `GatewayConfig.java` отключена (закомментирована) для исключения конфликтов.

## Запуск

См. [README.md](/README.md) в корне проекта для подробных инструкций.

## Дополнительная документация

Полная документация проекта доступна в файле [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md). 