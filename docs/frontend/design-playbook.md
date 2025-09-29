# Frontend Design Playbook

## Назначение
Этот плейбук описывает, как собирать и развивать UI AquaStream на основе shadcn/ui и Tailwind. Документ предназначен для дизайнеров и фронтендеров, чтобы новые экраны оставались консистентными, использовали общие токены и не дублировали паттерны.

## Фундаментальные токены
Токены определены в `app/globals.css:1` и проброшены в Tailwind через `tailwind.config.ts:1`.

### Цвет
- Базовая палитра (`--background`, `--foreground`, `--primary`, `--accent`, `--destructive`, `--muted`, `--secondary`) + набор для сайдбара (`--sidebar-*`) и графиков (`--chart-*`).
- Цвета доступны в Tailwind как `bg-background`, `text-foreground`, `bg-primary`, `border`, `ring`, и т. д. Пользуемся готовыми токенами — никаких hex/oklch напрямую в компонентах.
- Тёмная тема переопределяет те же токены в `.dark { ... }`, поэтому состояние темы переключается без дополнительных классов.

### Типографика
- Гарнитуры (`--font-sans`, `--font-serif`, `--font-mono`) подключены через `next/font` и доступны в Tailwind как `font-sans`, `font-serif`, `font-mono`.
- Базовый кегль и line-height задаёт Tailwind; для заголовков используем `PageHeader`/`Section` слоты.
- Трекинг регулируется токенами `--tracking-*` и применяется в Tailwind утилитами (`tracking-tight`, `tracking-wide`).

### Радиусы и тени
- Сквозной радиус `--radius` + производные (`--radius-sm`, `--radius-lg`, `borderRadius.xs/xl`). Компоненты shadcn уже читают их из Tailwind (`rounded-lg`, `rounded-xl`).
- Набор теней (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`) конфигурирован через CSS-переменные и используется стандартными Tailwind-классами.

### Отступы
- Tailwind spacing расширяет токены `spacing` из темы; дополнительная утилита `size-*` возвращена плагином в `tailwind.config.ts:46` и позволяет задавать одинаковую ширину/высоту (`size-6`, `size-14`).

## Базовые примитивы (layout)
- `Section` (`components/ui/section.tsx:1`) — основной контейнер страницы. Управляет сеткой, шириной, паддингами, выравниванием. Используем для верхнего уровня маршрута и крупных блоков.
- `Stack` (`components/ui/stack.tsx:1`) — вертикальные/горизонтальные стеки с настройкой gap/align/justify/wrap. Полезно для форм, карточек.
- `PageHeader` (`components/ui/page-header.tsx:1`) — заголовок страницы + описание + actions.
- `Toolbar` (`components/ui/toolbar.tsx:1`) — горизонтальная панель с выравниванием и опцией `border`. Комбинируется с `ToolbarGroup`, `ToolbarSpacer` для хедеров, фильтров таблиц, модальных футеров.
- `DataTableShell` (`components/ui/data-table-shell.tsx:1`) — каркас таблицы: заголовок, тулбар, футер, Card-разметка.

## Состояния
- Единые состояния находятся в `components/ui/states.tsx:1`: `LoadingState`, `EmptyState`, `ErrorState`. Подключаем их через `TableEmpty`, страницы, модальные окна.
- `TableEmpty` (`components/ui/table.tsx:82`) заполняет tbody, если нет данных, и принимает произвольный child — чаще всего `states.tsx`.

## Компоненты shadcn
Каталог и расширения приведены в `docs/frontend/shadcn-components.md:1`. Основные правила:
1. Любая новая таблица/список использует `Table` + `DataTableShell` и `TableEmpty`.
2. Формы собираем через `Form`, `FormField`, `Input`, `Select` и т. п.; кастомные поля оформляем как слоты (`data-slot`).
3. Диалоги, поповеры, тултипы берем из shadcn без переписывания классов — достаточно `className` c токенами.
4. Локальные расширения обязательно документируем в `shadcn-components.md`.

## Шаблоны страниц и модулей
- **Дашборды** (`app/(routes)/org/dashboard/*`): верхушку формирует `PageHeader` + `Toolbar` (`SiteHeader`), секции — `Section`, карточки — `Card`. Таблицы используют `DataTableShell`.
- **Админка** (`app/(routes)/admin/page.tsx:15`): таблица ролей с `DataTableShell`, селекты shadcn.
- **Навигация**: глобальный `Header` (`components/header.tsx:22`) использует `Toolbar` + `NavigationMenu`, сайдбар — `Sidebar` (`components/ui/sidebar.tsx`).
- **Формы**: `components/login-form.tsx:1` — эталон dev-формы (Card + Form + Input + Button + вспом. ссылки).
- **Списки событий**: `components/org/EventsDataTable.tsx:81` / `components/org/OrgEventsTable.tsx:34` демонстрируют расширенные тулбары (поиск, фильтры, пагинация).

## Процесс добавления нового UI-паттерна
1. **Анализ** — убедитесь, что аналог уже не реализован (`docs/frontend/shadcn-components.md`). Если есть — используйте существующий компонент/слот.
2. **Проектирование** — определите, какие токены нужны (цвет, радиус, spacing). Не вводите новые переменные без синхронизации с дизайном.
3. **Реализация** — строим на shadcn-примитивах (Radix + Tailwind). Классы только из токенов/утилит Tailwind, без «магических» значений.
4. **Состояния** — обязательно покрываем loading/empty/error, используя `states.tsx` или аналогичный паттерн.
5. **Тестирование** — `pnpm lint`, `pnpm test:unit`, `pnpm typecheck`, `pnpm build`. Для UI-сценариев добавляем Playwright-тест (см. TODO #9) или unit-тесты на утилиты.
6. **Документация** —
   - Добавляем запись в `docs/frontend/shadcn-components.md` (назначение, где используется).
   - При необходимости обновляем разделы плейбука или `docs/frontend/stack.md`.
   - В PR указываем, что соблюдены требования плейбука.

## Checklist для новых фичей/UI-изменений
- [ ] Использованы шадн-компоненты или задокументированные расширения.
- [ ] Цвета/радиусы/тени/spacing только через токены.
- [ ] Есть состояния: loading, empty, error.
- [ ] При необходимости — `PageHeader`/`Toolbar`/`Section` вместо кастомных `div`.
- [ ] Документация обновлена (`shadcn-components.md`, playbook, stack).
- [ ] `pnpm lint`, `pnpm test:unit`, `pnpm typecheck`, `pnpm build` выполнены локально.

## Как поддерживать актуальность
- Раз в квартал ревьюим UI против плейбука (см. `docs/frontend/process.md`).
- При обновлении зависимостей (Next, Tailwind, shadcn) фиксируем изменения в `docs/frontend/stack.md` и обновляем актуальные примитивы.
- Если добавляется новый дизайн-паттерн, сразу документируем его в этом файле и в `shadcn-components.md`.
