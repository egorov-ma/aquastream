import { cn } from '@/lib/utils';
import React from 'react';

export interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      className={cn(
        'rounded-md bg-error-50 dark:bg-error-900/50 p-4 border border-error-200 dark:border-error-800',
        className
      )}
    >
      <p className="text-error-600 dark:text-error-400 text-sm">{message}</p>
    </div>
  );
};

export default FormError;
