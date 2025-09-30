# CI/CD Pipeline

## Обзор

GitHub Actions pipeline для автоматизации сборки, тестирования, security scanning и деплоя.

## Workflow Компоненты

### Backend CI

**Файл**: `.github/workflows/backend-ci.yml`

**Триггеры**:
- `push` и `pull_request` с фильтрами путей:
  - `backend-*/**`
  - `build.gradle`
  - `settings.gradle`
  - `gradle/**`
  - `version.properties`

**Что выполняется**:
1. Gradle Wrapper Validation
2. Setup Java 21 (Temurin)
3. Gradle кэширование
4. `./gradlew clean build`
5. Lock Check - проверка актуальности dependency lock файлов
6. Upload test reports

**Кэширование**: Gradle dependencies + build cache

### Frontend CI

**Файл**: `.github/workflows/frontend-ci.yml`

**Триггеры**:
- `push` и `pull_request` с фильтрами путей:
  - `frontend/**`
  - `.github/workflows/frontend-ci.yml`

**Что выполняется**:
1. Setup Node.js 22
2. pnpm install (с кэшированием)
3. `pnpm lint` - ESLint
4. `pnpm typecheck` - TypeScript
5. `pnpm build` - Production build
6. `pnpm test:e2e` - Playwright тесты

**Кэширование**: pnpm store

### Docker Images CI

**Файл**: `.github/workflows/ci-images.yml`

**Триггеры**:
- `pull_request` (scan only, без push)
- `push` в `main`
- `release`
- `workflow_dispatch`

**Матрица сервисов**:
```yaml
services:
  - user
  - event
  - crew
  - payment
  - notification
  - media
  - gateway
```

**Что выполняется**:
1. Docker buildx setup
2. Login to GHCR (GitHub Container Registry)
3. Build образа для каждого сервиса
4. Trivy security scan
   - PR: информативный режим
   - main/release: fail на High/Critical
5. Syft SBOM generation (spdx-json format)
6. Push образов в GHCR (только main/release)
7. Upload security artifacts

**Артефакты**: `security-<service>-<sha>` (Trivy + SBOM)

### CodeQL Analysis

**Файл**: `.github/workflows/codeql.yml`

**Триггеры**:
- `push` в `main`
- `pull_request`
- Schedule: еженедельно (понедельник 00:00)

**Языки**:
- `java` (покрывает Java и Kotlin)
- `javascript` (покрывает JS/TS)
- `python`

**Что выполняется**:
1. Initialize CodeQL
2. Autobuild (Java) / Manual build (если нужно)
3. Perform CodeQL Analysis
4. Upload results to GitHub Security

### Commitlint

**Файл**: `.github/workflows/commitlint.yml`

**Триггеры**:
- `pull_request` (проверка заголовка PR)
- `push` (проверка commit messages)

**Что выполняется**:
- Проверка соответствия Conventional Commits
- Формат: `type(scope): subject`
- Разрешенные типы: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `revert`

### Labeler & Label Sync

**Файлы**: `.github/workflows/labeler.yml`, `.github/workflows/label-sync.yml`

**Labeler**:
- Автоматическая простановка меток на PR по измененным путям
- Конфиг: `.github/labeler.yml`
- Метки: `backend`, `frontend`, `docs-changed`, `ci`, etc.

**Label Sync**:
- Синхронизация списка меток репозитория
- Источник: `.github/labels.yml`
- Триггер: изменения в `labels.yml` или `workflow_dispatch`

### Release

**Файл**: `.github/workflows/release.yml`

**Триггеры**:
- `push` тэгов `v*` (например, `v1.0.0`)
- `workflow_dispatch` (ручной запуск)

**Что выполняется**:
1. Создание GitHub Release
2. Автогенерация release notes
3. Опция draft release
4. Прикрепление артефактов (опционально)

**Пример**:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Docs CI/CD

**Файл CI**: `.github/workflows/docs-ci.yml`
**Файл Deploy**: `.github/workflows/docs-deploy.yml`

**Docs CI** (на PR):
- Сборка MkDocs
- Проверка ссылок
- Upload артефакта `site`

**Docs Deploy** (на push в main):
- Сборка MkDocs
- Деплой на GitHub Pages
- URL: `https://<org>.github.io/<repo>/`

## Dependency Lock Check

**Файл**: Backend CI содержит job `Lock Check`

**Что делает**:
1. Генерирует lock-файлы для всех модулей: `./gradlew dependencies --write-locks`
2. Проверяет, что `gradle.lockfile` не изменились
3. Если изменились - job падает с подсказкой

**Исправление**:
```bash
# Обновить lock файлы
make deps-lock

# Или вручную
./gradlew dependencies --write-locks

# Закоммитить изменения
git add */gradle.lockfile
git commit -m "chore: update dependency locks"
```

**Оптимизация**: Job запускается только при изменениях в Gradle файлах

## Security Scanning

### Trivy (Docker Images)

