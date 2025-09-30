# Компоненты

## Обзор

Архитектура компонентов основана на shadcn/ui (Radix UI) + Tailwind CSS с четким разделением на UI примитивы, доменные компоненты и страницы.

## Структура

```
components/
├── ui/                    # shadcn/ui примитивы
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── section.tsx       # Layout примитив
│   ├── stack.tsx         # Flex layout
│   ├── page-header.tsx
│   ├── toolbar.tsx
│   ├── data-table-shell.tsx
│   └── states.tsx        # LoadingState, EmptyState, ErrorState
├── auth/                  # Компоненты аутентификации
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── RecoveryForm.tsx
├── checkout/              # Компоненты оплаты
│   ├── PaymentWidget.tsx
│   ├── QrSection.tsx
│   └── BookingTimer.tsx
├── org/                   # Компоненты организатора
│   ├── OrgCard.tsx
│   ├── EventsDataTable.tsx
│   └── TeamMemberCard.tsx
└── header.tsx             # Глобальный header
```

## UI Примитивы (shadcn/ui)

### Layout компоненты

**Section** - контейнер страницы:
```tsx
<Section width="lg" padding="md" align="center">
  <Content />
</Section>
```

**Stack** - flex layout:
```tsx
<Stack direction="vertical" gap="4">
  <Item1 />
  <Item2 />
</Stack>
```

**PageHeader** - заголовок страницы:
```tsx
<PageHeader
  title="Мои бронирования"
  description="Управление вашими бронированиями"
  actions={<Button>Новое</Button>}
/>
```

**Toolbar** - панель с кнопками:
```tsx
<Toolbar>
  <ToolbarGroup>
    <Search />
    <Filters />
  </ToolbarGroup>
  <ToolbarSpacer />
  <ToolbarGroup>
    <Button>Создать</Button>
  </ToolbarGroup>
</Toolbar>
```

### Form компоненты

**shadcn/ui формы**:
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`
- `DatePicker` = `Calendar` + `Popover`

**Валидация**: React Hook Form + Zod

```tsx
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Таблицы

**DataTableShell** - каркас таблицы:
```tsx
<DataTableShell
  title="События"
  description="Список всех событий"
  toolbar={<Filters />}
>
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>...</TableBody>
  </Table>
</DataTableShell>
```

**TableEmpty** - пустое состояние:
```tsx
<TableBody>
  {data.length === 0 ? (
    <TableEmpty>
      <EmptyState 
        icon={Calendar}
        title="Нет событий"
        description="Создайте первое событие"
        action={<Button>Создать</Button>}
      />
    </TableEmpty>
  ) : (
    data.map(...)
  )}
</TableBody>
```

### Состояния

```tsx
// Loading
<LoadingState message="Загрузка событий..." />

// Empty
<EmptyState 
  icon={Inbox}
  title="Список пуст"
  description="Здесь пока ничего нет"
/>

// Error
<ErrorState 
  title="Ошибка загрузки"
  description={error.message}
  action={<Button onClick={retry}>Повторить</Button>}
/>
```

## Доменные компоненты

### Аутентификация

**LoginForm** (`components/auth/LoginForm.tsx`):
- Card + Form + Input + Button
- Validation: email, password
- Submit → POST /api/auth/login
- Success → redirect /dashboard

**RegisterForm**:
- Email, password, phone
- Password strength indicator
- Terms acceptance checkbox

### Оплата

**PaymentWidget** (`components/checkout/PaymentWidget.tsx`):
- Integration с YooKassa/CloudPayments/Stripe
- Render widget в iframe
- Handle success/failure callbacks

**QrSection** (`components/checkout/QrSection.tsx`):
- Display QR code
- Upload proof (screenshot)
- Status indicator

**BookingTimer**:
- Countdown: 30 минут
- Real-time update каждую секунду
- Alert за 5 минут до истечения
- Redirect при истечении

### Организатор

**OrgCard** (`components/org/OrgCard.tsx`):
- Logo, название, описание
- Brand color accent
- Link на страницу организатора

**EventsDataTable**:
- Table с фильтрами
- Columns: title, date, status, capacity, actions
- Pagination, sorting
- Row actions: edit, delete, publish

**TeamMemberCard**:
- Photo, имя, роль, bio
- Responsive grid layout

### Модерация

**ModerationQueue**:
- Table QR-платежей
- Proof preview (modal)
- Accept/Reject buttons
- Comment textarea

## Styling Conventions

### Tailwind + Design Tokens

```tsx
// ✅ Используйте токены
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Кнопка
  </Button>
</div>

// ❌ Не используйте прямые значения
<div className="bg-white text-black">
  <button className="bg-blue-500">Кнопка</button>
</div>
```

### Dark/Light Theme

```tsx
// Автоматическое переключение через CSS variables
<div className="bg-card border-border">
  <h1 className="text-card-foreground">Заголовок</h1>
</div>
```

## Best Practices

### Naming

- **PascalCase**: компоненты (`LoginForm.tsx`)
- **camelCase**: utilities, hooks (`useAuth.ts`)
- **kebab-case**: CSS классы (через Tailwind)

### Testing

- **data-testid**: для E2E тестов Playwright
- **роли ARIA**: для accessibility

```tsx
<Button 
  data-testid="submit-button"
  aria-label="Отправить форму"
>
  Отправить
</Button>
```

### Accessibility

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

### Performance

- Lazy loading: `React.lazy()` для больших компонентов
- Мемоизация: `React.memo()` для дорогих renders
- Image optimization: Next.js `<Image>`
- Code splitting: автоматически по routes

## Компонентная библиотека

### shadcn/ui компоненты

**Базовые**:
- Button, Input, Textarea, Label
- Card, CardHeader, CardContent, CardFooter
- Badge, Avatar, Separator

**Навигация**:
- NavigationMenu, Sidebar
- Breadcrumb, Tabs
- Dropdown Menu

**Формы**:
- Form (React Hook Form)
- Select, Checkbox, RadioGroup, Switch
- Calendar, DatePicker

**Feedback**:
- Alert, AlertDialog
- Toast, Sonner
- Progress, Skeleton

**Overlays**:
- Dialog, Sheet
- Popover, Tooltip
- Command (⌘K menu)

**Data Display**:
- Table, DataTable
- Accordion, Collapsible

См. полный список в [shadcn/ui docs](https://ui.shadcn.com/docs/components)

## Кастомные extensions

- `Section`, `Stack` - layout primitives
- `PageHeader`, `Toolbar` - page layout
- `DataTableShell` - table wrapper
- `TableEmpty` - empty state для tables
- `LoadingState`, `EmptyState`, `ErrorState` - feedback states

## См. также

- [Frontend Setup](setup.md) - настройка
- [State Management](state-management.md) - управление состоянием
- [API Integration](api-integration.md) - интеграция с backend
