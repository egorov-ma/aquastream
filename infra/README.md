# AquaStream Infrastructure

Contains Docker configurations, CI/CD pipelines and deployment configs. 

# Инфраструктура AquaStream

## Canary Deployment

Система Canary Deployment позволяет тестировать новые версии сервисов в производственной среде на ограниченном потоке трафика, сводя к минимуму риски глобальных сбоев.

### Общая архитектура

![Архитектура Canary Deployment](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*8O0xt5BM9RwOe7zYzjZ6CA.png)

Архитектура Canary Deployment в AquaStream включает:

1. **Nginx-прокси** - распределяет трафик между стабильной и канареечной версиями
2. **Система мониторинга** - Prometheus + Grafana для отслеживания метрик
3. **Скрипты управления** - автоматизация запуска и анализа канареечных версий
4. **Система оповещений** - автоматические уведомления о проблемах
5. **ELK Stack** - централизованное логирование и анализ логов канареечной версии

### Подготовка к использованию

#### Требования

- Docker и Docker Compose
- Базовое понимание работы Nginx и мониторинга
- Скрипты `canary.sh`, `ab-test.sh` и `canary-alerts.sh` в директории `infra/docker/scripts`

#### Настройка

1. Убедитесь, что Docker Compose файлы корректно настроены:
   - `docker-compose.yml` - основная конфигурация
   - `docker-compose.canary.yml` - конфигурация для канареечных версий

2. Проверьте настройки Nginx:
   - Проверьте файл `infra/docker/config/canary/nginx.conf`
   - Убедитесь, что корректно настроено распределение трафика

3. Проверьте настройки мониторинга:
   - Доступен Grafana-дашборд для канареечных версий
   - Prometheus настроен для сбора метрик с обеих версий сервисов

4. Настройте систему оповещений:
   - Запустите интерактивную настройку оповещений: `./infra/docker/scripts/canary-alerts.sh --configure`

5. Настройте компоненты ELK (Elasticsearch, Logstash, Kibana):
   - Проверьте настройки в `infra/monitoring/logstash/`
   - Убедитесь, что сервисы могут отправлять логи в Logstash

### Использование Canary Deployment

#### Сборка канареечной версии

```bash
# Собрать канареечную версию с указанным номером
./build.sh --canary 1.2.3
```

#### Запуск канареечного окружения

```bash
# Запустить канареечное окружение с версией 1.2.3 и 10% трафика
./infra/docker/scripts/canary.sh -s -v 1.2.3 -t 10

# Запустить канареечное окружение с версией 1.2.3, включая ELK Stack
./infra/docker/scripts/canary.sh -s -v 1.2.3 -t 10 -e
```

#### Изменение процента трафика

```bash
# Изменить процент трафика на канареечную версию до 30%
./infra/docker/scripts/canary.sh -t 30
```

#### Мониторинг канареечной версии

```bash
# Открыть мониторинг канареечной версии
./infra/docker/scripts/canary.sh -m
```

#### Просмотр логов канареечных сервисов

```bash
# Показать логи канареечных сервисов
./infra/docker/scripts/canary.sh -l

# Показать логи конкретного канареечного сервиса
./infra/docker/scripts/canary.sh -l api-gateway
```

#### Сравнение метрик стабильной и канареечной версий

```bash
# Сравнить метрики стабильной и канареечной версий
./infra/docker/scripts/canary.sh -c
```

#### Настройка оповещений

Система оповещений позволяет автоматически получать уведомления о проблемах с канареечной версией:

```bash
# Интерактивная настройка оповещений
./infra/docker/scripts/canary-alerts.sh --configure

# Настроить оповещения в Slack
./infra/docker/scripts/canary-alerts.sh --slack https://hooks.slack.com/services/XXX/YYY/ZZZ

# Настроить оповещения по Email
./infra/docker/scripts/canary-alerts.sh --email team@example.com

# Отправить тестовое оповещение
./infra/docker/scripts/canary-alerts.sh --test

# Запустить автоматическую проверку метрик с оповещениями (обычно запускается как демон)
./infra/docker/scripts/canary-alerts.sh
```

