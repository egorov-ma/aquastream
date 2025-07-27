# Common Module – Logging Details

(Содержимое перенесено из other/common/logging.md)

## Logback конфигурация
Файл: `common/src/main/resources/logback-spring.xml`

- JSON форматирование через **LogstashEncoder**
- Асинхронный `TcpSocketAppender` на порт 5000
- MDC поля: `traceId`, `spanId`, `userId`
- Профили `dev`, `prod`, `test` – разные appenders (Console vs Logstash)

### Пример структурированного лога
```java
log.info("Payment initiated", kv("userId", userId), kv("amount", amount));
```

### Kibana KQL примеры
```kql
app_name:"user-service" and level:"ERROR"
```

## Elasticsearch endpoints
```bash
curl http://localhost:9200/_cluster/health
```

## Troubleshooting
- Проверьте переменные окружения `LOGSTASH_HOST`, `LOGSTASH_PORT`.
- Убедитесь, что контейнер Logstash слушает порт 5000 (TCP). 