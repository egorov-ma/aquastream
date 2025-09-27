# Layout Primitives

## Section
`Section` — семантический блок-обёртка с преднастроенными отступами.

```tsx
<Section width="normal" padding="lg" gap="md">
  <h1>Заголовок</h1>
  <p>Контент</p>
</Section>
```

- `width`: `none | narrow | normal | wide | xl | full`
- `gap`: `xs | sm | md | lg | xl`
- `padding`: `none | sm | md | lg | xl`
- `align`: `start | center | end`

## Stack
`Stack` упрощает вертикальные/горизонтальные группы с равными отступами.

```tsx
<Stack gap="sm">
  <h2>Заголовок</h2>
  <p>Описание</p>
</Stack>

<Stack direction="row" gap="xs" justify="between" align="center">
  <span>Лейбл</span>
  <Button>Действие</Button>
</Stack>
```

Варианты: `gap`, `direction`, `align`, `justify`, `wrap`.

## Center
`Center` помогает центрировать формы/карточки по вертикали.

```tsx
<Center maxWidth="sm">
  <LoginForm />
</Center>
```

Параметры: `maxWidth` (`none | xs | sm | md | lg | xl | 2xl`) и `padding` (`sm | md | lg`).

Обновления страниц должны использовать эти примитивы вместо произвольных комбинаций классов (`grid gap-4`, `flex min-h-svh ...`).
