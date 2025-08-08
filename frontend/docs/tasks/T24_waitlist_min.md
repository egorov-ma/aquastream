# T24 — Лист ожидания (минимум) + уведомления

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §9–10.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Встать/выйти из листа ожидания; заглушка уведомления при освобождении места.

## Область работ
**Входит в объём:**
- Кнопки Join/Leave; действие организатора «освободить место».

**Не входит:**
- Автоперевод в бронь.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t24`.

## Шаги выполнения
1. Кнопки и состояния.
2. Моки `POST/DELETE /waitlist`.
3. Действие организатора → заглушка уведомления.

## Артефакты
- Пользователь встает/выходит; уведомление эмулируется.

## Бизнес‑приёмка (пользовательская)
- Кнопки не активны, когда не применимо; состояние сохраняется.

## Definition of Done (техническая готовность)
- После навигации состояния непротиворечивы.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T24): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T24.md`.
