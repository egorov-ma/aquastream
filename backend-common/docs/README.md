---
title: Backend Common
summary: Общая библиотека AquaStream: автоконфигурации, метрики, ratelimit, service discovery и утилиты.
---

# AquaStream Backend Common

Общая библиотека, содержащая разделяемую функциональность для всех микросервисов AquaStream.

## Описание

`backend-common` предоставляет переиспользуемые компоненты, конфигурации и утилиты, которые используются 
во всех backend сервисах AquaStream. Следует принципам чистой архитектуры и обеспечивает 
автоконфигурацию для сквозных аспектов системы.

## Архитектура

### Основные модули

```
backend-common/
├── config/           # Service discovery и Spring конфигурации
├── domain/           # Доменные объекты и константы
├── error/            # Централизованная обработка ошибок
├── health/           # Проверка здоровья сервисов
├── metrics/          # Система сбора HTTP метрик
├── mock/             # Генерация mock ответов для тестирования
├── ratelimit/        # Функциональность ограничения скорости запросов
├── util/             # Общие утилиты
└── web/              # Web-слой (фильтры, интерсепторы)
```

### Ключевые компоненты

#### 🔧 Автоконфигурация
- WebAutoConfiguration — Correlation ID и RestTemplate
- MetricsAutoConfiguration — Сбор HTTP метрик
- RateLimitAutoConfiguration — Ограничение скорости
- ServiceDiscoveryAutoConfiguration — Service discovery

#### 🌐 Service Discovery
- ServiceUrls — Централизованная конфигурация URL сервисов
- ServiceHealthChecker — Мониторинг здоровья зависимых сервисов
- RestTemplate бины с передачей correlation ID

#### 📊 Система метрик
- Автоматический сбор метрик HTTP запросов
- Redis backend с TTL (48 часов)
- Агрегация по минутам: запросы, ошибки, латентность
- Debug endpoints

#### 🛡️ Безопасность и качество
- CorrelationIdFilter — трассировка
- RateLimitFilter — лимиты
- GlobalExceptionHandler — RFC 7807
- MockResponseGenerator — тестирование

#### 📋 Доменные объекты
- BookingStatus, PaymentStatus, UserRole, DomainConstants

## Использование

### Подключение к сервису

```gradle
dependencies {
    implementation project(':backend-common')
}
```

### Автоконфигурация

```yaml
aquastream:
  metrics:
    enabled: true
    service-name: ваш-сервис
    ttl: PT48H
  ratelimit:
    enabled: true
    global:
      requests-per-minute: 1000
  services:
    user:
      base-url: http://localhost:8101
    event:
      base-url: http://localhost:8102
```

### Трассировка Correlation ID

```java
import org.slf4j.MDC;
import org.aquastream.common.domain.DomainConstants;

String correlationId = MDC.get(DomainConstants.LOG_CORRELATION_ID);
```

### Коммуникация между сервисами

```java
@Autowired
@Qualifier("userServiceRestTemplate") 
private RestTemplate restTemplate;

ResponseEntity<String> response = restTemplate.getForEntity("/api/users/123", String.class);
```

### Сбор метрик (ручной)

```java
@Autowired
private MetricsCollector metricsCollector;

metricsCollector.recordLatency(responseTimeMs);
metricsCollector.recordError();
```

### Ограничение скорости (пример)

```yaml
aquastream:
  ratelimit:
    enabled: true
    rules:
      - path: "/api/auth/**"
        requests-per-minute: 60
      - path: "/api/bookings/**"  
        requests-per-minute: 300
```

### Обработка ошибок

```java
throw new ApiException(ErrorCodes.BOOKING_NOT_FOUND, "Бронирование не найдено: " + id);
```

```json
{
  "type": "https://api.aquastream.org/errors/booking-not-found",
  "title": "Бронирование не найдено",
  "status": 404,
  "detail": "Бронирование не найдено: 12345",
  "instance": "/api/bookings/12345",
  "timestamp": "2025-08-20T10:30:00Z",
  "correlationId": "req-abc123"
}
```

## Мониторинг (примеры endpoints)

- `/actuator/metrics-debug/health`
- `/actuator/ratelimit/status`

## Рекомендации по вкладy

1. Следуйте структуре пакетов
2. Добавляйте автоконфигурации
3. Тесты обязательны
4. Обновляйте этот README
5. Сохраняйте обратную совместимость
