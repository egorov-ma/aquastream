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

- Java 21, Spring Boot 3.2
- Spring Cloud Gateway, Spring Security (JWT)
- gRPC (backend-planning)
- Swagger / OpenAPI для REST API (backend-api, backend-user, backend-crew, backend-notification)
- Apache Kafka (backend-notification)
- PostgreSQL, Docker/Docker Compose, Kubernetes
- React, Node.js 20+

## Запуск проекта

### Локальный запуск (без Docker)

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/egorov-ma/AquaStream.git
   cd AquaStream
   ```
2. Соберите проект с использованием Gradle Wrapper:
   ```bash
   ./gradlew clean build
   ```
3. Для локального запуска сервисы используют файл `application.yml` (настройки для localhost).
4. Запустите сервисы из вашей IDE или с помощью командной строки.

### Запуск через Docker

Для работы в Docker используются специальные файлы конфигурации —  
- `application-docker.yml` (с настройками для имен контейнеров и переменными окружения)  
- Docker Compose (см. [infra/docker/docker-compose.yml](infra/docker/docker-compose.yml))

Чтобы запустить проект в Docker:
1. Перейдите в каталог с Docker Compose:
   ```bash
   cd infra/docker
   ```
2. Запустите контейнеры:
   ```bash
   docker-compose up -d
   ```

## Доступ к сервисам

После запуска доступны следующие URL:

- **API Gateway:** [http://localhost:8080](http://localhost:8080)
- **User Service:** [http://localhost:8081](http://localhost:8081)  
  Swagger UI: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **Planning Service:** [http://localhost:8082](http://localhost:8082)  
  gRPC сервер – порт 9090, gRPC UI: [http://localhost:8082/grpcui](http://localhost:8082/grpcui)
- **Crew Service:** [http://localhost:8083](http://localhost:8083)  
  Swagger UI: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- **Notification Service:** [http://localhost:8084](http://localhost:8084)  
  Swagger UI: [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html)
- **Frontend:** [http://localhost:3000](http://localhost:3000)

## Документация API

- **REST API:** Доступна через Swagger UI по адресу `/swagger-ui.html`.
- **gRPC API (Planning):** См. [planning.proto](backend-planning/src/main/proto/planning.proto) и [gRPC UI](http://localhost:8082/grpcui).

## Структура проекта

- **backend-api** – API Gateway
- **backend-user** – Сервис управления пользователями
- **backend-planning** – Сервис планирования
- **backend-crew** – Сервис управления экипажами
- **backend-notification** – Сервис уведомлений
- **frontend** – Веб-интерфейс
- **common** – Общие модули
- **infra** – Инфраструктурные скрипты (Docker, Kubernetes и т.д.) 