# AquaStream

Микросервисная платформа для организации сплавов, построенная на современных технологиях.

## Архитектура

Проект состоит из следующих модулей:

- **backend-api** — API Gateway на базе Spring Cloud Gateway для маршрутизации запросов к микросервисам.
- **backend-user** — Сервис управления пользователями и аутентификацией (JWT). Документация REST API доступна через Swagger UI.
- **backend-planning** — Сервис планирования сплавов, реализованный с использованием gRPC. API описано в файле `src/main/proto/planning.proto`. Для тестирования доступен gRPC UI.
- **backend-crew** — Сервис управления экипажами и командами. Документация REST API доступна через Swagger UI.
- **backend-notification** — Сервис уведомлений с использованием Kafka. Документация REST API доступна через Swagger UI.
- **frontend** — Веб-интерфейс, построенный на React.
- **common** — Общие компоненты (DTO, утилиты и пр.).
- **infra** — Инфраструктурный код (Docker, Kubernetes и прочее).

## Технологии

- Java 21
- Spring Boot 3.2
- Spring Cloud Gateway
- Spring Security с JWT
- gRPC (backend-planning)
- Swagger / OpenAPI для REST API (backend-api, backend-user, backend-crew, backend-notification)
- Apache Kafka (backend-notification)
- PostgreSQL
- React, Node.js 20+
- Docker и Docker Compose
- Kubernetes

## Быстрый старт

### Предварительные требования

- JDK 21
- Docker и Docker Compose
- Node.js 20+
- PostgreSQL 16
- Apache Kafka

### Локальный запуск

1. **Инфраструктура**

   Перейдите в директорию `infra/docker` и запустите контейнеры:
   ```bash
   cd infra/docker
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
   ```

2. **Сборка и запуск микросервисов**

   Соберите проект и запустите необходимые сервисы:
   ```bash
   ./gradlew clean build
   ./gradlew :backend-api:bootRun
   ./gradlew :backend-user:bootRun
   ./gradlew :backend-crew:bootRun
   ./gradlew :backend-notification:bootRun
   ./gradlew :backend-planning:bootRun
   ```
   **Примечание:** Сервис планирования использует gRPC и работает на порту 9090.

3. **Запуск фронтенда**

   Перейдите в директорию `frontend`, установите зависимости и запустите приложение:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Доступ к сервисам

После запуска контейнеров и сервисов доступны следующие URL:

- **API Gateway:** [http://localhost:8080](http://localhost:8080)
- **User Service:** [http://localhost:8081](http://localhost:8081)  
  Swagger UI: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **Planning Service:** [http://localhost:8082](http://localhost:8082)  
  gRPC сервер: порт 9090  
  gRPC UI: [http://localhost:8082/grpcui](http://localhost:8082/grpcui) (если настроен)
- **Crew Service:** [http://localhost:8083](http://localhost:8083)  
  Swagger UI: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- **Notification Service:** [http://localhost:8084](http://localhost:8084)  
  Swagger UI: [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html)
- **Frontend:** [http://localhost:3000](http://localhost:3000)

## Документация API

Для REST-сервисов (User, Crew, Notification и API Gateway) документация доступна через Swagger UI по соответствующим URL:

- `/swagger-ui.html`

Для gRPC API сервиса планирования используйте файл `src/main/proto/planning.proto` для ознакомления с методами или тестируйте с помощью gRPC UI.

## Структура проекта 