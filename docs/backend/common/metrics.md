# Metrics System

## Обзор

Встроенная система метрик для сбора и агрегации метрик HTTP запросов с автоматической записью в Redis. Предоставляет метрики throughput, latency (P95) и error rate в минутных окнах.

## Архитектура

```
HTTP Request → MetricsFilter → MetricsCollector → (in-memory)
                                                         ↓
                                       MetricsScheduler (каждую минуту)
                                                         ↓
                                              RedisMetricsWriter
                                                         ↓
                                                       Redis
```

## Компоненты

### MetricsCollector

Thread-safe коллектор для агрегации метрик в минутных окнах.

**Возможности**:
- Подсчет общего количества запросов (counter)
- Подсчет ошибок (counter)
- Сбор latency samples для расчета перцентилей (P95)
- Автоматическая очистка завершенных окон

**API**:

```java
@Autowired
private MetricsCollector metricsCollector;

// Записать запрос с latency и статусом ошибки
metricsCollector.recordRequest(150, false);  // 150ms, no error
metricsCollector.recordRequest(500, true);   // 500ms, with error

// Записать только latency
metricsCollector.recordLatency(200);

// Записать только ошибку
metricsCollector.recordError();

// Получить текущее состояние (для отладки)
Map<String, Object> state = metricsCollector.getCurrentState();
```

### MetricsFilter

Servlet фильтр для автоматического сбора метрик HTTP запросов.

**Что отслеживается**:
- Request latency (время выполнения)
- HTTP status code (для определения ошибок)
- Автоматический вызов `MetricsCollector.recordRequest()`

**Ошибки** (status >= 400):
- 4xx - client errors
- 5xx - server errors

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class MetricsFilter extends OncePerRequestFilter {
    // Автоматически применяется ко всем HTTP запросам
}
```

### MetricsScheduler

Периодический планировщик для flush метрик в Redis.

**Конфигурация**:
```yaml
aquastream:
  metrics:
    flush-interval: 60s  # Интервал flush (по умолчанию 1 минута)
```

**Процесс**:
1. Каждые N секунд вызывает `MetricsCollector.flushMetrics()`
2. Получает метрики для завершенных минутных окон
3. Передает в `RedisMetricsWriter.write()`
4. Метрики очищаются из памяти

### RedisMetricsWriter

Запись метрик в Redis для хранения и последующей агрегации.

**Формат ключей**:
```
metrics:{service}:{type}:{timestamp}
```

Примеры:
```
metrics:user-service:requests_total:2024-01-15T10:23:00
metrics:event-service:errors_total:2024-01-15T10:23:00
metrics:payment-service:latency_p95_ms:2024-01-15T10:23:00
```

**Структура данных** (Hash):
```
value: 150           # Значение метрики
timestamp: ...       # ISO-8601 timestamp
service: user-service
type: requests_total
```

**TTL**: По умолчанию 48 часов (конфигурируется)

### MetricsController

REST API для получения метрик.

**Endpoints**:

```http
GET /api/metrics/current
```

Возвращает текущее состояние MetricsCollector:

```json
{
  "currentMinute": "2024-01-15T10:25:00",
  "requestCount": 42,
  "errorCount": 3,
  "latencySampleCount": 42,
  "totalMinutesTracked": 2
}
```

## Типы метрик

### MetricType

```java
public enum MetricType {
    REQUESTS_TOTAL,    // Общее количество запросов
    ERRORS_TOTAL,      // Количество ошибок (4xx, 5xx)
    LATENCY_P95_MS     // 95-й перцентиль latency в миллисекундах
}
```

### MetricData

```java
public class MetricData {
    private String service;
    private MetricType type;
    private LocalDateTime timestamp;
    private double value;
    private List<Double> samples;  // Для percentile метрик
}
```

**Фабричные методы**:
```java
// Counter метрика
MetricData.counter("user-service", MetricType.REQUESTS_TOTAL,
                  timestamp, 150);

// Percentile метрика
MetricData.percentile("user-service", MetricType.LATENCY_P95_MS,
                     timestamp, 250.5, samples);
```

## Конфигурация

### application.yml

```yaml
aquastream:
  metrics:
    # Включить/выключить метрики
    enabled: true

    # Имя сервиса (обязательно!)
    service-name: user-service

    # Redis key prefix
    key-prefix: metrics

    # TTL для метрик в Redis
    ttl: 48h

    # Интервал flush в Redis
    flush-interval: 1m

    # Перцентили для расчета
    percentiles: [0.95]

    # Максимум samples для перцентилей
    max-samples: 10000
```

### Автоконфигурация

```java
@AutoConfiguration
@EnableConfigurationProperties(MetricsProperties.class)
public class MetricsAutoConfiguration {

    @Bean
    public MetricsCollector metricsCollector(MetricsProperties properties) {
        return new MetricsCollector(properties);
    }

    @Bean
    public MetricsFilter metricsFilter(MetricsCollector collector) {
        return new MetricsFilter(collector);
    }

