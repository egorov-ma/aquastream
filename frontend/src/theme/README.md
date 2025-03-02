# UI Kit AquaStream

Этот UI Kit содержит основные компоненты и стили для создания единого визуального стиля приложения AquaStream.

## Содержание

1. [Установка и настройка](#установка-и-настройка)
2. [Цветовая палитра](#цветовая-палитра)
3. [Типографика](#типографика)
4. [Компоненты](#компоненты)
5. [Демонстрация](#демонстрация)
6. [Принципы использования](#принципы-использования)

## Установка и настройка

UI Kit основан на Material-UI. Для использования необходимо:

1. Убедиться, что установлены необходимые пакеты:
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

2. Импортировать тему в ваш проект:
```jsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Ваше приложение */}
    </ThemeProvider>
  );
}
```

## Цветовая палитра

### Основные цвета

- **Первичный цвет (Primary)**: #1976d2 - Используется для основных кнопок и акцентов
- **Вторичный цвет (Secondary)**: #03A9F4 - Дополнительный цвет для выделения элементов
- **Цвет успеха (Success)**: #4CAF50 - Для положительных действий и уведомлений
- **Цвет ошибки (Error)**: #FF4B4B - Для ошибок и предупреждений
- **Цвет предупреждения (Warning)**: #FFAB00 - Для предупреждений
- **Информационный цвет (Info)**: #29B6F6 - Для информационных сообщений

### Оттенки серого

- **Светло-серый**: #F5F8FA - Фон страниц
- **Серый для границ**: #E0E7EE - Границы и разделители
- **Средне-серый**: #A0AEC0 - Неактивный текст
- **Тёмно-серый**: #4A5568 - Основной текст

## Типографика

Основной шрифт: **Open Sans**

### Размеры текста

- **H1**: 2.5rem / 40px - Для главных заголовков
- **H2**: 2rem / 32px - Для подзаголовков разделов
- **H3**: 1.75rem / 28px - Для заголовков групп
- **H4**: 1.5rem / 24px - Для заголовков подгрупп
- **H5**: 1.25rem / 20px - Для элементов навигации и выделения
- **H6**: 1rem / 16px - Для маркеров и малых заголовков
- **Body1**: 1rem / 16px - Основной текст
- **Body2**: 0.875rem / 14px - Дополнительный текст
- **Caption**: 0.75rem / 12px - Подписи и второстепенная информация

## Компоненты

### Основные компоненты

1. **Button** - Кнопки разных типов и размеров
2. **TextField** - Поля ввода текста
3. **Card** - Информационные карточки
4. **Typography** - Типографика

### Пример использования

```jsx
import { Button, TextField, Card, Typography } from '../components/ui';

function MyComponent() {
  return (
    <div>
      <Typography variant="h4">Заголовок секции</Typography>
      
      <TextField 
        label="Имя пользователя" 
        placeholder="Введите ваше имя" 
      />
      
      <Button variant="contained" color="primary">
        Сохранить
      </Button>
      
      <Card
        variant="outlined"
        header={{
          title: "Карточка с информацией",
          subheader: "Дополнительные детали"
        }}
      >
        <Typography variant="body1">
          Содержимое карточки с информацией.
        </Typography>
      </Card>
    </div>
  );
}
```

## Демонстрация

Для просмотра всех компонентов и их вариаций, посетите демо-страницу UI Kit:

[/ui-kit](/ui-kit)

## Принципы использования

1. **Консистентность** - Используйте одинаковые компоненты для одинаковых задач
2. **Доступность** - Следите за контрастом и размерами элементов
3. **Отзывчивость** - Создавайте адаптивные интерфейсы для всех размеров экранов
4. **Минимализм** - Избегайте перегруженности интерфейса
5. **Фокус на пользователя** - Ставьте удобство пользователя на первое место

---

© 2025 AquaStream | Дизайн-система 