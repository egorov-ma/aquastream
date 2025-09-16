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
- **WebAutoConfiguration** - Настройка Correlation ID и RestTemplate
- **MetricsAutoConfiguration** - Сбор HTTP метрик
- **RateLimitAutoConfiguration** - Ограничение скорости запросов
- **ServiceDiscoveryAutoConfiguration** - Настройка service discovery

#### 🌐 Service Discovery
- **ServiceUrls** - Централизованная конфигурация URL сервисов
- **ServiceHealthChecker** - Мониторинг здоровья зависимых сервисов
- **RestTemplate** бины с передачей correlation ID

#### 📊 Система метрик
- Автоматический сбор метрик HTTP запросов
- Хранение в Redis с настраиваемым TTL (48 часов)
- Агрегация по минутам: запросы, ошибки, латентность
- Debug endpoints для мониторинга

#### 🛡️ Безопасность и качество
- **CorrelationIdFilter** - Трассировка запросов между сервисами
- **RateLimitFilter** - Настраиваемое ограничение скорости
- **GlobalExceptionHandler** - Ошибки в формате RFC 7807
- **MockResponseGenerator** - Поддержка тестирования

#### 📋 Доменные объекты
- **BookingStatus** - Состояния жизненного цикла бронирования
- **PaymentStatus** - Состояния обработки платежей
- **UserRole** - Роли авторизации пользователей
- **DomainConstants** - Разделяемые константы

## Использование

### Подключение к сервису

Добавьте зависимость в `build.gradle` вашего сервиса:

```gradle
dependencies {
    implementation project(':backend-common')
}
```

### Автоконфигурация

Все компоненты автоконфигурируются через Spring Boot. Включите функции в `application.yml`:

```yaml
aquastream:
  # Сбор метрик
  metrics:
    enabled: true
    service-name: ваш-сервис
    ttl: PT48H
    
  # Ограничение скорости запросов
  ratelimit:
    enabled: true
    global:
      requests-per-minute: 1000
      
  # Service discovery
  services:
    user:
      base-url: http://localhost:8101
    event: 
      base-url: http://localhost:8102
```

### Трассировка Correlation ID

Автоматически включается для всех HTTP запросов. Доступ в коде:

```java
import org.slf4j.MDC;
import org.aquastream.common.domain.DomainConstants;

String correlationId = MDC.get(DomainConstants.LOG_CORRELATION_ID);
```

### Коммуникация между сервисами

Используйте автоконфигурированные RestTemplate бины:

```java
@Autowired
@Qualifier("userServiceRestTemplate") 
private RestTemplate restTemplate;

// Correlation ID автоматически передается
ResponseEntity<String> response = restTemplate.getForEntity("/api/users/123", String.class);
```

### Сбор метрик

HTTP метрики собираются автоматически. Ручной сбор:

```java
@Autowired
private MetricsCollector metricsCollector;

metricsCollector.recordLatency(responseTimeMs);
metricsCollector.recordError();
```

### Ограничение скорости запросов

Настройка лимитов по сервису или endpoint:

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

Стандартные ошибки в формате RFC 7807:

```java
throw new ApiException(ErrorCodes.BOOKING_NOT_FOUND, "Бронирование не найдено: " + id);
```

Формат ответа:
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

## Мониторинг

### Endpoints метрик

Доступны по адресу `/actuator/metrics-debug/`:

- `GET /health` - Проверка здоровья системы
- `GET /collector/state` - Текущее состояние метрик
- `POST /flush` - Ручная выгрузка метрик
- `GET /data?service=X&timePattern=Y` - Запрос сохраненных метрик

### Service Discovery

Проверка здоровья всех настроенных сервисов:

```bash
GET /actuator/service-discovery/health
```

### Статус Rate Limit

```bash  
GET /actuator/ratelimit/status
```

## Справочник конфигурации

### Свойства метрик

```yaml
aquastream:
  metrics:
    enabled: true                    # Включить сбор метрик
    service-name: имя-сервиса        # Идентификатор сервиса
    ttl: PT48H                      # TTL для Redis (48 часов)
    flush-interval: PT1M            # Интервал выгрузки (1 минута)
    max-samples: 10000              # Макс. выборок латентности в минуту
```

### URL сервисов

```yaml
aquastream:
  services:
    user:
      base-url: http://localhost:8101
      timeout: PT30S
    event:
      base-url: http://localhost:8102  
      timeout: PT30S
    # ... другие сервисы
```

### Ограничение скорости

```yaml
aquastream:
  ratelimit:
    enabled: true
    global:
      requests-per-minute: 1000
    rules:
      - path: "/api/auth/**"
        requests-per-minute: 60
        burst-capacity: 10
```

## Интеграция с Redis

### Хранение метрик

Метрики хранятся с форматом ключей:
```
metrics:<сервис>:<метрика>:YYYYMMDDHHmm
```

Примеры:
- `metrics:user:requests_total:202508201430`
- `metrics:event:latency_p95_ms:202508201431`

### Rate Limiting

Счетчики rate limit хранятся с автоматическим истечением.

## Поддержка тестирования

### Mock ответы

```java
@TestConfiguration
@EnableConfigurationProperties(MockProperties.class)
public class TestConfig {
    // Mock конфигурации для тестирования
}
```

### Тестовые утилиты

Доступны общие тестовые утилиты и конфигурации для тестирования сервисов.

## Производительность

### Использование памяти
- Минимальные накладные расходы памяти
- Потокобезопасные структуры данных
- Автоматическая очистка устаревших данных

### Использование Redis  
- Эффективная структура ключей для time-series запросов
- Автоматическое истечение сокращает хранение
- Batch операции где возможно

### Потокобезопасность
- Все компоненты полностью потокобезопасны
- Lock-free реализации где возможно
- Безопасность для высоконагруженных сред

## Участие в разработке

При добавлении новой общей функциональности:

1. Следуйте существующей структуре пакетов
2. Добавьте соответствующую автоконфигурацию
3. Включите исчерпывающие тесты
4. Обновите этот README
5. Учитывайте обратную совместимость

## Зависимости

### Обязательные
- Spring Boot 3.x
- Spring Web
- Spring Data Redis (для метрик)
- Jackson (обработка JSON)

### Опциональные  
- Micrometer (расширенные метрики)
- Spring Security (для функций безопасности)
- Testcontainers (для тестирования)