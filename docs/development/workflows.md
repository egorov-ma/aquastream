# Development Workflows

## Git Workflow

### Branching Strategy

```
main                    # Стабильная ветка, production-ready
├── develop             # Интеграционная ветка (опционально)
├── feature/XXX-description  # Новый функционал
├── fix/XXX-description      # Bug fixes
└── hotfix/vX.X.X           # Критичные исправления
```

### Feature Development

```bash
# 1. Создать ветку от main
git checkout main
git pull origin main
git checkout -b feature/AUTH-123-add-telegram-verification

# 2. Разработка
# ... commits ...

# 3. Push и создание PR
git push origin feature/AUTH-123-add-telegram-verification

# 4. Code review
# Получить approval

# 5. Merge в main
# Через GitHub UI (Squash and merge)
```

### Commit Messages (Conventional Commits)

**Формат**: `type(scope): subject`

**Типы**:
- `feat`: новый функционал
- `fix`: исправление бага
- `docs`: документация
- `style`: форматирование
- `refactor`: рефакторинг
- `test`: тесты
- `build`: система сборки
- `ci`: CI/CD
- `chore`: прочие задачи
- `perf`: оптимизация

**Примеры**:
```bash
feat(auth): add telegram bot integration
fix(payment): resolve webhook idempotency issue
docs: update API documentation
refactor(event): extract booking logic to service
test(user): add integration tests for registration
```

**Validation**: commitlint в CI проверяет формат

## Release Workflow

### Semantic Versioning

Проект следует [SemVer](https://semver.org/):
- **MAJOR.MINOR.PATCH[-SUFFIX]**
- Пример: `1.2.3-SNAPSHOT`

### Управление версиями (version.properties)

```properties
version.major=1
version.minor=0
version.patch=0
version.suffix=SNAPSHOT
```

**Формула**: `{major}.{minor}.{patch}[-{suffix}]`

### Процесс релиза

#### 1. Подготовка

```bash
# Выполнить релизную Gradle-задачу
./gradlew releasePatch  # или releaseMinor / releaseMajor

# Gradle создаст commit и тег vX.Y.Z
```

#### 2. Push и деплой

```bash
# Push изменений и тега (Gradle уже создал)
git push origin main --follow-tags

# GitHub Actions автоматически:
# - Создаст GitHub Release
# - Соберет Docker образы
# - Опубликует в GHCR
# - Задеплоит (если настроено)
```

#### 3. Следующая версия

```bash
# Перевести проект на следующую версию (например, MINOR)
./gradlew releaseMinor

# Push
git push origin main --follow-tags
```

### Hotfix Process

```bash
# 1. Создать ветку от тега
git checkout -b hotfix/v1.0.1 v1.0.0

# 2. Исправить проблему
# ... fixes ...

# 3. Выполнить релизную задачу (patch)
./gradlew releasePatch

# 4. Push и PR
git push origin hotfix/v1.0.1 --follow-tags

# 5. После ревью: merge в main
git checkout main
git merge hotfix/v1.0.1
git push origin main
```

## Git Hooks

### Pre-commit Hooks

**Документация** (`.githooks/docs-pre-commit-config.yaml`):
```bash
# Установка
pip install pre-commit
pre-commit install --config .githooks/docs-pre-commit-config.yaml

# Ручной запуск
pre-commit run --config .githooks/docs-pre-commit-config.yaml --all-files
```

**Проверки**:
- markdownlint - синтаксис и стиль Markdown
- cSpell - орфография
- Vale - качество текста
- Lychee - работоспособность ссылок

**Инфраструктура** (`.githooks/infra-pre-commit-hook`):
```bash
# Установка
cp .githooks/infra-pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Проверки**:
- docker-compose: запрет `:latest`, проверка секретов
- Shell scripts: `bash -n` + auto `chmod +x`
- YAML: синтаксис через `yq`
- Dockerfile: `hadolint`

### Commit-msg Hook

**Commitlint** (`.githooks/commitlint.config.js`):
- Проверка Conventional Commits формата
- Разрешенные типы: feat, fix, docs, style, refactor, test, build, ci, chore, perf, revert

## Issue Management

### Issue Templates

**Типы** (`.github/ISSUE_TEMPLATE/`):
- `bug_report.yml` - баг репорт
- `feature_request.yml` - запрос функционала
- `config.yml` - настройки (ссылки, disable blank issues)

### Labels

**Стандартные метки**:
- `bug`, `enhancement`, `documentation`, `question`
- `help wanted`, `good first issue`
- `duplicate`, `invalid`, `wontfix`
- `dependencies` (Dependabot)
- `ci`, `infra`, `security`, `performance`, `refactor`, `tests`
- `blocked`, `breaking-change`

**Автоматизация**:
- `.github/labeler.yml` - авто-метки по путям
- `.github/labels.yml` - синхронизация списка меток
- Workflow: `labeler.yml`, `label-sync.yml`

**Примеры авто-меток**:
```yaml
docs-changed:
  - docs/**
  - '**/*.md'
  
backend:
  - 'backend-*/**'
  
frontend:
  - 'frontend/**'
```

## Code Review Process

### Checklist для reviewer

- [ ] Код соответствует style guides
- [ ] Тесты добавлены/обновлены
- [ ] Документация обновлена
- [ ] CI проходит успешно
- [ ] Нет hardcoded секретов
- [ ] Не оставляем пометки в коде без соответствующего issue
- [ ] Breaking changes описаны

### Approval Requirements

- **Feature**: минимум 1 approval
- **Hotfix**: минимум 1 approval (может быть expedited)
- **Breaking change**: минимум 2 approvals

## Dependency Updates

### Регулярное обновление

```bash
# 1. Проверить доступные обновления
./gradlew dependencyUpdates

# 2. Обновить версии в build.gradle
# Редактировать ext.* версии

# 3. Обновить dependency locks
./gradlew dependencies --write-locks

# Или через Make
make deps-lock

# 4. Тестировать
./gradlew clean build test

# 5. Commit
git add build.gradle */gradle.lockfile
git commit -m "chore(deps): update spring boot to 3.3.6"
```

### Dependabot

- Автоматические PR для обновлений
- Метка `dependencies`
- Auto-merge для patch updates (опционально)

## См. также

- [Style Guides](style-guides.md) - стандарты кода
- [Testing](testing.md) - тестирование
- [CI/CD](../operations/ci-cd.md) - continuous integration
