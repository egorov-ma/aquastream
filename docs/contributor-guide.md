# Contributor Guide — Docs

---
title: Contributor Guide — Docs
summary: Как запускать docs локально, проходить проверки и вносить изменения по Doc as Code.
---

## Быстрый старт
- Установка: `make docs-setup`
- Предпросмотр: `make docs-serve`
- Сборка: `make docs-build`
- Линтеры: `make docs-lint`

## Что обновлять
- Код меняется → обновляйте релевантные `**/docs/**` или добавляйте лейбл `no-docs-needed` (см. drift‑guard).
- Контракты API → `make docs-api` (или просто `docs-build`, он включает генерацию).
- Диаграммы PlantUML → `make docs-diagrams` (или `docs-build`).

## Работа с API контрактами

### Создание OpenAPI спецификаций

Размещайте спецификации в `api-contracts/`. Проект содержит следующие категории API контрактов:

**Основные бизнес-API:**
- Управление пользователями, событиями, платежами, медиа
- Система уведомлений и экипажей
- Frontend HTTP API

**Административные и мониторинговые API:**
- Gateway администрирование и метрики
- Spring Boot Actuator для health checks

**Интеграционные API:**
- Webhook платежных провайдеров
- Telegram Bot интеграция
- Административное управление пользователями

```
api-contracts/
├── backend-crew-api.yaml              # Экипажи и команды
├── backend-event-api.yaml             # События и бронирования
├── backend-gateway-admin-api.yaml     # Администрирование Gateway
├── backend-gateway-metrics-api.yaml   # Метрики производительности
├── backend-media-api.yaml             # Управление медиафайлами
├── backend-notification-api.yaml      # Система уведомлений
├── backend-payment-api.yaml           # Платежи и транзакции
├── backend-user-api.yaml              # Аутентификация и профили
├── frontend-api.yaml                  # HTTP API фронтенда
├── payment-webhook-api.yaml           # Webhook платежных провайдеров
├── service-health-api.yaml            # Spring Boot Actuator (все сервисы)
├── telegram-bot-api.yaml              # Интеграция с Telegram Bot
└── user-admin-api.yaml                # Административное управление пользователями
```

### Структура спецификации

```yaml
openapi: 3.0.3
info:
  title: AquaStream <Service> API
  description: Микросервис <описание>
  version: 1.0.0
  contact:
    name: AquaStream Team
servers:
  - url: http://localhost:8XXX
    description: Development server
  - url: https://api.aquastream.org
    description: Production server

tags:
  - name: <Domain>
    description: <Описание домена>

paths:
  /api/v1/<resource>:
    # endpoints...

components:
  schemas:
    # DTOs...
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: JSESSIONID
```

### Автогенерация документации

```bash
# Генерация ReDoc HTML из OpenAPI
make docs-api

# Проверка в браузере
make docs-serve
# → http://localhost:8000/api/
```

Автоматически создается:
- `docs/api/specs/` — копии спецификаций
- `docs/api/redoc/` — ReDoc HTML страницы
- `docs/api/index.md` — индекс с таблицей

### Валидация в CI

OpenAPI спецификации проверяются автоматически:
- Синтаксис YAML
- Соответствие OpenAPI 3.0.3
- Ссылки и схемы

### Соответствие коду

Убедитесь что спецификация соответствует Swagger аннотациям в контроллерах:

```java
@Tag(name = "Authentication", description = "User authentication and session management")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Operation(summary = "Register new user")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<SimpleSuccessResponse> register(@Valid @RequestBody RegisterRequest request) {
        // ...
    }
}
```

### Workflow изменений

1. **Изменить контроллер** — добавить/изменить endpoints
2. **Обновить спецификацию** в `api-contracts/`
3. **Запустить генерацию** — `make docs-api`
4. **Проверить результат** — `make docs-serve`
5. **Закоммитить изменения** — спецификация + сгенерированные файлы

## Стиль и структура
- Следуйте `docs/styleguides/markdown_style.md`.
- Термины — `docs/glossary.md` (Vale проверяет предпочтительные варианты).
- Шаблоны: в `docs/_templates/` (README, runbook, API, architecture, ADR).

## ADR
- Ключевые решения фиксируем ADR (`docs/adr/` и `MODULE/docs/adr/`). Используйте шаблон `docs/_templates/adr-template.md`.

## Частые проверки
- Орфография и стиль: `make docs-lint` (markdownlint, cspell RU/EN, Vale).
- Ссылки: `make docs-check-links`.

## FAQ
- См. `docs/faq.md`. Если вопрос повторяется — добавьте в FAQ.
