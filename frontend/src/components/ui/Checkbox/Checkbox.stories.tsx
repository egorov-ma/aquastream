import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

// Исправляем импорт Typography на именованный
import { Typography } from '../Typography/Typography';

// Импорт Checkbox уже именованный
import { Checkbox } from './Checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Состояние переключателя (выбрано/не выбрано)',
    },
    onChange: {
      action: 'changed',
      description: 'Функция обратного вызова при изменении состояния',
    },
    label: {
      control: 'text',
      description: 'Текстовая метка рядом с переключателем',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключает переключатель',
    },
    error: {
      control: 'boolean',
      description: 'Показывает состояние ошибки',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Размер переключателя',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS-классы',
    },
  },
  args: {
    label: 'Пример Checkbox',
    checked: false,
    disabled: false,
    error: false,
    size: 'medium',
  }
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Базовый переключатель
export const Basic: Story = {
  args: {
    label: 'Базовый переключатель',
  },
};

// Состояния
export const Checked: Story = {
  args: {
    label: 'Выбранный переключатель',
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: 'Невыбранный переключатель',
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Отключенный переключатель',
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Отключенный выбранный переключатель',
    checked: true,
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Переключатель с ошибкой',
    error: true,
    checked: false,
  },
};

export const ErrorChecked: Story = {
  args: {
    label: 'Выбранный переключатель с ошибкой',
    error: true,
    checked: true,
  },
};

// Размеры
export const Small: Story = {
  args: {
    label: 'Маленький переключатель',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    label: 'Средний переключатель',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    label: 'Большой переключатель',
    size: 'large',
  },
};

// Длинная метка
export const LongLabel: Story = {
  args: {
    label:
      'Это переключатель с очень длинной меткой, которая может занимать несколько строк для демонстрации поведения компонента при длинном тексте метки.',
  },
};

// Без метки
export const NoLabel: Story = {
  args: {},
};

// Интерактивный пример
const CheckboxDemo = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-4">
      <Checkbox
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked)}
        label="Интерактивный переключатель"
      />
      <Typography variant="body-1">Состояние: {checked ? 'Выбрано' : 'Не выбрано'}</Typography>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <CheckboxDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Интерактивный пример переключателя с отображением текущего состояния.',
      },
      controls: { include: [] },
    },
  },
};
