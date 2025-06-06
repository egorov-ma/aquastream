# Библиотека UI компонентов AquaStream

В этом документе описаны основные UI компоненты, используемые в проекте AquaStream, принципы их создания и использования.

## Философия дизайн-системы

Наша дизайн-система основана на принципах:

1. **Консистентность** - все компоненты следуют единому стилю и поведению
2. **Доступность** - компоненты соответствуют стандартам WCAG 2.1 AA
3. **Гибкость** - возможность настройки через пропсы без необходимости создания новых компонентов
4. **Производительность** - оптимизация для быстрой работы
5. **Масштабируемость** - возможность расширения системы

## Технологический стек

Наша UI библиотека построена на:

- **React** - библиотека для создания компонентов
- **TypeScript** - для типизации и улучшения разработки
- **Tailwind CSS** - для стилизации компонентов
- **Storybook** - для документирования и тестирования компонентов в изоляции
- **Vitest** - для тестирования компонентов

## Архитектура компонентов

Все UI компоненты расположены в директории `src/components/ui`. Каждый компонент имеет следующую структуру:

```
src/components/ui/
  ├── ComponentName/
  │   ├── ComponentName.tsx      # Основной файл компонента
  │   ├── ComponentName.test.tsx # Тесты
  │   ├── ComponentName.stories.tsx # Документация Storybook
  │   └── index.ts               # Файл экспорта
  └── index.ts                   # Общий файл экспорта всех компонентов
```

## Основные компоненты

### Базовые компоненты

Базовые компоненты - это низкоуровневые элементы, которые используются для создания более сложных компонентов.

#### Button

Кнопка с различными вариантами стилей, размеров и состояний.

**Пропсы:**
- `variant` - вариант стиля кнопки: `primary`, `secondary`, `outlined`
- `size` - размер кнопки: `small`, `medium`, `large`
- `disabled` - отключает кнопку
- `fullWidth` - растягивает кнопку на всю ширину контейнера
- `startIcon` - иконка в начале кнопки
- `endIcon` - иконка в конце кнопки
- `children` - содержимое кнопки

#### TextField

Поле ввода текста с различными вариантами стилей.

**Пропсы:**
- `variant` - вариант стиля поля: `standard`, `outlined`, `filled`, `floating`
- `size` - размер поля: `small`, `medium`, `large`
- `label` - метка поля
- `placeholder` - подсказка внутри поля
- `value` - значение поля
- `onChange` - функция обратного вызова при изменении значения
- `error` - флаг ошибки
- `errorText` - текст ошибки
- `helperText` - вспомогательный текст
- `fullWidth` - растягивает поле на всю ширину контейнера
- `disabled` - отключает поле
- `startIcon` - иконка в начале поля
- `endIcon` - иконка в конце поля
- `type` - тип поля: `text`, `password`, `email`, и т.д.
- `required` - указывает, что поле обязательно

#### Typography

Компонент для отображения текста с различными стилями.

**Пропсы:**
- `variant` - вариант типографики: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body1`, `body2`, `subtitle1`, `subtitle2`, `caption`
- `color` - цвет текста: `primary`, `secondary`, `success`, `error`, `warning`, `info`, `disabled`
- `align` - выравнивание текста: `left`, `center`, `right`, `justify`
- `noWrap` - предотвращает перенос текста
- `children` - текстовое содержимое

### Компоненты форм

#### Checkbox

Чекбокс для выбора опций.

**Пропсы:**
- `checked` - состояние чекбокса
- `onChange` - функция обратного вызова при изменении состояния
- `label` - метка чекбокса
- `disabled` - отключает чекбокс
- `error` - флаг ошибки
- `size` - размер чекбокса: `small`, `medium`, `large`

### Компоненты обратной связи

#### Modal

Модальное окно для отображения содержимого поверх основного интерфейса.

**Пропсы:**
- `open` - состояние открытия модального окна
- `onClose` - функция обратного вызова при закрытии окна
- `title` - заголовок окна
- `children` - содержимое окна
- `actions` - действия в нижней части окна
- `maxWidth` - максимальная ширина окна: `xs`, `sm`, `md`, `lg`, `xl`, `full`

## Использование в проекте

### Импорт компонентов

```tsx
import { Button, TextField, Typography } from '@/components/ui';
```

### Пример использования

```tsx
import { Button, TextField, Typography } from '@/components/ui';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Логика авторизации
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Typography variant="h3" color="primary">
        Вход в систему
      </Typography>
      
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant="outlined"
        fullWidth
        required
      />
      
      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        fullWidth
        required
      />
      
      <Button variant="primary" type="submit" fullWidth>
        Войти
      </Button>
    </form>
  );
};
```

## Документация и примеры

Полная документация по компонентам доступна в Storybook. Для запуска документации выполните:

```bash
npm run storybook
```

## Рекомендации по использованию

1. **Используйте только библиотечные компоненты** - не создавайте дублирующие компоненты
2. **Следуйте принципам** - используйте компоненты согласно их назначению
3. **Расширяйте через пропсы** - используйте `className` для дополнительных стилей
4. **Соблюдайте иерархию** - используйте Typography для текста, а не обычные HTML-теги

## Вклад в развитие библиотеки

При разработке новых компонентов следуйте установленным правилам и соглашениям:

1. Размещайте компоненты в отдельных директориях в `src/components/ui`
2. Обеспечьте полное покрытие тестами
3. Создайте документацию в Storybook с примерами использования
4. Экспортируйте компонент в общем файле `index.ts`
5. При необходимости обновите этот документ

## Версионирование

Для отслеживания изменений в библиотеке компонентов мы используем семантическое версионирование:

- **Major** - несовместимые изменения API
- **Minor** - новая функциональность с обратной совместимостью
- **Patch** - исправления ошибок с обратной совместимостью 