## План унификации стилей: Tailwind CSS v4 + shadcn/ui

### Контекст и текущее состояние

- Бандл: Next.js 15 + Tailwind CSS v4 через PostCSS (`@tailwindcss/postcss`), глобальные токены и темы заданы в `app/globals.css` (`@theme inline`, `@layer base`).
- UI-библиотека: shadcn/ui (Radix-праймитивы + утилиты Tailwind), есть `cn` на базе `clsx` + `tailwind-merge`.
- Анимации: подключен `tw-animate-css` через `@import` (используются классы `animate-in`, `fade-in-0`, `slide-in-from-*`, и т.д.).
- Выявленные отклонения от целевой модели:
  - Остаточный CSS-модуль `app/page.module.css` (не используется).
  - Инлайновые стили в нескольких местах (цвета/бордеры, ширина сайдбара, transform прогресса).
  - Повторяющиеся «ссылки как кнопки» с вручную собранными классами вместо `Button`/`buttonVariants`.
- Целевая модель: только Tailwind v4 утилиты и компоненты shadcn/ui; без кастомных CSS-классов и CSS-модулей; инлайновые стили не использовать, кроме установки CSS‑переменных, далее — только утилиты Tailwind.

Ссылки:
- Документация по установке Tailwind (Vite-гайд как ориентир по v4 экосистеме): [Using Vite](https://tailwindcss.com/docs/installation/using-vite)
- shadcn - https://ui.shadcn.com/docs/installation/next 

### Цели

1) Полная унификация визуального слоя на Tailwind v4 + shadcn/ui.
2) Исключить кастомные CSS-модули и стили, оставить только тему/токены в `globals.css`.
3) Упростить поддержку за счет переиспользуемых компонентов и паттернов shadcn (варианты через `cva`, `data-*` состояния, `focus-visible` ring и т.п.).
4) Сохранить визуальный паритет (или улучшить) и не нарушить UX.

### Принципы и best practices (применять везде)

- Tailwind v4:
  - Использовать токены из `@theme inline` и CSS-переменные (`--background`, `--foreground`, `--primary`, и т.д.).
  - Утилиты только Tailwind; произвольные значения — через синтаксис Tailwind `[prop:value]` и переменные `var(--*)`.
  - Состояния и анимации — через `data-*` и соответствующие утилиты.
- shadcn/ui:
  - Компоненты с вариантами через `cva`; публичный API: `className` мержится через `cn`.
  - Везде обеспечивать `focus-visible:ring`/`border` для доступности; aria-атрибуты у интерактивных элементов.
  - Переиспользовать `Button`, `Input`, `Badge`, `Card`, `Dialog`, `Sheet`, и пр., вместо ручных комбинаций классов.
- Стандарты кода:
  - Не использовать `style={...}` за исключением задания CSS‑переменных (например, `style={{ "--accent": accent }}`) и только если невозможно иначе.
  - Не создавать новые CSS-файлы/модули; все стили — утилитами Tailwind.
  - Анимации — единым плагином, совместимым со shadcn (см. ниже).

### Изменения по репозиторию (по файлам/зонам)

1) Удаление остаточного CSS-модуля
- Файл: `frontend/app/page.module.css` — удалить (не используется).

2) Инлайновые стили → Tailwind + CSS‑переменные
- `frontend/app/(routes)/org/dashboard/page.tsx`
  - SidebarProvider: заменить
    - БЫЛО: `style={{ ["--sidebar-width" as unknown as string]: "280px" }}`
    - СТАЛО: `className="[--sidebar-width:280px]"`
  - Ссылки-кнопки «Настройки/Группы/…»: заменить ручные классы на `Button` (`asChild`) с `variant="outline"`/`size="sm"`.
- `frontend/components/org/OrgHeader.tsx`
  - Бордер и цвет бейджа:
    - Вводить переменную `--accent` через style: `style={{ "--accent": accent }}` (или через проп на ближайшем контейнере, если данные динамические).
    - Применение: `border-b border-[var(--accent)]`, `bg-[color:var(--accent)/0.125]`, `text-[var(--accent)]`.
    - Удалить `style={{ borderColor: ... }}` и `style={{ backgroundColor: ... , color: ... }}`.
