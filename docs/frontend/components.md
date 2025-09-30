# Компоненты

Статус: as-is

## Соглашения
- UI — shadcn/ui (Radix) + Tailwind; без кастомных CSS
- Папки по доменам/страницам, общие примитивы в `components/ui/*`
- Именование: PascalCase, тест‑идентификаторы `data-test-id`

## Примитивы
- `Section`, `Stack`, `PageHeader`, `Toolbar`, `DataTableShell`
- Состояния: `LoadingState`, `EmptyState`, `ErrorState`

## Рецепты
- DatePicker: `Calendar` + `Popover`
- DataTable: `Table` + TanStack Table
