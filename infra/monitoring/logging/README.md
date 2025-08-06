# AquaStream Logging Configuration

## Обзор

AquaStream использует структурированное логирование с поддержкой JSON формата для production и читаемого формата для development.

## Ключевые возможности

- **Structured Logging**: JSON формат в production для удобного парсинга
- **Correlation ID**: Трассировка запросов между сервисами
- **Environment-specific**: Разная конфигурация для dev/test/production
- **Performance**: Асинхронные appenders для высокой производительности
- **Centralized**: Общая конфигурация в common модуле

## Конфигурация

### Development Environment
```yaml
aquastream:
  logging:
    structured:
      enabled: false  # Pattern logging для читаемости
    level:
      root: DEBUG

logging:
  level:
    org.aquastream: DEBUG
    root: DEBUG
```

**Output Format:**
```
2024-01-15 10:30:45.123 [http-nio-8082-exec-1] INFO [abc-123-def] [o.a.e.grpc.EventServiceImpl] - Starting gRPC method execution
```

### Production Environment (Docker)
```yaml
aquastream:
  logging:
    structured:
      enabled: true   # JSON logging для log aggregation
    level:
      root: INFO

logging:
  level:
    org.aquastream: INFO
    root: INFO
```

**Output Format:**
```json
{
  "@timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "Starting gRPC method execution",
  "logger": "org.aquastream.event.grpc.EventServiceImpl",
  "thread": "http-nio-8082-exec-1",
  "correlationId": "abc-123-def",
  "service": "event-service",
  "method": "createEvent",
  "type": "grpc"
}
```

## Correlation ID

### HTTP Requests
- Header: `X-Correlation-ID`
- Auto-generated если отсутствует
- Передается в response headers

### gRPC Requests  
- Metadata: `x-correlation-id`
- Автоматическая генерация UUID
- Context propagation между сервисами

### Использование в коде
```java
// Получение correlation ID
String correlationId = CorrelationIdInterceptor.getCurrentCorrelationId();

// Логирование с correlation ID (автоматически из MDC)
logger.info("Processing event", "eventId", eventId);
```

## Структурированное логирование

### Рекомендуемый формат
```java
// ✅ Хорошо: структурированные поля
logger.info("Event created successfully",
    "eventId", eventId,
    "eventName", eventName,
    "userId", userId,
    "executionTimeMs", executionTime);

// ❌ Плохо: строковая интерполяция
logger.info("Event " + eventName + " created for user " + userId);
```

### Ключевые поля
- `correlationId`: ID для трассировки запроса
- `service`: Название сервиса
- `method`: Название метода
- `type`: Тип операции (grpc, rest, db)
- `executionTimeMs`: Время выполнения
- `status`: Статус операции (success, error)
- `errorType`: Тип ошибки при неудаче

## Уровни логирования

### Production
- **ERROR**: Критические ошибки, требующие внимания
- **WARN**: Потенциальные проблемы, не блокирующие работу
- **INFO**: Важные бизнес-события (создание событий, пользователей)

### Development  
- **DEBUG**: Детальная информация для отладки
- **TRACE**: Максимальная детализация (не рекомендуется в production)

### По компонентам

| Компонент | Development | Production | Описание |
|-----------|-------------|------------|----------|
| `org.aquastream.*` | DEBUG | INFO | Бизнес-логика приложения |
| `org.springframework` | INFO | WARN | Spring Framework |
| `org.hibernate.SQL` | DEBUG | OFF | SQL запросы (только dev) |
| `net.devh.boot.grpc` | DEBUG | INFO | gRPC framework |
| `org.springframework.security` | INFO | WARN | Security events |
| Health checks | WARN | WARN | Actuator health endpoints |

## Performance

### Async Appenders
- **Queue Size**: 256 messages
- **Discarding Threshold**: 0 (не отбрасывать сообщения)
- **Include Caller Data**: false (для производительности)

### Log Rotation (Docker)
```yaml
logging:
  driver: \"json-file\"
  options:
    max-size: \"10m\"
    max-file: \"3\"
```

## Мониторинг и Алертинг

### ELK Stack Integration
```json
{
  \"service\": \"event-service\",
  \"level\": \"ERROR\",
  \"correlationId\": \"abc-123\",
  \"errorType\": \"ValidationException\",
  \"@timestamp\": \"2024-01-15T10:30:45.123Z\"
}
```

### Алерты по ошибкам
- **ERROR level**: Немедленные алерты
- **High error rate**: >5% за 5 минут
- **Service down**: Отсутствие логов >2 минуты

### Dashboards
- Error rate по сервисам
- Response time trends
- Correlation ID трассировка
- Top error types

## Troubleshooting

### Проверка конфигурации
```bash
# Проверить уровень логирования
curl http://localhost:8082/actuator/loggers

# Изменить уровень на лету (только dev)
curl -X POST http://localhost:8082/actuator/loggers/org.aquastream.event \\
  -H \"Content-Type: application/json\" \\
  -d '{\"configuredLevel\":\"DEBUG\"}'
```

### Correlation ID не работает
1. Проверить filter order
2. Убедиться что CorrelationIdFilter active
3. Проверить MDC в thread context

### JSON логи не читаемы
```bash
# Использовать jq для форматирования
docker logs event-service 2>&1 | jq '.'

# Или включить pretty-printing (только dev)
echo '{\"spring.profiles.active\": \"dev\"}' > application.properties
```

### Производительность
1. Убрать DEBUG логи в production
2. Использовать async appenders
3. Ограничить SQL logging
4. Настроить log rotation

## Best Practices

### 1. Структурированные поля
```java
// Используйте key-value пары
logger.info("User login attempt", 
    \"userId\", userId, 
    \"ipAddress\", request.getRemoteAddr(),
    \"userAgent\", request.getHeader(\"User-Agent\"));
```

### 2. Не логировать sensitive данные
```java
// ❌ Опасно
logger.info(\"User password: {}\", password);

// ✅ Безопасно
logger.info(\"User authentication\", \"userId\", userId);
```

### 3. Контекстная информация
```java
// Добавляйте контекст в MDC
MDC.put(\"transactionId\", transactionId);
try {
    // business logic
} finally {
    MDC.remove(\"transactionId\");
}
```

### 4. Performance considerations
```java
// ❌ Дорогие операции в параметрах
logger.debug(\"Processing: {}\", expensiveMethod());

// ✅ Проверяйте уровень логирования
if (logger.isDebugEnabled()) {
    logger.debug(\"Processing: {}\", expensiveMethod());
}
```

## Configuration Files

- `logback-spring.xml`: Основная конфигурация Logback
- `application.yml`: Development settings
- `application-docker.yml`: Production settings  
- `CorrelationIdFilter.java`: HTTP correlation ID
- `CorrelationIdInterceptor.java`: gRPC correlation ID
- `EventServiceLoggingAspect.java`: AOP для логирования методов"