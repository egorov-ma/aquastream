# Руководство по доступности (A11y)

## Введение

Доступность (accessibility, сокращенно a11y) - это практика создания веб-приложений, которые могут использоваться всеми людьми, независимо от их способностей или ограничений. В AquaStream мы стремимся соответствовать стандартам WCAG 2.1 на уровне AA, чтобы обеспечить равный доступ к нашему приложению для всех пользователей.

## Стандарты и принципы

Мы следуем четырем основным принципам доступности WCAG:

1. **Воспринимаемость**: информация и компоненты пользовательского интерфейса должны быть представлены пользователям так, чтобы они могли воспринимать их.
2. **Управляемость**: компоненты пользовательского интерфейса и навигация должны быть управляемыми.
3. **Понятность**: информация и операции пользовательского интерфейса должны быть понятными.
4. **Надежность**: контент должен быть достаточно надежным, чтобы он мог быть интерпретирован различными пользовательскими агентами, включая вспомогательные технологии.

## Рекомендации по реализации

### 1. Семантическая разметка HTML

Используйте семантические элементы HTML для структурирования контента:

```jsx
// Плохо
<div className="header">
  <div className="title">Заголовок страницы</div>
</div>
<div className="nav">
  <div onClick={() => navigate('/')}>Главная</div>
</div>

// Хорошо
<header>
  <h1>Заголовок страницы</h1>
</header>
<nav>
  <a href="/">Главная</a>
</nav>
```

### 2. Атрибуты ARIA

Используйте ARIA-атрибуты для улучшения доступности:

```jsx
// Пример использования ARIA-атрибутов
<button 
  aria-expanded={isOpen} 
  aria-controls="dropdown-menu"
  onClick={toggleMenu}
>
  Меню
</button>
<ul 
  id="dropdown-menu" 
  aria-labelledby="dropdown-button"
  hidden={!isOpen}
>
  <li><a href="/profile">Профиль</a></li>
  <li><a href="/settings">Настройки</a></li>
</ul>
```

### 3. Фокус и навигация с клавиатуры

Обеспечьте правильную навигацию с помощью клавиатуры:

```jsx
// Компонент с обработкой клавиатурной навигации
function KeyboardNavigableMenu({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        items[activeIndex].action();
        break;
      default:
        break;
    }
  };
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li 
          key={item.id}
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
          className={index === activeIndex ? 'active' : ''}
          onClick={item.action}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### 4. Управление фокусом

Правильно управляйте фокусом, особенно в модальных окнах:

```jsx
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Сохраняем предыдущий активный элемент
      const previousActiveElement = document.activeElement;
      
      // Устанавливаем фокус на модальное окно
      modalRef.current?.focus();
      
      // Возвращаем фокус при закрытии
      return () => {
        previousActiveElement?.focus();
      };
    }
  }, [isOpen]);
  
  return isOpen ? (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button 
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  ) : null;
}
```

### 5. Контрастность и цветовая схема

Обеспечьте достаточный контраст текста:

```jsx
// Утилита для проверки контраста
function hasGoodContrast(foreground, background) {
  // Функция для расчета яркости цвета
  const getLuminance = (hexColor) => {
    const rgb = hexColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!rgb) return 0;
    
    const r = parseInt(rgb[1], 16) / 255;
    const g = parseInt(rgb[2], 16) / 255;
    const b = parseInt(rgb[3], 16) / 255;
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const ratio = (Math.max(getLuminance(foreground), getLuminance(background)) + 0.05) /
                (Math.min(getLuminance(foreground), getLuminance(background)) + 0.05);
  
  // WCAG AA требует соотношения не менее 4.5:1 для обычного текста
  // и 3:1 для крупного текста
  return ratio >= 4.5;
}

