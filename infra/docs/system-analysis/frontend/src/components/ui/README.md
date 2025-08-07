# UI Components

Библиотека UI компонентов AquaStream содержит базовые компоненты интерфейса, которые используются во всем приложении. Все компоненты построены на Tailwind CSS и следуют принципам атомарного дизайна.

## Установка и использование компонентов

Компоненты доступны внутри проекта и могут быть импортированы следующим образом:

```tsx
import { Button, Input, Typography } from '@/components/ui';
```

## Документация компонентов

Для просмотра документации и примеров использования компонентов, запустите Storybook:

```bash
npm run storybook
```

Storybook будет доступен по адресу http://localhost:6006

## Атомарный дизайн

Библиотека UI компонентов следует принципам атомарного дизайна, который предполагает разделение компонентов на 5 уровней:

1. **Атомы** - базовые строительные блоки (кнопки, текстовые поля, иконки)
2. **Молекулы** - простые группы атомов (форма поиска, навигационное меню)
3. **Организмы** - сложные компоненты, состоящие из молекул и атомов (заголовок, панель навигации)
4. **Шаблоны** - макеты страниц без содержимого
5. **Страницы** - конкретные экземпляры шаблонов с реальными данными

Такая организация обеспечивает:
- Единообразие интерфейса
- Простоту поддержки
- Переиспользуемость компонентов
- Удобное масштабирование UI системы

## Основные компоненты

### Button

Кнопка с различными вариантами стилей, размеров и возможностью добавления иконок.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Нажми меня
</Button>
```

### Input

Поле ввода текста с различными вариантами стилей, состояниями ошибок и подсказками.

```tsx
<Input
  label="Email"
  placeholder="Введите email"
  value={email}
  onChange={handleEmailChange}
  variant="outlined"
/>
```

### Typography

Компонент для отображения текста различных типов (заголовки, параграфы и т.д.).

```tsx
<Typography variant="h1" color="primary">
  Главный заголовок
</Typography>
```

### Modal

Модальное окно для отображения содержимого поверх основного интерфейса.

```tsx
<Modal 
  open={isOpen} 
  onClose={handleClose} 
  title="Информация" 
  actions={
    <Button variant="primary" onClick={handleClose}>OK</Button>
  }
>
  <Typography variant="body1">
    Содержимое модального окна.
  </Typography>
</Modal>
```

### Checkbox

Компонент чекбокса для выбора опций.

```tsx
<Checkbox 
  label="Подтверждаю согласие" 
  checked={isChecked} 
  onChange={handleCheck} 
/>
```

## Тестирование компонентов

Все компоненты имеют соответствующие тесты. Для запуска тестов используйте команду:

```bash
npm test
```

## Создание нового компонента

При создании новых компонентов следуйте этим шагам:

1. **Определите уровень компонента** (атом, молекула, организм)
2. **Создайте директорию и файлы**:
   ```
   components/ui/ComponentName/
   ├── ComponentName.tsx         # Основной компонент
   ├── ComponentName.types.ts    # Типы и интерфейсы (при необходимости)
   ├── ComponentName.test.tsx    # Тесты компонента
   ├── ComponentName.styles.ts   # Стили (при необходимости)
   ├── ComponentName.stories.tsx # Storybook истории
   └── index.ts                  # Экспорт компонента
   ```

3. **Создайте компонент**, следуя соглашениям:
   ```tsx
   import React from 'react';
   import { cn } from '@/utils';
   
   export interface ComponentProps {
     /** Основное содержимое компонента */
     children: React.ReactNode;
     /** Дополнительные CSS классы */
     className?: string;
     /** Обработчик события клика */
     onClick?: () => void;
   }
   
   export const Component: React.FC<ComponentProps> = ({
     children,
     className,
     onClick,
   }) => {
     return (
       <div className={cn('base-classes', className)} onClick={onClick}>
         {children}
       </div>
     );
   };
   ```

4. **Создайте файл экспорта** index.ts:
   ```tsx
   export * from './Component';
   ```

5. **Напишите тесты** с помощью React Testing Library:
   ```tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import { Component } from './Component';
   
   describe('Component', () => {
     it('renders children correctly', () => {
       render(<Component>Test</Component>);
       expect(screen.getByText('Test')).toBeInTheDocument();
     });
     
     it('responds to click events', () => {
       const handleClick = vi.fn();
       render(<Component onClick={handleClick}>Click me</Component>);
       fireEvent.click(screen.getByText('Click me'));
       expect(handleClick).toHaveBeenCalledTimes(1);
     });
   });
   ```

6. **Создайте истории Storybook**:
   ```tsx
   import type { Meta, StoryObj } from '@storybook/react';
   import { Component } from './Component';
   
   const meta: Meta<typeof Component> = {
     component: Component,
     title: 'UI/Component',
     tags: ['autodocs'],
     argTypes: {
       // Определите аргументы здесь
     },
   };
   
   export default meta;
   
   type Story = StoryObj<typeof Component>;
   
   export const Default: Story = {
     args: {
       children: 'Default Component',
     },
   };
   ```

7. **Добавьте компонент к экспорту** в components/ui/index.ts

## Рекомендации по созданию компонентов

1. **Принцип единой ответственности** - компонент должен делать что-то одно и делать это хорошо
2. **Доступность (a11y)** - компоненты должны быть доступны для всех пользователей
3. **Typescript везде** - все пропсы должны быть типизированы
4. **Документированные пропсы** - используйте JSDoc для описания пропсов
5. **Переиспользуемость** - компоненты должны быть переиспользуемыми и не должны зависеть от контекста
6. **Тестирование** - каждый компонент должен быть покрыт тестами
7. **Стили** - используйте Tailwind для стилизации и утилиту `cn` для объединения классов
8. **Документирование в Storybook** - создавайте подробные истории для компонентов 