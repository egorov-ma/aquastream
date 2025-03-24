import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Button from '../Button/Button';
import Typography from '../Typography';

import Modal from './Modal';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Состояние открытия модального окна',
    },
    onClose: {
      action: 'closed',
      description: 'Функция обратного вызова при закрытии модального окна',
    },
    title: {
      control: 'text',
      description: 'Заголовок модального окна',
    },
    children: {
      control: 'text',
      description: 'Содержимое модального окна',
    },
    actions: {
      description: 'Действия в нижней панели модального окна',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Максимальная ширина модального окна',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS-классы',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Вместо console.log используем пустую функцию
const noop = () => {};

// Базовое модальное окно
export const Basic: Story = {
  args: {
    open: true,
    onClose: noop,
    title: 'Заголовок модального окна',
    children:
      'Это содержимое модального окна. Здесь можно разместить любую информацию или компоненты.',
    actions: (
      <>
        <Button variant="outlined" onClick={noop}>
          Отмена
        </Button>
        <Button variant="primary" onClick={noop}>
          ОК
        </Button>
      </>
    ),
  },
};

// Модальное окно с детальным содержимым
export const WithDetailedContent: Story = {
  args: {
    open: true,
    onClose: noop,
    title: 'Информационное сообщение',
    children: (
      <div className="space-y-4">
        <Typography variant="body-1">
          Это модальное окно с более детальным содержимым, включающим различные элементы
          типографики.
        </Typography>
        <Typography variant="body-2">
          Вы можете добавить различные компоненты внутрь модального окна для создания сложных
          интерфейсов.
        </Typography>
        <ul className="list-disc pl-5">
          <li>Пункт списка 1</li>
          <li>Пункт списка 2</li>
          <li>Пункт списка 3</li>
        </ul>
      </div>
    ),
    actions: (
      <Button variant="primary" onClick={noop}>
        Понятно
      </Button>
    ),
  },
};

// Модальные окна разных размеров
export const SmallSize: Story = {
  args: {
    open: true,
    onClose: noop,
    title: 'Маленькое модальное окно',
    maxWidth: 'sm',
    children: 'Это маленькое модальное окно.',
    actions: (
      <Button variant="primary" onClick={noop}>
        ОК
      </Button>
    ),
  },
};

export const MediumSize: Story = {
  args: {
    open: true,
    onClose: noop,
    title: 'Среднее модальное окно',
    maxWidth: 'md',
    children: 'Это модальное окно среднего размера.',
    actions: (
      <Button variant="primary" onClick={noop}>
        ОК
      </Button>
    ),
  },
};

export const LargeSize: Story = {
  args: {
    open: true,
    onClose: noop,
    title: 'Большое модальное окно',
    maxWidth: 'lg',
    children: 'Это большое модальное окно.',
    actions: (
      <Button variant="primary" onClick={noop}>
        ОК
      </Button>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    open: true,
    onClose: noop,
    title: 'Модальное окно на всю ширину',
    maxWidth: 'full',
    children: 'Это модальное окно на всю ширину экрана.',
    actions: (
      <Button variant="primary" onClick={noop}>
        ОК
      </Button>
    ),
  },
};

// Интерактивное демо
const ModalDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Открыть модальное окно
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Интерактивное модальное окно"
        actions={
          <>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              ОК
            </Button>
          </>
        }
      >
        <Typography variant="body-1">
          Это интерактивное модальное окно. Вы можете закрыть его, нажав на любую из кнопок ниже или
          кликнув за пределами модального окна.
        </Typography>
      </Modal>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <ModalDemo />,
  args: {
    open: false,
    onClose: noop,
    children: 'Этот контент будет заменён при рендере компонента ModalDemo',
  },
};
