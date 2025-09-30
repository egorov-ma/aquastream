# План миграции контента из to_refactoring/

**Дата**: 2025-09-30  
**Статус**: 📋 Готов к выполнению

## Обзор

В `to_refactoring/` находится **8 файлов** с ценной информацией (общий объем ~117KB). Этот документ описывает план интеграции этого контента в целевую структуру согласно `docs-structure.md`.

## Файлы для миграции

| Файл | Размер | Строк | Приоритет | Ценность |
|------|--------|-------|-----------|----------|
| DEVELOPER.md | 40KB | 1361 | 🔴 Высокий | Комплексное руководство разработчика |
| aquastream-backend-spec-complete.md | 27KB | 959 | 🔴 Высокий | Полная спецификация backend |
| aquastream-frontend-spec.md | 21KB | 289 | 🔴 Высокий | Бизнес-постановка и спецификация |
| build-guide.md | 11KB | 162 | 🟡 Средний | Gradle, зависимости, сборка |
| version-management.md | 5.4KB | 157 | 🟡 Средний | Управление версиями |
| git-hooks.md | 4.0KB | 100 | 🟡 Средний | Автоматизация качества |
| dependency-locking.md | 3.9KB | 120 | 🟡 Средний | Gradle dependency locking |
| issue-management.md | 2.8KB | 39 | 🟢 Низкий | Шаблоны issues и метки |

## Стратегия миграции

### Подход: Разбивка и интеграция

Большие файлы (DEVELOPER.md, спецификации) нужно **разбить** на логические части и интегрировать в соответствующие разделы целевой структуры. Маленькие файлы можно интегрировать целиком.

## Детальный план по файлам

### 1. 🔴 DEVELOPER.md (40KB, 1361 строка)

**Содержание:**
- Быстрый старт (Docker, порты, команды)
- Архитектура микросервисов (схемы, модули)
- Настройка окружения (переменные, конфиги)
- База данных (миграции, подключение)
- Бэкапы и восстановление
- CI/CD процессы
- Релизы
- Мониторинг и отладка
- Типичные ошибки
- FAQ

**План интеграции:**

#### ✅ Раздел: Быстрый старт
**Куда**: `docs/quickstart.md`  
**Действие**: Дополнить существующий файл  
**Что добавить**:
- Детальную информацию о портах сервисов
- Политики контейнеров (безопасность)
- Быстрые команды infra (SBOM, scan)
- Команды для observability (Prometheus/Grafana)

#### ✅ Раздел: Архитектура
**Куда**: `docs/architecture.md`  
**Действие**: Расширить существующий файл  
**Что добавить**:
- Mermaid диаграммы микросервисов
- Детальное описание каждого сервиса
- Схема взаимодействия сервисов
- Описание модульной структуры каждого сервиса

#### ✅ Раздел: Настройка окружения
**Куда**: `docs/development/setup.md`  
**Действие**: Дополнить  
**Что добавить**:
- Переменные окружения для каждого сервиса
- Конфигурационные файлы
- Профили (dev/prod)

#### ✅ Раздел: База данных
**Куда**: `docs/backend/common/database.md`  
**Действие**: Расширить  
**Что добавить**:
- Детали подключения
- Миграции (Liquibase)
- Схемы БД
- Индексы и оптимизация

#### ✅ Раздел: Бэкапы
**Куда**: `docs/operations/backup-recovery.md`  
**Действие**: Дополнить  
**Что добавить**:
- Скрипты бэкапа
- Процедуры восстановления
- Расписание бэкапов

#### ✅ Раздел: CI/CD
**Куда**: `docs/operations/ci-cd.md`  
**Действие**: Расширить  
**Что добавить**:
- GitHub Actions workflows
- Процессы сборки
- Deployment pipeline
- Security scanning

#### ✅ Раздел: Релизы
**Куда**: `docs/operations/deployment.md`  
**Действие**: Дополнить  
**Что добавить**:
- Процесс релиза
- Версионирование
- Rollback процедуры

#### ✅ Раздел: Мониторинг
**Куда**: `docs/operations/monitoring.md`  
**Действие**: Расширить  
**Что добавить**:
- Prometheus метрики
- Grafana дашборды
- Loki логи
- Health checks

#### ✅ Раздел: Troubleshooting & FAQ
**Куда**: `docs/development/troubleshooting.md`  
**Действие**: Дополнить  
**Что добавить**:
- Типичные ошибки и решения
- FAQ по настройке и запуску
- Debug советы

---

