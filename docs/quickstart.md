# Быстрый старт AquaStream

Добро пожаловать в AquaStream! Это руководство поможет вам быстро начать работу с проектом.

## Предварительные требования

### Обязательное ПО

- **Java**: OpenJDK 21
- **Node.js**: 18+ (рекомендуется 20 LTS)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.x

### Рекомендуемое ПО

- **IDE**: IntelliJ IDEA или VS Code
- **Make**: для упрощения команд
- **pnpm**: менеджер пакетов для frontend (устанавливается автоматически)

## Быстрая установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/egorov-ma/aquastream.git
cd aquastream
```

### 2. Запуск инфраструктуры

```bash
# Запуск PostgreSQL, Redis и других сервисов
make infra-up
```

**Что запустится:**
- PostgreSQL (порт 5432)
- Redis (порт 6379)
- RabbitMQ (порт 5672, UI: 15672)
- MinIO (порт 9000, UI: 9001)

### 3. Сборка и запуск Backend

```bash
# Сборка всех модулей
make backend-build

# Запуск всех микросервисов
make backend-up
```

**Что запустится:**
- API Gateway (порт 8080)
- User Service (порт 8101)
- Event Service (порт 8102)
- Crew Service (порт 8103)
- Payment Service (порт 8104)
- Notification Service (порт 8105)
- Media Service (порт 8106)

**Политики безопасности контейнеров:**
- Сервисы запускаются под пользователем `1000:1000` (без root)
- Корневая ФС read-only, запись только в `/tmp` и volumes
- `cap_drop: [ALL]` + `no-new-privileges:true` - защита от эскалации привилегий
- Лимит открытых файлов увеличен до 65536

### 4. Запуск Frontend

```bash
# Установка зависимостей и запуск dev-сервера
make frontend-dev
```

**Доступ:** http://localhost:3000

### 5. Проверка работоспособности

```bash
# Проверка всех сервисов
make health-check
```

Вы должны увидеть статус "UP" для всех сервисов.

## Основные команды

### Управление инфраструктурой

```bash
# Запуск
make infra-up

# Остановка
make infra-down

# Просмотр логов
make infra-logs
```

### Backend разработка

```bash
# Сборка
make backend-build

# Запуск
make backend-up

# Остановка
make backend-down

# Логи конкретного сервиса
make logs SERVICE=user-service

# Тесты
make backend-test

# Перезапуск сервиса
make restart SERVICE=user-service
```

### Инфраструктурные команды

```bash
# Сборка Docker образов локально
make build-images

# Security scanning (Trivy)
make scan

# Генерация SBOM (Software Bill of Materials)
make sbom

# Запуск Observability stack (Prometheus/Grafana/Loki)
make up-dev-observability

# Инициализация MinIO бакетов
make minio-bootstrap
```

**Отчеты сохраняются:**
- SBOM: `backend-infra/reports/sbom/`
- Security scans: `backend-infra/reports/scan/`

### Frontend разработка

```bash
# Dev режим (с hot reload)
make frontend-dev

# Production сборка
make frontend-build

# Тесты
make frontend-test

# Линтеры
cd frontend && pnpm lint

# Проверка типов
cd frontend && pnpm typecheck
```

### Документация

```bash
# Установка зависимостей (один раз)
make docs-setup

# Локальный просмотр
make docs-serve
# Открыть http://localhost:8000

# Сборка
make docs-build
```

## Доступ к сервисам

### Приложение

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html

### Backend сервисы (dev режим)

- **Gateway**: http://localhost:8080
- **User API**: http://localhost:8101
- **Event API**: http://localhost:8102
- **Crew API**: http://localhost:8103
- **Payment API**: http://localhost:8104
- **Notification API**: http://localhost:8105
- **Media API**: http://localhost:8106

### Инфраструктура

- **PostgreSQL**: localhost:5432 (aquastream/password123)
- **Redis**: localhost:6379
- **MinIO**: localhost:9000 (UI: localhost:9001)
- **RabbitMQ**: localhost:5672 (UI: localhost:15672, guest/guest)

## Первые шаги

### 1. Регистрация тестового пользователя

Откройте http://localhost:3000/auth/register и создайте аккаунт.

### 2. Просмотр событий

Перейдите на http://localhost:3000/events для просмотра доступных событий.

### 3. API документация

Откройте http://localhost:8080/swagger-ui.html для интерактивной документации API.

## Структура проекта

```
aquastream/
├── backend-*/              # Микросервисы
│   ├── *-api/             # REST API слой
│   ├── *-service/         # Бизнес-логика
│   └── *-db/              # Data Access слой
├── frontend/              # Next.js приложение
├── backend-infra/         # Docker, CI/CD
├── docs/                  # Документация
└── Makefile              # Команды для разработки
```

## Разработка

### Backend

1. Откройте проект в IntelliJ IDEA как Gradle проект
2. Настройте Java 21 как Project SDK
3. Установите плагины: Spring Boot, Docker
4. Найдите класс `*Application.java` и запустите

См. [Development Setup](development/setup.md) для деталей.

### Frontend

1. Откройте папку `frontend/` в VS Code
2. Установите рекомендуемые расширения
3. Запустите `pnpm dev`

См. [Frontend Setup](frontend/setup.md) для деталей.

## Тестирование

### Backend тесты

```bash
# Unit-тесты
./gradlew test

# Integration-тесты
./gradlew integrationTest

# Все тесты
./gradlew check
```

### Frontend тесты

```bash
cd frontend

# Линтеры
pnpm lint

# Типизация
pnpm typecheck

# Unit-тесты
pnpm test:unit

# E2E-тесты
pnpm test:e2e
```

## Решение проблем

### Backend не запускается

```bash
# Проверьте статус инфраструктуры
docker ps

# Проверьте логи
make backend-logs

# Пересоберите проект
make backend-clean
make backend-build
```

### Frontend не запускается

```bash
# Переустановите зависимости
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Проверьте версию Node.js
node --version  # должна быть 18+
```

### Порты заняты

```bash
# Остановите все сервисы
make clean-all

# Проверьте занятые порты
lsof -i :8100  # для конкретного порта
```

См. [Troubleshooting](development/troubleshooting.md) для деталей.

## Полезные ссылки

- **[Архитектура](architecture.md)** - обзор архитектуры системы
- **[Backend Guide](backend/README.md)** - руководство по backend
- **[Frontend Guide](frontend/README.md)** - руководство по frontend
- **[Operations](operations/README.md)** - DevOps и эксплуатация
- **[QA Guide](qa/README.md)** - тестирование и QA

## Следующие шаги

1. **Изучите архитектуру**: [Architecture Overview](architecture.md)
2. **Настройте окружение**: [Development Setup](development/setup.md)
3. **Изучите workflow**: [Development Workflows](development/workflows.md)
4. **Ознакомьтесь с style guides**: [Style Guides](development/style-guides.md)

## Получить помощь

- **Документация**: см. `docs/`
- **Issues**: создайте issue в GitHub
- **Вопросы**: задайте вопрос в команде

---

**Удачи в разработке! 🚀**
