# Шаблоны документации

Все шаблоны для создания консистентной документации в проекте AquaStream.

## Доступные шаблоны

### 🔧 Backend разработка

**[backend-service-readme.md](backend-service-readme.md)**
- Полная документация backend сервиса
- Включает: API, архитектуру, мониторинг, troubleshooting
- Технологии: Java 21, Gradle, Spring Boot, PostgreSQL

### 🎨 Frontend разработка

**[frontend-component.md](frontend-component.md)**
- Документация React компонентов
- Включает: API reference, примеры, тестирование, стилизацию
- Технологии: React, TypeScript, Tailwind CSS

### 🧪 QA и тестирование

**[qa-test-plan.md](qa-test-plan.md)**
- План тестирования функций/модулей
- Включает: стратегию, тест-кейсы, автоматизацию
- Инструменты: Jest, Cypress, JUnit, TestContainers

### ⚙️ Operations

**[operations-runbook.md](operations-runbook.md)**
- Операционные процедуры для сервисов
- Включает: мониторинг, алерты, troubleshooting
- Инструменты: Grafana, Prometheus, Docker

### 🏗️ Архитектура

**[architecture.md](architecture.md)**
- Документация архитектуры модулей/систем
- Включает: компоненты, интеграции, решения, безопасность
- Диаграммы: Mermaid, схемы данных

**[adr-template.md](adr-template.md)**
- Architecture Decision Records
- Включает: контекст, решения, риски, план реализации

### 📋 Планирование

**[roadmap.md](roadmap.md)**
- Дорожная карта развития продукта
- Включает: планирование по кварталам, метрики, риски

## Быстрый старт

### Создание документации для backend сервиса

```bash
# Скопировать шаблон
cp docs/_internal/templates/backend-service-readme.md docs/backend/user/README.md

# Заменить placeholder'ы
sed -i 's/{Service Name}/User Service/g' docs/backend/user/README.md
sed -i 's/{service-name}/user-service/g' docs/backend/user/README.md
sed -i 's/{port}/8101/g' docs/backend/user/README.md
```

### Создание ADR

```bash
# Скопировать шаблон
cp docs/_internal/templates/adr-template.md docs/decisions/adr-004-jwt-authentication.md

# Заменить placeholder'ы
sed -i 's/{NNN}/004/g' docs/decisions/adr-004-jwt-authentication.md
sed -i 's/{Короткий заголовок}/JWT Authentication/g' docs/decisions/adr-004-jwt-authentication.md
```

## Соглашения

### Технические стандарты
- **Backend:** Java 21, Spring Boot 3.x, Gradle
- **Frontend:** React, TypeScript, Next.js
- **Database:** PostgreSQL
- **Build:** Makefile команды
- **Docs:** Markdown с YAML frontmatter

### Placeholder'ы для замены
- `{Service Name}` → User Service
- `{service-name}` → user-service
- `{ComponentName}` → UserProfile
- `{port}` → 8101
- `{описание}` → конкретное описание

## Проверка документации

```bash
# Линтинг и проверка ссылок
make docs-lint

# Сборка документации
make docs-build

# Локальный предпросмотр
make docs-serve
```

## Обновление шаблонов

При улучшении шаблонов:
1. Обновите шаблон
2. Обновите README
3. Уведомите команду