### 2. 🔴 aquastream-backend-spec-complete.md (27KB, 959 строк)

**Содержание:**
- Обзор системы (роли, бизнес-процессы)
- Архитектура (технологии, микросервисы, схемы)
- База данных (схемы таблиц для каждого сервиса)
- Спецификация каждого сервиса (endpoints, бизнес-логика)
- Безопасность (JWT, RBAC)
- Интеграции (Telegram, payment providers)
- Инфраструктура
- API Reference

**План интеграции:**

#### ✅ Раздел: Обзор и роли
**Куда**: `docs/backend/common/authentication.md`  
**Действие**: Дополнить  
**Что добавить**:
- Детальное описание RBAC
- Роли (Guest, User, Organizer, Admin)
- Права доступа

#### ✅ Раздел: Бизнес-процессы
**Куда**: `docs/business/processes.md`  
**Действие**: Расширить  
**Что добавить**:
- Регистрация и онбординг
- Бронирование (pending → confirmed → completed)
- Оплата
- Группировка (экипажи)
- Waitlist

#### ✅ Раздел: Архитектура
**Куда**: `docs/architecture.md`  
**Действие**: Дополнить  
**Что добавить**:
- Технологический стек
- Микросервисы (таблица с портами)
- Схема авторизации

#### ✅ Раздел: База данных
**Куда**: `docs/backend/common/database.md`  
**Действие**: Расширить  
**Что добавить**:
- Схемы таблиц для каждого сервиса
- Связи между таблицами
- Индексы

#### ✅ Раздел: Спецификации сервисов
**Куда**: Каждый сервис отдельно:
- `docs/backend/user/business-logic.md`
- `docs/backend/event/business-logic.md`
- `docs/backend/crew/business-logic.md`
- `docs/backend/payment/business-logic.md`
- `docs/backend/notification/business-logic.md`
- `docs/backend/media/business-logic.md`
- `docs/backend/gateway/business-logic.md`

**Действие**: Расширить  
**Что добавить**:
- Бизнес-логика каждого сервиса
- Важные endpoints
- Validation rules
- State machines

#### ✅ Раздел: Безопасность
**Куда**: `docs/backend/common/security.md`  
**Действие**: Дополнить  
**Что добавить**:
- JWT схема
- Rate limiting
- CORS
- Security headers

#### ✅ Раздел: Интеграции
**Куда**: Создать новый раздел в architecture.md или в соответствующих сервисах  
**Что добавить**:
- Telegram Bot integration
- Payment providers (YooKassa, CloudPayments, Stripe)
- MinIO/S3

---

### 3. 🔴 aquastream-frontend-spec.md (21KB, 289 строк)

**Содержание:**
- Бизнес-постановка (назначение, контекст)
- Роли и права
- Пользовательские сценарии
- Страницы и маршруты
- Поиск и фильтрация
- Оплата (виджеты, QR, вебхуки)
- Модерация оплат
- UI компоненты
- Формы
- Дашборды

**План интеграции:**

#### ✅ Раздел: Бизнес-постановка
**Куда**: 
- `docs/index.md` (обзор проекта)
- `docs/business/requirements.md`

**Действие**: Дополнить  
**Что добавить**:
- Назначение продукта
- Цели
- Область MVP
- Roadmap

#### ✅ Раздел: Пользовательские сценарии
**Куда**: `docs/business/user-journeys.md`  
**Действие**: Расширить  
**Что добавить**:
- Гость → регистрация
- Участник → бронирование → оплата
- Организатор → создание события → модерация
- Админ → управление

#### ✅ Раздел: Маршруты и страницы
**Куда**: `docs/frontend/routing.md`  
**Действие**: Дополнить  
**Что добавить**:
- Полный список маршрутов
- Публичные/приватные маршруты
- Параметры маршрутов

#### ✅ Раздел: Оплата
**Куда**: 
- `docs/backend/payment/business-logic.md`
- `docs/frontend/components.md` (UI компоненты оплаты)

**Действие**: Расширить  
**Что добавить**:
- Виджеты эквайринга
- QR оплата
- Вебхуки
- Модерация оплат организатором

#### ✅ Раздел: UI компоненты
**Куда**: `docs/frontend/components.md`  
**Действие**: Дополнить  
**Что добавить**:
- Компоненты оплаты
- Компоненты форм
- Компоненты дашбордов
- Shadcn/ui использование

---

### 4. 🟡 build-guide.md (11KB, 162 строки)