- `frontend/components/ui/progress.tsx`
  - Индикатор прогресса:
    - Вводим `--progress` в `style` (число 0–100) на корне/индикаторе.
    - Применяем ширину: `w-[calc(var(--progress)*1%)]` вместо `style.transform`.
- `frontend/components/ui/sidebar.tsx`
  - Избавиться от `style` на контейнере; ширину и иные параметры принимать через CSS‑переменные в `className`.
  - `SidebarTrigger`: заменить ручные классы на `Button` (`asChild`) со схожим видом (`variant="outline"`, `size="sm"`).

3) Ссылки как кнопки → shadcn `Button`
- Файлы с ручными классами на ссылках:
  - `frontend/app/(routes)/403/page.tsx`
  - `frontend/app/(routes)/org/dashboard/page.tsx`
  - `frontend/components/events/WaitlistSection.tsx`
- Шаблон:
  - БЫЛО: `<Link className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50" ...>`
  - СТАЛО:
    - Вариант 1 (предпочтительно): `<Button asChild variant="outline" size="sm"><Link href="...">…</Link></Button>`
    - Вариант 2: использовать `buttonVariants({ variant: "outline", size: "sm" })` для получения классов и присвоить их ссылке, если `asChild` неудобен в конкретном месте.

4) Анимации: унифицировать плагин
- Цель: использовать рекомендованный shadcn плагин `tailwindcss-animate`.
- Действия:
  - Заменить `tw-animate-css` на `tailwindcss-animate`.
  - В `app/globals.css` подключить плагин (Tailwind v4): `@import "tailwindcss-animate";` (или `@plugin`, согласно версии плагина). Удалить `@import "tw-animate-css";`.
  - Проверить совместимость классов (`animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-*`, и т.п.), заменить несовместимые аналоги при необходимости.

5) Унификация UI-компонентов (shadcn best practices)
- Общие требования ко всем компонентам в `components/ui/*`:
  - `export` именованных компонентов, поддержка `className`, мерж через `cn`.
  - Варианты — через `cva` (где применимо), дефолтные варианты заданы.
  - `data-slot` на корневых узлах для удобства селекторов.
  - Состояния Radix — через `data-*` и Tailwind-утилиты (уже используется в большинстве компонентов).
  - Фокус/валидность: `focus-visible:ring-[3px]` + `border-ring`/`aria-invalid` классы.
- Специфика по компонентам:
  - `button.tsx`: оставить как есть (соответствует shadcn). Дополнить readme по паттерну `asChild`.
  - `page-header.tsx`: ок; гарантировать единые размеры и отступы заголовков на страницах (см. раздел «Шаблон страницы»).
  - `calendar.tsx`: уже Tailwind-only. Оставить; визуальные токены — из темы.
  - `sidebar.tsx`: см. пункт 2 — увести от `style`, унифицировать триггер через `Button`.
  - Остальные (`dialog/sheet/popover/select/tooltip/...`): оставить, проверить после смены анимационного плагина.

6) Шаблон страницы и секции
- Шаблон страницы должен использовать общие блоки:
  - `PageHeader` (заголовок/описание/действия).
  - `Section`/`Card` для контента и блоков.
  - Грид/спейсинг — только Tailwind-утилитами без локальных классов.
- Рекомендуемые утилиты для разметки:
  - Обертка: `container mx-auto px-4 sm:px-6 lg:px-8` (или `max-w-*` по контексту), вертикальные отступы через `py-*`.
  - Текст: `text-balance`, `tracking-tight/normal`, текстовые токены `text-muted-foreground`.

### Пошаговый план внедрения

Шаг 1. Подготовка зависимостей
- Удалить: `tw-animate-css`.
- Добавить: `tailwindcss-animate` (v4-совместимая версия).
- Внести изменения в `app/globals.css`: заменить импорт плагина.

Шаг 2. Удаление CSS-модулей
- Удалить `frontend/app/page.module.css`.
- Проверить отсутствие импортов CSS/SCSS в кодовой базе.

