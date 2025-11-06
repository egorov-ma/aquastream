# Architecture Delta — AquaStream ➜ AqStream

## Purpose
- зафиксировать ключевые расхождения между текущей бизнес-документацией AqStream и наследием AquaStream;
- подсветить регрессии, которые противоречат целевому микросервисному подходу;
- выделить улучшения и пробелы, которые нужно закрыть до продолжения бизнес-аналитики.

## Tech Stack Comparison

| Слой | AqStream (новые материалы) | AquaStream (наследие) | Влияние |
|------|----------------------------|------------------------|---------|
| **Backend** | Spring Boot 3.2.x, Java 21, модульный монолит (aqstream-docs/07_Technical_Architecture.md:6-120; aqstream-docs/README.md:58-87) | Spring Boot 3.5.x, Java 21, независимые микросервисы (docs/index.md:28-77; docs/backend/README.md:5-41) | Даёт откат по версии Spring Boot и теряет выгоды независимых релизов; нужно подтвердить, что остаётся roadmap к микросервисам или обновить стек. |
| **Frontend** | Next.js 14, React 18, Tailwind/shadcn (aqstream-docs/07_Technical_Architecture.md:120-200; aqstream-docs/README.md:90-120) | Next.js 15 App Router, React 18, pnpm/Turbopack (docs/index.md:78-137; docs/frontend/README.md:3-21) | Новый набор не фиксирует обновлённые инструменты (pnpm, Turbopack) и App Router практики; версия Next.js ниже. |
| **API** | REST-first, примеры DTO, JWT RS256 (aqstream-docs/05_API_Design_Guidelines.md:1-180; aqstream-docs/07_Technical_Architecture.md:360-400) | REST + план событийного обмена, OpenAPI, RFC 7807, JWT HS512 (docs/architecture.md:208-218; docs/backend/common/README.md:1-80) | AqStream добавляет RS256 как улучшение, но не описывает OpenAPI и event-driven части. |
| **Tooling** | GitFlow, brew install, docker-compose, ручные шаги (aqstream-docs/08_Development_DevOps_Guide.md:7-165) | Makefile таргеты, Gradle Kotlin DSL, pnpm, docs pipeline, automation hooks (docs/development/workflows.md:1-120; docs/operations/deployment.md:11-101) | Потеря автоматизации и doc-as-code процессов; GitFlow сложнее поддерживать малой командой. |

## Architecture & Service Topology

- AqStream описывает «microservices-ready монолит» без явного списка доменных границ (aqstream-docs/07_Technical_Architecture.md:6-120).
- AquaStream фиксирует 7 независимых сервисов, их назначения, порты и границы данных (docs/architecture.md:53-105; docs/backend/README.md:5-17).
- **Риск:** при планировании работ и инфраструктуры нет опоры на сервисную модель; нужна стратегия декомпозиции или обновление схем в AqStream документации.

## Data & Storage

- AqStream: единая схема PostgreSQL с детализированной ER-моделью и партиционированием (aqstream-docs/03_Data_Model.md:1-174).
- AquaStream: схема-per-service, eventual consistency, план событийного обмена (docs/architecture.md:208-218; docs/backend/database.md:1-120).
- **Необходимо:** выбрать подход — либо вернуть schema-per-service, либо описать, как микро-сервисы будут владеть своими таблицами на базе общей модели.

## Operations & DevOps

- AqStream даёт ручную установку и локальный запуск через `docker-compose`, отсутствуют make-процессы, линтеры инфраструктуры и release playbook (aqstream-docs/08_Development_DevOps_Guide.md:72-165).
- AquaStream документирует `make up-<env>`, backup/restore, zero-downtime, CI/CD (docs/operations/deployment.md:11-101; docs/operations/ci-cd.md:1-180; docs/operations/README.md:7-72).
- **Регресс:** без make-таргетов и pipeline описаний сложно обеспечить повторяемость окружений и контроль качества. Нужно перенести automation и описать, как doc-as-code/CI интегрируются в AqStream.

## Documentation & Governance

