---
title: CI/CD Pipeline
summary: GitHub Actions для автоматизации сборки, тестирования, security scanning и деплоя
tags: [operations, ci-cd, github-actions, automation]
---

# CI/CD Pipeline

## Обзор

GitHub Actions pipeline для автоматизации сборки, тестирования, security scanning и деплоя.

## Workflow Компоненты

| Workflow | Файл | Триггер | Шаги | Артефакты |
|----------|------|---------|------|-----------|
| **Backend CI** | `backend-ci.yml` | `push`/`pr` на backend paths | Gradle build, test, lock check | Test reports |
| **Frontend CI** | `frontend-ci.yml` | `push`/`pr` на `frontend/**` | pnpm lint/typecheck/build/test | - |
| **Docker Images** | `ci-images.yml` | `pr`/`push`/`release` | Build, Trivy scan, SBOM, push (GHCR) | Security reports, SBOM |
| **CodeQL** | `codeql.yml` | `push`/`pr`/weekly | Analyze java/js/python | Security findings |
| **Commitlint** | `commitlint.yml` | `push`/`pr` | Validate Conventional Commits | - |
| **Labeler** | `labeler.yml` | `pr` opened | Auto-label by paths | - |
| **Label Sync** | `label-sync.yml` | `labels.yml` changes | Sync repo labels | - |
| **Release** | `release.yml` | Tag `v*` pushed | Create GitHub Release | Release notes |
| **Docs CI** | `docs-ci.yml` | `pr` на docs | Build MkDocs, check links | Static site |
| **Docs Deploy** | `docs-deploy.yml` | `push` to main | Deploy to GitHub Pages | - |

### Как читать таблицу

- Подробные скрипты и параметры смотрите прямо в файлах workflow (`.github/workflows/<name>`).
- Любые изменения pipeline проходят через Pull Request и ревью — соблюдаем принцип *Docs as Code*.
- Если нужен ручной запуск, используйте `workflow_dispatch` в интерфейсе GitHub Actions.

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

#### CodeQL языки
- По умолчанию включены `java` (Java/Kotlin), `javascript` (JS/TS) и `python`.
- Дополнительные языки (например, `go`, `ruby`, `csharp`, `swift`) добавляются в шаге `Initialize CodeQL`: `languages: java,javascript,python,go`.

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

## Release process

См. [Version Management](version-management.md) для повышения версий и постановки тегов. Workflow `release.yml` автоматически публикует GitHub Release при пуше тега `v*`.

### Hotfix процесс

```bash
# 1. Создать hotfix ветку от тега
git checkout -b hotfix/v1.0.1 v1.0.0

# 2. Исправить проблему
# ... fixes ...

# 3. Повысить версию (patch)
./gradlew releasePatch

# 4. Запушить ветку (Gradle задача уже создала тег)
git push origin hotfix/v1.0.1
```

## Monitoring & Alerts

### GitHub Status

- **Actions tab**: просмотр всех запусков
- **Security tab**: результаты CodeQL, Dependabot
- **Insights → Dependency graph**: SBOM и уязвимости

### Notifications

Настройки GitHub Notifications:
- **Failed workflows**: email
- **Security alerts**: немедленно
- **Dependabot PRs**: digest раз в неделю

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
- [Infrastructure](infrastructure.md) - компоненты инфраструктуры
