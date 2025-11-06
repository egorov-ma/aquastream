# AqStream

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

Open-source платформа для организации и управления событиями. Объединяет организаторов мероприятий и участников в единой экосистеме.

## 🎯 Особенности

- 📅 **Управление событиями** - Полный цикл от создания до проведения
- 🔍 **Умный поиск** - Фильтры по локации, типу, дате и цене
- 👥 **Группы участников** - Гибкая система формирования групп
- 🔐 **Закрытые сообщества** - Корпоративные и приватные мероприятия
- 📱 **Mobile-first** - Адаптивный дизайн для всех устройств
- 🤖 **Telegram интеграция** - Уведомления через Telegram Bot
- 📊 **Аналитика** - Детальная статистика для организаторов
- 🛡️ **Модерация** - Контроль качества контента

## 🚀 Быстрый старт

### Требования

- Java 21+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Установка через Docker

```bash
# Клонировать репозиторий
git clone https://github.com/aqstream/aqstream.git
cd aqstream

# Запустить через Docker Compose
docker-compose up -d

# Приложение будет доступно по адресу
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
```

### Локальная разработка

#### Backend

```bash
cd backend

# Копировать и настроить переменные окружения
cp .env.example .env

# Запустить зависимости
docker-compose -f docker-compose.dev.yml up -d postgres redis minio

# Запустить миграции БД
./gradlew liquibaseUpdate

# Запустить приложение
./gradlew bootRun
```

#### Frontend

```bash
cd frontend

# Установить зависимости
yarn install

# Настроить переменные окружения
cp .env.local.example .env.local

# Запустить dev сервер
yarn dev
```

## 📚 Документация

- [Vision & Scope](docs/01_Vision_and_Scope.md) - Видение продукта
- [User Stories](docs/02_User_Stories.md) - Пользовательские истории
- [Data Model](docs/03_Data_Model.md) - Модель данных
- [API Guidelines](docs/05_API_Design_Guidelines.md) - API спецификация
- [Technical Architecture](docs/07_Technical_Architecture.md) - Техническая архитектура
- [Development Guide](docs/08_Development_DevOps_Guide.md) - Руководство разработчика

## 🏗️ Технологический стек

### Backend
- **Java 21** - Основной язык
- **Spring Boot 3.2** - Фреймворк
- **PostgreSQL** - Основная БД
- **Redis** - Кэширование
- **MinIO** - Хранилище файлов
- **Liquibase** - Миграции БД
- **JWT** - Аутентификация

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **shadcn/ui** - UI компоненты
- **React Hook Form** - Формы
- **Zod** - Валидация

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
./gradlew test
./gradlew integrationTest

# Frontend тесты
cd frontend
yarn test
yarn test:e2e
```

## 🤝 Участие в разработке

Мы приветствуем вклад в развитие проекта! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) для деталей.

### Как помочь

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📋 Roadmap

### MVP (Q1 2024)
- [x] Базовая аутентификация
- [x] Создание и просмотр событий
- [x] Регистрация на события
- [x] Telegram уведомления
- [ ] Система оплаты
- [ ] Группы участников

### Phase 2 (Q2 2024)
- [ ] Расширенная аналитика
- [ ] Telegram Mini App
- [ ] API для интеграций
- [ ] Геолокация событий

См. [открытые issues](https://github.com/aqstream/aqstream/issues) для полного списка предложенных функций и известных проблем.

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Контакты

- Email: info@aqstream.ru
- Telegram: [@aqstream_support](https://t.me/aqstream_support)
- Website: [https://aqstream.ru](https://aqstream.ru)

## 🙏 Благодарности

- [Spring Boot](https://spring.io/projects/spring-boot)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<p align="center">
  Made with ❤️ by AqStream Team
</p>
