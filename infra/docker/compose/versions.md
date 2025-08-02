# Docker Image Versions

Это документ для отслеживания актуальных версий Docker образов в проекте AquaStream.

## 📋 Текущие версии (для небольшой нагрузки)

### Инфраструктурные сервисы
| Сервис | Образ | Версия | Обоснование |
|--------|-------|--------|-------------|
| **Zookeeper** | bitnami/zookeeper | 3.8.4-debian-11-r0 | Стабильная LTS версия, Bitnami для production |
| **Kafka** | confluentinc/cp-kafka | 7.5.1-ccs | Confluent Platform, совместимость с Zookeeper |
| **PostgreSQL** | postgres | 16.2-alpine3.19 | Alpine для экономии ресурсов |
| **Elasticsearch** | docker.elastic.co/elasticsearch/elasticsearch | 8.12.2 | Последняя стабильная 8.x |
| **Logstash** | docker.elastic.co/logstash/logstash | 8.12.2 | Совместимость с Elasticsearch |
| **Kibana** | docker.elastic.co/kibana/kibana | 8.12.2 | Совместимость с ELK stack |

### Мониторинг
| Сервис | Образ | Версия | Обоснование |
|--------|-------|--------|-------------|
| **Prometheus** | prom/prometheus | v2.50.1 | Последняя стабильная версия |
| **Grafana** | grafana/grafana | 10.4.1 | LTS версия для стабильности |

### Базовые образы для приложений
| Назначение | Образ | Версия | Обоснование |
|------------|-------|--------|-------------|
| **Node.js** | node | 20.11.1-slim | LTS версия, slim для меньшего размера |
| **Nginx** | nginx | 1.25.4-alpine | Стабильная версия с Alpine |
| **Java JDK** | eclipse-temurin | 21-jdk | OpenJDK 21 LTS |
| **Java JRE** | eclipse-temurin | 21-jre | Runtime для production |
| **Alpine Linux** | alpine | 3.19.1 | Последняя стабильная версия |

## 🔄 График обновлений

### Ежемесячно
- Проверка security updates для всех образов
- Обновление patch версий (например, 8.12.2 → 8.12.3)

### Ежеквартально  
- Обновление minor версий при необходимости
- Тестирование совместимости новых версий
- Обновление LTS версий

### По мере необходимости
- Critical security patches
- Major версии (с полным тестированием)

## 📚 Ссылки на документацию

- [PostgreSQL Release Notes](https://www.postgresql.org/docs/release/)
- [Elasticsearch Release Notes](https://www.elastic.co/guide/en/elasticsearch/reference/current/release-notes.html)
- [Kafka Release Notes](https://kafka.apache.org/downloads)
- [Prometheus Release Notes](https://github.com/prometheus/prometheus/releases)
- [Grafana Release Notes](https://grafana.com/docs/grafana/latest/whatsnew/)
- [Nginx Release Notes](https://nginx.org/en/CHANGES)
- [Node.js Release Schedule](https://nodejs.org/en/about/releases/)
- [Eclipse Temurin Releases](https://adoptium.net/temurin/releases/)

## ⚠️ Рекомендации по безопасности

1. **Никогда не используйте `latest` тег в production**
2. **Регулярно проверяйте CVE для используемых версий**
3. **Тестируйте обновления в staging среде**
4. **Ведите changelog изменений версий**
5. **Используйте Alpine базовые образы для уменьшения attack surface**

## 📝 История изменений

### 2024-08-02
- Инициализация версионирования
- Переход с `latest` на фиксированные версии
- Выбор версий для небольшой нагрузки
- Приоритет стабильности над новейшими функциями