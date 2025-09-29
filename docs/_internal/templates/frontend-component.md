# {Component Name}

---
title: {Component Name}
summary: {Краткое описание компонента и его назначения}
tags: [frontend, component, react, {category}]
---

## Описание

{Подробное описание компонента и его роли в приложении}

**Назначение:**
- {Основная функция 1}
- {Основная функция 2}
- {Основная функция 3}

## Использование

### Базовое использование

```tsx
import { {ComponentName} } from '@/components/{category}/{ComponentName}'

export function Example() {
  return (
    <{ComponentName}
      {prop1}="{value1}"
      {prop2}="{value2}"
    >
      {content}
    </{ComponentName}>
  )
}
```

### Продвинутое использование

```tsx
import { {ComponentName} } from '@/components/{category}/{ComponentName}'
import { useState } from 'react'

export function AdvancedExample() {
  const [state, setState] = useState(initialValue)

  const handleAction = () => {
    // логика обработки
  }

  return (
    <{ComponentName}
      {prop1}={state}
      {prop2}={handleAction}
      variant="advanced"
      size="lg"
    >
      {content}
    </{ComponentName}>
  )
}
```

## API Reference

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `{prop1}` | `{type}` | `{default}` | ✅/❌ | {Описание свойства} |
| `{prop2}` | `{type}` | `{default}` | ✅/❌ | {Описание свойства} |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | ❌ | Визуальный вариант компонента |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | ❌ | Размер компонента |
| `disabled` | `boolean` | `false` | ❌ | Отключает взаимодействие |
| `className` | `string` | `undefined` | ❌ | Дополнительные CSS классы |
| `children` | `ReactNode` | `undefined` | ❌ | Дочерние элементы |

### Events

| Event | Type | Description |
|-------|------|-------------|
| `onClick` | `(event: MouseEvent) => void` | Вызывается при клике |
| `onChange` | `(value: {Type}) => void` | Вызывается при изменении значения |
| `onSubmit` | `(data: {Type}) => void` | Вызывается при отправке формы |

## Варианты

### Размеры

```tsx
<{ComponentName} size="sm">Small</{ComponentName}>
<{ComponentName} size="md">Medium</{ComponentName}>
<{ComponentName} size="lg">Large</{ComponentName}>
```

### Состояния

```tsx
{/* Нормальное состояние */}
<{ComponentName}>Normal</{ComponentName}>

{/* Отключенное состояние */}
<{ComponentName} disabled>Disabled</{ComponentName}>

{/* Состояние загрузки */}
<{ComponentName} loading>Loading</{ComponentName}>

{/* Состояние ошибки */}
<{ComponentName} error="Error message">Error</{ComponentName}>
```

## Стилизация

### CSS классы

| Класс | Описание |
|-------|----------|
| `.{component-name}` | Основной контейнер |
| `.{component-name}__header` | Заголовок |
| `.{component-name}__content` | Содержимое |
| `.{component-name}__footer` | Подвал |
| `.{component-name}--{variant}` | Модификатор варианта |
| `.{component-name}--{size}` | Модификатор размера |

### CSS переменные

```css
.{component-name} {
  --{component-name}-bg: #{цвет фона};
  --{component-name}-color: #{цвет текста};
  --{component-name}-border: #{цвет границы};
  --{component-name}-radius: #{радиус закругления};
  --{component-name}-shadow: #{тень};
  --{component-name}-spacing: #{отступы};
}
```

### Кастомизация через Tailwind

```tsx
<{ComponentName}
  className="bg-blue-500 text-white rounded-lg shadow-lg"
>
  Custom styled
</{ComponentName}>
```

## Доступность (A11y)

**Поддерживаемые ARIA атрибуты:**
- `aria-label` - альтернативный текст
- `aria-describedby` - ссылка на описание
- `aria-expanded` - состояние раскрытия (для раскрывающихся элементов)
- `aria-disabled` - состояние отключения

**Клавиатурная навигация:**
- `Tab` / `Shift+Tab` - навигация между элементами
- `Enter` / `Space` - активация элемента
- `Escape` - закрытие модальных окон/меню
- `Arrow keys` - навигация в списках/меню

## Тестирование

### Unit тесты

```bash
# Запуск тестов компонента
make test-frontend COMPONENT={ComponentName}

# Тесты с покрытием
make test-frontend-coverage COMPONENT={ComponentName}
```

**Основные тест-кейсы:**
- Рендеринг с базовыми props
- Обработка пользовательских событий
- Корректное отображение различных состояний
- Доступность (a11y testing)

### E2E тесты

```bash
# Тесты взаимодействия
make e2e-test COMPONENT={ComponentName}
```

## Производительность

**Оптимизации:**
- Используется `React.memo` для предотвращения лишних ре-рендеров
- Ленивая загрузка тяжелых зависимостей
- Оптимизированные CSS анимации

**Метрики:**
- Bundle size impact: `{размер в KB}`
- Initial render time: `<{время}ms`
- Re-render performance: `<{время}ms`

```bash
# Анализ размера бандла
make bundle-analyze COMPONENT={ComponentName}

# Performance профилирование
make perf-profile COMPONENT={ComponentName}
```

## Примеры использования

### В формах

```tsx
import { {ComponentName} } from '@/components/{category}/{ComponentName}'
import { useForm } from 'react-hook-form'

export function FormExample() {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <{ComponentName}
        {...register('{fieldName}')}
        placeholder="Введите значение"
        required
      />
    </form>
  )
}
```

### С состоянием

```tsx
import { {ComponentName} } from '@/components/{category}/{ComponentName}'
import { useState } from 'react'

export function StatefulExample() {
  const [value, setValue] = useState('')

  return (
    <{ComponentName}
      value={value}
      onChange={setValue}
      onSubmit={(data) => {
        // обработка отправки
      }}
    />
  )
}
```

## Связанные компоненты

- [{RelatedComponent1}](./{RelatedComponent1}.md) - {краткое описание связи}
- [{RelatedComponent2}](./{RelatedComponent2}.md) - {краткое описание связи}

## См. также

- [Frontend Architecture](../README.md) - общая архитектура frontend
- [Design System](../design-system.md) - дизайн система и гайдлайны
- [Component Development](../development/components.md) - разработка компонентов
- [Testing Guide](../../qa/test-plans/frontend-testing.md) - тестирование frontend