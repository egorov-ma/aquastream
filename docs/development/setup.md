# Development Setup

## Требования

- **Java**: OpenJDK 21 (Eclipse Temurin или OpenJDK)
- **Node.js**: 18+ (рекомендуется 20 LTS)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.x
- **Make**: опционально, для упрощения команд

## Установка зависимостей

Установите требуемые зависимости (инструкции на официальных сайтах):
- **Java 21**: [OpenJDK](https://openjdk.org/) или [Eclipse Temurin](https://adoptium.net/)
- **Docker**: [docker.com/get-started](https://www.docker.com/get-started)
- **Node.js 20 LTS**: [nodejs.org](https://nodejs.org/)

```bash
# Проверка версий
java -version   # OpenJDK 21
docker --version && docker compose version
node --version  # 18+
```

## Быстрый старт

См. [Quickstart Guide](../quickstart.md) для запуска проекта за 5 минут.

## IDE настройка

**IntelliJ IDEA**: импорт Gradle проекта, Java 21 SDK, плагины (Spring Boot, Docker, Database Navigator)

**VS Code**: расширения (Extension Pack for Java, Spring Boot Tools, Docker, TypeScript)

## Переменные окружения

Env-файлы находятся в `backend-infra/docker/compose/`:

```bash
cd backend-infra/docker/compose
cp .env.dev.example .env.dev  # dev/stage/prod
```

**Ключевые переменные (dev)**:
```bash
# PostgreSQL
POSTGRES_HOST=postgres POSTGRES_DB=aquastream POSTGRES_USER=aquastream POSTGRES_PASSWORD=password123

# Redis
REDIS_HOST=redis REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=http://minio:9000 MINIO_ACCESS_KEY=minioadmin MINIO_BUCKET=aquastream

# JWT
JWT_SECRET=dev-secret-key JWT_ACCESS_EXPIRATION=3600 JWT_REFRESH_EXPIRATION=2592000

# External APIs
TELEGRAM_BOT_TOKEN=your-token YOOKASSA_SHOP_ID=your-id YOOKASSA_SECRET_KEY=your-key
```

**Профили**: `dev` (локальная разработка), `stage` (тестовое окружение), `prod` (production)

## База данных

```bash
# Connection
jdbc:postgresql://localhost:5432/aquastream (user: aquastream, password: password123)

# psql
psql -h localhost -p 5432 -U aquastream -d aquastream
```

PostgreSQL использует схемы: `user`, `event`, `crew`, `payment`, `notification`, `media`. См. [Database Details](../backend/database.md).

## Gradle команды

```bash
# Сборка
./gradlew clean build                                  # Все модули
./gradlew :backend-user:backend-user-api:bootJar       # Конкретный сервис
./gradlew build -x test                                # Без тестов

# Тестирование
./gradlew test                                         # Unit-тесты
./gradlew integrationTest                              # Integration-тесты
./gradlew :backend-user:backend-user-service:test      # Конкретный модуль
./gradlew test jacocoTestReport                        # С покрытием

# Зависимости
./gradlew :backend-common:dependencies                 # Дерево зависимостей
make deps-lock                                         # Обновить locks
./gradlew dependencyUpdates                            # Проверить обновления

# Security
./gradlew dependencyCheckAnalyze  # OWASP scan → build/reports/
```

## Docker команды

```bash
# Make (рекомендуется)
make up-dev                # Запуск dev окружения
make build-images          # Сборка образов
make scan && make sbom     # Security scanning + SBOM
make up-dev-observability  # Observability stack
make logs                  # Логи всех сервисов
make down                  # Остановка
```

Подробнее: [Operations Guide](../operations/README.md)

## Troubleshooting

См. [Troubleshooting Guide](troubleshooting.md) для решения типичных проблем.