Настройка порогов оповещений:

```bash
# Настройка порога отклонения метрик (30%)
./infra/docker/scripts/canary-alerts.sh --metrics 30

# Настройка порога количества ошибок (10 ошибок)
./infra/docker/scripts/canary-alerts.sh --errors-threshold 10

# Настройка порога задержки (1000 мс)
./infra/docker/scripts/canary-alerts.sh --latency-threshold 1000

# Настройка интервала проверки (10 минут)
./infra/docker/scripts/canary-alerts.sh --interval 10
```

#### Управление ELK Stack

Система ELK Stack используется для централизованного сбора и анализа логов:

```bash
# Проверить статус компонентов ELK Stack
./infra/docker/scripts/elk-manager.sh --status

# Перезапустить Elasticsearch
./infra/docker/scripts/elk-manager.sh --restart elasticsearch

# Показать логи Logstash
./infra/docker/scripts/elk-manager.sh --logs logstash

# Показать список индексов Elasticsearch
./infra/docker/scripts/elk-manager.sh --indices

# Очистить индексы старше 15 дней
./infra/docker/scripts/elk-manager.sh --clean 15

# Экспортировать данные индекса в JSON
./infra/docker/scripts/elk-manager.sh --export logstash-2023.03.01

# Открыть дашборд Kibana
./infra/docker/scripts/elk-manager.sh --dashboard

# Проверить подключения микросервисов к Logstash
./infra/docker/scripts/elk-manager.sh --test-connection
```

#### A/B тестирование

A/B тестирование используется для сравнения производительности и стабильности стабильной и канареечной версий.

```bash
# Запустить A/B тест с 1000 запросами и 10 одновременными соединениями
./infra/docker/scripts/ab-test.sh -n 1000 -c 10

# Запустить тест для конкретного эндпоинта и создать HTML-отчет
./infra/docker/scripts/ab-test.sh -e "/api/users" --html
```

#### Продвижение канареечной версии в стабильную

Если канареечная версия показывает стабильные и удовлетворительные результаты, можно продвинуть её в стабильную версию:

```bash
# Продвинуть канареечную версию в стабильную
./infra/docker/scripts/canary.sh -x
```

#### Остановка канареечного окружения

```bash
# Остановить канареечное окружение
./infra/docker/scripts/canary.sh -p
```

### Рекомендуемый процесс Canary Deployment

1. **Подготовка:** Соберите канареечную версию с новым функционалом
2. **Запуск:** Запустите канареечное окружение с низким процентом трафика (5-10%)
3. **Настройка оповещений:** Настройте систему оповещений для автоматического мониторинга
4. **Мониторинг:** Наблюдайте за метриками канареечной версии минимум 30-60 минут
5. **Тестирование:** Проведите A/B тестирование для сравнения с текущей стабильной версией
6. **Постепенное увеличение:** Если всё стабильно, постепенно увеличивайте процент трафика (30% -> 50% -> 75%)
7. **Продвижение:** Если канареечная версия работает стабильно с полной нагрузкой, продвиньте её в стабильную

### Откат в случае проблем

Если в канареечной версии обнаружены проблемы:

1. Немедленно сократите трафик до минимума:
   ```bash
   ./infra/docker/scripts/canary.sh -t 0
   ```

2. Остановите канареечное окружение:
   ```bash
   ./infra/docker/scripts/canary.sh -p
   ```

3. Проанализируйте логи и метрики для выявления причин проблем.

### Метрики для оценки канареечной версии

При оценке канареечной версии обращайте внимание на следующие метрики:

1. **Задержка (Latency):** Время ответа должно быть сопоставимо со стабильной версией
2. **Ошибки:** Процент ошибок не должен превышать стабильную версию
3. **Использование ресурсов:** Потребление CPU, RAM не должно быть существенно выше
4. **Бизнес-метрики:** Конверсии, активность пользователей не должны снижаться
5. **Логи и ошибки в ELK:** Анализ логов для выявления аномалий и скрытых проблем

