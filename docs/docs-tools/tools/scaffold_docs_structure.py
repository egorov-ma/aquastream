#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3] / 'docs'

pages: dict[str, list[str]] = {
    # Getting started
    'getting-started/quick-start.md': [
        '# Быстрый старт',
        '',
        '- См. также: [Обзор](overview.md), [Локальная разработка](local-development.md)'
    ],
    'getting-started/local-development.md': [
        '# Локальная разработка',
        '',
        '- Инфраструктура и запуск: [Developer Guide](../modules/backend-infra/DEVELOPER.md)'
    ],

    # Architecture
    'architecture/overview.md': [
        '# Архитектура',
        '',
        '- Полная спецификация бекенда: [Backend Spec](../modules/backend-infra/aquastream-backend-spec-complete.md)'
    ],
    'architecture/microservices.md': [
        '# Микросервисы',
        '',
        '- Обзоры сервисов: [Backend Services](../modules/backend-user/backend-user-service/README.md) и соседние'
    ],
    'architecture/database-design.md': [
        '# Дизайн БД',
        '',
        '- Миграции и схемы: см. README соответствующих сервисов'
    ],
    'architecture/security.md': [
        '# Безопасность',
        '',
        '- Общая аутентификация/авторизация: см. Gateway/User сервисы'
    ],
    'architecture/common-library.md': [
        '# Общая библиотека',
        '',
        '- backend-common: [README](../modules/backend-common/README.md), [Runbook](../modules/backend-common/runbook.md), [Changelog](../modules/backend-common/changelog.md)'
    ],
    'architecture/build-system.md': [
        '# Сборочная система',
        '',
        '- Gradle/Make: [Build Guide](../getting-started/build-guide.md), CI: [CI README](../modules/backend-infra/CI-README.md)'
    ],

    # Backend overview
    'backend/overview.md': ['# Backend — обзор', ''],
    'backend/authentication.md': ['# Глобальная аутентификация', ''],
    'backend/error-handling.md': ['# Обработка ошибок', 'RFC 7807, централизованные хендлеры'],

    # Gateway
    'backend/gateway/api.md': [
        '# Gateway API',
        '- Обзор: [README](../../modules/backend-gateway/README.md)'
    ],
    'backend/gateway/operations.md': [
        '# Gateway — операции',
        '- Runbook: [runbook](../../modules/backend-gateway/runbook.md)'
    ],
    'backend/gateway/changelog.md': [
        '# Gateway — изменения',
        '- Changelog: [changelog](../../modules/backend-gateway/changelog.md)'
    ],

    # User
    'backend/user/api.md': [
        '# User API',
        '- Обзор: [README](../../modules/backend-user/backend-user-service/README.md)'
    ],
    'backend/user/business-logic.md': ['# User — бизнес-логика', ''],
    'backend/user/operations.md': [
        '# User — операции',
        '- Runbook: [runbook](../../modules/backend-user/backend-user-service/runbook.md)'
    ],
    'backend/user/changelog.md': [
        '# User — изменения',
        '- Changelog: [changelog](../../modules/backend-user/backend-user-service/changelog.md)'
    ],

    # Event
    'backend/event/api.md': ['# Event API', '- Обзор: [README](../../modules/backend-event/backend-event-service/README.md)'],
    'backend/event/business-logic.md': ['# Event — бизнес-логика', ''],
    'backend/event/operations.md': ['# Event — операции', '- Runbook: [runbook](../../modules/backend-event/backend-event-service/runbook.md)'],
    'backend/event/changelog.md': ['# Event — изменения', '- Changelog: [changelog](../../modules/backend-event/backend-event-service/changelog.md)'],

    # Payment
    'backend/payment/api.md': ['# Payment API', '- Обзор: [README](../../modules/backend-payment/backend-payment-service/README.md)'],
    'backend/payment/business-logic.md': ['# Payment — бизнес-логика', ''],
    'backend/payment/operations.md': ['# Payment — операции', '- Runbook: [runbook](../../modules/backend-payment/backend-payment-service/runbook.md)'],
    'backend/payment/changelog.md': ['# Payment — изменения', '- Changelog: [changelog](../../modules/backend-payment/backend-payment-service/changelog.md)'],

    # Notification
    'backend/notification/api.md': ['# Notification API', '- Обзор: [README](../../modules/backend-notification/backend-notification-service/README.md)'],
    'backend/notification/business-logic.md': ['# Notification — бизнес-логика', ''],
    'backend/notification/operations.md': ['# Notification — операции', '- Runbook: [runbook](../../modules/backend-notification/backend-notification-service/runbook.md)'],
    'backend/notification/changelog.md': ['# Notification — изменения', '- Changelog: [changelog](../../modules/backend-notification/backend-notification-service/changelog.md)'],

    # Crew
    'backend/crew/api.md': ['# Crew API', '- Обзор: [README](../../modules/backend-crew/backend-crew-service/README.md)'],
    'backend/crew/business-logic.md': ['# Crew — бизнес-логика', ''],
    'backend/crew/operations.md': ['# Crew — операции', '- Runbook: [runbook](../../modules/backend-crew/backend-crew-service/runbook.md)'],
    'backend/crew/changelog.md': ['# Crew — изменения', '- Changelog: [changelog](../../modules/backend-crew/backend-crew-service/changelog.md)'],

    # Media
    'backend/media/api.md': ['# Media API', '- Обзор: [README](../../modules/backend-media/backend-media-service/README.md)'],
    'backend/media/business-logic.md': ['# Media — бизнес-логика', ''],
    'backend/media/operations.md': ['# Media — операции', '- Runbook: [runbook](../../modules/backend-media/backend-media-service/runbook.md)'],
    'backend/media/changelog.md': ['# Media — изменения', '- Changelog: [changelog](../../modules/backend-media/backend-media-service/changelog.md)'],

    # Frontend
    'frontend/overview.md': ['# Frontend — обзор', '- [README](../modules/frontend/README.md)'],
    'frontend/routing.md': ['# Маршрутизация', ''],
    'frontend/components.md': ['# Компоненты', '- См. внутренние заметки: frontend spec/brief/checklist'],
    'frontend/state-management.md': ['# Управление состоянием', ''],
    'frontend/development-guide.md': ['# Руководство по разработке', '- [Frontend spec](../modules/frontend/aquastream-frontend-spec.md)'],

    # Business
    'business/user-roles.md': ['# Роли и права', ''],
    'business/booking-flow.md': ['# Процесс бронирования', ''],
    'business/payment-methods.md': ['# Способы оплаты', ''],
    'business/crew-management.md': ['# Управление группами', ''],

    # DevOps
    'devops/infrastructure.md': ['# Инфраструктура', '- [Developer Guide](../modules/backend-infra/DEVELOPER.md)'],
    'devops/ci-cd.md': ['# CI/CD', '- [CI README](../modules/backend-infra/CI-README.md)'],
    'devops/git-hooks.md': ['# Git hooks', '- [pre-commit](../.pre-commit-config.yaml)'],
    'devops/environment-setup.md': ['# Окружения', ''],
    'devops/deployment.md': ['# Деплой', '- [Releases](../modules/backend-infra/RELEASES.md)'],
    'devops/monitoring.md': ['# Мониторинг', ''],
    'devops/backup-recovery.md': ['# Бэкап и восстановление', '- [Backup README](../modules/backend-infra/backup/README.md)'],

    # Styleguides
    'styleguides/code-style.md': ['# Стандарты кода', ''],
    'styleguides/api-design.md': ['# Проектирование API', ''],
    'styleguides/database-conventions.md': ['# Соглашения по БД', ''],
    'styleguides/git-workflow.md': ['# Git workflow', ''],
    'styleguides/documentation-style.md': ['# Стиль документации', '- [Markdown style](markdown_style.md)'],
    'styleguides/ui-ux-guidelines.md': ['# UI/UX принципы', ''],

    # Roadmap
    'roadmap/current-release.md': ['# Текущий релиз', '- См. общий [Roadmap](../roadmap.md)'],
    'roadmap/planned-features.md': ['# Запланированные функции', ''],
    'roadmap/technical-debt.md': ['# Технический долг', ''],
    'roadmap/long-term-vision.md': ['# Долгосрочное видение', ''],

    # Reference
    'reference/environment-variables.md': ['# Переменные окружения', '- См. раздел в [Developer Guide](../modules/backend-infra/DEVELOPER.md)'],
    'reference/configuration.md': ['# Конфигурация', ''],
    'reference/troubleshooting.md': ['# Troubleshooting', '- См. runbook конкретных сервисов'],
}


def main() -> None:
    for rel, lines in pages.items():
        path = ROOT / rel
        if path.exists():
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        content = '\n'.join(lines) + '\n'
        path.write_text(content, encoding='utf-8')
        print(f"[scaffold] {rel}")


if __name__ == '__main__':
    main()
