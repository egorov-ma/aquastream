# T23 — Админ: управление ролями

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §3, §21–22, §23.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Страница админа для назначения/снятия ролей.

## Область работ
**Входит в объём:**
- Таблица пользователей; подтверждение действий.

**Не входит:**
- Массовые операции; аудит‑лог.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t23`.

## Шаги выполнения
1. `/dashboard/admin` с таблицей.
2. Действия изменения ролей.
3. Гарды в middleware.

## Артефакты
- Роли меняются и сразу влияют на доступ.

## Бизнес‑приёмка (пользовательская)
- Неавторизованные пользователи не попадают в раздел.

## Definition of Done (техническая готовность)
- Нет циклов редиректов; гарды протестированы.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T23): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T23.md`.
