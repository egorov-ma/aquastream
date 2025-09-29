# Frontend Overview

## Технологический стек

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context
- **HTTP Client**: Fetch API
- **Testing**: Jest + Cypress

## Архитектура

```
frontend/
├── components/          # Переиспользуемые компоненты
├── pages/              # Next.js страницы
├── hooks/              # Пользовательские хуки
├── contexts/           # React контексты
├── utils/              # Утилиты и хелперы
├── types/              # TypeScript типы
└── __tests__/          # Тесты
```

## Разделы документации

- [Setup](setup.md) - настройка окружения для разработки
- [Components](components.md) - архитектура и соглашения компонентов
- [Routing](routing.md) - маршрутизация в приложении
- [State Management](state-management.md) - управление состоянием
- [API Integration](api-integration.md) - интеграция с backend API
- [Deployment](deployment.md) - развертывание frontend