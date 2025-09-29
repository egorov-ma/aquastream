# Quick Start

---
title: Quick Start Guide
summary: Быстрый старт для разработчиков - запуск локальной среды AquaStream за 5 минут.
---

## Требования

- **Java 17+** для backend сервисов
- **Node.js 18+** для frontend
- **Docker & Docker Compose** для локальной инфраструктуры
- **Git** для работы с кодом

## Запуск за 5 минут

### 1. Клонирование репозитория

```bash
git clone https://github.com/egorov-ma/aquastream.git
cd aquastream
```

### 2. Запуск инфраструктуры

```bash
# Запуск PostgreSQL, Redis, Kafka через Docker Compose
docker-compose up -d postgres redis kafka
```

### 3. Запуск Backend сервисов

```bash
# Сборка всех модулей
./mvnw clean install

# Запуск основных сервисов
./mvnw spring-boot:run -pl backend-gateway &
./mvnw spring-boot:run -pl backend-user &
./mvnw spring-boot:run -pl backend-event &
```

### 4. Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Проверка

Откройте браузер:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8100
- **API Documentation**: http://localhost:8000/api/

## Полезные команды

```bash
# Остановить все сервисы
docker-compose down
pkill -f "spring-boot:run"

# Просмотр логов
docker-compose logs -f postgres
tail -f backend-gateway/target/spring-boot.log

# Пересборка после изменений
./mvnw clean install -DskipTests
```

## Тестовые данные

При первом запуске создаются тестовые пользователи:

- **Admin**: admin@aquastream.org / admin123
- **Organizer**: organizer@test.com / test123
- **User**: user@test.com / test123

## Следующие шаги

- [Development Setup](development/setup.md) - детальная настройка среды разработки
- [Architecture](architecture.md) - обзор архитектуры системы
- [Backend Guide](backend/) - руководство по backend разработке
- [Frontend Guide](frontend/) - руководство по frontend разработке

## Проблемы?

См. [Troubleshooting](development/troubleshooting.md) или обратитесь к команде разработки.