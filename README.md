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

Для запуска проекта существует несколько вариантов, в зависимости от ваших требований и среды разработки. Ниже приведены подробные инструкции для локального запуска и запуска через Docker.

### 1. Локальный запуск (без Docker)

1. **Установка необходимых инструментов:**
   - Java 21 (или выше)
   - Node.js (версия 20 или выше) и npm
   - Git

2. **Клонирование репозитория:**
   ```bash
   git clone <URL_репозитория>
   cd <название_проекта>
   ```

3. **Сборка проекта:**
   Выполните скрипт сборки, который соберёт как backend, так и frontend:
   ```bash
   ./build.sh
   ```
   Скрипт:
   - Проверяет, что вы находитесь в корневой директории проекта (наличие файла settings.gradle).
   - Собирает backend посредством Gradle (очистка и сборка с помощью `./gradlew clean build`).
   - Переходит в директорию `frontend`, устанавливает зависимости через npm и выполняет сборку.
   В случае ошибок сборки скрипт завершится, и сообщение об ошибке будет выведено в консоли.

4. **Запуск микросервисов:**
   Запустите каждый микросервис (например, с использованием Spring Boot):
   - **API Gateway (backend-api):** `java -jar backend-api/build/libs/backend-api.jar`
   - **User Service (backend-user):** `java -jar backend-user/build/libs/backend-user.jar`
   - **Planning Service (backend-planning):** `java -jar backend-planning/build/libs/backend-planning.jar`
   - **Crew Service (backend-crew):** `java -jar backend-crew/build/libs/backend-crew.jar`
   - **Notification Service (backend-notification):** `java -jar backend-notification/build/libs/backend-notification.jar`
   
   Перед запуском убедитесь, что заданы необходимые переменные окружения (например, настройки базы данных, SSL-параметры и прочее).

5. **Проверка работы сервисов:**
   - **API Gateway:** [http://localhost:8080](http://localhost:8080) и [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
   - **User Service:** Swagger UI – [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html), Health – [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health)
   - **Planning Service:** Health – [http://localhost:8082/actuator/health](http://localhost:8082/actuator/health) (для тестирования gRPC используйте `grpcui`)
   - **Crew Service:** Swagger UI – [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html), Health – [http://localhost:8083/actuator/health](http://localhost:8083/actuator/health)
   - **Notification Service:** Swagger UI – [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html), Health – [http://localhost:8084/actuator/health](http://localhost:8084/actuator/health)
   - **Frontend:** [http://localhost:3000](http://localhost:3000)

### 2. Запуск через Docker

1. **Установка Docker и Docker Compose:**
   Убедитесь, что на вашем компьютере установлены Docker и Docker Compose.

2. **Сборка Docker образов:**
   Выполните команду сборки образов, используя Docker Compose:
   ```bash
   docker-compose -f infra/docker/docker-compose.yml build
   ```
   В Dockerfile-ах, расположенных в директории `infra/docker`, описан процесс сборки для каждого микросервиса.

3. **Запуск контейнеров:**
   Запустите все контейнеры в фоновом режиме:
   ```bash
   docker-compose -f infra/docker/docker-compose.yml up -d
   ```

4. **Проверка запущенных контейнеров:**
   Перейдите в директорию с docker-compose файлом и проверьте статус контейнеров:
   ```bash
   cd infra/docker
   docker-compose ps
   ```
   
   Пример успешного вывода команды:
   ```
   Name                          Command                        State           Ports         
   -------------------------------------------------------------------------------------------
   aquastream-frontend        nginx -g daemon off;             Up      0.0.0.0:3000->80/tcp
   aquastream-api             java -jar app.jar                Up      0.0.0.0:8080->8080/tcp
   aquastream-crew            java -jar app.jar                Up      0.0.0.0:8083->8083/tcp
   aquastream-notification    java -jar app.jar                Up      0.0.0.0:8084->8084/tcp
   aquastream-planning        java -jar app.jar                Up      0.0.0.0:8082->8082/tcp
   aquastream-user            java -jar app.jar                Up      0.0.0.0:8081->8081/tcp
   aquastream-postgres        docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
   aquastream-zookeeper       /etc/confluent/docker/run        Up      2181/tcp, 2888/tcp, 3888/tcp
   aquastream-kafka           /etc/confluent/docker/run        Up      0.0.0.0:9092->9092/tcp
   aquastream-prometheus      /bin/prometheus --config.f ...   Up      0.0.0.0:9091->9090/tcp
   aquastream-grafana         /run.sh                          Up      0.0.0.0:3001->3000/tcp
   ```
   
   Все контейнеры должны иметь статус "Up". Если какой-то контейнер находится в другом состоянии или отсутствует, проверьте логи командой `docker-compose logs <имя_контейнера>`.

5. **Доступ к сервисам:**
   - **API Gateway:** [http://localhost:8080](http://localhost:8080)
   - Остальные сервисы доступны через порты, указанные в конфигурационных файлах Docker Compose.
   - Для тестирования gRPC API (Planning Service) можно воспользоваться командой:
     ```bash
     docker run -p 8080:8080 fullstorydev/grpcui -plaintext localhost:9090
     ```

### Дополнительные рекомендации

- **Настройка переменных окружения:**  
  Если ваше приложение использует переменные окружения (например, для подключения к базе данных или SSL-настроек), создайте файл `.env` в корневой директории или экспортируйте их перед запуском.

- **Логи и отладка:**  
  Для диагностики проблем проверяйте логи сервисов:
  - При локальном запуске – вывод консоли.
  - При запуске через Docker – командой `docker logs <имя_контейнера>`.

- **Документация и обновления:**  
  Ознакомьтесь с документацией в файлах [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) и [db-common.yml](common/src/main/resources/db-common.yml) для получения информации о настройке базы данных и прочих конфигурационных параметрах.

Эти подробные шаги помогут вам успешно запустить проект и проверить работоспособность каждого модуля.

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