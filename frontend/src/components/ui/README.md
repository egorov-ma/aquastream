# UI Components

Библиотека UI компонентов AquaStream содержит базовые компоненты интерфейса, которые используются во всем приложении. Все компоненты построены на Tailwind CSS и следуют принципам атомарного дизайна.

## Установка и использование компонентов

Компоненты доступны внутри проекта и могут быть импортированы следующим образом:

```tsx
import { Button, TextField, Typography } from '@/components/ui';
```

## Документация компонентов

Для просмотра документации и примеров использования компонентов, запустите Storybook:

```bash
npm run storybook
```

Storybook будет доступен по адресу http://localhost:6006

## Основные компоненты

### Button

Кнопка с различными вариантами стилей, размеров и возможностью добавления иконок.

```tsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Нажми меня
</Button>
```

### TextField

Поле ввода текста с различными вариантами стилей, состояниями ошибок и подсказками.

```tsx
<TextField 
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

## Вклад в разработку

При создании новых компонентов следуйте следующим правилам:

1. Размещайте компоненты в отдельных каталогах внутри `src/components/ui/`
2. Для каждого компонента создавайте соответствующие файлы:
   - `ComponentName.tsx` - основной файл компонента
   - `ComponentName.test.tsx` - тесты компонента
   - `ComponentName.stories.tsx` - документация и примеры использования в Storybook
   - `index.ts` - файл экспорта компонента
3. Следуйте соглашениям по стилям кода и обеспечьте полное покрытие тестами
4. Обновляйте документацию Storybook при добавлении новых возможностей 