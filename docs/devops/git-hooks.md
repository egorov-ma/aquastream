# Git Hooks

Git hooks для автоматизации качества кода и инфраструктуры в репозитории.

## Структура

Все Git hooks находятся в каталоге `.githooks/` для лучшей организации.

## 1. Docs Pre-commit Hooks

**Файл**: `.githooks/docs-pre-commit-config.yaml`

**Назначение**: Автоматическая проверка качества документации перед каждым коммитом.

**Проверки**:
- **markdownlint** - синтаксис и стиль Markdown
- **cSpell** - орфография
- **Vale** - качество прозы, терминология
- **Lychee** - работоспособность ссылок

**Установка**:
```bash
# Установить pre-commit
pip install pre-commit

# Активировать хуки документации
pre-commit install --config .githooks/docs-pre-commit-config.yaml

# Или запустить вручную
pre-commit run --config .githooks/docs-pre-commit-config.yaml --all-files
```

## 2. Infrastructure Pre-commit Hook

**Файл**: `.githooks/infra-pre-commit-hook`

**Назначение**: Custom bash скрипт для валидации инфраструктурных файлов перед коммитом.

**Установка** (если нужен):
```bash
# Скопировать в .git/hooks/
cp .githooks/infra-pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Как работает

При `git commit` автоматически запускаются проверки. Если есть ошибки - коммит блокируется до их исправления.

## Конфигурации инструментов

### Качество документации
Все конфигурации инструментов качества документации находятся в `docs/docs-tools/`:

- `.markdownlint.jsonc` - настройки markdownlint
- `cspell.json` - словарь и правила cSpell
- `.vale.ini` + `.vale/` - конфигурация Vale
- `lychee.toml` - настройки проверки ссылок

### Качество коммитов
**Файл**: `.githooks/commitlint.config.js`

**Назначение**: Автоматическая проверка формата commit-сообщений по стандарту [Conventional Commits](https://conventionalcommits.org/).

**Разрешенные типы коммитов**:
- `feat` - новая функциональность
- `fix` - исправление багов
- `docs` - изменения в документации
- `style` - форматирование кода
- `refactor` - рефакторинг
- `test` - тесты
- `build` - система сборки
- `ci` - CI/CD настройки
- `chore` - прочие задачи
- `perf` - оптимизация производительности
- `revert` - откат изменений

**Примеры валидных коммитов**:
```
feat(auth): add user registration endpoint
fix(payment): resolve calculation rounding error
docs: update API documentation
```

## Результат

Гарантирует высокое качество документации и инфраструктуры в репозитории автоматически.

См. также: [CI/CD](./ci-cd.md)
