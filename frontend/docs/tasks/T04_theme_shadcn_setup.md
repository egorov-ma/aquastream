# T04 — Тема и реестр shadcn/ui

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §12–13.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Подключить Tangerine, завести базовые примитивы, реализовать `ThemeToggle`.

## Область работ
**Входит в объём:**
- Импорт базовых компонентов.
- `ThemeToggle` на `next-themes`.
- Базовая доступность (focus/контраст).

**Не входит:**
- Кастомные CSS/нестандартные компоненты.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Добавить примитивы: button,input,dialog,card,table,tabs,navigation-menu,dropdown-menu,badge,avatar,accordion,alert,alert-dialog,sheet,calendar,popover,tooltip,menubar,pagination,separator,progress,scroll-area,carousel,resizable.
2. Реализовать `ThemeToggle` с `next-themes`.
3. Проверить контраст и фокусы в обеих темах.

## Артефакты
- Импорты доступны; переключатель темы работает.

## Бизнес‑приёмка (пользовательская)
- Тема сохраняется между страницами и после перезагрузки.

## Definition of Done (техническая готовность)
- Lighthouse a11y ≥ 90 на базовых страницах.
- Нет лишнего CSS.