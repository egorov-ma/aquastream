# Backend Architecture

## Обзор

AquaStream backend построен на микросервисной архитектуре с использованием Java Spring Boot. Каждый сервис отвечает за определенную бизнес-область и взаимодействует через API Gateway.

## Сервисы

| Сервис | Назначение | Порт |
|--------|------------|------|
| **[Gateway](gateway/README.md)** | API Gateway, маршрутизация, JWT валидация | 8080 |
| **[User](user/README.md)** | Аутентификация, профили, RBAC | 8101 |
| **[Event](event/README.md)** | События, бронирования, waitlist | 8102 |
| **[Crew](crew/README.md)** | Экипажи, команды, назначения | 8103 |
| **[Payment](payment/README.md)** | Платежи, интеграции (YooKassa, Stripe) | 8104 |
| **[Notification](notification/README.md)** | Уведомления (Telegram, Email, SMS) | 8105 |
| **[Media](media/README.md)** | Загрузка файлов, MinIO/S3 | 8106 |

## Общие компоненты

- **[Common](common/README.md)** - shared библиотека (error handling, metrics, rate limiting)
- **[Authentication](authentication.md)** - JWT, RBAC, refresh tokens
- **[Database](database.md)** - PostgreSQL схемы, миграции (Liquibase)

## Технологический стек

- **Framework**: Spring Boot 3.5.x
- **Database**: PostgreSQL 16
- **Security**: Spring Security, JWT (HS512)
- **API**: RESTful, OpenAPI 3.0
- **Build**: Gradle
- **Containerization**: Docker

## Принципы

1. **Domain Driven Design** - каждый сервис = бизнес-домен
2. **API First** - контракты до реализации
3. **Microservices** - слабо связанные, высоко сплоченные
4. **Event Sourcing** - асинхронное взаимодействие
5. **CQRS** - разделение команд и запросов

---

См. [Operations](../operations/README.md), [Architecture Decisions](../decisions/README.md).