**Содержание:**
- Обзор Gradle проекта
- Правила артефактов и плагинов
- Управление зависимостями
- Производительность сборки
- Команды сборки
- Архитектура слоев (ArchUnit)
- Convention plugins
- Testcontainers
- OWASP

**План интеграции:**

#### ✅ Интеграция целиком
**Куда**: `docs/development/setup.md`  
**Действие**: Добавить новый раздел "Система сборки (Gradle)"  
**Что добавить**:
- Весь контент build-guide.md
- Структурировать по подразделам:
  - Обзор проекта
  - Управление зависимостями
  - Команды сборки
  - Convention plugins
  - Тестирование
  - OWASP

**Альтернатива**: Можно создать отдельный файл `docs/development/build-system.md` (но его нет в плане docs-structure.md)

---

### 5. 🟡 version-management.md (5.4KB, 157 строк)

**Содержание:**
- Структура version.properties
- Команды для обновления версий
- Workflow релиза
- Semantic versioning
- CI/CD интеграция

**План интеграции:**

#### ✅ Интеграция в существующие файлы
**Куда**: 
- `docs/operations/deployment.md` (раздел "Управление версиями")
- `docs/development/workflows.md` (раздел "Релизы")

**Действие**: Добавить раздел  
**Что добавить**:
- version.properties структура
- Команды обновления
- Release workflow
- Semantic versioning правила

---

### 6. 🟡 dependency-locking.md (3.9KB, 120 строк)

**Содержание:**
- Gradle dependency locking настройка
- Команды обновления lockfile
- Анализ зависимостей
- Troubleshooting
- CI/CD интеграция (Lock Check job)

**План интеграции:**

#### ✅ Интеграция
**Куда**: 
- `docs/development/setup.md` (раздел "Управление зависимостями")
- `docs/operations/ci-cd.md` (раздел "Lock Check")

**Действие**: Добавить раздел  
**Что добавить**:
- Dependency locking концепция
- Команды
- Troubleshooting
- CI проверки

---

### 7. 🟡 git-hooks.md (4.0KB, 100 строк)

**Содержание:**
- Docs pre-commit hooks (markdownlint, cSpell, Vale, Lychee)
- Infrastructure pre-commit hook
- Commitlint (Conventional Commits)
- Конфигурации

**План интеграции:**

#### ✅ Интеграция
**Куда**: `docs/development/workflows.md`  
**Действие**: Добавить раздел "Git Hooks и автоматизация качества"  
**Что добавить**:
- Pre-commit hooks для документации
- Infrastructure validation hooks
- Commitlint настройка
- Установка и использование

---

### 8. 🟢 issue-management.md (2.8KB, 39 строк)

**Содержание:**
- Issue templates
- Стандартные метки
- Автоматические метки (labeler)
- Label sync

**План интеграции:**

#### ✅ Интеграция
**Куда**: `docs/development/workflows.md`  
**Действие**: Добавить раздел "Управление задачами (Issues)"  
**Что добавить**:
- Issue templates
- Система меток
- Автоматизация
- Best practices

---

## Порядок выполнения

### Фаза 1: Высокий приоритет (🔴)

**Цель**: Интегрировать основную техническую информацию

1. **DEVELOPER.md** → множественные файлы
   - Начать с `quickstart.md` и `architecture.md`
   - Затем `development/setup.md` и `backend/common/`
   - Далее `operations/` файлы
   - Финал `development/troubleshooting.md`

2. **aquastream-backend-spec-complete.md** → множественные файлы
   - Начать с `architecture.md` и `backend/common/`
   - Затем каждый сервис `backend/[service]/business-logic.md`
   - Финал `business/processes.md`

3. **aquastream-frontend-spec.md** → множественные файлы
   - Начать с `business/` файлы
   - Затем `frontend/routing.md` и `frontend/components.md`
   - Финал дополнения к `backend/payment/`

**Время**: ~4-6 часов работы

### Фаза 2: Средний приоритет (🟡)

**Цель**: Добавить детали по инструментам и процессам

4. **build-guide.md** → `development/setup.md`
5. **version-management.md** → `operations/deployment.md` + `development/workflows.md`
6. **dependency-locking.md** → `development/setup.md` + `operations/ci-cd.md`
7. **git-hooks.md** → `development/workflows.md`

**Время**: ~2-3 часа работы

### Фаза 3: Низкий приоритет (🟢)

**Цель**: Дополнительная информация

8. **issue-management.md** → `development/workflows.md`

**Время**: ~30 минут

### Фаза 4: Финализация

**Цель**: Проверка и очистка