- **Режим PR**: информативный, не блокирует merge
- **Режим main/release**: fail на HIGH/CRITICAL уязвимостях
- **Отчеты**: SARIF format → GitHub Security tab
- **Артефакты**: сохраняются для каждого образа

### OWASP Dependency Check

```bash
# Локально
./gradlew dependencyCheckAnalyze

# Отчет: build/reports/dependency-check-report.html
```

### SBOM Generation

- **Инструмент**: Syft
- **Формат**: SPDX JSON
- **Хранение**: GitHub Actions artifacts
- **Использование**: supply chain security, compliance

## Ручной запуск (workflow_dispatch)

Все ключевые пайплайны поддерживают запуск из UI:

**Actions → Run workflow**:
- Backend CI
- Frontend CI
- CodeQL
- Commitlint
- Docs CI
- Docs Deploy
- Release (с параметрами: `tag`, `draft`)

## Best Practices

### Security

- **Минимальные permissions**: обычно `contents: read`
- **Pin actions по SHA**: безопасность + стабильность
  ```yaml
  - uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608 # v4
  ```
- **Dependabot для actions**: автообновления через PR
- **Secrets management**: используйте GitHub Secrets, не хардкодьте

### Performance

- **Кэширование**:
  - Gradle: dependencies + build cache
  - pnpm: store cache
  - Docker: layer caching с buildx
- **Concurrency groups**: предотвращение дублей
  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
  ```
- **Path filters**: запуск только при изменении релевантных файлов

### Reliability

- **Gradle Wrapper Validation**: проверка целостности wrapper
- **Матричные стратегии**: параллельная сборка сервисов
- **Fail-fast**: быстрое обнаружение проблем
- **Артефакты**: сохранение важных отчетов и логов

### Documentation

- **Docs-as-Code**: вся документация в `/docs`
- **Сборка в CI**: проверка на PR
- **Автодеплой**: GitHub Pages с main
- **Link checking**: проверка битых ссылок

CodeQL: языки и расширение
- По умолчанию включены `java` (покрывает Java и Kotlin), `javascript` (покрывает JS/TS) и `python`.
- Чтобы добавить другие языки (например, `go`, `ruby`, `csharp`, `swift`), отредактируйте шаг `Initialize CodeQL`:
  `languages: java,javascript,python,go`

## Локальная валидация

### Backend

```bash
# Полная проверка как в CI
./gradlew clean build

# Только тесты
./gradlew test

# Security scan
./gradlew dependencyCheckAnalyze
```

### Frontend

```bash
cd frontend

# Установка зависимостей (frozen lockfile)
pnpm i --frozen-lockfile

# Полная проверка как в CI
pnpm lint && pnpm typecheck && pnpm build

# E2E тесты
pnpm test:e2e
```

### Docker

```bash
# Build всех образов
make build-images

# Security scan
make scan

# SBOM
make sbom
```

## Release Process

### Semantic Versioning

Проект следует [SemVer](https://semver.org/):
- **MAJOR**: breaking changes
- **MINOR**: новый функционал (обратная совместимость)
- **PATCH**: bug fixes

### Создание релиза

```bash
# 1. Обновить версию в version.properties
version.major=1
version.minor=0
version.patch=0
version.suffix=

# 2. Создать тег
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. Push тега
git push origin v1.0.0

# 4. GitHub Actions автоматически создаст Release
```

### Hotfix процесс

```bash
# 1. Создать hotfix ветку от тега
git checkout -b hotfix/v1.0.1 v1.0.0

# 2. Исправить проблему
# ... fixes ...

# 3. Обновить версию (patch)
version.patch=1

# 4. Commit, tag, push
git commit -m "fix: critical bug"
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin v1.0.1
```

## Monitoring & Alerts

### GitHub Status

- **Actions tab**: просмотр всех запусков
- **Security tab**: результаты CodeQL, Dependabot
- **Insights → Dependency graph**: SBOM и уязвимости

### Notifications

Настройка в Settings → Notifications:
- **Failed workflows**: email/Slack
- **Security alerts**: немедленно
- **Dependabot PRs**: дайджест

### Metrics

Отслеживайте:
- Build success rate
- Average build time
- Time to merge (PR cycle time)
- Security findings

## Troubleshooting

### Build fails в CI, но работает локально

```bash
# Очистить локальный кэш
./gradlew clean --no-build-cache

# Проверить версию Java
java -version  # должна быть 21

# Проверить Gradle wrapper
./gradlew wrapper --gradle-version 8.5
```

### Docker build fails

```bash
# Проверить Dockerfile
docker build -f backend-infra/docker/images/user.Dockerfile .

# Проверить buildx
docker buildx ls
```

### Dependency lock check fails

```bash
# Обновить lock файлы
make deps-lock

# Commit изменения
git add */gradle.lockfile
git commit -m "chore: update gradle locks"
```

## См. также

- [Deployment Guide](deployment.md) - процесс деплоя
- [Monitoring](monitoring.md) - мониторинг сервисов
- [Security Policy](policies/security.md) - политика безопасности
