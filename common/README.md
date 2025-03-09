# Common Module

## Логирование и мониторинг (ELK Stack)

### Обзор
В проекте используется централизованная система логирования на базе ELK Stack (Elasticsearch, Logstash, Kibana) версии 8.12.1. Эта система обеспечивает:
- Централизованный сбор логов со всех микросервисов
- Структурированное JSON-логирование
- Полнотекстовый поиск по логам
- Визуализацию и анализ логов
- Мониторинг в реальном времени

### Архитектура логирования
```
[Микросервисы] -> [Logstash] -> [Elasticsearch] -> [Kibana]
     |
     └-> [Console] (для локальной разработки)
```

### Конфигурация

#### Logback Spring
Конфигурация логирования находится в `common/src/main/resources/logback-spring.xml` и включает:
- JSON форматирование через LogstashEncoder
- Профили для разных окружений (dev, prod)
- Асинхронную отправку логов
- Настройки буферизации и переподключения

#### Тестовое окружение
Для тестов используется отдельная конфигурация `common/src/test/resources/logback-test.xml`:
- Оптимизированное JSON логирование
- Отключение избыточных логов
- Настройки для улучшения читаемости тестовых логов

### Использование

#### Базовое логирование
```java
@Slf4j
public class YourService {
    public void method() {
        log.info("Информационное сообщение");
        log.error("Ошибка", exception);
    }
}
```

#### Структурированное логирование
```java
log.info("Операция выполнена", 
    kv("userId", userId),
    kv("operation", "create"),
    kv("duration", duration));
```

#### MDC для трассировки
```java
MDC.put("requestId", UUID.randomUUID().toString());
try {
    // ваш код
} finally {
    MDC.clear();
}
```

### Kibana

#### Доступ
- URL: http://localhost:5601
- Логин: elastic (по умолчанию)
- Пароль: см. в конфигурации окружения

#### Основные операции
1. Просмотр логов: 
   - Discover -> aquastream-logs-*
   - Используйте KQL для поиска: `app_name: "user-service" and level: "ERROR"`

2. Создание дашбордов:
   - Dashboard -> Create dashboard
   - Добавьте визуализации для мониторинга ошибок, производительности и т.д.

### Elasticsearch

#### API endpoints
- Проверка здоровья: `GET http://localhost:9200/_cluster/health`
- Поиск логов: `GET /aquastream-logs-*/_search`
- Управление индексами: `GET /_cat/indices`

#### Примеры запросов
```bash
# Поиск ошибок за последний час
curl -X GET "localhost:9200/aquastream-logs-*/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "ERROR" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}'
```

### Logstash

#### Конфигурация
- Основной конфиг: `infra/monitoring/logstash/config/logstash.yml`
- Пайплайн: `infra/monitoring/logstash/pipeline/logstash.conf`

#### Мониторинг
- Статус: http://localhost:9600
- Метрики: http://localhost:9600/_node/stats

### Лучшие практики

1. Логирование
   - Используйте соответствующие уровни логирования
   - Включайте контекст в структурированном формате
   - Избегайте чувствительной информации в логах

2. Индексы
   - Настроена ротация по дням
   - Используйте ILM для управления жизненным циклом

3. Мониторинг
   - Настройте алерты на критические ошибки
   - Регулярно проверяйте использование ресурсов

### Устранение неполадок

1. Проблемы с подключением:
   ```bash
   # Проверка доступности Logstash
   nc -zv localhost 5000
   
   # Проверка Elasticsearch
   curl localhost:9200/_cluster/health
   ```

2. Проблемы с логами:
   - Проверьте конфигурацию в `logback-spring.xml`
   - Убедитесь, что переменные окружения установлены
   - Проверьте права доступа к файлам логов

### Дополнительные ресурсы
- [Официальная документация Elasticsearch](https://www.elastic.co/guide/index.html)
- [Руководство по Logstash](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Kibana User Guide](https://www.elastic.co/guide/en/kibana/current/index.html) 