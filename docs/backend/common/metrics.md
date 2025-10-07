# Metrics System

## Обзор

Встроенная система метрик для сбора и агрегации HTTP метрик с записью в Redis. Предоставляет throughput, latency (P95) и error rate в минутных окнах.

**Архитектура**:
```
HTTP Request → MetricsFilter → MetricsCollector → (in-memory)
                                                        ↓
                                      MetricsScheduler (каждую минуту)
                                                        ↓
                                             RedisMetricsWriter → Redis
```

## Компоненты

| Компонент | Назначение | Ключевые функции |
|-----------|------------|------------------|
| **MetricsCollector** | Thread-safe коллектор | `recordRequest(latency, isError)`, `recordLatency()`, `recordError()` |
| **MetricsFilter** | Servlet фильтр | Автоматический сбор HTTP метрик (latency, status code) |
| **MetricsScheduler** | Периодический flush | Flush в Redis каждую минуту (конфигурируется) |
| **RedisMetricsWriter** | Запись в Redis | Ключи: `metrics:{service}:{type}:{timestamp}`, TTL: 48h |
| **MetricsController** | REST API | `GET /api/metrics/current` для текущего состояния |

## Типы метрик

```java
public enum MetricType {
    REQUESTS_TOTAL,    // Общее количество запросов
    ERRORS_TOTAL,      // Количество ошибок (4xx, 5xx)
    LATENCY_P95_MS     // 95-й перцентиль latency в ms
}
```

**Формат в Redis**:
```
metrics:user-service:requests_total:2024-01-15T10:23:00
metrics:event-service:errors_total:2024-01-15T10:23:00
metrics:payment-service:latency_p95_ms:2024-01-15T10:23:00
```

## Конфигурация

### application.yml

```yaml
aquastream:
  metrics:
    enabled: true                  # Включить/выключить
    service-name: user-service     # Обязательно!
    key-prefix: metrics            # Redis prefix
    ttl: 48h                       # TTL в Redis
    flush-interval: 1m             # Интервал flush
    percentiles: [0.95]            # Перцентили
    max-samples: 10000             # Максимум samples для P95
```

### Параметры

| Параметр | Default | Описание |
|----------|---------|----------|
| `enabled` | true | Включить систему метрик |
| `service-name` | - | **Обязательно**: имя сервиса |
| `ttl` | 48h | TTL метрик в Redis |
| `flush-interval` | 1m | Частота flush в Redis |
| `max-samples` | 10000 | Reservoir sampling limit |

## Использование

### Автоматический сбор (HTTP)

Автоматически работает для всех HTTP endpoints:

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable UUID id) {
        // MetricsFilter автоматически записывает latency и status
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
            metricsCollector.recordLatency(System.currentTimeMillis() - start);
        } catch (Exception e) {
            metricsCollector.recordError();
            throw e;
        }
    }
}
```

## Алгоритм P95

### Reservoir Sampling

Для предотвращения переполнения памяти используется reservoir sampling с максимум 10000 samples (конфигурируется).

**Процесс**:
1. Samples < maxSamples → добавляем новый
2. Samples = maxSamples → заменяем случайный sample

### Расчет перцентиля

```java
// 1. Сортировка samples
// 2. index = ceil(0.95 * samples.size()) - 1
// 3. return sorted.get(index)
```

## Производительность

### Thread Safety

| Структура | Тип | Назначение |
|-----------|-----|------------|
| Counters | `AtomicLong` | requests_total, errors_total |
| Latency samples | `CopyOnWriteArrayList` | Thread-safe для P95 |
| Minute windows | `ConcurrentHashMap` | Параллельный доступ |

### Performance Impact

- **Overhead per request**: < 1ms
- **Memory per minute window**: ~80KB (при max samples)
- **Redis writes**: 3 метрики * N сервисов в минуту

## Мониторинг

### Проверка состояния

```bash
# Текущее состояние коллектора
curl http://localhost:8101/api/metrics/current

# Response:
{
  "currentMinute": "2024-01-15T10:25:00",
  "requestCount": 42,
  "errorCount": 3,
  "latencySampleCount": 42,
  "totalMinutesTracked": 2
}

# Метрики в Redis
redis-cli KEYS "metrics:user-service:*"
redis-cli HGETALL "metrics:user-service:requests_total:2024-01-15T10:23:00"
```

### Логирование

```yaml
logging:
  level:
    org.aquastream.common.metrics: DEBUG
```

## Отключение метрик

### Полное отключение

```yaml
aquastream:
  metrics:
    enabled: false
```

### Отключение для конкретных endpoints

```java
@Bean
public FilterRegistrationBean<MetricsFilter> metricsFilterRegistration(MetricsFilter filter) {
    FilterRegistrationBean<MetricsFilter> registration = new FilterRegistrationBean<>(filter);
    registration.addUrlPatterns("/api/*");  // Только /api/*, исключить /actuator/*
    return registration;
}
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **Метрики не пишутся в Redis** | 1. Проверить `enabled: true`<br>2. Redis подключен<br>3. `service-name` задан<br>4. Логи `RedisMetricsWriter` |
| **Высокое потребление памяти** | Снизить `max-samples: 5000` |
| **Метрики запаздывают** | Уменьшить `flush-interval: 30s` |

---

См. [Backend Common](README.md), [Web Utilities](web-utilities.md), [Operations: Monitoring](../../operations/monitoring.md).