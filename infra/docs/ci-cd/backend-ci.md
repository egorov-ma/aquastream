## Backend CI

Этот workflow проверяет и собирает все backend-сервисы проекта.

```yaml
name: Backend CI
```

Основные job-ы:
1. **test** – unit-тесты с кэшированием Gradle и выгрузкой отчётов.
2. **build** – сборка JAR-файлов после тестов, публикация артефактов.
3. **compose-validate** – валидация `docker-compose.full.yml`.

Workflow настроен с минимальными правами (`contents: read`, `actions: write`) и
использует `concurrency` для отмены повторяющихся запусков.

# Local Docker workflow

```bash
./run.sh build   # compile backend & frontend and build images
./run.sh start   # start stack (waits for healthchecks)
./run.sh logs api-gateway   # follow logs of a service
./run.sh stop    # stop & cleanup
```

Service was renamed from `planning-service` to `event-service` inside `docker-compose.full.yml`.
