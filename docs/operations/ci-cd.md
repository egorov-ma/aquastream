# CI/CD

Ниже описан минималистичный и типовой пайплайн GitHub Actions для проекта.
Он чистый, предсказуемый и легко переносится в другие репозитории.

Состав
- Backend CI: сборка и тесты Gradle для `backend-*` модулей.
- Docker Images CI: buildx + Trivy (PR — информативно, main/release — fail по High/Critical) и публикация образов в GHCR по матрице сервисов; Syft генерирует SBOM (`spdx-json`).
- Frontend CI: линт, typecheck и билд фронтенда (`frontend/`).
- CodeQL: статический анализ безопасности для Java/Kotlin, JavaScript/TypeScript и Python.
- Dependabot: автоматические PR с обновлениями зависимостей и actions.
- Labeler/Label sync: автоматическая простановка и синхронизация меток.
- Release: создание GitHub Release по тэгам `v*`.
- Docs-as-Code: сборка документации на PR и деплой на GitHub Pages с ветки `main`.

Файлы workflow
- `.github/workflows/backend-ci.yml`: сборка backend (JDK 21, Gradle cache).
- `.github/workflows/ci-images.yml`: матричная сборка/публикация Docker образов и Trivy scan на PR.
- `.github/workflows/frontend-ci.yml`: Node 22 + pnpm, lint/typecheck/build.
- `.github/workflows/codeql.yml`: анализ кода (расписание + PR/Push) для Java/Kotlin, JS/TS и Python.
- `.github/workflows/commitlint.yml`: проверка Conventional Commits.
- `.github/workflows/labeler.yml` и `label-sync.yml`: автоматизация меток.
- `.github/workflows/release.yml`: релиз при пуше тэгов `v*` или ручном запуске.
- `.github/workflows/docs-ci.yml`: сборка документации (MkDocs) на PR/Push, артефакт `site`.
- `.github/workflows/docs-deploy.yml`: деплой документации на GitHub Pages при пуше в `main`.

Триггеры
- Backend/Frontend CI: `push` и `pull_request` с фильтрами путей.
- Docker Images CI: `pull_request` (без push), `push` в `main`, `release`, `workflow_dispatch`.
- CodeQL: `push`, `pull_request`, по расписанию (раз в неделю).
- Release: `push` тэгов `v*`.
- Labeler: `pull_request_target` (синхронизация меток на PR).
- Docs CI: `pull_request` и `push` при изменениях в `docs/**`, `mkdocs.yml`, `requirements-docs.txt`, `tools/**`.
- Docs Deploy: `push` в `main` по тем же путям.

Ручной запуск (workflow_dispatch)
- Все ключевые пайплайны поддерживают запуск из вкладки Actions → Run workflow:
  - Backend CI, Frontend CI, CodeQL, Commitlint, Docs CI, Docs Deploy, Release
- Release вручную:
  - Укажите `tag` (например, `v1.2.3`) и опционально `draft`.
  - Если `tag` не указан, запуск сработает только из контекста тега (`push` тега).

Лучшие практики
- Минимальные `permissions` (обычно `contents: read`).
- `concurrency` для предотвращения одновременных дублей.
- Кэширование Gradle и pnpm для ускорения.
- Проверка Gradle Wrapper (`gradle/wrapper-validation-action`) в Backend CI.
- Пинование GitHub Actions по SHA для безопасности (обновления через PR).
- Артефакты безопасности: `security-<service>-<sha>` (Trivy отчёты + Syft SBOM) сохраняются для каждого образа.
- При желании автоматизировать обновления pinned SHA для actions, добавьте комментарий с мажорной версией рядом с SHA (формат `# vX`) — Dependabot сможет предлагать обновления внутри мажорной линии.
- Docs-as-Code: держите всё в `/docs`, сборка в CI, деплой с `main`.

CodeQL: языки и расширение
- По умолчанию включены `java` (покрывает Java и Kotlin), `javascript` (покрывает JS/TS) и `python`.
- Чтобы добавить другие языки (например, `go`, `ruby`, `csharp`, `swift`), отредактируйте шаг `Initialize CodeQL`:
  `languages: java,javascript,python,go`

Быстрый старт локально
- Backend: `./gradlew clean build`
- Frontend: `cd frontend && pnpm i --frozen-lockfile && pnpm lint && pnpm exec tsc --noEmit && pnpm build`

Политики и процессы
- Security: см. DevOps → Security Policy.
- Code of Conduct и Support: см. DevOps → Policies.

Release процесс
- Теги формата `vMAJOR.MINOR.PATCH` запускают релиз:
  - Пример: `git tag -a v0.1.0 -m "Release v0.1.0" && git push origin v0.1.0`
  - Workflow `release.yml` создаёт GitHub Release с автогенерацией release notes.
  - Версионирование выбирайте по вашим правилам (SemVer рекомендуется).

Commitlint (строгий)
- Все коммиты и заголовок PR должны соответствовать Conventional Commits.
- CI упадёт при нарушении формата. Рекомендуемый вид: `type(scope): subject`.
