# Build Guide

---
title: Build Guide
summary: Архитектура сборочной системы, типовые команды и правила управления зависимостями.
tags: [development, build]
---

## Архитектура сборки

- **Gradle 8.5** — многомодульный проект со своим `build-logic`
- **Java 21 / Spring Boot 3** — backend сервисы
- **Convention plugins**:
  - `com.aquastream.java-library-conventions` — библиотеки (`*-service`, `*-db`, `backend-common`)
  - `com.aquastream.spring-boot-api-conventions` — исполняемые модули (`*-api`, `backend-gateway`)
- **Артефакты**: `*-api` и `backend-gateway` → `bootJar`, остальные → обычный `jar`
- **Dependency locking**: включён (`lockAllConfigurations = true`, режим `STRICT`)

См. [`docs/backend/README.md`](../backend/README.md) для деталей по слоям и модулям.

## Gradle команды

```bash
# Сборка
./gradlew clean build                             # Полная сборка с тестами
./gradlew :backend-event:backend-event-api:bootJar # Конкретный сервис
./gradlew test                                    # Unit-тесты
./gradlew integrationTest                         # Integration-тесты
./gradlew test jacocoTestReport                   # Отчёт о покрытии

# Зависимости
./gradlew :backend-common:dependencies            # Дерево зависимостей
./gradlew dependencies --write-locks              # Обновить lock-файлы
./gradlew dependencyUpdates                       # Проверка обновлений
```

**Советы**:
- Версии библиотек в `build.gradle` (раздел `ext`), остальное из BOM
- После изменения версий: обновить locks, запустить `./gradlew clean build` и `dependencyCheckAnalyze`
- Ложные срабатывания OWASP → `owasp-suppression.xml` с комментарием

## Документация (MkDocs)

```bash
make docs-setup  # Установить зависимости (один раз)
make docs-serve  # Dev-сервер (/docs/_internal/mkdocs.yml)
make docs-build  # Сборка (strict mode)
make docs-lint   # Линтеры/орфография
```

## Docker

```bash
make build-images  # Сборка образов
make scan          # Trivy security scan
make sbom          # Syft SBOM generation
make up-dev        # Dev-окружение (Postgres, Redis, MinIO, nginx, backend)
make logs SERVICE=backend-event  # Логи сервиса
```

**Вручную**:
```bash
cd backend-infra/docker/compose
docker compose config                # Проверка конфигурации
docker compose --profile dev up -d   # Запуск dev
docker compose --profile dev down    # Остановка
```

## CI/CD

GitHub Actions использует те же команды:
- `backend-ci.yml` — `./gradlew clean build`, `dependencyCheckAnalyze`, lock-check
- `frontend-ci.yml` — `pnpm lint`, `typecheck`, `build`, `test:e2e`
- `ci-images.yml` — `make build-images`, `scan`, `sbom`
- `docs-ci.yml` — `make docs-build`

См. [`docs/operations/ci-cd.md`](../operations/ci-cd.md).

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| `bootJar` собирается у библиотеки | Плагин должен быть `java-library`, а не Spring Boot |
| Конфликт зависимостей | `dependencyInsight`, обновить BOM/версии, перегенерировать locks |
| Долгая сборка | Использовать `--configuration-cache`, убедиться что Daemon включён |
| OWASP уязвимость | Проверить обновление версии, при ложном срабатывании → `owasp-suppression.xml` |
| Docs build падает | Запустить `make docs-lint` и исправить Markdown/орфографию |

## Полезные файлы

- `build.gradle`, `settings.gradle`, `gradle.properties`
- `build-logic/` — convention plugins
- `version.properties` — централизованная версия
- `owasp-suppression.xml` — подавления OWASP
- `backend-infra/docker/compose/` — docker-композиция и конфиг nginx

---

**Правило**: любое изменение в сборочном пайплайне должно быть отражено в документации и обкатано через `make docs-build` и `./gradlew clean build`.