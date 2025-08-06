# Backend-Crew Service

Микросервис управления экипажами/командами.

| Подпроект | Назначение |
|-----------|-----------|
| `backend-crew-api`     | публичные DTO/интерфейсы, которые могут использоваться другими сервисами |
| `backend-crew-db`      | миграции базы данных, JPA-сущности, репозитории |
| `backend-crew-service` | основная бизнес-логика, REST контроллеры, конфигурация Spring Boot |

## Запуск сервиса

### Локально
```bash
./gradlew :backend-crew-service:bootRun
```
Сервис стартует на `http://localhost:8083`.

### Docker
```bash
docker build -t aquastream-crew -f infra/docker/images/Dockerfile.backend --build-arg SERVICE=backend-crew/backend-crew-service .
docker run -p 8083:8083 aquastream-crew
```

## ENV переменные
| Переменная | Значение по умолчанию | Описание |
|------------|-----------------------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/aquastream_db` | Строка подключения к БД |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Адрес Kafka |

## Использование API
См. Swagger UI: `http://localhost:8083/swagger-ui.html` (через Gateway — `/crew/swagger-ui.html`).

Пример запроса создания экипажа:
```bash
curl -X POST http://localhost:8083/api/v1/crews \
  -H 'Content-Type: application/json' \
  -d '{"name":"River Riders","description":"Test crew"}'
```

## Тестирование
```bash
./gradlew :backend-crew-service:test
```
Отчёт Jacoco генерируется в `backend-crew-service/build/reports/jacoco` и публикуется в CI.

## CI/CD
![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)
Артефакты сборки: `backend-build` (JAR) и `backend-test-reports`.

## Дополнительная документация
- Системный анализ: [`crew-analysis`](../infra/docs/system-analysis/crew-analysis.md)
- Бизнес-архитектура: [`crew-architecture`](../infra/docs/business-architecture/crew-architecture.md)