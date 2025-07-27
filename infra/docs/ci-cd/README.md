# CI/CD для AquaStream

Данный документ описывает процесс непрерывной интеграции и доставки (CI/CD) проекта AquaStream, реализованный при помощи GitHub Actions.

## Обзор архитектуры

```
[Разработчик] → push / PR → GitHub Actions →  🧪  Тесты  →  🏗  Сборки  →  📦  Артефакты  →  🚀  Деплой
```

Для каждого слоя системы (backend, frontend) настроены отдельные пайплайны проверки и сборки. Деплой выполняется отдельным workflow и запускается вручную (или из других workflow в будущем).

| Workflow | Назначение | Триггеры |
|----------|-----------|----------|
| `backend-ci.yml`   | Сборка и тестирование серверной части, валидация `docker-compose.yml` | push / PR → ветки `main`, `develop` |
| `frontend-ci.yml`  | TSLint, type-check, unit-тесты, генерация отчётов покрытия, сборка фронтенда | push / PR, изменения внутри `frontend/` |
| `deploy.yml`       | Сборка Docker-образов всего проекта и деплой (заглушка) | ручной запуск (`workflow_dispatch`) |

---

## `backend-ci.yml`

```yaml
name: Backend CI
```

### Структура job-ов

1. **test** – запускает unit-тесты всех модулей backend-части.
   - Поддерживается кэш Gradle.
   - Результаты тестов загружаются как artifact `backend-test-reports`.
2. **build** – сборка JAR-файлов (`./gradlew build -x test`) после успешных тестов.
   - Артефакт: `backend-build` со всеми JAR-ами.
3. **compose-validate** – проверяет корректность файла `infra/docker/compose/docker-compose.yml` при помощи `docker compose config`.

### Кэширование

Используется встроенный кэш Gradle (`actions/setup-java@v4 cache: 'gradle'`). Это ускоряет повторные сборки.

---

## `frontend-ci.yml`

```yaml
name: Frontend CI
```

Workflow запускается при изменениях внутри каталога `frontend/`.

### build-test job

- Устанавливается Node.js 18.x.
- Кэшируются зависимости `npm`.
- Выполняются:
  1. `npm run lint` – линтинг ESLint.
  2. `tsc --noEmit` – статическая проверка типов.
  3. `npm run test:ci` – юнит-тесты + отчёт покрытия.
  4. Генерация бейджей покрытия (`scripts/generate-coverage-badge.js`).
  5. `npm run build` – прод-сборка Vite.
- Итоговые артефакты:
  - `coverage-report` – отчёты покрытия.
  - `frontend-build` – папка `dist/`.

---

## `deploy.yml`

Пока содержит только заглушку.

1. Клонирует репозиторий.
2. Настраивает Docker Buildx.
3. Выполняет `docker compose build`, собирая все описанные в `infra/docker/compose/docker-compose.yml` образы.
4. **TODO**: добавить логин в Docker Registry, push образов и деплой (например, на Kubernetes/GitHub Environments).

---

## Как добавить новый workflow

1. Создайте файл в `.github/workflows/` с описанием.
2. Следуйте конвенциям имени: `<area>-ci.yml` для CI, `deploy-<env>.yml` для деплоя.
3. Используйте кэширование зависимостей (`actions/setup-java`, `actions/setup-node`) для ускорения.
4. Каждый workflow должен загружать полезные артефакты (build, отчёты) через `actions/upload-artifact`.

---

## Переменные и секреты

- **`GH_TOKEN`** – токен GitHub, автоматически доступен в раннерах (`secrets.GITHUB_TOKEN`).
- **`DOCKERHUB_USERNAME`** / **`DOCKERHUB_TOKEN`** – потребуются после добавления этапа публикации образов.
- **`KUBE_CONFIG`** – конфиг k8s-кластера, если деплой будет выполняться напрямую.

Настройте секреты в разделе *Settings → Secrets and variables → Actions*.

---

## Рекомендации по CI/CD

- Разделяйте тесты и сборку на разные job-ы, чтобы кэширование работало корректно.
- Старайтесь держать продолжительность CI < 10 минут.
- Фиксируйте версии action-ов (`@v4`, `@v3`), чтобы избежать неожиданных изменений.
- Используйте бейджи статуса в README модулей:
  ```markdown
  ![Backend CI](https://github.com/<ORG>/aquastream/actions/workflows/backend-ci.yml/badge.svg)
  ``` 