- Проверить все ссылки
- Убедиться в консистентности
- Удалить `to_refactoring/` после миграции
- Обновить `mkdocs.yml`

**Время**: ~1 час

**Общее время**: ~8-11 часов

---

## Рекомендации по выполнению

### Принципы интеграции

1. **Не копировать слепо** - адаптировать контент под стиль целевого файла
2. **Избегать дублирования** - если информация уже есть, дополнить, не повторять
3. **Сохранять структуру** - следовать иерархии заголовков целевого файла
4. **Добавлять ссылки** - cross-reference между связанными разделами
5. **Проверять актуальность** - обновить устаревшую информацию

### Техника "Merge and Enhance"

Для каждого раздела:
1. **Прочитать** целевой файл
2. **Определить** место для новой информации
3. **Извлечь** нужный контент из to_refactoring файла
4. **Адаптировать** стиль и форматирование
5. **Интегрировать** в целевой файл
6. **Проверить** ссылки и структуру

### Контроль качества

После каждой интеграции:
- ✅ Проверить Markdown синтаксис
- ✅ Проверить внутренние ссылки
- ✅ Убедиться в логической связности
- ✅ Проверить что не сломались существующие разделы

---

## Отслеживание прогресса

### Чек-лист файлов

- [ ] DEVELOPER.md → 9 целевых файлов
  - [ ] `docs/quickstart.md`
  - [ ] `docs/architecture.md`
  - [ ] `docs/development/setup.md`
  - [ ] `docs/backend/common/database.md`
  - [ ] `docs/operations/backup-recovery.md`
  - [ ] `docs/operations/ci-cd.md`
  - [ ] `docs/operations/deployment.md`
  - [ ] `docs/operations/monitoring.md`
  - [ ] `docs/development/troubleshooting.md`

- [ ] aquastream-backend-spec-complete.md → 15 целевых файлов
  - [ ] `docs/architecture.md`
  - [ ] `docs/backend/common/authentication.md`
  - [ ] `docs/backend/common/database.md`
  - [ ] `docs/backend/common/security.md`
  - [ ] `docs/business/processes.md`
  - [ ] `docs/backend/user/business-logic.md`
  - [ ] `docs/backend/event/business-logic.md`
  - [ ] `docs/backend/crew/business-logic.md`
  - [ ] `docs/backend/payment/business-logic.md`
  - [ ] `docs/backend/notification/business-logic.md`
  - [ ] `docs/backend/media/business-logic.md`
  - [ ] `docs/backend/gateway/business-logic.md`

- [ ] aquastream-frontend-spec.md → 5 целевых файлов
  - [ ] `docs/index.md`
  - [ ] `docs/business/requirements.md`
  - [ ] `docs/business/user-journeys.md`
  - [ ] `docs/frontend/routing.md`
  - [ ] `docs/frontend/components.md`

- [ ] build-guide.md → 1 целевой файл
  - [ ] `docs/development/setup.md`

- [ ] version-management.md → 2 целевых файла
  - [ ] `docs/operations/deployment.md`
  - [ ] `docs/development/workflows.md`

- [ ] dependency-locking.md → 2 целевых файла
  - [ ] `docs/development/setup.md`
  - [ ] `docs/operations/ci-cd.md`

- [ ] git-hooks.md → 1 целевой файл
  - [ ] `docs/development/workflows.md`

- [ ] issue-management.md → 1 целевой файл
  - [ ] `docs/development/workflows.md`

**Итого целевых файлов**: ~24 уникальных файла (с учетом пересечений)

---

## После миграции

1. **Удалить to_refactoring/**
   ```bash
   rm -rf docs/_internal/to_refactoring/
   ```

2. **Обновить отчеты**
   - Обновить CLEANUP-SUMMARY.md
   - Отметить миграцию как завершенную

3. **Проверить документацию**
   ```bash
   make docs-build
   make docs-serve
   ```

4. **Закоммитить изменения**
   ```bash
   git add docs/
   git commit -m "docs: migrate content from to_refactoring"
   ```

---

## Заключение

Миграция контента из `to_refactoring/` обогатит документацию **детальной технической информацией**, **бизнес-процессами** и **практическими руководствами**. 

После выполнения этого плана документация станет:
- ✅ **Полной** - охватывающей все аспекты проекта
- ✅ **Структурированной** - организованной согласно docs-structure.md
- ✅ **Практичной** - с конкретными командами и примерами
- ✅ **Актуальной** - без устаревшей информации

**Готов к выполнению!** 🚀
