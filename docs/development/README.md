---
title: Development Overview
summary: Как развернуть окружение, собирать проект и следовать рабочим процессам в AquaStream.
tags: [development]
---

# Development Overview

## Куда идти дальше

| Документ | Описание |
|----------|----------|
| [Setup](setup.md) | Развернуть локальное окружение, зависимости, env-файлы |
| [Build Guide](build-guide.md) | Архитектура системы сборки, Gradle/Docker команды |
| [Workflows](workflows.md) | Git-процессы, релизы, hotfix и коммиты |
| [Style Guides](style-guides.md) | Конвенции кодирования, коммиты, документация |
| [Troubleshooting](troubleshooting.md) | Решение типичных проблем при разработке |

## Общие ссылки

- Архитектура: [docs/architecture.md](../architecture.md)
- Ops и эксплуатация: [docs/operations/](../operations/README.md)
- Backend overview: [docs/backend/](../backend/README.md)
- **Тестирование**: [QA & Testing](../qa/testing.md) - команды, планы, best practices
- QA стратегия: [docs/qa/](../qa/index.md)

## Принципы

- **Doc as Code** — документация обновляется вместе с кодом. Перед PR проверяем `make docs-build`.
- **Single Source of Truth** — ссылки на профильные разделы, без копирования текста.
- **Automation First** — используем `make`/Gradle/npm скрипты вместо ручных команд.
