# T16 — Интеграция платёжного виджета (YooKassa по умолчанию)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §8, §14, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Подключить виджет на странице Checkout; обработать success/cancel; эмулировать вебхук.

## Область работ
**Входит в объём:**
- Переключение провайдера по `PAYMENTS_PROVIDER`.
- Клиентский mount виджета.
- Заглушка вебхука обновляет статус брони.

**Не входит:**
- Боевые ключи мерчанта.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t16`.

## Шаги выполнения
1. Рендер провайдера по ENV.
2. Обработчики `onSuccess/onCancel`.
3. `/api/payments/webhook` (stub); в dev — эмуляция вебхука таймером.
4. Обновление статуса брони.

## Артефакты
- Успешная оплата переводит бронь в `paid`.

## Бизнес‑приёмка (пользовательская)
- Отмена возвращает к опциям без ошибок.

## Definition of Done (техническая готовность)
- В консоли нет ошибок виджета; вебхук‑заглушка детерминирована.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T16): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T16.md`.
