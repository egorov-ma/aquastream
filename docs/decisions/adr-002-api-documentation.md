---
title: ADR-002 - API Documentation Strategy
summary: Генерация ReDoc и Swagger UI из OpenAPI, линтинг Spectral и drift‑check в CI.
tags: [adr, api, documentation, openapi]
---

# ADR-002: Автогенерация API‑документации (ReDoc + Swagger UI + Spectral)

**Статус:** Accepted
**Дата:** 2025-09-22
**Авторы:** Backend Team

## Контекст

OpenAPI YAML спецификации хранятся в `docs/api/specs/root/`. Требуется автогенерация документации для разных задач: чтения/изучения, интерактивного тестирования, автопроверки качества в CI. ReDoc оптимален для чтения (компактный layout), Swagger UI - для тестирования (Try it out, authorization).

## Решение

Генерация **ReDoc + Swagger UI** из OpenAPI YAML:

```bash
# tools/generate_api_docs.py
docs/api/specs/root/*.yaml →
  - docs/api/redoc/root/*.html       # ReDoc (чтение)
  - docs/api/swagger/root/*.html     # Swagger UI (тестирование)
  - docs/api/index.md                # Индекс с таблицей ссылок
```

**CI/CD**: workflow `docs-api.yml` - генерация, линтинг (Spectral), drift-check артефактов

## Последствия

**Положительные:**
- ✅ ReDoc - оптимальный для чтения, Swagger UI - для интерактивного тестирования
- ✅ Единый источник правды (OpenAPI YAML)
- ✅ Автопроверка качества в CI (Spectral)

**Отрицательные:**
- ❌ Генерация двух форматов, требуются Node.js + Python

**Риски:**
| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Swagger UI требует CORS в dev | Medium | Документация настройки CORS |

## Альтернативы

### Вариант 1: Только ReDoc
**Плюсы:** Простота, компактная документация
**Минусы:** Нет интерактивного тестирования
**Почему не выбран:** Отсутствие Try it out снижает productivity

### Вариант 2: Только Swagger UI
**Плюсы:** Интерактивное тестирование
**Минусы:** Менее удобен для чтения больших спецификаций
**Почему не выбран:** Хуже UX для изучения API

### Вариант 3: Stoplight Elements
**Плюсы:** Современный UI, интерактивные примеры
**Минусы:** Сложнее интеграция, меньше community support
**Почему не выбран:** Дополнительная сложность без явных преимуществ

## Ссылки

- [ReDoc GitHub](https://github.com/Redocly/redoc)
- [Swagger UI Docs](https://swagger.io/tools/swagger-ui/)
- [Spectral Docs](https://stoplight.io/open-source/spectral)
- `tools/generate_api_docs.py` - генератор
- `.github/workflows/docs-api.yml` - CI workflow
