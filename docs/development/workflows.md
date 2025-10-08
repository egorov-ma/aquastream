# Development Workflows

## Git Workflow

**Branching Strategy**:
```
main              # Production-ready
├── feature/XXX   # Новый функционал
├── fix/XXX       # Bug fixes
└── hotfix/vX.X.X # Критичные исправления
```

**Feature Development**:
```bash
git checkout main && git pull origin main
git checkout -b feature/AUTH-123-add-telegram-verification
# ... commits ...
git push origin feature/AUTH-123-add-telegram-verification
# Create PR → Code review → Merge (Squash and merge)
```

## Commit Messages (Conventional Commits)

**Формат**: `type(scope): subject`

**Типы**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`

**Примеры**:
```bash
feat(auth): add telegram bot integration
fix(payment): resolve webhook idempotency issue
docs: update API documentation
test(user): add integration tests for registration
```

Validation: commitlint в CI проверяет формат.

## Release Workflow

**Semantic Versioning**: `MAJOR.MINOR.PATCH[-SUFFIX]` (например, `1.2.3-SNAPSHOT`)

**version.properties**:
```properties
version.major=1
version.minor=0
version.patch=0
version.suffix=SNAPSHOT
```

**Релиз**:
```bash
# 1. Подготовка
./gradlew releasePatch  # или releaseMinor / releaseMajor (создаст commit и тег)

# 2. Push
git push origin main --follow-tags

# GitHub Actions автоматически: Release, Docker образы, GHCR, deploy
```

**Hotfix**:
```bash
git checkout -b hotfix/v1.0.1 v1.0.0
# ... fixes ...
./gradlew releasePatch
git push origin hotfix/v1.0.1 --follow-tags
# PR → merge в main
```

## Git Hooks

**Документация** (`.githooks/docs-pre-commit-config.yaml`):
```bash
pip install pre-commit
pre-commit install --config .githooks/docs-pre-commit-config.yaml
```
Проверки: markdownlint, cSpell, Vale, Lychee

**Инфраструктура** (`.githooks/infra-pre-commit-hook`):
```bash
cp .githooks/infra-pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```
Проверки: docker-compose (запрет `:latest`, секреты), Shell scripts, YAML, Dockerfile (hadolint)

**Commitlint** (`.githooks/commitlint.config.js`): проверка Conventional Commits формата

## Issue Management

**Templates** (`.github/ISSUE_TEMPLATE/`): `bug_report.yml`, `feature_request.yml`

**Labels**: `bug`, `enhancement`, `documentation`, `ci`, `infra`, `security`, `performance`, `blocked`, `breaking-change`

**Автоматизация**: `.github/labeler.yml` (авто-метки по путям), `.github/labels.yml` (синхронизация)

## Code Review

**Checklist**:
- [ ] Код соответствует style guides
- [ ] Тесты добавлены/обновлены
- [ ] Документация обновлена
- [ ] CI проходит
- [ ] Нет hardcoded секретов
- [ ] Breaking changes описаны

**Approval**: Feature (1 approval), Hotfix (1 approval), Breaking change (2 approvals)

## Dependency Updates

```bash
# 1. Проверить обновления
./gradlew dependencyUpdates

# 2. Обновить версии в build.gradle (ext.* версии)

# 3. Обновить все lock файлы (root + вложенные модули)
make deps-lock

# 4. Тест
./gradlew clean build test

# 5. Commit
git commit -m "chore(deps): update spring boot to 3.3.6"
```

**Dependabot**: автоматические PR, метка `dependencies`, auto-merge для patch (опционально)

## См. также

- [Style Guides](style-guides.md)
- [Testing](testing.md)
- [CI/CD](../operations/ci-cd.md)