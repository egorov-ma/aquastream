# Рекомендации по работе со Storybook

Этот документ содержит рекомендации по использованию Storybook для документирования компонентов интерфейса в проекте AquaStream.

## Введение

[Storybook](https://storybook.js.org/) - это инструмент для разработки и документирования UI компонентов в изолированной среде. Он позволяет разрабатывать компоненты независимо от приложения и демонстрировать их различные состояния.

## Запуск Storybook

Для запуска Storybook выполните:

```bash
npm run storybook
```

Storybook будет доступен по адресу http://localhost:6006

## Создание историй

### Структура файла историй

Каждый компонент должен иметь соответствующий файл `.stories.tsx` со следующей структурой:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

const meta = {
  title: 'Категория/ИмяКомпонента',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Определение аргументов компонента
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Примеры историй
export const Default: Story = {
  args: {
    // Значения пропсов для этой истории
  },
};
```

### Категории компонентов

Используйте следующие категории для организации компонентов:

- **UI** - базовые компоненты интерфейса (кнопки, поля ввода и т.д.)
- **Forms** - компоненты для работы с формами
- **Layout** - компоненты для организации макета страницы
- **Navigation** - компоненты для навигации
- **Feedback** - компоненты для обратной связи (алерты, тосты и т.д.)
- **Data Display** - компоненты для отображения данных (таблицы, списки и т.д.)
- **Pages** - целые страницы приложения

### Документирование аргументов

Используйте `argTypes` для описания всех свойств компонента:

```tsx
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'outlined'],
    description: 'Вариант стиля компонента',
  },
  size: {
    control: { type: 'radio' },
    options: ['small', 'medium', 'large'],
    description: 'Размер компонента',
  },
  disabled: {
    control: 'boolean',
    description: 'Отключает компонент',
  },
  onClick: {
    action: 'clicked',
    description: 'Функция обратного вызова при клике',
  },
}
```

### Создание историй для разных состояний

Для каждого компонента создавайте истории, демонстрирующие:

1. Базовое использование компонента
2. Различные варианты стилей
3. Различные размеры
4. Состояния (отключено, ошибка, загрузка и т.д.)
5. Примеры с разными свойствами

```tsx
// Базовое использование
export const Default: Story = {
  args: {
    children: 'Кнопка',
  },
};

// Варианты стилей
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Основная кнопка',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Второстепенная кнопка',
  },
};

// Размеры
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Маленькая кнопка',
  },
};

// Состояния
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Отключенная кнопка',
  },
};
```

### Интерактивные истории

Для более сложных случаев используйте функцию `render` и React-хуки:

```tsx
const InteractiveDemo = () => {
  const [value, setValue] = useState('');
  
  return (
    <TextField
      label="Интерактивное поле"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      helperText={`Вы ввели: ${value}`}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
```

## Создание документации

Используйте addons для добавления дополнительной документации:

```tsx
export const WithExample: Story = {
  args: {
    // ...
  },
  parameters: {
    docs: {
      description: {
        story: 'Это пример использования компонента в определенной ситуации.',
      },
    },
  },
};
```

## Тестирование доступности

Storybook автоматически проверяет компоненты на доступность с помощью addon-a11y. Обращайте внимание на результаты этих проверок и устраняйте проблемы.

## Советы и рекомендации

1. **Начинайте с документации** - создавайте истории Storybook одновременно с разработкой компонента
2. **Обновляйте регулярно** - поддерживайте истории в актуальном состоянии при изменении компонентов
3. **Демонстрируйте крайние случаи** - показывайте как компонент справляется с длинным текстом, ошибками и т.д.
4. **Используйте дополнения (addons)** - для расширения возможностей документации
5. **Тестируйте в разных размерах** - проверяйте как компонент выглядит на разных устройствах

## Дополнительные ресурсы

- [Официальная документация Storybook](https://storybook.js.org/docs/react/get-started/introduction)
- [Примеры историй](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Аргументы компонентов](https://storybook.js.org/docs/react/writing-stories/args)
- [Документирование компонентов](https://storybook.js.org/docs/react/writing-docs/introduction) 