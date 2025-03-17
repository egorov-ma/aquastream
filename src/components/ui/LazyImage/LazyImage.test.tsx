import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LazyImage } from './LazyImage';

// Мокаем IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  
  constructor(callback: IntersectionObserverCallback) {
    this.root = null;
    this.rootMargin = "";
    this.thresholds = [];
    
    // Сохраняем колбэк для имитации событий
    (this as any)._callback = callback;
  }
  
  observe(target: Element): void {
    // Сразу вызываем колбэк для имитации появления в области видимости
    const entry = {
      isIntersecting: true,
      target,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now()
    };
    
    (this as any)._callback([entry], this);
  }
  
  unobserve(): void {}
  disconnect(): void {}
}

describe('LazyImage', () => {
  beforeEach(() => {
    // Мокаем IntersectionObserver
    global.IntersectionObserver = MockIntersectionObserver as any;
    
    // Мокаем метод createElement для проверки стилей
    Object.defineProperty(global.Image.prototype, 'onload', {
      get() {
        return this._onload;
      },
      set(fn) {
        this._onload = fn;
        // Автоматически вызываем onload при установке
        setTimeout(() => {
          fn && fn();
        }, 0);
      }
    });
  });
  
  it('renders with default props', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test Image"
      />
    );
    
    // Проверяем, что контейнер отрендерен
    expect(screen.getByLabelText('Test Image')).toBeDefined();
  });
  
  it('applies custom styles and classes', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        className="custom-class"
        placeholderColor="#ff0000"
      />
    );
    
    const container = screen.getByLabelText('Test Image');
    
    expect(container.className).toContain('custom-class');
    expect(container.style.width).toBe('200px');
    expect(container.style.height).toBe('150px');
    expect(container.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });
  
  it('handles onLoad callback', async () => {
    const onLoadMock = vi.fn();
    
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test Image"
        onLoad={onLoadMock}
      />
    );
    
    // Так как мы имитируем автоматический вызов onload,
    // ожидаем, что наш mock будет вызван
    await vi.waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled();
    });
  });
  
  it('renders preview image when lowQualityPreview is true', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test Image"
        lowQualityPreview
        previewSrc="preview-image.jpg"
      />
    );
    
    // Проверяем, что превью изображение отрендерено
    const previewImage = screen.getByRole('img', { hidden: true });
    expect(previewImage).toBeDefined();
    expect(previewImage.getAttribute('src')).toBe('preview-image.jpg');
  });
}); 