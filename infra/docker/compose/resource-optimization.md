# Оптимизация ресурсов для небольшой нагрузки

## 📊 Анализ и распределение ресурсов

### 🎯 Цели оптимизации
- **Минимизация потребления памяти** при сохранении функциональности
- **Эффективное использование CPU** с учетом небольшой нагрузки
- **Быстрый старт приложений** с правильными JVM настройками
- **Стабильная работа** под ограниченными ресурсами

## 📋 Категории сервисов и их лимиты

### 🔸 MICRO (CPU: 0.05, RAM: 64M)
**Placeholder сервисы** - временные заглушки
- **crew-service** - заглушка экипажа
- **event-service** - заглушка событий  
- **notification-service** - заглушка уведомлений
- **frontend** - статические файлы через nginx

**Обоснование**: Минимальные ресурсы для сервисов-заглушек

### 🔹 TINY (CPU: 0.15, RAM: 192M)
**Микросервисы с JVM** - реальные Spring Boot приложения
- **user-service** - управление пользователями
- **api-gateway** - маршрутизация API

**JVM настройки:**
- Initial heap: 96M
- Max heap: 160M  
- G1GC для низкого pause time
- Container-aware настройки

### 🔺 SMALL (CPU: 0.3, RAM: 384M)
**Стандартные инфраструктурные сервисы**
- **nginx** - reverse proxy
- **zookeeper** - координация Kafka
- **kafka** - брокер сообщений
- **logstash** - обработка логов (128m heap)
- **kibana** - визуализация логов
- **prometheus** - сбор метрик
- **grafana** - дашборды

### 🔶 MEDIUM (CPU: 0.6, RAM: 768M)
**База данных** с умеренным кэшем
- **postgres** - основная БД с настройками для небольшой нагрузки

### 🔴 BIG (CPU: 0.8, RAM: 1536M)
**Поисковый движок** - самый ресурсоемкий компонент
- **elasticsearch** - поиск и аналитика

**ES настройки:**
- Heap: 512m-1024m (G1GC)
- Single node режим
- Базовая лицензия

## 🧮 Общее потребление ресурсов

### CPU (суммарно: ~3.5 ядра)
```
Elasticsearch:     0.8 ядра  (23%)
PostgreSQL:        0.6 ядра  (17%)
Инфраструктура:    1.8 ядра  (51%)
Микросервисы:      0.3 ядра  (9%)
```

### Memory (суммарно: ~4.6GB)
```
Elasticsearch:     1536M     (33%)
PostgreSQL:        768M      (17%)
Инфраструктура:    1920M     (42%)
Микросервисы:      384M      (8%)
```

## ⚡ JVM оптимизации

### Микросервисы (192M контейнер)
```bash
-Xms96m -Xmx160m              # Heap 96-160M
-XX:+UseG1GC                  # G1 для низкой паузы
-XX:MaxGCPauseMillis=100      # Цель паузы 100ms
-XX:+UseContainerSupport      # Контейнер-aware
-XX:MaxRAMPercentage=80.0     # 80% от лимита
```

### Elasticsearch (1536M контейнер)
```bash
-Xms512m -Xmx1024m           # Heap 512M-1GB
-XX:+UseG1GC                 # G1 для поиска
-XX:MaxGCPauseMillis=200     # Цель паузы 200ms
```

### Logstash (384M контейнер)
```bash
-Xms128m -Xmx128m           # Фиксированный heap 128M
```

## 🔧 Специфические оптимизации

### PostgreSQL
- **shared_buffers**: ~128MB (автоматически)
- **effective_cache_size**: ~384MB
- **work_mem**: 4MB (по умолчанию)
- **maintenance_work_mem**: 64MB

### Kafka
- **Heap**: JVM по умолчанию (~200-300M)
- **Log retention**: 7 дней (по умолчанию)
- **Batch size**: стандартный для небольшой нагрузки

### Nginx
- **worker_processes**: auto (1-2 на небольшой нагрузке)
- **worker_connections**: 1024 (достаточно)
- **Кэш статики**: 50M tmpfs

## 📈 Мониторинг ресурсов

### Prometheus метрики для отслеживания:
```yaml
# Memory usage
container_memory_usage_bytes
container_memory_limit_bytes

# CPU usage  
rate(container_cpu_usage_seconds_total[5m])
container_spec_cpu_quota

# JVM metrics (для Java приложений)
jvm_memory_used_bytes
jvm_gc_collection_seconds
```

### Алерты для превышения лимитов:
- Memory usage > 85%
- CPU usage > 80% (за 5 минут)
- GC pause time > 500ms

## 🚀 Рекомендации по масштабированию

### При росте нагрузки увеличить:
1. **API Gateway**: до SMALL (0.3 CPU, 384M RAM)
2. **User Service**: до SMALL при активных пользователях
3. **PostgreSQL**: до BIG с увеличенным shared_buffers
4. **Elasticsearch**: heap до 2GB при росте данных

### Горизонтальное масштабирование:
- Микросервисы: добавить replica за load balancer
- Elasticsearch: перейти на multi-node кластер
- PostgreSQL: master-slave репликация

## ⚠️ Предупреждения

1. **Не снижайте лимиты ниже** рекомендованных значений
2. **Мониторьте OOM kills** в логах Docker
3. **JVM heap не должен превышать** 75% от лимита контейнера
4. **G1GC может потреблять больше CPU**, но дает лучшую отзывчивость

## 📝 История изменений

### 2024-08-02 - Первоначальная оптимизация
- Создание 5 категорий ресурсных лимитов
- Оптимизация JVM настроек для Java приложений
- Перевод placeholder сервисов на MICRO лимиты
- Настройка Elasticsearch heap для небольшой нагрузки