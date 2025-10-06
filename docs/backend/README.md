---
title: Backend Overview
summary: Обзор backend архитектуры AquaStream - микросервисы, общие компоненты и принципы проектирования.
---

# Backend Architecture

## Архитектура

AquaStream backend построен на микросервисной архитектуре с использованием Java Spring Boot. Каждый сервис отвечает за определенную бизнес-область и взаимодействует через API Gateway.

### Модули сервисов

- **[Gateway](gateway/README.md)** - API Gateway, маршрутизация и балансировка нагрузки
- **[User](user/README.md)** - Управление пользователями, аутентификация и профили
- **[Event](event/README.md)** - События, бронирования и расписания
- **[Payment](payment/README.md)** - Платежи, транзакции и интеграции с платежными системами
- **[Notification](notification/README.md)** - Система уведомлений (Email, SMS, Push, Telegram)
- **[Crew](crew/README.md)** - Управление экипажами и командами
- **[Media](media/README.md)** - Загрузка и обработка медиафайлов

### Общие компоненты

- **[Common Overview](common/README.md)** - стандарты и соглашения, применимые ко всем сервисам
- **[Error Handling](common/error-handling.md)** - централизованная обработка ошибок
- **[Security](common/security.md)** - политики безопасности и контроль доступа
- **[Metrics](common/metrics.md)** - метрики и мониторинг
- **[Rate Limiting](common/rate-limiting.md)** - защита от перегрузок
- **[Web Utilities](common/web-utilities.md)** - общие веб-компоненты и middleware

## Технологический стек

- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT
- **API**: RESTful, OpenAPI 3.0
- **Build**: Gradle
- **Containerization**: Docker

## Принципы проектирования

1. **Domain Driven Design** - каждый сервис представляет бизнес-домен
2. **API First** - контракты определяются до реализации
3. **Microservices** - слабо связанные, высоко сплоченные сервисы
4. **Event Sourcing** - асинхронное взаимодействие через события
5. **CQRS** - разделение команд и запросов где необходимо

## См. также

- [API Documentation](../api/index.md) - автогенерированная документация всех API
- [Architecture Decisions](../decisions/index.md) - архитектурные решения (ADR)
- [Operations](../operations/README.md) - руководства по эксплуатации
