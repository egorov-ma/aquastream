## Backend CI

Этот workflow проверяет и собирает все backend-сервисы проекта.

```yaml
name: Backend CI
```

Основные job-ы:
1. **test** – unit-тесты с кэшированием Gradle и выгрузкой отчётов.
2. **build** – сборка JAR-файлов после тестов, публикация артефактов.
3. **compose-validate** – валидация `docker-compose.yml`.
