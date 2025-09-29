# Development Setup

## Требования

- **Java**: OpenJDK 21
- **Node.js**: 18+ (рекомендуется 20 LTS)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

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

## База данных

Подключение к локальной БД:
```
URL: jdbc:postgresql://localhost:5432/aquastream
User: aquastream
Password: password123
```

## Полезные команды

```bash
# Логи сервисов
make logs SERVICE=user-service

# Перезапуск сервиса
make restart SERVICE=user-service

# Очистка
make clean-all
```