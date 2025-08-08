# T17 — Оплата по QR (ручное подтверждение)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §8, §11, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Показать инструкции и загрузку пруфа; статус `submitted` до модерации.

## Область работ
**Входит в объём:**
- Загрузка файла в мок‑хранилище.
- Перевод статуса брони в `submitted`.

**Не входит:**
- Модерация организатором (отдельная задача).

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t17`.

## Шаги выполнения
1. Блок QR с шагами и `Progress`.
2. Компонент загрузки файла, предпросмотр, сохранение `proofUrl`.
3. Экран ожидания модерации.

## Артефакты
- Пруф загружен; состояние сохраняется.

## Бизнес‑приёмка (пользовательская)
- Валидируются тип/размер; ошибки показаны.

## Definition of Done (техническая готовность)
- Нет XSS при предпросмотре; валидация файлов на месте.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T17): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T17.md`.
