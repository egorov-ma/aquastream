# Shadcn UI Coverage

## Layout & Structure
- `Section`, `Stack`, `PageHeader`, `Toolbar` — базовые примитивы для секций, вертикальных/горизонтальных стеков и хедеров страниц. Используются в большинстве страниц (`app/(routes)/*`).
- `DataTableShell` — универсальная обёртка таблиц с заголовком, тулбаром и футером. Применена в админке, модерации, дашборде организатора и каталогах (`components/org-dashboard/DataTable`, `app/(routes)/admin/page`, `components/org/EventsDataTable`, `components/org/OrgEventsTable`).

## Navigation
- `NavigationMenu` + `Toolbar` используются в `components/header.tsx` для субнавигации организаций.
- `Sidebar` + `Toolbar` образуют хедер панели организатора (`components/org-dashboard/SiteHeader.tsx`).

## Data Display
- `Card`, `Table` и их слоты — базис для всех дашбордных секций (`SectionCards`, `DataTableShell`).
- `TableEmpty` + `LoadingState`/`EmptyState`/`ErrorState` обеспечивают единые паттерны состояния.

## Forms & Feedback
- `Form`, `Input`, `Select`, `Alert`, `Dialog`, `Textarea` — стандарт shadcn; кастомные сценарии (например, модерация) используют их через `data-slot`.

## Правила использования
1. **Новые таблицы** создаём только через `DataTableShell` + `Table` + `TableEmpty`. Состояния — через `states.tsx`.
2. **Хедеры и тулбары** всегда строим на `Toolbar`/`PageHeader`. Если нужен коллапс/дополнения — расширение через `data-slot` и `className` c токенами Tailwind.
3. **Навигация**: горизонтальная — `NavigationMenu`, боковая — `Sidebar` (`components/ui/sidebar.tsx`).
4. **Расширения shadcn** фиксируем здесь: при добавлении нового паттерна описываем компонент и страницы, где он используется.

## Контроль расхождений
- Проверяем PR на предмет использования `DataTableShell`, `Toolbar`, `PageHeader` вместо кастомных `div` с `flex`/`grid`.
- При появлении нового паттерна добавляем его в этот документ и в `docs/frontend/stack.md`.
- `tailwind-merge` и `cn` покрывают `group-data-*`, `data-*`, `size-*` — логику тестирует `tests/unit/cn.test.ts`.

