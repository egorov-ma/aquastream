# Development Setup

## Требования

- **Java**: OpenJDK 21 (Eclipse Temurin или OpenJDK)
- **Node.js**: 18+ (рекомендуется 20 LTS)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.x
- **Make**: опционально, для упрощения команд

## Установка зависимостей

### Установка Java 21

```bash
# macOS (Homebrew)
brew install openjdk@21

# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-21-jdk

# Windows (Chocolatey)
choco install openjdk21

# Проверка
java -version
javac -version
```

### Установка Docker

```bash
# macOS (Homebrew)
brew install --cask docker

# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Проверка
docker --version
docker-compose --version
```

### Установка Node.js

```bash
# macOS (Homebrew)
brew install node@20

# Ubuntu/Debian (через NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows (Chocolatey)
choco install nodejs-lts

# Проверка
node --version
npm --version
```

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/egorov-ma/aquastream.git
cd aquastream
```

### 2. Запуск инфраструктуры

```bash
make infra-up
```

### 3. Сборка и запуск backend

```bash
make backend-build
make backend-up
```

### 4. Запуск frontend

```bash
make frontend-dev
```

### 5. Проверка

```bash
make health-check
```

## IDE настройка

### IntelliJ IDEA

1. Импортировать как Gradle проект
2. Настроить Java 21 как Project SDK
3. Установить плагины:
   - Spring Boot
   - Docker
   - Database Navigator

### VS Code

1. Установить расширения:
   - Extension Pack for Java
   - Spring Boot Tools
   - Docker
   - TypeScript

## Переменные окружения

### Структура env-файлов

Env-файлы находятся в `backend-infra/docker/compose/` и разделены по средам:

```bash
cd backend-infra/docker/compose

# Создайте файлы окружений из примеров
cp .env.dev.example   .env.dev
cp .env.stage.example .env.stage
cp .env.prod.example  .env.prod
```

### Ключевые переменные (Development)

#### База данных
```bash
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=aquastream
POSTGRES_USER=aquastream
POSTGRES_PASSWORD=password123
```

#### Redis
```bash
REDIS_HOST=redis
REDIS_PORT=6379
```

#### MinIO (S3)
```bash
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=aquastream
```

#### JWT
```bash
JWT_SECRET=dev-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=3600      # 1 час
JWT_REFRESH_EXPIRATION=2592000  # 30 дней
```

#### External APIs
```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
```

### Профили окружений

- **dev**: локальная разработка, слабые пароли, debug логи
- **stage**: тестовое окружение, реальные секреты
- **prod**: production, строгая безопасность

## База данных

### Подключение к локальной БД

```bash
# Connection string
URL: jdbc:postgresql://localhost:5432/aquastream
User: aquastream
Password: password123

# psql команда
psql -h localhost -p 5432 -U aquastream -d aquastream
```

### Схемы БД

PostgreSQL использует одну базу с разделением по схемам:

- `user` - пользователи, профили, сессии
- `event` - события, бронирования, организаторы
- `crew` - экипажи, назначения
- `payment` - платежи, транзакции
- `notification` - уведомления, подписки
- `media` - файлы, изображения

См. [Database Details](../backend/database.md) для подробностей.

## Gradle команды

### Сборка

```bash
# Полная сборка всех модулей
./gradlew clean build

# Сборка конкретного сервиса
./gradlew :backend-user:backend-user-api:bootJar

# Сборка без тестов
./gradlew build -x test
```

### Тестирование

```bash
# Unit-тесты
./gradlew test

# Integration-тесты
./gradlew integrationTest

# Тесты конкретного модуля
./gradlew :backend-user:backend-user-service:test

# С отчетом о покрытии
./gradlew test jacocoTestReport
```

### Зависимости

```bash
# Просмотр дерева зависимостей
./gradlew :backend-common:dependencies

# Обновление dependency lock файлов
./gradlew dependencies --write-locks

# Или через Make
make deps-lock

# Проверка устаревших зависимостей
./gradlew dependencyUpdates
```

### OWASP Security Scan

```bash
# Сканирование зависимостей
./gradlew dependencyCheckAnalyze

# Отчеты в: build/reports/dependency-check-report.html
```

## Docker команды

### Через Make (рекомендуется)

```bash
# Сборка Docker образов
make build-images

# Security scanning
make scan

# SBOM генерация
make sbom

# Запуск Observability stack
make up-dev-observability

# Логи сервисов
make logs SERVICE=user-service

# Перезапуск сервиса
make restart SERVICE=user-service

# Очистка
make clean-all
```

### Через Docker Compose

```bash
# Development окружение
docker compose -f backend-infra/docker/compose/docker-compose.yml --profile dev up -d

# Просмотр логов
docker compose -f backend-infra/docker/compose/docker-compose.yml logs -f

# Остановка
docker compose -f backend-infra/docker/compose/docker-compose.yml down
```

## Troubleshooting

См. [Troubleshooting Guide](troubleshooting.md) для решения типичных проблем.
