import clsx from 'clsx';
import React, { ReactNode, useEffect, useRef } from 'react';

export interface ModalProps {
  /**
   * Состояние открытия модального окна
   */
  open: boolean;
  /**
   * Функция закрытия модального окна
   */
  onClose: () => void;
  /**
   * Заголовок модального окна
   */
  title?: ReactNode;
  /**
   * Содержимое модального окна
   */
  children: ReactNode;
  /**
   * Действия в нижней части модального окна
   */
  actions?: ReactNode;
  /**
   * Максимальная ширина модального окна
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент Modal - модальное окно для отображения контента поверх основного содержимого страницы
 */
const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Обработчик нажатия клавиши Escape для закрытия модального окна
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onClose]);

  // Блокировка прокрутки страницы при открытом модальном окне
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Обработчик клика по фону для закрытия модального окна
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  // Если модальное окно закрыто, не рендерим его
  if (!open) return null;

  // Классы для разных размеров модальных окон
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  // Формируем классы для модального окна
  const modalClasses = clsx(
    'bg-white dark:bg-secondary-800 rounded-lg shadow-xl',
    'overflow-hidden',
    'transition-all duration-300',
    'flex flex-col',
    maxWidthClasses[maxWidth],
    className
  );

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity"
      role="presentation"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Заголовок модального окна */}
        {title && (
          <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-secondary-900 dark:text-white"
            >
              {title}
            </h2>
          </div>
        )}

        {/* Содержимое модального окна */}
        <div className="px-6 py-4 overflow-auto">{children}</div>

        {/* Действия модального окна */}
        {actions && (
          <div className="px-6 py-3 border-t border-secondary-200 dark:border-secondary-700 flex justify-end space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