Шаг 3. Рефактор инлайновых стилей
- `SidebarProvider` (`org/dashboard/page.tsx`): `[--sidebar-width:280px]` вместо `style`.
- `OrgHeader`: `--accent` + утилиты Tailwind, убрать `style.borderColor/backgroundColor/color`.
- `Progress`: `--progress` + `w-[calc(var(--progress)*1%)]`, убрать `transform` из `style`.
- `sidebar.tsx`: принимать `className` и CSS‑переменные вместо `style`; `SidebarTrigger` → `Button`.

Шаг 4. Унификация «ссылок как кнопок»
- Во всех местах с ручной сборкой классов для ссылок — перейти на `Button asChild` + `variant/size`.

Шаг 5. Аудит компонентов ui/*
- Проверить экспорт/пропсы/варианты/фокус/aria; привести к единому виду shadcn.
- Проверить классы анимаций после смены плагина; адаптировать при необходимости.

Шаг 6. Глобальные проверки
- Поиск по проекту: отсутствие `style={` (кроме мест, где задаются CSS‑переменные с последующим использованием в утилитах Tailwind).
- Поиск по проекту: отсутствие `*.module.css`.
- Визуальная регрессия ключевых страниц и компонентов.

### Критерии приемки (Definition of Done)

- Зависимости: `tailwindcss-animate` подключен; `tw-animate-css` отсутствует. Анимационные классы работают во всех соответствующих компонентах.
- В репозитории нет CSS-модулей и импортов CSS/SCSS, кроме `app/globals.css`.
- Нет инлайновых стилей, кроме задания CSS‑переменных (например, `--accent`, `--progress`). Все визуальные свойства выражены Tailwind-классами.
- Все «ссылки как кнопки» реализованы через `Button asChild` или `buttonVariants`.
- Компоненты `components/ui/*` поддерживают `className`, используют `cn`, применяют `cva` для вариантов (где уместно), имеют корректные фокус/aria состояния.
- Визуальный паритет/улучшение подтвержден на страницах:
  - `/(routes)/403`
  - `/org/dashboard` (включая `SiteHeader`, `SectionCards`, `DataTable`)
  - `/org/[orgSlug]/*` (включая `OrgHeader`)
  - `/events/[eventId]`
  - `/checkout/[bookingId]`
- Линт/типизация/сборка проходят без ошибок.

### Риски и смягчающие меры

- Несовместимость классов между `tw-animate-css` и `tailwindcss-animate`: адресовать точечными заменами, покрыть визуальной проверкой модалок/меню/tooltip.
- Динамические цвета бренда: централизовать через `--accent` на ближайшем контейнере, каскадно применять в дочерних элементах.
- Возможные отличия в размерах/отступах после унификации кнопок: согласовать `variant/size` в `button.tsx` (при необходимости добавить `xs`/`md`).

### Технические примеры (референсные фрагменты)

1) Ссылка как кнопка

```tsx
<Button asChild variant="outline" size="sm">
  <Link href="/org/dashboard/settings">Настройки</Link>
</Button>
```

2) Акцентный цвет через CSS‑переменную

```tsx
<div style={{ "--accent": accent }} className="border-b border-[var(--accent)] pb-2">
  <Badge variant="secondary" className="bg-[color:var(--accent)/0.125] text-[var(--accent)]">Организатор</Badge>
</div>
```

3) Прогресс через ширину

```tsx
<ProgressPrimitive.Root className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
  <ProgressPrimitive.Indicator style={{ "--progress": value ?? 0 }} className="h-full w-[calc(var(--progress)*1%)] bg-primary transition-all" />
</ProgressPrimitive.Root>
```

### Чек‑лист ревью перед мерджем

- [ ] `tw-animate-css` удален, `tailwindcss-animate` подключен.
- [ ] Нет `style={` кроме задания `--*` и нет `*.module.css`.
- [ ] Все ссылки-кнопки унифицированы на `Button asChild`.
- [ ] Ария/фокус/контрасты соответствуют shadcn.
- [ ] Ключевые страницы визуально проверены.

### Оценка объема работ

- Замена зависимостей и настройка
- Рефактор инлайновых стилей и ссылок-кнопок
- Аудит и доводка компонентов ui/*
- Визуальная приемка