// Пример использования
const Button = ({ children, color = 'blue', size = 'md' }) => {
  // Проверка контраста
  const hasWarning = !hasGoodContrast(textColors[color], bgColors[color]);
  
  return (
    <button 
      className={`btn btn-${color} btn-${size}`}
      data-warning={hasWarning ? 'low-contrast' : undefined}
    >
      {children}
      {hasWarning && <span className="sr-only">Внимание: низкий контраст</span>}
    </button>
  );
};
```

### 6. Текстовые альтернативы и подписи

Добавляйте текстовые альтернативы к нетекстовому контенту:

```jsx
// Изображения должны иметь атрибут alt
<img 
  src="/images/trip_photo.jpg" 
  alt="Группа туристов сплавляется по реке Ока на рафте"
/>

// Для декоративных элементов используйте пустой alt
<img src="/images/divider.png" alt="" role="presentation" />

// Интерактивные элементы должны иметь доступные имена
<button aria-label="Закрыть уведомление">
  <svg>...</svg>
</button>
```

### 7. Адаптивный дизайн и масштабирование

Обеспечьте корректное отображение при масштабировании:

```css
/* Используйте относительные единицы измерения */
body {
  font-size: 16px;
}

h1 {
  font-size: 2rem; /* относительно размера шрифта корневого элемента */
}

.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
}

/* Обеспечьте корректное отображение при масштабировании */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
```

### 8. Формы и валидация

Обеспечьте доступность форм:

```jsx
function AccessibleForm() {
  const [errors, setErrors] = useState({});
  
  return (
    <form>
      <div>
        <label htmlFor="name">Имя</label>
        <input 
          id="name"
          type="text"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <div id="name-error" className="error" role="alert">
            {errors.name}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input 
          id="email"
          type="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <div id="email-error" className="error" role="alert">
            {errors.email}
          </div>
        )}
      </div>
      
      <button type="submit">Отправить</button>
    </form>
  );
}
```

### 9. Динамический контент и уведомления

Уведомляйте пользователей о динамических изменениях:

```jsx
function Notification({ message, type = 'info' }) {
  return (
    <div 
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`notification notification-${type}`}
    >
      {message}
    </div>
  );
}

// Использование
function App() {
  const [notification, setNotification] = useState(null);
  
  const showNotification = (message, type) => {
    setNotification({ message, type });
    
    // Автоматически скрываем уведомление
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  return (
    <div>
      {/* Компоненты приложения */}
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
        />
      )}
    </div>
  );
}
```

## Компоненты UI AquaStream и их доступность

### Button

```jsx
/**
 * Доступная кнопка с возможностью настройки ARIA-атрибутов
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  onClick,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Input

```jsx
/**
 * Доступное текстовое поле с поддержкой сообщений об ошибках
 */
