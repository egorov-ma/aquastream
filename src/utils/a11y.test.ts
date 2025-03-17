import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isFocusable, focusableElementsSelector, trapFocus, addKeyboardSupport } from './a11y';

describe('a11y utilities', () => {
  
  describe('isFocusable', () => {
    it('should identify focusable elements', () => {
      // Создаем DOM элементы для тестирования
      document.body.innerHTML = `
        <button id="btn">Кнопка</button>
        <a id="link" href="#">Ссылка</a>
        <input id="input" type="text" />
        <div id="div">Обычный div</div>
        <div id="divWithTabIndex" tabindex="0">Div с tabindex</div>
        <div id="divWithNegativeTabIndex" tabindex="-1">Div с отрицательным tabindex</div>
      `;
      
      // Тестируем каждый элемент
      expect(isFocusable(document.getElementById('btn') as HTMLElement)).toBe(true);
      expect(isFocusable(document.getElementById('link') as HTMLElement)).toBe(true);
      expect(isFocusable(document.getElementById('input') as HTMLElement)).toBe(true);
      expect(isFocusable(document.getElementById('div') as HTMLElement)).toBe(false);
      expect(isFocusable(document.getElementById('divWithTabIndex') as HTMLElement)).toBe(true);
      expect(isFocusable(document.getElementById('divWithNegativeTabIndex') as HTMLElement)).toBe(false);
    });
  });
  
  describe('trapFocus', () => {
    beforeEach(() => {
      // Создаем модальное окно с фокусируемыми элементами
      document.body.innerHTML = `
        <div id="outside">
          <button id="outsideButton">Внешняя кнопка</button>
        </div>
        <div id="modal">
          <button id="firstButton">Первая кнопка</button>
          <input id="middleInput" type="text" />
          <button id="lastButton">Последняя кнопка</button>
        </div>
      `;
    });
    
    afterEach(() => {
      document.body.innerHTML = '';
    });
    
    it('should trap focus within the container', () => {
      const modal = document.getElementById('modal') as HTMLElement;
      const firstButton = document.getElementById('firstButton') as HTMLElement;
      const lastButton = document.getElementById('lastButton') as HTMLElement;
      
      // Устанавливаем ловушку фокуса
      const cleanup = trapFocus(modal);
      
      // Имитируем Tab на последнем элементе
      lastButton.focus();
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      lastButton.dispatchEvent(tabEvent);
      
      // Проверяем, что фокус циклически переходит на первый элемент
      expect(document.activeElement).toBe(firstButton);
      
      // Имитируем Shift+Tab на первом элементе
      firstButton.focus();
      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, shiftKey: true });
      firstButton.dispatchEvent(shiftTabEvent);
      
      // Проверяем, что фокус циклически переходит на последний элемент
      expect(document.activeElement).toBe(lastButton);
      
      // Очищаем
      cleanup();
    });
  });
  
  describe('addKeyboardSupport', () => {
    beforeEach(() => {
      document.body.innerHTML = `<div id="button-like">Элемент как кнопка</div>`;
    });
    
    afterEach(() => {
      document.body.innerHTML = '';
    });
    
    it('should add correct ARIA attributes', () => {
      const element = document.getElementById('button-like') as HTMLElement;
      const onClick = vi.fn();
      
      addKeyboardSupport(element, onClick);
      
      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('tabindex')).toBe('0');
    });
    
    it('should call onClick handler on Enter key', () => {
      const element = document.getElementById('button-like') as HTMLElement;
      const onClick = vi.fn();
      
      addKeyboardSupport(element, onClick);
      
      // Имитируем нажатие Enter
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      element.dispatchEvent(enterEvent);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
    
    it('should call onClick handler on Space key', () => {
      const element = document.getElementById('button-like') as HTMLElement;
      const onClick = vi.fn();
      
      addKeyboardSupport(element, onClick);
      
      // Имитируем нажатие пробела
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      element.dispatchEvent(spaceEvent);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
}); 