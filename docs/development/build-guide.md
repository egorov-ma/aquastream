# Build Guide

---
title: Build Guide
summary: Архитектура сборочной системы, типовые команды и правила управления зависимостями.
tags: [development, build]
---

## Архитектура сборки

- **Gradle 8.5** — многомодульный проект со своим `build-logic`.
- **Java 21 / Spring Boot 3** — backend сервисы.
- **Convention plugins**:
  - `com.aquastream.java-library-conventions` — общий набор для библиотек (`*-service`, `*-db`, `backend-common`).
  - `com.aquastream.spring-boot-api-conventions` — только для исполняемых модулей (`*-api`, `backend-gateway`).
- **Артефакты**:
  - `*-api` и `backend-gateway`: только `bootJar`.
  - `*-service` и `*-db`: только обычный `jar`.
- **Dependency locking** включён во всех модулях (`lockAllConfigurations = true`, режим `STRICT`).

Подробнее о слоях и модулях — см. [`docs/backend/README.md`](../backend/README.md).

## Основные Gradle команды

```bash
# Полная сборка всех модулей с тестами
./gradlew clean build

# Сборка конкретного сервиса (bootJar)
./gradlew :backend-event:backend-event-api:bootJar

# Unit-тесты (всем проектом)
./gradlew test

# Интеграционные тесты (если настроены)
./gradlew integrationTest

# Отчёт о покрытии (Jacoco)
./gradlew test jacocoTestReport
```

### Управление зависимостями

```bash
# Просмотреть дерево зависимостей
./gradlew :backend-common:dependencies

# Обновить lock-файлы для всех модулей
./gradlew dependencies --write-locks

# Проверка обновлений
./gradlew dependencyUpdates
```

Советы:
- Версии библиотек объявляем в корневом `build.gradle` (раздел `ext`), остальное получаем из BOM.
- После изменения версий — обновляем lock-файлы и прогоняем `./gradlew clean build` и `./gradlew dependencyCheckAnalyze`.
- Ложные срабатывания OWASP фиксируем в `owasp-suppression.xml` с комментарием.

## Документация (MkDocs)

```bash
# Установить зависимости документации (один раз)
make docs-setup

# Дев-сервер (/docs/_internal/mkdocs.yml)
make docs-serve

# Сборка (strict mode)
make docs-build

# Линтеры/орфография
make docs-lint
```

## Docker и контейнеры

```bash
# Сборка всех образов
make build-images

# Сканирование на уязвимости (Trivy)
make scan

# Генерация SBOM (Syft)
make sbom

# Поднять dev-окружение целиком (Postgres, Redis, MinIO, nginx, backend)
make up-dev

# Логи конкретного сервиса
make logs SERVICE=backend-event
```

Вручную (если необходимо):

```bash
cd backend-infra/docker/compose

# Проверка конфигурации
docker compose config

# Запуск/остановка профиля dev
docker compose --profile dev up -d
docker compose --profile dev down
```

## CI/CD связка

GitHub Actions использует те же команды:
- `backend-ci.yml` — `./gradlew clean build`, `dependencyCheckAnalyze`, lock-check.
- `frontend-ci.yml` — `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e`.
- `ci-images.yml` — `make build-images`, `make scan`, `make sbom`.
- `docs-ci.yml` — `make docs-build`.

Подробности см. в [`docs/operations/ci-cd.md`](../operations/ci-cd.md).

## Частые проблемы

| Проблема | Быстрое решение |
|----------|-----------------|
| `bootJar` собирается у библиотеки | Убедитесь, что модуль помечен плагином `java-library`, а не Spring Boot |
| Конфликт зависимостей | Проверьте зависимость через `dependencyInsight`, обновите BOM/версии, перегенерируйте lock-файлы |
| Долгая сборка | Используйте `./gradlew build --configuration-cache`, убедитесь что Daemon включён в `gradle.properties` |
| OWASP находит уязвимость | Проверьте обновление версии, при ложном срабатывании добавьте запись в `owasp-suppression.xml` |
| Docs build падает | Запустите `make docs-lint` и исправьте Markdown/орфографию |

## Полезные файлы

- `build.gradle`, `settings.gradle`, `gradle.properties`
- `build-logic/` — convention plugins
- `version.properties` — централизованная версия
- `owasp-suppression.xml` — подавления OWASP
- `backend-infra/docker/compose/` — docker-композиция и конфиг nginx

---

Следуйте общему правилу: **любое изменение в сборочном пайплайне должно быть отражено в документации и обкатано через `make docs-build` и `./gradlew clean build`**.
