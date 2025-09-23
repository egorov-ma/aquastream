# CI/CD (GitHub Actions)

## Workflows
- `/.github/workflows/ci-service.yml` — reusable: Gradle build + unit + Liquibase dry-run + build/push image.
- `/.github/workflows/ci-matrix.yml` — запускает reusable для всех сервисов на push/PR.
- `/.github/workflows/release.yml` — по тегам `v*` собирает образы и создаёт GitHub Release.

## Secrets
- `GITHUB_TOKEN` — встроенный (GHCR push).
- (Опционально) `REGISTRY_USERNAME`, `REGISTRY_TOKEN` — для внешнего реестра.

## Образы
- main: `ghcr.io/<owner>/<image>:latest` и `:sha-<short>`.
- tags `vX.Y.Z`: `:vX.Y.Z` и `:latest`.

## Требования к сервисам
- Должен существовать Dockerfile (пример: `backend-gateway/Dockerfile`).
- Gradle build создаёт fat jar `build/libs/<service>-*.jar`.

Бейдж в `README.md` настроен на `ci-matrix.yml`.