- AqStream: разрозненные markdown файлы, отсутствует упоминание MkDocs, ADR, линтинга, шаблонов (aqstream-docs/*.md).
- AquaStream: Doc-as-Code принципы, ADR-001/002, структуры docs/, требования к фронтматтеру, линтеры (docs/decisions/adr-001-docs-stack.md:13-94; docs/_internal/documentation-guidelines.md:1-200).
- **Следствие:** теряется централизованный портал и контроль качества документации. Нужно подтвердить возврат MkDocs или альтернативы и интегрировать ADR в новый репозиторий.

## Security & Compliance

- AqStream: JWT RS256 пример, security headers, базовые health checks (aqstream-docs/07_Technical_Architecture.md:360-420).
- AquaStream: Security First принцип, security policy, RBAC слои, secrets management, мониторинг security событий (docs/architecture.md:220-227; docs/operations/policies/security.md:1-180).
- **Gap:** AqStream не фиксирует RBAC уровни, secret management, incident response — стоит перенести из наследия.

## Observability & SRE

- AqStream: общие схемы кэширования и мониторинга без SLO/SLA (aqstream-docs/07_Technical_Architecture.md:320-360).
- AquaStream: конкретные SLA, риск-матрицы, observability stack, runbooks и алерты (docs/architecture.md:230-282; docs/operations/monitoring.md:1-180; docs/operations/runbooks/service-restart.md).
- **Регресс:** без целевых метрик и runbook-ов сложнее поддерживать качество; перенести SLA и runbook-и в новую документацию.

## Frontend Practices

- AqStream: описывает структуру Next.js монолита и базовые хуки (aqstream-docs/07_Technical_Architecture.md:120-200).
- AquaStream: отдельные документы по setup, routing, state management, security, testing (docs/frontend/README.md:3-120; docs/frontend/state-management.md:1-60; docs/frontend/security.md).
- **Необходимо:** вернуть разделённую frontend документацию, зафиксировать современные практики (App Router, data fetching, безопасности на клиенте).

## QA & Testing

- AqStream: подробный тест-план, но без привязки к automation pipelines (aqstream-docs/09_Test_Plan.md:1-200).
- AquaStream: QA стратегия, процессы, команды запусков, KPI, CI интеграция (docs/qa/index.md:1-160; docs/qa/test-strategy.md).
- **Риск:** отсутствие Cross-reference с CI и требованиями к coverage приводит к дрейфу. Следует объединить тест-план с QA стратегией и automation правилами из наследия.

## CI/CD & Automation

- AqStream: CI обзор ограничен одним workflow (aqstream-docs/08_Development_DevOps_Guide.md:159-220) без упоминания lock-check, security scanning, SBOM.
- AquaStream: детальный CI/CD гайд, security scanning, pin действий, concurrency, dependency lock check (docs/operations/ci-cd.md:1-200).
- **Gap:** вернуть pipeline структуру, включая security и doc build, чтобы сохранить современный DevSecOps уровень.

## Regressions & Risks
- **Размывание микросервисных границ** — новая архитектура рисует один Spring Boot сервис, тогда как целевая модель включает отдельные доменные сервисы (aqstream-docs/07_Technical_Architecture.md:28; docs/backend/README.md:5-17). Нужно решить, какие сервисы существуют в первой итерации и как отражаем их в бизнес-аналитике/бэклоге.
- **Единая БД против schema-per-service** — документ «Data Model» описывает единую схему, что конфликтует с предыдущей стратегией изоляции (aqstream-docs/03_Data_Model.md:1-174; docs/architecture.md:208-218). Без уточнения появится плотная связанность и сложнее масштабировать команды.
- **DevOps практики упростились до ручных инструкций** — новые шаги через brew и прямой docker-compose не покрывают make-таргеты, линтинг документации и CI-пайплайны (aqstream-docs/08_Development_DevOps_Guide.md:72-165 vs docs/operations/deployment.md:11-101; docs/operations/ci-cd.md:1-140). Это увеличивает вероятность дрейфа и «снежных хлопьев» в окружениях.
- **Документация перестала быть «кодом»** — в AqStream нет упоминаний о MkDocs, ADR и CI-проверках, что нивелирует процессные гарантии (docs/decisions/adr-001-docs-stack.md:13-70). Риск: бизнес-анализ перестанет синхронизироваться с кодом.
- **Наблюдаемость и SLA исчезли** — в новой документации нет целевых метрик и runbook-ов, тогда как AquaStream фиксировал SLA и процедуры (docs/architecture.md:232-282; docs/operations/README.md:34-72). Это усложнит поддержание качества при росте нагрузки.
- **Версии и инструменты откатились** — Spring Boot 3.2 и Next.js 14 в AqStream отстают от ранее зафиксированных 3.5.x и 15, отсутствуют pnpm/Turbopack, ArchUnit тесты и doc линтеры (aqstream-docs/README.md:58-120; docs/index.md:78-137; docs/development/style-guides.md:1-80).

## Improvements to Keep
- **Более детализированная доменная модель** — AqStream фиксирует сущности, атрибуты и партиционирование (aqstream-docs/03_Data_Model.md:1-174), чего не было в явном виде; полезно перенести в будущие микросервисы.
- **Чёткая Vision & Scope и пользовательские истории** — новые документы лучше формализуют ценностные предложения и roadmap (aqstream-docs/06_Vision_and_Scope.md:1-200; aqstream-docs/02_User_Stories.md). Это усиливает бизнес-фокус.
- **Расширенные примеры API и интеграций** — AqStream даёт готовые payload-ы и коды ответов (aqstream-docs/05_API_Design_Guidelines.md:1-180); можно использовать как основу для обновления OpenAPI.
- **Фокус на caching/индексации** — технический раздел описывает уровни кэшей и индексы (aqstream-docs/07_Technical_Architecture.md:320-400), что стоит перенести в будущие микросервисы.

## Missing Topics in AqStream Docs
- Doc-as-code пайплайн (MkDocs, CI, проверки ссылок) и роль ADR.
- Детализация микросервисов: границы, ответственность, схемы БД per service, взаимодействия (REST vs события).
- Описание Makefile/automation и окружений (`make up-<env>`, backup, smoke-тесты).
- Runbooks, monitoring stack, SLA/alerting и политика безопасности.
- Стратегия миграции от монолита к микросервисам (критерии выделения сервисов, roadmap).
- Обновлённые решения по messaging (RabbitMQ/Kafka), которые были в backlog AquaStream.

## Recommended Next Steps
1. **Принять архитектурное решение**: зафиксировать, остаёмся ли на микросервисной модели или начинаем с модульного монолита с чётким планом декомпозиции (обновить aqstream-docs/07_Technical_Architecture.md и соответствующие ADR).
2. **Вернуть doc-as-code процессы**: описать MkDocs/CI pipeline и включить ADR-001/002 или их обновлённые версии в AqStream документацию.
3. **Восстановить DevOps разделы**: перенести make-команды, release-процедуры, backup/restore и runbooks из `docs/operations` в новую структуру, адаптировав под актуальные планы.
4. **Определить SLA и observability**: повторно зафиксировать целевые метрики и инструменты мониторинга, чтобы бизнес-метрики не потерялись.
5. **Синхронизировать дорожную карту с сервисными границами**: дополнить Vision/Roadmap информацией о том, какие сервисы запускаются в MVP и как эволюционируют.

## Что добавить в документацию AqStream
- **Architecture & Services**: описать целевую микросервисную структуру внутри одного монорепозитория (gateway, backend сервисы, frontend), стратегию декомпозиции и стандарты модульности (`*-api`, `*-service`, `*-db`, `*-client`).
- **Principles & Roadmap**: закрепить ключевые принципы (Microservices, API-First, Security First, DevSecOps, Continuous Delivery), roadmap миграции (включая Service Mesh как Phase 2) и требования Definition of Done/Code Review.
- **Data Ownership**: документировать mixed schema-per-service (dedicated БД для критичных сервисов, схемы для остальных), naming convention (`event_service` и т.п.), правила миграций Liquibase и использование RLS для multi-tenancy с tenant-контекстом.
- **Tech Stack & Tooling**: подтвердить Spring Boot 3.5.x + Java 21, Next.js 15 + pnpm/Turbopack, Gradle Kotlin DSL, Tailwind/shadcn, ArchUnit, Testcontainers, RestAssured, Playwright, линтеры, Makefile, MkDocs, с пояснением их роли.
- **Operations & DevOps**: вернуть Makefile-пайплайн (`make up-<env>`, backup, smoke), release процессы, zero-downtime подходы, шаблоны `.env`, описание базового набора контейнеров (edge, backend сервисы, PostgreSQL, Redis, MinIO, observability) и roadmap на переход к Kubernetes/Service Mesh.
- **CI/CD & Automation**: описать структуру пайплайнов, quality/security проверки (dependency lock-check, Trivy, Dependency Check, SBOM), публикацию артефактов и Docker образов, вспомогательные workflows (analytica/security, auto versioning, dependabot), критерии прохождения пайплайнов и release-менеджмент.
- **Doc-as-Code & Governance**: описать использование MkDocs + Material, структуру `docs/`, линтинг (`make docs-lint`), публикацию через GitHub Pages, систему ADR и правила обновления документации при изменениях.
- **Security & Observability**: зафиксировать RBAC уровни, secrets management, incident response, audit logging, JWT RS256/refresh/revoke, monitoring стек (Prometheus/Grafana/Loki), логирование, SLA/SLO и runbooks.
- **Frontend Engineering**: описать структуру App Router, распределение server/client компонентов, SSR/ISR, data fetching, state management, формы (RHF+Zod), стилизации Tailwind/shadcn, безопасность клиента, accessibility, Playwright сценарии.
- **Backend Testing**: документировать обязательные уровни тестов (JUnit, RestAssured, Testcontainers, ArchUnit), coverage/quality критерии и их связь с CI/CD.
- **QA & Release Quality**: связать тест-план со стратегией QA, Definition of Done, release gate’ами, баг-менеджментом, performance/security gate’ами, ответственностью за обновление.
