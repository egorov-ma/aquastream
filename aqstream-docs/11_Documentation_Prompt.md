# Documentation Update Prompt for AqStream

## Context to Keep in Mind
- AqStream — современная микросервисная платформа.
- Код организован по модулям: отдельные сервисы, общий модуль `common`, gateway слой.
- Каждый сервис (кроме gateway/common) имеет подмодули `*-api`, `*-service`, `*-db`.
- Документация должна отражать микросервисную архитектуру, модульную структуру и современные engineering практики.

## Что требуется доработать в документации AqStream
- **Принципы и подходы**: выделить ключевые принципы (Microservices, Domain/Module boundaries, API-First, Security First, DevSecOps, Continuous Delivery), описать как они применяются в проекте и как влияют на процессы разработки.
- **Архитектура**: явно зафиксировать, что система микросервисная, перечислить модули и их взаимодействия, описать роль gateway и common.
- **Данные**: описать стратегию schema-per-service, указать как распределяются схемы и миграции между сервисными модулями, и как общая ER-модель соотносится с изоляцией данных.
- **Структура репозитория**: показать модульное разбиение (backend сервисы, frontend, infra), подчеркнуть внутреннее деление сервисов на `api/service/db`.
- **Технологический стек**: подтвердить использование актуальных версий Spring Boot, Java, Next.js, pnpm/Turbopack; перечислить обязательные инструменты (Gradle Kotlin DSL, Tailwind CSS, shadcn/ui, ArchUnit, Testcontainers, RestAssured, Playwright, линтеры, Makefile, MkDocs) и пояснить зачем каждый нужен.
- **Doc-as-Code**: описать установку MkDocs + Material, процесс обновления документации, линтинг (`make docs-lint`), CI публикацию.
- **Operations & DevOps**: задокументировать make-команды, процессы запуска окружений, backup/restore, zero-downtime подходы, release checklist, состав базовых контейнеров (edge, backend сервисы, PostgreSQL, Redis, MinIO, observability стек).
- **CI/CD**: описать структуру пайплайнов, проверки качества и безопасности (dependency lock-check, Trivy, Dependency Check, SBOM), публикацию итоговых артефактов и образов.
- **Automation & Quality Gates**: зафиксировать вспомогательные workflows (quality/security анализ, автоматическое версионирование, управление зависимостями), правила release-менеджмента и критерии прохождения пайплайнов.
- **API документация**: зафиксировать процесс ведения OpenAPI спецификаций, использование Swagger UI и Redoc для публикации, требования к версионированию и проверкам.
- **Security & Observability**: зафиксировать принципы безопасности (RBAC, JWT RS256, secrets management), monitoring стек (Prometheus/Grafana/Loki) и целевые SLA/SLO.
- **Testing**: указать обязательные инструменты и уровни тестирования — backend через JUnit + RestAssured + Testcontainers + ArchUnit, frontend через Playwright, QA метрики.
- **QA документация**: объединить стратегию, тест-планы и процессы (Definition of Done, release критерии, баг-менеджмент), определить ответственность за обновление, связать с CI/CD и метриками качества.
- **Frontend документация**: описать структуру App Router, роли server/client компонентов, стратегии SSR/ISR и data fetching, state management, работу с формами (RHF+Zod), стилизацию через Tailwind/shadcn, требования к безопасности клиента, accessibility и обязательные Playwright сценарии.
- **Roadmap & процессы**: дополнить roadmap привязкой к модульной архитектуре и инженерным практикам (Definition of Done, code review, automation).

## Формат ответа модели
1. Обновить или создать соответствующие документы в `aqstream-docs/` (и смежных директориях), чтобы закрыть перечисленные пункты.
2. Сохранять ориентацию на AqStream (не упоминать AquaStream или старую документацию).
3. В текстах использовать русский язык, Markdown, короткие ссылки на файлы.
4. При необходимости добавлять новые разделы/файлы с понятными заголовками и краткими инструкциями.
