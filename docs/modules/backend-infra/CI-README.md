# CI/CD (GitHub Actions)

## Workflows
- `.github/workflows/backend-ci.yml` — сборка и тесты Gradle для всех `backend-*` модулей.
- `.github/workflows/ci-images.yml` — матричная сборка Docker‑образов (PR: build+Trivy, push/main/release: публикация в GHCR с тегами `sha-*`, `v*`, `latest`).
- `.github/workflows/frontend-ci.yml` — pnpm lint/typecheck/build для фронтенда.
- `.github/workflows/docs-ci.yml` — строгая сборка MkDocs на PR и пушах.
- `.github/workflows/docs-deploy.yml` — деплой документации на GitHub Pages из `main`.
- `.github/workflows/codeql.yml` — анализ безопасности для Java/Kotlin, JS/TS и Python.
- `.github/workflows/commitlint.yml` — проверка Conventional Commits и заголовков PR.
- `.github/workflows/labeler.yml` и `.github/workflows/label-sync.yml` — автоматизация меток в PR и синхронизация набора меток.
- `.github/workflows/release.yml` — GitHub Release по тегам `v*` или ручному запуску.

## Secrets
- `GITHUB_TOKEN` — встроенный (GHCR push).
- (Опционально) `REGISTRY_USERNAME`, `REGISTRY_TOKEN` — для внешнего реестра.

## Образы
- Push в `main`: `ghcr.io/<owner>/aquastream-backend-<service>:sha-<short>`.
- Теги `vX.Y.Z` и события Release: добавляются теги `:vX.Y.Z` и `:latest` поверх `sha-*`.

## Требования к сервисам
- Должен существовать Dockerfile (пример: `backend-gateway/Dockerfile`).
- Gradle build создаёт fat jar `build/libs/<service>-*.jar`.

## Security & SBOM
- Trivy (PR: информативный отчёт, Push/Release: фейл по High/Critical) — результаты в артефактах `security-<service>-<sha>`.
- Syft (SBOM `spdx-json`) формируется для каждого образа и прикладывается в те же артефакты.

Все workflow используют ограниченные `permissions`, `concurrency` и кэш Gradle/pnpm/pip для повторяемости.
