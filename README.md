# AquaStream

Микросервисная платформа для организации сплавов, построенная на современных технологиях.

## Архитектура

Проект состоит из следующих модулей:

- **backend-api** — API Gateway на базе Spring Cloud Gateway для маршрутизации запросов к микросервисам.
- **backend-user** — Сервис управления пользователями и аутентификацией (JWT). Документация REST API доступна через Swagger UI.
- **backend-planning** — Сервис планирования сплавов, реализованный с использованием gRPC. API описано в файле `src/main/proto/planning.proto`. Для тестирования gRPC используется grpcui.
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

Используйте инструкции в корневом [build.sh](build.sh) для сборки и запуска проекта.

После сборки доступны следующие сервисы:

- **API Gateway:** [http://localhost:8080](http://localhost:8080)  
  (Проверка работоспособности: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health))
- **User Service:** Swagger UI [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)  
  (Проверка: [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health))
- **Planning Service:**  
  gRPC сервер – порт 9090; проверка состояния: [http://localhost:8082/actuator/health](http://localhost:8082/actuator/health)
- **Crew Service:** Swagger UI [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)  
  (Проверка: [http://localhost:8083/actuator/health](http://localhost:8083/actuator/health))
- **Notification Service:** Swagger UI [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html)  
  (Проверка: [http://localhost:8084/actuator/health](http://localhost:8084/actuator/health))
- **Frontend:** [http://localhost:3000](http://localhost:3000)

## Визуализация API

### REST API  
Для просмотра документации REST API используйте Swagger UI, доступный по URL-адресам каждого сервиса (например, [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)).

### gRPC API  
Сервис планирования использует gRPC с поддержкой Reflection. Это позволяет внешним инструментам автоматически получать информацию об API. Для визуализации gRPC API используйте [grpcui](https://github.com/fullstorydev/grpcui). Примеры запуска:

- Если у вас установлен grpcui на локальной машине:
  ```
  grpcui -plaintext localhost:9090
  ```
- Или через Docker:
  ```
  docker run -p 8080:8080 fullstorydev/grpcui -plaintext localhost:9090
  ```

## Проверка работы сервисов

После запуска контейнеров или сервисов выполните следующие проверки:

1. **API Gateway**  
   - Откройте [http://localhost:8080](http://localhost:8080).
   - Проверьте состояние по [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health).

2. **User Service**  
   - Перейдите в Swagger UI: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html).
   - Проверьте [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health).

3. **Planning Service**  
   - Для тестирования gRPC API используйте grpcui (как описано выше).
   - Проверьте работоспособность сервиса: [http://localhost:8082/actuator/health](http://localhost:8082/actuator/health).

4. **Crew Service**  
   - Откройте Swagger UI: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html).
   - Проверьте [http://localhost:8083/actuator/health](http://localhost:8083/actuator/health).

5. **Notification Service**  
   - Откройте Swagger UI: [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html).
   - Проверьте [http://localhost:8084/actuator/health](http://localhost:8084/actuator/health).

6. **Frontend**  
   - Проверьте доступ по [http://localhost:3000](http://localhost:3000).

## Документация API

- **REST API:** Используйте Swagger UI для визуализации и тестирования.
- **gRPC API (Planning):** Смотрите [planning.proto](backend-planning/src/main/proto/planning.proto) и используйте grpcui для визуализации.

## Структура проекта

- **backend-api** – API Gateway
- **backend-user** – Сервис управления пользователями
- **backend-planning** – Сервис планирования
- **backend-crew** – Сервис управления экипажами
- **backend-notification** – Сервис уведомлений
- **frontend** – Веб-интерфейс
- **common** – Общие модули
- **infra** – Инфраструктурные скрипты (Docker, Kubernetes и т.д.)

## Дополнительная документация

Полная документация проекта доступна в файле [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md). 