### Система оповещений

Система оповещений для канареечных деплойментов позволяет своевременно выявлять проблемы и реагировать на них. Она мониторит следующие аспекты:

1. **Отклонения в производительности:** Сравнивает метрики канареечной и стабильной версий
2. **Критические ошибки:** Отслеживает аномальное количество ошибок
3. **Задержки:** Следит за увеличением времени отклика

Оповещения могут быть настроены для отправки через:
- **Slack:** Уведомления в каналы команды разработки/DevOps
- **Email:** Отправка писем ответственным лицам

Конфигурация системы оповещений сохраняется в JSON-формате в файле `infra/docker/config/canary/alerts/alerts_config.json`.

### ELK Stack для мониторинга логов

Система централизованного логирования ELK Stack (Elasticsearch, Logstash, Kibana) используется для сбора, хранения и анализа логов канареечной версии. Это позволяет:

1. **Централизованный доступ к логам:** Все логи собираются в одном месте
2. **Полнотекстовый поиск:** Быстрый поиск по логам с использованием Elasticsearch
3. **Визуализация:** Создание дашбордов и графиков по данным из логов
4. **Корреляция событий:** Связывание логов из разных сервисов для анализа проблем
5. **Сравнение версий:** Анализ различий в поведении стабильной и канареечной версий

#### Архитектура ELK Stack

```
[Микросервисы] --> [Logstash] --> [Elasticsearch] <-- [Kibana]
```

Logstash принимает логи от сервисов, обрабатывает их, и сохраняет в Elasticsearch. Kibana используется для визуализации и анализа данных из Elasticsearch.

#### Расположение конфигурационных файлов

- **Logstash:** 
  - Конфигурация: `infra/monitoring/logstash/config/logstash.yml`
  - Пайплайны: `infra/monitoring/logstash/pipeline/logstash.conf`
- **Elasticsearch:** 
  - Данные: `/usr/share/elasticsearch/data` (внутри контейнера)
- **Kibana:**
  - Дашборды: экспортируются через интерфейс Kibana

#### Настройка логирования в сервисах

Для отправки логов в Logstash сервисы используют библиотеку `logstash-logback-encoder`. 
Пример настройки в `logback-spring.xml`:

```xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>${LOGSTASH_HOST:-localhost}:${LOGSTASH_PORT:-5000}</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeMdc>true</includeMdc>
        <includeCallerData>true</includeCallerData>
    </encoder>
</appender>
```

#### Использование в канареечном деплойменте

При запуске канареечной версии с опцией `-e` (или `--elk`), все компоненты ELK Stack будут добавлены в канареечное окружение:

```bash
./infra/docker/scripts/canary.sh -s -v 1.2.3 -t 10 -e
```

Это позволяет использовать отдельный экземпляр ELK Stack для канареечной версии, что изолирует логи и упрощает анализ.

### Советы по эффективному использованию

1. **Постепенные изменения:** Вносите небольшие изменения для легкого отслеживания влияния на систему
2. **Автоматизация:** Используйте CI/CD для автоматического деплоя канареечных версий
3. **Тесты:** Всегда проводите A/B тестирование перед увеличением трафика
4. **Документирование:** Ведите журнал всех канареечных развертываний и их результатов
5. **Оповещения:** Настройте систему оповещений для раннего выявления проблем
6. **Анализ логов:** Используйте ELK Stack для глубокого анализа поведения канареечной версии

### Устранение неполадок

#### Nginx не распределяет трафик корректно

Проверьте конфигурацию Nginx и перезагрузите:
```bash
docker exec -it aquastream-nginx nginx -t
docker exec -it aquastream-nginx nginx -s reload
```

#### Канареечная версия не запускается

Проверьте логи:
```bash
./infra/docker/scripts/canary.sh -l
```

