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
- Создана ветка `feature/t04`.

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

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/

## Инструкции для агента (ChatGPT Agent)
Ты — агент, выполняющий работу в монорепозитории AquaStream. Следуй шагам выше **точно**.  
- Держись принципа **MVP**, без оверинженеринга.  
- Используй **pnpm** для всех установок.  
- Коммиты — в стиле Conventional Commits (напр., `feat(T04): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T04.md`.
