## 🏗️ Архитектура

### Паттерн архитектуры
- **Микросервисная архитектура** с API Gateway
- **Event-Driven Architecture** через Apache Kafka
- **Доменно-ориентированный дизайн (DDD)**
- **Сегментированная сеть** с изоляцией сервисов

### Сетевая архитектура
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  public-network │    │   api-network    │    │ infra-network   │
│   172.20.0.0/24 │    │  172.21.0.0/24   │    │ 172.22.0.0/24   │
│                 │    │                  │    │                 │
│ • Nginx         │    │ • API Gateway    │    │ • PostgreSQL    │
│ • Frontend      │    │ • Микросервисы   │    │ • Kafka         │
└─────────────────┘    │                  │    │ • ZooKeeper     │
                       └──────────────────┘    └─────────────────┘
                               │
                       ┌──────────────────┐
                       │monitoring-network│
                       │ 172.23.0.0/24    │
                       │                  │
                       │ • Prometheus     │
                       │ • Grafana        │
                       │ • Elasticsearch  │
                       │ • Kibana         │
                       └──────────────────┘
```

---

## 🔧 Backend - Java Ecosystem

### Язык программирования
- **Java 21 LTS** (Eclipse Temurin)
  - JDK: `21-jdk` (для сборки)
  - JRE: `21-jre` (для runtime в контейнерах)

### Основные фреймворки
- **Spring Boot**: `3.2.3`
  - Spring Boot Starter Web
  - Spring Boot Starter Security  
  - Spring Boot Starter Data JPA
  - Spring Boot Starter Actuator
  - Spring Boot Starter Validation
- **Spring Cloud**: `2023.0.1`
  - Spring Cloud Gateway
  - Spring Cloud Netflix Eureka
- **Spring Kafka**: `3.0.14`

### Библиотеки разработки
- **Lombok**: `1.18.30` - уменьшение boilerplate кода
- **Jakarta Validation**: `3.0.2` - валидация данных
- **Hibernate Validator**: `8.0.1.Final`
- **JSON Web Token**: `0.12.5` - JWT токены
- **Swagger/OpenAPI**: `2.2.16` - документирование API

### Тестирование
- **JUnit Jupiter**: `5.10.2`
- **Mockito**: `5.10.0`  
- **Spring Security Test**: `6.2.2`
- **H2 Database**: `2.2.224` (для тестов)

### Система сборки
- **Gradle**: `8.x`
  - Plugin: Spring Boot `3.2.3`
  - Plugin: Dependency Management `1.1.4`
  - Plugin: OpenAPI Generator `7.2.0`
  - Plugin: Google Protobuf `0.9.4`
  - Plugin: OWASP Dependency Check `10.0.4`

---

## 🌐 Frontend - React Ecosystem

### Язык программирования
- **TypeScript**: `5.2.2`
- **JavaScript ES2022**

### Основные фреймворки
- **React**: `18.2.0`
  - React DOM `18.2.0`
  - React Router DOM `6.x`
- **Vite**: `6.2.4` - инструмент сборки
- **Node.js**: `20.11.1-slim` (LTS)

### UI библиотеки
- **Material-UI (MUI)**: `5.x`
- **Emotion**: CSS-in-JS решение
- **React Hook Form**: управление формами
- **React Query/TanStack Query**: управление состоянием сервера

### Тестирование
- **Vitest**: тестовый runner совместимый с Vite
- **Testing Library**: `@testing-library/react`
- **Jest DOM**: дополнительные матчеры

### Инструменты разработки
- **ESLint**: `9.0.0` - линтинг кода
- **Storybook**: `8.6.11` - документирование компонентов
- **Sass**: препроцессор CSS

---

## 🗄️ Базы данных и хранилища

### Основная база данных
- **PostgreSQL**: `16.2-alpine3.19`
  - Драйвер: `org.postgresql:postgresql:42.7.2`
  - Миграции: **Liquibase** `4.25.1`

### Поисковая система
- **Elasticsearch**: `8.12.2`
  - Используется для:
    - Централизованное логирование
    - Поиск по данным приложения
    - Аналитика и мониторинг

---

## 📨 Обработка сообщений

### Message Broker
- **Apache Kafka**: `7.5.1` (Confluent Platform)
  - **ZooKeeper**: `3.9` (Bitnami)
  - Порты:
    - Internal: `9092`
    - External: `19092`

### Паттерны обмена сообщениями
- **Event Sourcing**: для критически важных операций
- **CQRS**: разделение команд и запросов
- **Saga Pattern**: для распределенных транзакций

---

## 🔍 Мониторинг и наблюдаемость

### Метрики и мониторинг
- **Prometheus**: `v2.50.1`
  - Сбор метрик приложений
  - Настройка алертов
- **Grafana**: `10.4.1` (LTS)
  - Визуализация метрик
  - Дашборды мониторинга
- **Alertmanager**: `v0.27.0`
  - Управление алертами

### Централизованное логирование (ELK Stack)
- **Elasticsearch**: `8.12.2` - хранение логов
- **Logstash**: `8.12.2` - обработка логов
- **Kibana**: `8.12.2` - визуализация логов
- **Logback**: конфигурация логирования в приложениях

### Трассировка
- **Spring Boot Actuator**: health checks и метрики
- **Micrometer**: метрики приложений
- **OpenTelemetry**: (планируется) распределенная трассировка

---

## 🌐 Инфраструктура и развертывание

### Контейнеризация
- **Docker**: `latest`
  - Multi-stage builds
  - Optimized image layers
  - Security-hardened containers
- **Docker Compose**: оркестрация локальной разработки

### Базовые образы
- **Eclipse Temurin**: `21-jdk` / `21-jre` (для Java приложений)
- **Node.js**: `20.11.1-slim` (для Frontend)
- **Alpine Linux**: `3.19.1` (для вспомогательных контейнеров)
- **Nginx**: `1.25.4-bookworm` (для reverse proxy)

### Reverse Proxy и Load Balancer
- **Nginx**: `1.25.4-bookworm`
  - SSL/TLS терминация
  - Маршрутизация запросов
  - Статический контент
  - Gzip сжатие
  - Балансировка нагрузки

### Оркестрация (Планируется)
- **Kubernetes**: для production развертывания
- **Helm Charts**: для управления конфигурациями
- **Ingress Controller**: для внешнего доступа

---

## 🔐 Безопасность

### Аутентификация и авторизация
- **Spring Security**: `6.x`
- **JWT (JSON Web Tokens)**: `0.12.5`
- **CSRF Protection**: встроенная защита
- **CORS**: настроенная политика

### Безопасность контейнеров
- **Non-root users**: все контейнеры запускаются от непривилегированных пользователей
- **Read-only filesystems**: файловые системы только для чтения где возможно
- **Capability dropping**: удаление ненужных Linux capabilities
- **Security options**: `no-new-privileges:true`

### Сетевая безопасность
- **Сегментированные сети**: изоляция компонентов по функциональности
- **Firewall rules**: ограничение доступа между сегментами
- **SSL/TLS**: шифрование трафика

### Мониторинг безопасности
- **OWASP Dependency Check**: `10.0.4` - проверка уязвимостей в зависимостях
- **Container scanning**: планируется
- **Security headers**: настроены в Nginx

---

## 📊 Производительность и ресурсы

### Ресурсные лимиты (оптимизированы для небольшой нагрузки)

#### CPU лимиты
- **Micro**: `0.05` cores - сервисы-заглушки
- **Tiny**: `0.15` cores - микросервисы с минимальной логикой
- **Small**: `0.3` cores - стандартные сервисы (nginx, мониторинг)
- **Medium**: `0.6` cores - базы данных и брокеры сообщений
- **Big**: `0.8` cores - тяжелые сервисы (Elasticsearch)

#### Memory лимиты
- **Micro**: `64M` - сервисы-заглушки
- **Tiny**: `192M` - микросервисы с JVM
- **Small**: `384M` - стандартные сервисы
- **Medium**: `768M` - базы данных с умеренным кешем
- **Big**: `1536M` - Elasticsearch с небольшим heap

### JVM настройки
- **Heap Size (Tiny)**: `-Xms96M -Xmx160M`
- **Heap Size (Medium)**: `-Xms256M -Xmx512M`
- **GC**: G1GC для Elasticsearch
- **JVM Flags**: оптимизированы для контейнерной среды

---

## 🔄 CI/CD и DevOps

### Система контроля версий
- **Git**: с conventional commits
- **Git Hooks**: pre-commit валидация
- **Branching**: GitFlow модель

### Автоматизация
- **Gradle Wrapper**: обеспечение консистентности сборки
- **Multi-stage Docker builds**: оптимизация размера образов
- **Health checks**: во всех контейнерах
- **Graceful shutdown**: корректное завершение работы сервисов

### Скрипты управления
- **run.sh**: единая точка входа для всех операций
- **Валидация инфраструктуры**: автоматические проверки
- **Backup/Restore**: автоматизированное резервное копирование
- **Secrets rotation**: ротация паролей и секретов

---

## 📈 Масштабируемость

### Горизонтальное масштабирование
- **Stateless микросервисы**: без привязки к конкретным экземплярам
- **Load balancing**: через Nginx и Spring Cloud Gateway
- **Database connection pooling**: эффективное использование соединений

### Вертикальное масштабирование
- **Гибкие ресурсные лимиты**: настраиваемые через переменные окружения
- **JVM tuning**: оптимизация под доступные ресурсы
- **Кеширование**: на уровне приложения и базы данных

---

## 🎯 Качество кода

### Статический анализ
- **ESLint**: для TypeScript/JavaScript
- **SpotBugs**: для Java (планируется)
- **SonarQube**: комплексный анализ качества (планируется)

### Тестирование
- **Unit tests**: JUnit + Mockito (Java), Vitest (TypeScript)
- **Integration tests**: Spring Boot Test
- **E2E tests**: планируется Cypress/Playwright
- **Contract testing**: планируется Spring Cloud Contract

### Документация
- **OpenAPI/Swagger**: автогенерируемая документация API
- **Storybook**: документация UI компонентов
- **Architecture Decision Records (ADR)**: документирование архитектурных решений

---

## 🔮 Планы развития

### Краткосрочные цели (3-6 месяцев)
- Внедрение OpenTelemetry для distributed tracing
- Миграция на Kubernetes
- Настройка полноценного CI/CD pipeline
- Внедрение контрактного тестирования

### Среднесрочные цели (6-12 месяцев)
- Реализация Event Sourcing для критичных операций
- Внедрение CQRS паттерна
- Микро-фронтенды архитектура
- Advanced security scanning

### Долгосрочные цели (12+ месяцев)
- Миграция на Spring Boot 4.x
- Внедрение машинного обучения для аналитики
- Multi-region deployment
- Service mesh (Istio)

---

## 📚 Дополнительные ресурсы

### Документация
- [Руководство по настройке](./docs/README.md)
- [Сетевая архитектура](./docs/NETWORK_ARCHITECTURE.md)
- [Стратегия резервного копирования](./docs/BACKUP_STRATEGY.md)
- [Справочник скриптов](./docs/SCRIPTS_REFERENCE.md)

### Конфигурационные файлы
- [Docker Compose](./docker/compose/docker-compose.yml)
- [Nginx конфигурация](./monitoring/nginx/nginx.conf)
- [Prometheus конфигурация](./monitoring/prometheus/prometheus.yml)