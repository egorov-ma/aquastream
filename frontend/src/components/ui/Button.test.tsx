import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Button from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Кнопка</Button>);
    const button = screen.getByRole('button', { name: /кнопка/i });
    expect(button).toBeDefined();
  });

  it('applies the correct variant', () => {
    render(<Button variant="outlined">Кнопка</Button>);
    const button = screen.getByRole('button', { name: /кнопка/i });
    expect(button.className).toContain('MuiButton-outlined');
  });

  it('applies the correct color', () => {
    render(<Button color="secondary">Кнопка</Button>);
    const button = screen.getByRole('button', { name: /кнопка/i });
    expect(button.className).toContain('MuiButton-colorSecondary');
  });

  it('handles clicks correctly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Кнопка</Button>);

    const button = screen.getByRole('button', { name: /кнопка/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Кнопка</Button>);
    const button = screen.getByRole('button', { name: /кнопка/i });
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('renders with full width when specified', () => {
    render(<Button fullWidth>Кнопка</Button>);
    const button = screen.getByRole('button', { name: /кнопка/i });
    expect(button.className).toContain('MuiButton-fullWidth');
  });
});
