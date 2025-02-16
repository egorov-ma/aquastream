# AquaStream

Микросервисная платформа для организации сплавов.

## Архитектура

Проект состоит из следующих модулей:
- `backend-api` - API Gateway на Spring Cloud Gateway
- `backend-user` - Сервис управления пользователями и авторизацией
- `backend-planning` - Сервис планирования сплавов (gRPC)
- `backend-crew` - Сервис управления экипажами
- `backend-notification` - Сервис уведомлений (Kafka)
- `frontend` - Веб-интерфейс (React)
- `common` - Общие компоненты (DTO, утилиты)
- `infra` - Инфраструктурный код (Docker, K8s)

## Технологии

- Java 21
- Spring Boot 3.2
- Spring Cloud Gateway
- Spring Security + JWT
- gRPC
- Apache Kafka
- PostgreSQL
- React
- Docker
- Kubernetes

## Начало работы

### Предварительные требования

- JDK 21
- Docker и Docker Compose
- Node.js 20+ (для frontend)
- PostgreSQL 16
- Apache Kafka

### Локальный запуск

1. Запуск инфраструктуры:
```bash
cd infra/docker
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

2. Сборка и запуск сервисов:
```bash
./gradlew build
./gradlew :backend-api:bootRun
```

3. Запуск фронтенда:
```bash
cd frontend
npm install
npm start
```

### API Endpoints

- API Gateway: http://localhost:8080
- User Service: http://localhost:8081
- Planning Service: http://localhost:8082 (gRPC: 9090)
- Crew Service: http://localhost:8083
- Notification Service: http://localhost:8084

## Разработка

### Структура проекта 