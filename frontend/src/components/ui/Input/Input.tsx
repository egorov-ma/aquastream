import clsx from 'clsx';
import { forwardRef, InputHTMLAttributes, ReactNode, useCallback, useId } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Лейбл поля ввода
   */
  label?: string;
  /**
   * Сообщение об ошибке
   */
  error?: string;
  /**
   * Подсказка под полем ввода
   */
  helperText?: string;
  /**
   * Размер поля ввода
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Иконка слева от поля ввода
   */
  leftIcon?: ReactNode;
  /**
   * Иконка справа от поля ввода
   */
  rightIcon?: ReactNode;
  /**
   * Флаг, полностью растягивающий поле ввода
   */
  fullWidth?: boolean;
  /**
   * Дополнительный класс для обертки
   */
  wrapperClassName?: string;
  /**
   * Дополнительный класс для поля ввода
   */
  inputClassName?: string;
  /**
   * Флаг, отображающий кнопку очистки
   */
  clearable?: boolean;
  /**
   * Функция, вызываемая при очистке поля
   */
  onClear?: () => void;
}

/**
 * Поле ввода - основной компонент для ввода текста
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      wrapperClassName,
      inputClassName,
      disabled,
      id,
      value,
      onChange,
      clearable = false,
      onClear,
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const uniqueId = id || reactId;
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
    }, [onChange]);
    
    const handleClear = useCallback(() => {
      if (onClear) onClear();

      if (onChange) {
        const pseudoEvent = {
          target: { value: '' } as HTMLInputElement,
          currentTarget: { value: '' } as HTMLInputElement,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(pseudoEvent);
      }
    }, [onChange, onClear]);

    const wrapperClasses = clsx('flex flex-col', fullWidth ? 'w-full' : '', wrapperClassName);

    const baseInputClasses =
      'bg-secondary-50 dark:bg-secondary-900 border rounded-md focus:outline-none transition-colors';

    const sizeClasses = {
      sm: 'text-xs py-1 px-2',
      md: 'text-sm py-2 px-3',
      lg: 'text-base py-3 px-4',
    };

    const stateClasses = {
      normal:
        'border-secondary-300 dark:border-secondary-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400',
      error:
        'border-error-500 dark:border-error-400 focus:ring-1 focus:ring-error-500 focus:border-error-500 dark:focus:ring-error-400 dark:focus:border-error-400',
      disabled: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 cursor-not-allowed',
    };

    const showClearButton = clearable && value && !disabled;
    
    const iconClasses = {
      left: leftIcon ? 'pl-9' : '',
      right: (rightIcon || showClearButton) ? 'pr-9' : '',
    };

    const inputClasses = clsx(
      baseInputClasses,
      sizeClasses[size],
      error ? stateClasses.error : stateClasses.normal,
      disabled ? stateClasses.disabled : '',
      iconClasses.left,
      iconClasses.right,
      'w-full',
      inputClassName
    );

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={uniqueId}
            className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
            data-testid={`${uniqueId}-label`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-secondary-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={uniqueId}
            className={inputClasses}
            disabled={disabled}
            data-testid={uniqueId}
            value={value}
            onChange={handleChange}
            {...props}
          />

          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
              data-testid={`${uniqueId}-clear-button`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}

          {rightIcon && !showClearButton && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-500">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="mt-1">
            {error ? (
              <p className="text-xs text-error-600 dark:text-error-500" data-testid={`${uniqueId}-error-text`}>{error}</p>
            ) : helperText ? (
              <p className="text-xs text-secondary-500 dark:text-secondary-400" data-testid={`${uniqueId}-helper-text`}>{helperText}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
