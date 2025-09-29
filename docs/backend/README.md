# Backend Architecture

---
title: Backend Overview
summary: Обзор backend архитектуры AquaStream - микросервисы, общие компоненты и принципы проектирования.
---

## Архитектура

AquaStream backend построен на микросервисной архитектуре с использованием Java Spring Boot. Каждый сервис отвечает за определенную бизнес-область и взаимодействует через API Gateway.

### Модули сервисов

- **[Gateway](gateway/)** - API Gateway, маршрутизация и балансировка нагрузки
- **[User](user/)** - Управление пользователями, аутентификация и профили
- **[Event](event/)** - События, бронирования и расписания
- **[Payment](payment/)** - Платежи, транзакции и интеграции с платежными системами
- **[Notification](notification/)** - Система уведомлений (Email, SMS, Push, Telegram)
- **[Crew](crew/)** - Управление экипажами и командами
- **[Media](media/)** - Загрузка и обработка медиафайлов

### Общие компоненты

- **[Authentication](common/authentication.md)** - Система аутентификации и авторизации
- **[Error Handling](common/error-handling.md)** - Централизованная обработка ошибок
- **[Database](common/database.md)** - Схема базы данных и миграции
- **[Security](common/security.md)** - Политики безопасности

## Технологический стек

- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT
- **API**: RESTful, OpenAPI 3.0
- **Build**: Maven
- **Containerization**: Docker

## Принципы проектирования

1. **Domain Driven Design** - каждый сервис представляет бизнес-домен
2. **API First** - контракты определяются до реализации
3. **Microservices** - слабо связанные, высоко сплоченные сервисы
4. **Event Sourcing** - асинхронное взаимодействие через события
5. **CQRS** - разделение команд и запросов где необходимо

## См. также

- [API Documentation](../api/) - автогенерированная документация всех API
- [Architecture Decisions](../decisions/) - архитектурные решения (ADR)
- [Operations](../operations/) - руководства по эксплуатации