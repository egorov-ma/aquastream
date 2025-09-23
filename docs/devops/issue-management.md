# Issue management

## Зачем нужны templates
Файлы в `.github/ISSUE_TEMPLATE/` задают шаблоны при создании issue в GitHub UI. Это помогает авто‑структурировать описание бага или фичи и экономит время на уточнения.

## Что есть
- `bug_report.yml` — поля для описания, шагов воспроизведения, логов и версии.
- `feature_request.yml` — мотивация, предложение, альтернативы.
- `config.yml` — отключает «пустые» issue и показывает полезные ссылки (на документацию и политику безопасности).

## Стандартные метки
Используем типовой набор меток для задач и PR:
- `bug` — ошибка/дефект
- `enhancement` — улучшение/функционал
- `documentation` — задачи по документации
- `question` — вопрос/уточнение
- `help wanted`, `good first issue` — для вовлечения контрибьюторов
- `duplicate`, `invalid`, `wontfix` — служебные статусы
- `dependencies` — обновления зависимостей (Dependabot)
- `ci`, `infra`, `security`, `performance`, `refactor`, `tests`, `blocked`, `breaking-change` — проектные метки

## Как это работает
1. Нажмите «New issue» в репозитории.
2. Выберите подходящий шаблон (Bug/Feature).
3. Заполните обязательные поля — это повысит качество и скорость triage.

## Автоматические метки
- Файл `.github/labeler.yml` + workflow `labeler.yml` ставят метки на PR по путям:
  - `docs-changed` — изменения в `docs/**`, `*.md`, `mkdocs.yml`
  - `ci` — изменения в `.github/workflows/**`
  - `backend` — изменения в `backend-*/**`, `backend-common/**`
  - `frontend` — изменения в `frontend/**`
- Dependabot PR отмечаются меткой `dependencies` (см. `.github/labels.yml`).

## Синхронизация набора меток репозитория
- Workflow `.github/workflows/label-sync.yml` поддерживает список меток (имя/цвет/описание) в актуальном состоянии на основе `.github/labels.yml`.
- Триггеры: при изменении `.github/labels.yml` в `main` и вручную через "Run workflow".
- Зачем: единообразные метки во всех репозиториях без ручного редактирования в Settings → Labels.
