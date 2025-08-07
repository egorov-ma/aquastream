import { cn } from '@/lib/utils';
import React, { forwardRef, useCallback, useId, useState } from 'react';

import { Input as ShadcnInput } from '../input';
import { FormMessage } from '../Form';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
  clearable?: boolean;
  onClear?: () => void;
}

/**
 * Текстовое поле на основе shadcn Input
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      wrapperClassName,
      inputClassName,
      clearable = false,
      onClear,
      id,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const elementId = id || reactId;
    const [internalValue, setInternalValue] = useState<string>(String(value ?? ''));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = useCallback(() => {
      onClear?.();
      if (onChange) {
        const event = {
          target: { value: '' } as HTMLInputElement,
          currentTarget: { value: '' } as HTMLInputElement,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      setInternalValue('');
    }, [onChange, onClear]);

    const showClearButton = clearable && (value ? String(value).length > 0 : internalValue.length > 0) && !disabled;

    const inputClasses = cn(
      error && 'border-destructive focus-visible:ring-destructive',
      leftIcon && 'pl-10',
      (rightIcon || showClearButton) && 'pr-10',
      inputClassName
    );

    const containerClasses = cn('flex flex-col', fullWidth ? 'w-full' : 'inline-block', wrapperClassName);

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={elementId} className="mb-1 text-sm font-medium" data-testid={`${elementId}-label`}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{leftIcon}</div>
          )}
          <ShadcnInput
            ref={ref}
            id={elementId}
            className={inputClasses}
            disabled={disabled}
            value={value ?? internalValue}
            onChange={handleChange}
            {...props}
          />
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              data-testid={`${elementId}-clear-button`}
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">{rightIcon}</div>
          )}
        </div>
        <FormMessage error={error} helperText={helperText} />
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
