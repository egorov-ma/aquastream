# AquaStream

Микросервисная платформа для организации сплавов.

## Архитектура

Проект состоит из следующих модулей:

- **backend-gateway** — API Gateway на базе Spring Cloud Gateway для маршрутизации запросов к микросервисам.
- **backend-user** — Сервис управления пользователями и аутентификацией (JWT). Документация REST API доступна через Swagger UI.
- **backend-event** — Сервис планирования сплавов, реализованный с использованием gRPC. API описано в файле `src/main/proto/planning.proto`. Для тестирования gRPC используется grpcui.
- **backend-crew** — Сервис управления экипажами и командами. Документация REST API доступна через Swagger UI.
- **backend-notification** — Сервис уведомлений с использованием Kafka. Документация REST API доступна через Swagger UI.
- **frontend** — Веб-интерфейс, построенный на React.
- **common** — Общие компоненты (DTO, утилиты и пр.).
- **infra** — Инфраструктурный код (Docker, Kubernetes и прочее).

## Технологии

- Java 21, Spring Boot 3.2
- Spring Cloud Gateway, Spring Security (JWT)
- REST API, gRPC
- Swagger / OpenAPI 
- Apache Kafka
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
   - **API Gateway (backend-gateway):** `java -jar backend-gateway/build/libs/backend-gateway.jar`
   - **User Service (backend-user):** `java -jar backend-user/build/libs/backend-user.jar`
   - **Planning Service (backend-event):** `java -jar backend-event/build/libs/backend-event.jar`
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
   docker-compose -f infra/docker/compose/docker-compose.yml build
   ```
   В Dockerfile-ах, расположенных в директории `infra/docker/images`, описан процесс сборки для каждого микросервиса.

3. **Запуск контейнеров (чистый запуск):**
   Перед запуском очистите ранее запущенные и осиротевшие контейнеры, затем запустите все контейнеры в фоновом режиме:
   ```bash
   docker-compose -f infra/docker/compose/docker-compose.yml down --remove-orphans && docker-compose -f infra/docker/compose/docker-compose.yml up -d
   ```
   
   Все контейнеры должны иметь статус "Up". Если какой-то контейнер находится в другом состоянии или отсутствует, проверьте логи командой `docker-compose logs <имя_контейнера>`.

4. **Проверка запущенных контейнеров:**
   Пример успешного вывода команды:
   ```bash
   Name                          Command                        State           Ports         
   -------------------------------------------------------------------------------------------
   aquastream-frontend           nginx -g daemon off;             Up      0.0.0.0:3000->80/tcp
   aquastream-api                java -jar app.jar                Up      0.0.0.0:8080->8080/tcp
   aquastream-crew               java -jar app.jar                Up      0.0.0.0:8083->8083/tcp
   aquastream-notification       java -jar app.jar                Up      0.0.0.0:8084->8084/tcp
   aquastream-event              java -jar app.jar                Up      0.0.0.0:8082->8082/tcp
   aquastream-user               java -jar app.jar                Up      0.0.0.0:8081->8081/tcp
   aquastream-postgres           docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
   aquastream-zookeeper          /etc/confluent/docker/run        Up      2181/tcp, 2888/tcp, 3888/tcp
   aquastream-kafka              /etc/confluent/docker/run        Up      0.0.0.0:9092->9092/tcp
   aquastream-prometheus         /bin/prometheus --config.f ...   Up      0.0.0.0:9091->9090/tcp
   aquastream-grafana            /run.sh                          Up      0.0.0.0:3001->3000/tcp
   ```

4. **Доступ к сервисам:**
   - **API Gateway:** [http://localhost:8080](http://localhost:8080)
   - Остальные сервисы доступны через порты, указанные в конфигурационных файлах Docker Compose.
   - Для тестирования gRPC API (Planning Service) можно воспользоваться командой:
     ```bash
     docker run -p 8080:8080 fullstorydev/grpcui -plaintext localhost:9090
     ```

5. **Запуск с использованием скриптов:**
   Вы также можете управлять проектом с помощью специальных скриптов, расположенных в директории `infra/docker`:
   - `start.sh` — первичный запуск проекта.
   - `restart.sh` — перезапуск проекта с логированием ошибок.
   - `stop.sh` — остановка проекта.
   - `check.sh` — проверка состояния контейнеров.

   Для использования скриптов выполните в терминале:
   ```bash
   ./start.sh    # первичный запуск
   ```
   ```bash
   ./restart.sh  # перезапуск проекта
   ```
   ```bash
   ./stop.sh     # остановка проекта
   ```
   ```bash
   ./check.sh    # проверка состояния контейнеров
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
- **gRPC API (Planning):** Смотрите [planning.proto](backend-event/src/main/proto/planning.proto) и используйте grpcui для визуализации.

## Структура проекта

- **backend-gateway** – API Gateway
- **backend-user** – Сервис управления пользователями
- **backend-event** – Сервис планирования
- **backend-crew** – Сервис управления экипажами
- **backend-notification** – Сервис уведомлений
- **frontend** – Веб-интерфейс
- **common** – Общие модули
- **infra** – Инфраструктурные скрипты (Docker, Kubernetes и т.д.)

## Дополнительная документация

Полная документация проекта доступна в файле [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

## Aquastream Frontend

Современное веб-приложение для управления аквариумами.

### Последние улучшения

#### Май 2024
- ✅ Произведен полный переход с Material UI на Tailwind CSS для лучшей производительности и гибкости
- ✅ Внедрены комплексные E2E тесты с использованием Playwright
- ✅ Настроен Storybook для документирования и разработки UI компонентов
- ✅ Улучшены модульные тесты с использованием Vitest и React Testing Library
- ✅ Реализована стратегия тестирования с охватом всех ключевых компонентов
- ✅ Оптимизирована производительность с использованием мемоизации и ленивой загрузки
- ✅ Улучшена доступность (a11y) всех UI компонентов согласно стандартам WCAG 2.1 AA
- ✅ Добавлены автоматизированные тесты доступности
- ✅ Полностью переработаны базовые UI компоненты (Button, TextField, Typography и др.)
- ✅ Создана подробная документация по API стандартам, компонентам и рекомендациям

#### Апрель 2024
- ✅ Исправлены все ошибки TypeScript
- ✅ Улучшена структура директорий
- ✅ Настроены алиасы импортов
- ✅ Обновлены типы
- ✅ Оптимизировано использование Redux
- ✅ Добавлены тесты для UI компонентов и API сервисов
- ✅ Исправлены ошибки ESLint и настроен Prettier
- ✅ Обновлены зависимости для совместимости

### Технологии

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Vitest и React Testing Library
- Playwright для E2E тестирования
- Storybook
- React Router
- Redux Toolkit и RTK Query

### Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск тестов
npm run test

# Проверка типов и линтинг
npm run check
```

### Структура проекта

```
src/
├── components/       # UI компоненты
│   ├── ui/           # Переиспользуемые компоненты
│   └── layout/       # Компоненты макета
├── hooks/            # Кастомные хуки
├── i18n/             # Интернационализация
│   └── locales/      # Переводы
├── pages/            # Страницы приложения
├── services/         # Сервисы для работы с API
├── store/            # Redux store
└── utils/            # Утилиты
```

### Рекомендации по дальнейшим улучшениям

1. Расширить тестовое покрытие
2. Добавить интеграционные тесты
3. Реализовать PWA (Progressive Web App)
4. Добавить мониторинг производительности
5. Оптимизировать размер бандла 