    @Bean
    @ConditionalOnProperty(prefix = "aquastream.metrics", name = "enabled", havingValue = "true")
    public MetricsScheduler metricsScheduler(...) {
        return new MetricsScheduler(...);
    }

    @Bean
    public RedisMetricsWriter redisMetricsWriter(...) {
        return new RedisMetricsWriter(...);
    }

    @Bean
    public MetricsController metricsController(...) {
        return new MetricsController(...);
    }
}
```

## Использование в сервисах

### Автоматический сбор (через фильтр)

Автоматически работает для всех HTTP endpoints:

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable UUID id) {
        // MetricsFilter автоматически записывает:
        // - latency этого запроса
        // - success/error status
        return userService.findById(id);
    }
}
```

### Ручной сбор метрик

Для кастомных операций (не HTTP):

```java
@Service
public class BackgroundJobService {

    @Autowired
    private MetricsCollector metricsCollector;

    public void processJob() {
        long start = System.currentTimeMillis();

        try {
            // ... работа

            long latency = System.currentTimeMillis() - start;
            metricsCollector.recordLatency(latency);

        } catch (Exception e) {
            metricsCollector.recordError();
            throw e;
        }
    }
}
```

## Алгоритм P95

### Reservoir Sampling

Для предотвращения переполнения памяти используется reservoir sampling:

```java
private void recordLatencySample(LocalDateTime minute, double latencyMs) {
    List<Double> samples = latencySamples.computeIfAbsent(minute,
            k -> new CopyOnWriteArrayList<>());

    if (samples.size() < maxSamples) {
        // Место есть - просто добавляем
        samples.add(latencyMs);
    } else {
        // Заменяем случайный sample
        int randomIndex = new Random().nextInt(samples.size());
        samples.set(randomIndex, latencyMs);
    }
}
```

### Расчет перцентиля

```java
private double calculatePercentile(List<Double> samples, double percentile) {
    List<Double> sorted = new ArrayList<>(samples);
    Collections.sort(sorted);

    int index = (int) Math.ceil(percentile * sorted.size()) - 1;
    index = Math.max(0, Math.min(index, sorted.size() - 1));

    return sorted.get(index);
}
```

Для P95: `percentile = 0.95`

## Производительность

### Thread Safety

- `AtomicLong` для counters (requests, errors)
- `CopyOnWriteArrayList` для latency samples
- `ConcurrentHashMap` для минутных окон

### Memory Management

- Максимум samples: 10000 по умолчанию
- Автоматическая очистка завершенных окон
- TTL в Redis: 48 часов

### Performance Impact

- Overhead per request: < 1ms
- Memory per minute window: ~80KB (при max samples)
- Redis writes: 3 метрики * N сервисов в минуту

## Мониторинг

### Проверка состояния

```bash
# Текущее состояние коллектора
curl http://localhost:8101/api/metrics/current

# Метрики в Redis
redis-cli KEYS "metrics:user-service:*"

# Получить метрику
redis-cli HGETALL "metrics:user-service:requests_total:2024-01-15T10:23:00"
```

### Логирование

```yaml
logging:
  level:
    org.aquastream.common.metrics: DEBUG
```

Логи:
```
[DEBUG] MetricsCollector - Recorded request: latency=150ms, error=false, minute=2024-01-15T10:23:00
[DEBUG] MetricsScheduler - Flushing metrics...
[DEBUG] MetricsCollector - Flushed 3 metrics for 1 completed minutes
[DEBUG] RedisMetricsWriter - Wrote 3 metrics to Redis
```

## Отключение метрик

### Полное отключение

```yaml
aquastream:
  metrics:
    enabled: false
```

### Отключение для конкретного endpoint

Metrics фильтр применяется ко всем запросам. Для исключений можно настроить:

```java
@Configuration
public class MetricsConfig {

    @Bean
    public FilterRegistrationBean<MetricsFilter> metricsFilterRegistration(
            MetricsFilter filter) {
        FilterRegistrationBean<MetricsFilter> registration =
            new FilterRegistrationBean<>(filter);

        // Исключить actuator endpoints
        registration.addUrlPatterns("/api/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);

        return registration;
    }
}
```

## Troubleshooting

### Метрики не пишутся в Redis

1. Проверить `enabled: true`
2. Проверить Redis подключение
3. Проверить логи `RedisMetricsWriter`
4. Проверить что `service-name` задан

### Высокое потребление памяти

Снизить `max-samples`:
```yaml
aquastream:
  metrics:
    max-samples: 5000  # Вместо 10000
```

### Метрики запаздывают

Уменьшить `flush-interval`:
```yaml
aquastream:
  metrics:
    flush-interval: 30s  # Вместо 1m
```

## См. также

- [Backend Common](README.md) - обзор модуля
- [Web Utilities](web-utilities.md) - CorrelationId для трейсинга
- [Operations: Monitoring](../../operations/monitoring.md) - общий мониторинг системы