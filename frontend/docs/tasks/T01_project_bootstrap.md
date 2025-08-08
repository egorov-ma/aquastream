# T01 — Бутстрап проекта: Next.js 15 + React 19 + TS + Tailwind v4 + shadcn/ui

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §1–2, §12–17, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Инициализировать продакшен‑готовый каркас в `/frontend` без бизнес‑логики: App Router, строгий TypeScript, Tailwind v4, shadcn/ui с темой Tangerine, next-themes, lucide-react, sonner.

## Область работ
**Входит в объём:**
- Инициализация проекта App Router.
- Подключение Tailwind v4.
- Инициализация реестра shadcn/ui и импорта темы Tangerine.
- Переключатель светлая/тёмная тема.
- ESLint (flat) + Prettier 3.
- Базовый layout: Navbar/ Footer.
- Плейсхолдеры страниц по спецификации.

**Не входит:**
- Любая бизнес‑логика и вызовы реальных API.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t01`.

## Шаги выполнения
1. `pnpm dlx create-next-app@latest frontend --ts --app --eslint --no-tailwind --use-pnpm`.
2. Настроить Tailwind v4 и подключить к `app/globals.css`.
3. `pnpm dlx shadcn@latest init -y` и добавить тему Tangerine: `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/tangerine.json`.
4. `pnpm add next-themes lucide-react sonner`.
5. Сверстать Header/Footer, добавить переключатель темы.
6. Создать плейсхолдеры: `/`, `/org/[orgSlug]`, `/org/[orgSlug]/events`, `/org/[orgSlug]/team`, `/org/[orgSlug]/for-participants`, `/events/[eventId]`, `/auth/login`, `/auth/register`, `/auth/recovery`, `/dashboard`, `/checkout/[bookingId]`.
7. Проставить `data-test-id` на корневых элементах страниц.
8. Убедиться, что `pnpm build` проходит.

## Артефакты
- Компилируемый проект в `/frontend` с плейсхолдерами страниц.
- Тема Tangerine и переключение тем работают.
- Локально проходят lint/typecheck/build.

## Бизнес‑приёмка (пользовательская)
- Домашняя и все плейсхолдеры открываются, есть шапка/подвал и переключатель темы.
- Нет кастомного CSS сверх утилит Tailwind.

## Definition of Done (техническая готовность)
- Build, lint, typecheck без ошибок.
- Все страницы имеют `data-test-id`.
- В консоли нет ошибок.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T01): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T01.md`.
