# Управление версиями

---
title: Version Management
summary: Политика управления версиями и релизами AquaStream.
tags: [operations, release-management, semver]
---

## Подход к версиям

AquaStream использует **Semantic Versioning (SemVer)** в формате `MAJOR.MINOR.PATCH`.

- **MAJOR** — несовместимые изменения API или контрактов.
- **MINOR** — новая функциональность без нарушений обратной совместимости.
- **PATCH** — исправления ошибок и мелкие улучшения.

Версия хранится в файле `version.properties` и автоматически подставляется в Gradle и Docker образы.

## Правила повышения версии

| Тип изменения | Версия | Требования |
|---------------|---------|------------|
| Ломающие изменения (breaking changes) | `MAJOR++` | ADR/документация, миграционный план |
| Новые фичи, совместимые по API | `MINOR++` | Обновление документации, тесты |
| Фиксы, улучшения без нового API | `PATCH++` | Regression тесты |

> ⚠️ Повышение версий выполняется только после успешного прохождения CI/CD пайплайна.

## Workflow релизов

1. **Release branch**: `release/x.y.z` (создаётся из `main`).
2. **Stabilization**: только фиксы, freeze на новые фичи.
3. **Version bump**: обновить `version.properties` + changelog.
4. **Release tag**: `git tag -s vX.Y.Z` (подписанный).
5. **Merge**: `release/x.y.z → main` (fast-forward), затем `main → develop`.
6. **Artifacts**: Docker образы `ghcr.io/aquastream/<service>:vX.Y.Z` + документация.

## Инструменты

```bash
# Проверить текущую версию
./gradlew printVersion

# Повысить PATCH версию
./gradlew releasePatch

# Повысить MINOR версию
./gradlew releaseMinor

# Повысить MAJOR версию
./gradlew releaseMajor
```

Скрипты обновляют `version.properties`, создают git tag и пушат в origin.

## Чек-лист перед релизом

- [ ] Все CI пайплайны Green (`backend-ci`, `frontend-ci`, `docs-ci`).
- [ ] Обновлены ADR/документация.
- [ ] Проверены миграции БД.
- [ ] Сгенерирован changelog (`make changelog`).
- [ ] Обновлены Docker тэги и опубликованы образы.
- [ ] Создан GitHub Release с артефактами.

## Пост-релизные действия

- [ ] Мониторинг критичных метрик (latency, error rate).
- [ ] Smoke тесты в production (`make smoke-prod`).
- [ ] Создать issue для улучшений/обратной связи.
- [ ] Запланировать post-mortem при инцидентах.

## Дополнительно

- Руководство по деплою: [Deployment](deployment.md)
- Политики инцидентов: [Incident Response](runbooks/incident-response.md)
- Стратегия тестирования: [QA Strategy](../qa/index.md)