function Input({
  id,
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  type = 'text',
  ...props
}) {
  const inputId = id || `input-${useId()}`;
  const helperTextId = `${inputId}-helper-text`;
  const errorId = `${inputId}-error`;
  
  return (
    <div className="form-field">
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${helperText ? helperTextId : ''} ${error ? errorId : ''}`}
        disabled={disabled}
        {...props}
      />
      
      {helperText && !error && (
        <div id={helperTextId} className="helper-text">
          {helperText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="error-text" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Modal

```jsx
/**
 * Доступное модальное окно с управлением фокусом и ловушкой фокуса
 */
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Запоминаем активный элемент
      const previousActiveElement = document.activeElement;
      
      // Устанавливаем фокус на модальное окно
      modalRef.current?.focus();
      
      // Блокируем скролл страницы
      document.body.style.overflow = 'hidden';
      
      // Находим все фокусируемые элементы внутри модального окна
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        firstFocusableRef.current = focusableElements[0];
        lastFocusableRef.current = focusableElements[focusableElements.length - 1];
        firstFocusableRef.current.focus();
      }
      
      // Восстанавливаем предыдущее состояние при закрытии
      return () => {
        document.body.style.overflow = '';
        previousActiveElement?.focus();
      };
    }
  }, [isOpen]);
  
  // Обрабатываем клавишу Escape для закрытия
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Реализация ловушки фокуса
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusableRef.current) {
        e.preventDefault();
        lastFocusableRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusableRef.current) {
        e.preventDefault();
        firstFocusableRef.current?.focus();
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="modal-content"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id="modal-title">{title}</h2>
        
        <div className="modal-body">
          {children}
        </div>
        
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

## Тестирование доступности

### Автоматизированное тестирование

Мы используем следующие инструменты для автоматизированного тестирования доступности:

1. **ESLint с плагином jsx-a11y**:

```bash
npm install eslint-plugin-jsx-a11y --save-dev
```

Пример конфигурации в `.eslintrc.js`:

```js
module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
  }
};
```

2. **Storybook с аддоном a11y**:

```js
// .storybook/main.js
module.exports = {
  addons: [
    '@storybook/addon-a11y',
    // ... другие аддоны
  ],
};
```

3. **Тестирование с использованием Testing Library**:

```jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('Button should be accessible', () => {
  render(<Button>Click me</Button>);
  
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
  
  // Проверяем доступность с клавиатуры
  expect(button).not.toHaveAttribute('tabindex', '-1');
  
  // Проверяем правильность атрибутов
  expect(button).toHaveAttribute('type', 'button');
});
```

4. **Интеграция с Playwright для E2E тестирования**:

```js
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // ... другие настройки
  use: {
    // Включаем снимок состояния доступности
    accessibility: true,
  },
};

export default config;
```

```js
// a11y.spec.ts
import { test, expect } from '@playwright/test';

test('homepage should be accessible', async ({ page }) => {
  await page.goto('/');
  
  // Выполняем проверку доступности
  const snapshot = await page.accessibility.snapshot();
  
  // Проверяем наличие основных элементов
  expect(snapshot).toHaveProperty('role', 'WebArea');
  expect(snapshot.children.find(c => c.role === 'heading' && c.name.includes('AquaStream'))).toBeTruthy();
  
  // Проверяем наличие навигации
  const nav = snapshot.children.find(c => c.role === 'navigation');
  expect(nav).toBeTruthy();
});
```

### Ручное тестирование

Помимо автоматизированного тестирования, рекомендуется проводить следующие ручные проверки:

1. **Навигация с клавиатуры**:
   - Убедитесь, что все функции доступны с клавиатуры
   - Проверьте порядок фокуса (tabindex)
   - Убедитесь, что фокус всегда видим

2. **Тестирование со скринридером**:
   - NVDA или JAWS (Windows)
   - VoiceOver (macOS)
   - TalkBack (Android)
   - VoiceOver (iOS)

3. **Проверка контраста и цветов**:
   - Используйте инструменты типа axe DevTools или Wave
   - Проверьте в режиме высокого контраста
   - Проверьте при различных настройках цвета

4. **Масштабирование**:
   - Увеличьте текст до 200%
   - Убедитесь, что контент не обрезается и не перекрывается

## Чек-лист по доступности

Используйте этот чек-лист при разработке новых компонентов и функций:

- [ ] Семантическая HTML-разметка
- [ ] Правильное использование заголовков (h1-h6)
- [ ] Альтернативный текст для изображений
- [ ] Доступная навигация с клавиатуры
- [ ] ARIA-атрибуты для динамического контента
- [ ] Контраст текста соответствует WCAG AA (4.5:1)
- [ ] Формы имеют понятные метки и сообщения об ошибках
- [ ] Интерактивные элементы имеют фокусное состояние
- [ ] Модальные окна ловят и удерживают фокус
- [ ] Динамические уведомления доступны для скринридеров

## Ресурсы

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [WebAIM](https://webaim.org/)
- [MDN: Доступность](https://developer.mozilla.org/ru/docs/Learn/Accessibility)
- [React: Доступность](https://reactjs.org/docs/accessibility.html)
- [Axe DevTools](https://www.deque.com/axe/)