#### Проблемы с мониторингом

Проверьте, что Prometheus и Grafana работают корректно:
```bash
docker ps | grep prometheus
docker ps | grep grafana
```

#### Оповещения не работают

Проверьте настройки и отправьте тестовое оповещение:
```bash
# Проверить конфигурацию
cat infra/docker/config/canary/alerts/alerts_config.json

# Отправить тестовое оповещение
./infra/docker/scripts/canary-alerts.sh --test
```

#### Проблемы с ELK Stack

Используйте скрипт управления ELK Stack для диагностики и исправления проблем:

```bash
# Проверить статус компонентов ELK
./infra/docker/scripts/elk-manager.sh --status

# Перезапустить проблемный компонент
./infra/docker/scripts/elk-manager.sh --restart logstash

# Проверить логи компонента
./infra/docker/scripts/elk-manager.sh --logs elasticsearch

# Проверить подключения микросервисов к Logstash
./infra/docker/scripts/elk-manager.sh --test-connection
```

Дополнительные проверки:

1. **Elasticsearch недоступен**
   - Проверьте настройки памяти: `vm.max_map_count` должен быть увеличен
   - На Linux: `sysctl -w vm.max_map_count=262144`
   - На macOS: в Docker Desktop настройте ресурсы

2. **Logstash не получает логи**
   - Проверьте, что порт 5000 открыт
   - Убедитесь, что микросервисы правильно настроены для отправки логов
   - Проверьте переменные окружения `LOGSTASH_HOST` и `LOGSTASH_PORT`

3. **Kibana не может подключиться к Elasticsearch**
   - Проверьте URL подключения в настройках Kibana
   - Убедитесь, что Elasticsearch запущен и доступен для Kibana

### Дополнительная информация

Для более детальной информации обратитесь к следующим ресурсам:
- [Документация по Docker Compose](https://docs.docker.com/compose/)
- [Документация по Nginx](https://nginx.org/en/docs/)
- [Документация по Prometheus](https://prometheus.io/docs/introduction/overview/)
- [Документация по Grafana](https://grafana.com/docs/)
- [Документация по Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Документация по Logstash](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Документация по Kibana](https://www.elastic.co/guide/en/kibana/current/index.html)

## Управление логами

AquaStream включает систему автоматического управления логами, которая решает следующие задачи:

### Очистка и ротация логов

Для автоматического управления логами используется скрипт `cleanup-logs.sh`, который:

- Удаляет устаревшие файлы логов
- Выполняет ротацию больших файлов
- Сжимает архивные логи
- Ограничивает количество хранимых архивных файлов

#### Использование скрипта очистки логов

```bash
# Базовое использование (удаляет логи старше 30 дней)
./infra/docker/scripts/cleanup-logs.sh

# Удалить логи старше 7 дней
./infra/docker/scripts/cleanup-logs.sh -d 7

# Ротировать файлы больше 50MB и сжать их
./infra/docker/scripts/cleanup-logs.sh -s 50 -c

# Очистить все логи (полное удаление)
./infra/docker/scripts/cleanup-logs.sh -a

# Тестовый режим без реального удаления
./infra/docker/scripts/cleanup-logs.sh --dry-run -v
```

#### Автоматизация очистки логов

Для настройки автоматической очистки логов используйте cron:

1. Отредактируйте файл crontab:
   ```bash
   crontab -e
   ```

2. Добавьте задания из примера в файле `infra/docker/scripts/cron/log-cleanup.cron`:
   ```
   # Ежедневная очистка старых логов
   30 3 * * * /path/to/aquastream/infra/docker/scripts/cleanup-logs.sh -d 30 -c
   ```

3. Сохраните и закройте редактор

#### Структура хранения логов

- `infra/docker/logs/` - основные логи скриптов
- `infra/docker/logs/archived/` - архивные ротированные логи
- `infra/docker/compose/logs/` - логи контейнеров

Все эти директории включены в `.gitignore` и не отслеживаются в репозитории. 