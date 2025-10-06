# Development Overview

---
title: Development Overview
summary: Как развернуть окружение, собирать проект и следовать рабочим процессам в AquaStream.
tags: [development]
---

## Куда идти дальше

| Документ | Описание |
|----------|----------|
| [Setup](setup.md) | Развернуть локальное окружение, зависимости, env-файлы |
| [Build Guide](build-guide.md) | Архитектура системы сборки, Gradle/Docker команды |
| [Workflows](workflows.md) | Git-процессы, релизы, hotfix и коммиты |
| [Style Guides](style-guides.md) | Конвенции кодирования, коммиты, документация |
| [Testing](testing.md) | Как запускать юнит/интеграционные/Frontend тесты |
| [Troubleshooting](troubleshooting.md) | Решение типичных проблем при разработке |

## Общие ссылки

- Архитектура: [docs/architecture.md](../architecture.md)
- Ops и эксплуатация: [docs/operations/](../operations/README.md)
- Backend overview: [docs/backend/](../backend/README.md)
- QA стратегия: [docs/qa/](../qa/index.md)

## Принципы

- **Doc as Code** — документация обновляется вместе с кодом. Перед PR проверяем `make docs-build`.
- **Single Source of Truth** — ссылки на профильные разделы, без копирования текста.
- **Automation First** — используем `make`/Gradle/npm скрипты вместо ручных команд.

---

Если в разделе чего-то не хватает — заводите issue или PR, чтобы все участники работали с актуальными инструкциями.
