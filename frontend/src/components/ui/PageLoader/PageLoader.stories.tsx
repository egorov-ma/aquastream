import type { Meta, StoryObj } from '@storybook/react';
import { PageLoader } from './PageLoader'; // Импортируем компонент

const meta = {
  title: 'UI/PageLoader',
  component: PageLoader,
  parameters: {
    // Занимает всю страницу, поэтому layout: 'fullscreen'
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  // Нет аргументов для контроля
  argTypes: {},
  args: {},
} satisfies Meta<typeof PageLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Единственная история - сам лоадер
export const Default: Story = {}; 