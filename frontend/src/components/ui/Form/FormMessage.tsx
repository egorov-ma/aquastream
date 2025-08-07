import React from 'react';
import { cn } from '@/lib/utils';

export interface FormMessageProps {
  error?: string;
  helperText?: string;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ error, helperText, className }) => {
  const message = error || helperText;
  if (!message) return null;
  return (
    <p
      className={cn(
        'text-xs mt-1',
        error ? 'text-destructive' : 'text-muted-foreground',
        className
      )}
    >
      {message}
    </p>
  );
};

export default FormMessage;
