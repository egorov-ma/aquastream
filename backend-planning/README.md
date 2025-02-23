# Planning Service

Сервис планирования сплавов, реализованный с использованием gRPC.

## Функциональность

- Создание и управление планами сплавов
- Расчёт длительности и оценка сложности маршрутов
- Предоставление gRPC API для интеграции
- Тестирование через gRPC UI

## Конфигурация

Конфигурация определяется в файлах:
- **Локальный запуск:** [application.yml](src/main/resources/application.yml)
- **Запуск через Docker:** [application-docker.yml](src/main/resources/application-docker.yml)

Для ознакомления с API см. файл [planning.proto](src/main/proto/planning.proto).

## Запуск

См. [README.md](../../README.md) в корне проекта для инструкций по запуску. 