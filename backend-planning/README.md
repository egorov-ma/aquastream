# Planning Service

Сервис планирования сплавов, реализованный с использованием gRPC.

## Функциональность

- Создание и управление планами сплавов
- Расчёт длительности и оценка сложности маршрутов
- Предоставление gRPC API для интеграции

## Конфигурация

Конфигурация определяется в файлах:
- **Локальный запуск:** [application.yml](src/main/resources/application.yml)
- **Запуск через Docker:** [application-docker.yml](src/main/resources/application-docker.yml)

Описание API содержится в файле [planning.proto](src/main/proto/planning.proto).

## Визуализация gRPC API

Сервис поддерживает gRPC Reflection для автоматического предоставления схемы API внешним инструментам. Для визуализации gRPC API используйте утилиту grpcui:

- Если grpcui установлен локально, выполните:
  ```
  grpcui -plaintext localhost:9090
  ```
- Либо запустите через Docker:
  ```
  docker run -p 8080:8080 fullstorydev/grpcui -plaintext localhost:9090
  ```

## Запуск сервиса

Смотрите [README.md](../../README.md) в корневой директории проекта для подробных инструкций по сборке и запуску. 