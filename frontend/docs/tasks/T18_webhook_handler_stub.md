# T18 — Route handler вебхука (dev‑заглушка)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §8, §14, §20, §23–24.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Принимать коллбеки провайдера и обновлять статус брони (моки).

## Область работ
**Входит в объём:**
- Парсинг payload; маппинг на внутренние статусы.
- Идемпотентная обработка.

**Не входит:**
- Реальная проверка подписи.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t18`.

## Шаги выполнения
1. Хэндлер с переключателем по провайдеру.
2. Логирование payload в dev.
3. Защита от повторной обработки.

## Артефакты
- Состояние меняется один раз на событие.

## Бизнес‑приёмка (пользовательская)
- Checkout обновляется без перезагрузки.

## Definition of Done (техническая готовность)
- Возвращается 2xx; устойчивость к дублям.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T18): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T18.md`.
