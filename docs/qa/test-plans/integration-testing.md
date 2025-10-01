# Integration Testing Plan

---
title: Integration Testing Plan
summary: План интеграционного тестирования взаимодействия между компонентами системы AquaStream
tags: [qa, testing, integration, testcontainers]
---

## Обзор

План интеграционного тестирования взаимодействия между компонентами системы AquaStream.

## Области интеграции

### 1. Backend ↔ Database

**Компоненты**:
- Все микросервисы
- PostgreSQL базы данных
- Миграции Flyway/Liquibase

**Тесты**:
- CRUD операции через JPA/Hibernate
- Транзакционность
- Каскадные операции
- Индексы и производительность

**Инструменты**: Testcontainers + PostgreSQL

### 2. Service ↔ Service

**Компоненты**:
- Межсервисное REST взаимодействие
- API Gateway ↔ Backend services

**Тесты**:
- Корректность вызовов API
- Обработка ошибок
- Таймауты и retry logic
- Circuit breaker patterns

**Инструменты**: MockServer, WireMock

### 3. Backend ↔ Redis

**Компоненты**:
- Сервисы с кэшированием
- Redis

**Тесты**:
- Кэширование данных
- Инвалидация кэша
- TTL политики
- Rate limiting (Bucket4j)

**Инструменты**: Testcontainers + Redis

### 4. Backend ↔ Message Queue

**Компоненты**:
- Notification Service
- RabbitMQ/Kafka

**Тесты**:
- Отправка сообщений
- Обработка сообщений
- Dead letter queue
- Гарантии доставки

**Инструменты**: Testcontainers + RabbitMQ

### 5. Frontend ↔ Backend

**Компоненты**:
- Next.js приложение
- API Gateway

**Тесты**:
- REST API вызовы
- Аутентификация (JWT)
- Обработка ошибок
- CORS

**Инструменты**: Playwright + Mock Backend

## Тестовые сценарии

### Сценарий 1: Создание пользователя

```
1. Frontend отправляет POST /api/users
2. Gateway маршрутизирует на User Service
3. User Service валидирует данные
4. User Service сохраняет в PostgreSQL
5. User Service публикует событие в очередь
6. Notification Service получает событие
7. Notification Service отправляет email
8. Frontend получает успешный ответ
```

**Проверки**:
- Пользователь создан в БД
- Email отправлен
- Корректный HTTP статус
- Корректная структура ответа

### Сценарий 2: Бронирование события

```
1. Frontend запрашивает доступные места
2. Event Service возвращает данные
3. Пользователь выбирает место
4. Frontend создает бронирование
5. Event Service блокирует место
6. Payment Service обрабатывает платеж
7. Event Service подтверждает бронирование
8. Notification Service отправляет подтверждение
```

**Проверки**:
- Место заблокировано в БД
- Платеж проведен
- Уведомление отправлено
- Consistency между сервисами

## Окружение для тестов

### Docker Compose конфигурация

```yaml
services:
  postgres:
    image: postgres:15
  redis:
    image: redis:7
  rabbitmq:
    image: rabbitmq:3-management
```

### Testcontainers подход

```java
@Testcontainers
class IntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = 
        new PostgreSQLContainer<>("postgres:15");
    
    @Container
    static GenericContainer<?> redis = 
        new GenericContainer<>("redis:7")
            .withExposedPorts(6379);
}
```

## Данные для тестов

### Подготовка данных
- SQL-скрипты (test-data.sql)
- Fixtures в коде тестов
- Генераторы тестовых данных

### Изоляция данных
- Отдельная БД для каждого теста
- Rollback транзакций
- Очистка после выполнения

## Запуск тестов

```bash
# Backend integration tests
./gradlew integrationTest

# Frontend + Backend integration
pnpm test:e2e

# Full integration suite
make test-integration
```

## Метрики

### KPI
- Integration Test Coverage: ≥60%
- Success Rate: 100%
- Execution Time: <20 мин
- Flakiness Rate: <5%

### Отчетность
- JUnit XML reports
- Test execution logs
- Integration coverage reports

## Обработка ошибок

### Типы ошибок для тестирования

1. **Network errors**: таймауты, недоступность сервиса
2. **Data errors**: невалидные данные, конфликты
3. **Auth errors**: неавторизованный доступ
4. **Business logic errors**: нарушение бизнес-правил

### Ожидаемое поведение
- Graceful degradation
- Понятные сообщения об ошибках
- Retry механизмы
- Circuit breaker activation

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Нестабильность тестов | Высокая | Высокое | Testcontainers, изоляция |
| Долгое выполнение | Средняя | Среднее | Параллелизация |
| Конфликты данных | Средняя | Высокое | Изолированные окружения |
| Несинхронизация версий | Низкая | Высокое | Contract testing |

## График

- **При каждом PR**: smoke integration tests
- **Ночные сборки**: full integration suite
- **Перед релизом**: полная регрессия с отчетом
