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

1. Убедитесь, что у вас установлены Docker и Docker Compose.

2. Соберите проект:
   ```bash
   ./gradlew clean build
   ```

3. Перейдите в каталог с Docker Compose:
   ```bash
   cd infra/docker
   ```

4. Для первого запуска выполните:
   ```bash
   ./start.sh
   ```

5. Если возникли ошибки или необходимо перезапустить проект, выполните:
   ```bash
   ./restart.sh
   ```

6. Для остановки работы проекта выполните:
   ```bash
   ./stop.sh
   ```

Примечание: Скрипты уже исполняемые по умолчанию при клонировании репозитория.

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

## Проверка работы сервисов

После запуска контейнеров или сервисов выполните следующие проверки для подтверждения их работоспособности:

1. **API Gateway**  
   - Откройте [http://localhost:8080](http://localhost:8080) в браузере.  
   - При наличии Spring Actuator проверьте [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

2. **User Service**  
   - Проверьте Swagger UI: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)  
   - Если включён Actuator, проверьте [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health)

3. **Planning Service**  
   - Проверьте gRPC UI: [http://localhost:8082/grpcui](http://localhost:8082/grpcui)  
   - Если настроен Actuator, проверьте [http://localhost:8082/actuator/health](http://localhost:8082/actuator/health)

4. **Crew Service**  
   - Проверьте Swagger UI: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)  
   - Если доступен, проверьте [http://localhost:8083/actuator/health](http://localhost:8083/actuator/health)

5. **Notification Service**  
   - Проверьте Swagger UI: [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html)  
   - При наличии Actuator проверьте [http://localhost:8084/actuator/health](http://localhost:8084/actuator/health)

6. **Frontend**  
   - Откройте [http://localhost:3000](http://localhost:3000) для проверки работы пользовательского интерфейса.

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