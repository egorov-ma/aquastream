# Безопасность централизованного логирования

## Обзор

Система централизованного логирования AquaStream реализована с помощью ELK Stack (Elasticsearch, Logstash, Kibana) с усиленными мерами безопасности, включающими санитизацию логов, управление жизненным циклом индексов и детектирование угроз.

## Архитектура логирования

```
Микросервисы → Logstash → Elasticsearch → Kibana
     ↓              ↓           ↓
  Санитизация  Фильтрация  Хранение    Визуализация
  данных       угроз       с ILM       и анализ
```

## Компоненты безопасности

### 1. Санитизация чувствительных данных

Logstash автоматически удаляет или маскирует следующие типы данных:

- **Пароли**: `password=***СКРЫТО***`
- **Токены авторизации**: `authorization=***СКРЫТО***`
- **API ключи**: `secret=***СКРЫТО***`
- **Номера кредитных карт**: `credit_card=***СКРЫТО***`
- **Социальные номера**: `ssn=***СКРЫТО***`
- **Email адреса**: `email=***СКРЫТО***`

### 2. Детектирование угроз

Система автоматически обнаруживает и помечает:

- **SQL-инъекции**: паттерны `UNION`, `SELECT`, `DROP`, etc.
- **XSS атаки**: `<script>`, `javascript:`, `alert()`, etc.
- **HTTP ошибки**: коды ответа >= 400
- **Подозрительная активность**: повторяющиеся неудачные запросы

### 3. Категоризация логов

Логи автоматически классифицируются по тегам:

- `security_alert` - угрозы безопасности
- `auth_event` - события аутентификации
- `database_event` - операции с БД
- `high_severity` - критические ошибки
- `http_error` - HTTP ошибки

## Управление жизненным циклом индексов (ILM)

### Политика для обычных логов (`aquastream-logs-*`)

| Фаза   | Время      | Действия                           |
|--------|------------|------------------------------------|
| Hot    | 0-7 дней   | Активная запись, приоритет 100     |
| Warm   | 7-30 дней  | Снижение реплик до 0, приоритет 50 |
| Cold   | 30-90 дней | Архивное хранение, приоритет 0     |
| Delete | 90+ дней   | Удаление                           |

### Политика для логов безопасности (`aquastream-security-*`)

| Фаза   | Время       | Действия                            |
|--------|-------------|-------------------------------------|
| Hot    | 0-30 дней   | Активная запись, приоритет 200      |
| Warm   | 30-90 дней  | 1 реплика для надежности            |
| Cold   | 90-365 дней | Долгосрочное хранение               |
| Delete | 365+ дней   | Удаление                            |

## Конфигурация

### Logstash конфигурация

**Файл**: `/infra/monitoring/logstash/pipeline/logstash.conf`

- Входные порты: TCP 5000, Beats 5044
- Фильтры санитизации и детектирования угроз
- Раздельные индексы для обычных логов и алертов безопасности

**Файл**: `/infra/monitoring/logstash/config/logstash.yml`

- SSL соединение с Elasticsearch
- Оптимизированные настройки для небольшой нагрузки
- Мониторинг производительности

### Elasticsearch индексы

- `aquastream-logs-YYYY.MM.dd` - основные логи приложений
- `aquastream-security-YYYY.MM.dd` - алерты безопасности

### Docker Compose конфигурация

```yaml
logstash:
  environment:
    LS_JAVA_OPTS: -Xms128m -Xmx128m
    ELASTICSEARCH_HOSTS: https://elasticsearch:9200
    ELASTICSEARCH_SSL_CERTIFICATEAUTHORITIES: /usr/share/logstash/config/certs/ca/ca.crt
```

## Настройка и развертывание

### 1. Автоматическая настройка

Политики ILM применяются автоматически при запуске через скрипт:

```bash
./infra/scripts/setup-log-retention.sh
```

### 2. Ручная настройка

```bash
# Проверка статуса политик
curl -k -u elastic:password https://localhost:9200/_ilm/policy

# Просмотр индексов
curl -k -u elastic:password https://localhost:9200/_cat/indices?v

# Просмотр алиасов
curl -k -u elastic:password https://localhost:9200/_cat/aliases?v
```

## Мониторинг и алерты

### Метрики для отслеживания

1. **Объем логов**:
   - Размер индексов
   - Скорость поступления логов
   - Количество алертов безопасности

2. **Производительность**:
   - Задержка индексации
   - Время выполнения запросов
   - Использование ресурсов Logstash/Elasticsearch

3. **Безопасность**:
   - Количество заблокированных IP
   - Тренды атак по типам
   - Geographic distribution угроз

### Kibana дашборды

Доступ: `https://localhost/monitoring/kibana/`

Рекомендуемые визуализации:

- **Security Overview**: количество алертов по типам
- **Application Logs**: уровни логирования по сервисам  
- **Error Analysis**: топ ошибок и их частота
- **Performance Metrics**: задержки и пропускная способность

## Алертинг

### Рекомендуемые алерты

1. **Критические события**:
   - Более 5 алертов безопасности за 5 минут
   - SQL-инъекции или XSS попытки
   - Множественные неудачные аутентификации

2. **Производительность**:
   - Задержка индексации > 30 секунд
   - Размер индекса > 1GB без rollover
   - Использование диска > 80%

3. **Доступность**:
   - Logstash недоступен > 2 минут
   - Elasticsearch cluster health != green
   - Потеря логов от микросервисов

## Соответствие требованиям

### Защита персональных данных

- ✅ Автоматическая маскировка PII данных
- ✅ Encrypted transmission (TLS)
- ✅ Access control (Elasticsearch Security)
- ✅ Audit trail логов доступа

### Стандарты логирования

- ✅ Structured JSON logging
- ✅ Correlation IDs для трейсинга
- ✅ Стандартизированные поля (timestamp, severity, service)
- ✅ Geolocation enrichment

### Retention policies

- ✅ Automated retention управление
- ✅ Разные политики для разных типов данных
- ✅ Compliance с требованиями хранения

## Устранение неполадок

### Проверка работы Logstash

```bash
# Статус Logstash
curl http://localhost:9600/_node/stats

# Мониторинг pipeline
curl http://localhost:9600/_node/stats/pipeline

# Логи Logstash
docker logs aquastream-logstash-1 -f
```

### Проверка индексов Elasticsearch

```bash
# Статус индексов
curl -k -u elastic:password https://localhost:9200/_cat/indices?v

# Статус ILM политик
curl -k -u elastic:password https://localhost:9200/_ilm/explain/aquastream-logs-*

# Поиск в логах
curl -k -u elastic:password -X GET "https://localhost:9200/aquastream-logs-*/_search" \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}, "size": 10}'
```

### Типичные проблемы

1. **Logstash не подключается к Elasticsearch**:
   - Проверить SSL сертификаты
   - Проверить пароли в переменных окружения

2. **Логи не поступают**:
   - Проверить сетевую связность
   - Проверить конфигурацию приложений

3. **Высокое использование диска**:
   - Проверить работу ILM политик
   - Настроить более агрессивное удаление

## Масштабирование

### Увеличение нагрузки

1. **Logstash**:
   ```yaml
   deploy:
     replicas: 2
     resources:
       limits:
         memory: 512M
   ```

2. **Elasticsearch**:
   - Увеличить heap size до 2GB
   - Добавить дополнительные узлы
   - Увеличить количество shards

3. **Политики хранения**:
   - Сократить время в hot phase
   - Увеличить размер rollover
   - Добавить warm узлы для оптимизации