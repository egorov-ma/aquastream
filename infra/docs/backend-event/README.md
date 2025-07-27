# Backend-Event (Planning) Service – Документация

> Версия: 0.1 (draft)

Микросервис **Backend-Event** (далее *Planning Service*) отвечает за планирование сплавов и управление событиями (events) в системе AquaStream.

*Ключевая особенность*: коммуникация с другими сервисами осуществляется через **gRPC** с включённой reflection, что упрощает разработку клиентов.

---

## Назначение модуля

1. CRUD-операции над событиями (планами сплава): создание, обновление, удаление, просмотр.
2. Расчёт параметров маршрута (планируется).
3. Генерация доменных событий (`EventCreated`, `EventUpdated`) в Kafka.
4. Предоставление высокопроизводительного gRPC API другим сервисам.

---

## Подпроектная структура

| Подпроект | Описание |
|-----------|----------|
| `backend-event-api`     | gRPC/Protobuf контракты + DTO для интеграции. |
| `backend-event-db`      | Liquibase-миграции, репозитории и JPA-сущности. |
| `backend-event-service` | Spring Boot приложение с gRPC-сервисами, бизнес-логикой и Kafka-интеграцией. |

---

## gRPC API

Файл контракта: `backend-event-service/src/main/proto/planning.proto`

```protobuf
service PlanningService {
    rpc CreatePlan (PlanRequest) returns (PlanResponse);
}

message PlanRequest {
    string name = 1;
    string description = 2;
}

message PlanResponse {
    int64 id = 1;
    string status = 2;
}
```

### Запуск локального клиента

Поскольку reflection включён (`grpc.server.reflection.enabled = true`), можно использовать [grpcui](https://github.com/fullstorydev/grpcui):

```bash
docker run -p 8080:8080 fullstorydev/grpcui -plaintext host.docker.internal:9090
```

Интерфейс будет доступен по `http://localhost:8080`.

---

## Конфигурация

Файл `application.yml`:
```yaml
server:
  port: 8082
spring:
  application:
    name: planning-service

grpc:
  server:
    port: 9090
  reflection:
    enabled: true

grpcui:
  enabled: true
  path: /grpcui/
```

---

## База данных

| Сущность | Описание |
|----------|----------|
| `Plan`   | Маршрут сплава с датами начала/окончания, ссылкой на экипаж и статусом. |
| `Waypoint` | Контрольная точка маршрута (широта/долгота, номер порядка). |

Миграции хранятся в `backend-event-db/src/main/resources/db/changelog`.

---

## События Kafka (draft)

| Событие | Топик | Описание |
|---------|-------|----------|
| `PlanCreated` | `planning.events` | Создан новый план сплава |
| `PlanStatusChanged` | `planning.events` | Изменился статус (DRAFT → PUBLISHED и т.д.) |

Схемы будут описаны в Avro-формате.

---

## Тестирование

- Unit-тесты сервисного слоя.
- Integration-тесты gRPC при помощи `grpc-java-testing` + Testcontainers.
- Jacoco coverage выводится в CI-pipeline `backend-ci.yml`.

---

## Разработка и запуск

```bash
# Сборка
./gradlew :backend-event-service:build

# Запуск gRPC сервера
./gradlew :backend-event-service:bootRun

# Проверка grpcui (если включен spring-boot-starter-grpc-ui)
open http://localhost:8082/grpcui/
```

Контейнеризация описана в `infra/docker/images/Dockerfile.backend-event`.

---

## TODO
- [ ] Реализовать CRUD-операции и репозитории.
- [ ] Добавить Kafka-publisher с Avro-схемами.
- [ ] Расширить Proto (списки, фильтрация, пагинация).