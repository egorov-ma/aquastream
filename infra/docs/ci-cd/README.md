# CI/CD для AquaStream

Документы этого раздела описывают процессы GitHub Actions, используемые для сборки и деплоя проекта.

| Workflow | Файл |
|----------|------|
| Backend CI | [backend-ci.md](backend-ci.md) |
| Frontend CI | [frontend-ci.md](frontend-ci.md) |
| Deploy | [deploy-ci.md](deploy-ci.md) |
| Workflow Lint | [workflow-lint.md](workflow-lint.md) |

Файлы содержат ключевые шаги каждого workflow и рекомендации по настройке.

Все пайплайны настроены с минимальными правами доступа. CI workflows используют
`actions: write` для загрузки артефактов и `contents: read` для получения
кода. Кроме того, добавлена директива `concurrency`, которая отменяет
одновременные запуски одного workflow для одной ветки.
