'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-mono-900 dark:text-mono-100"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            // Base styles
            'min-h-[120px] w-full rounded-xl p-4',
            'text-mono-900 dark:text-mono-100',
            'placeholder:text-mono-400 dark:placeholder:text-mono-500',
            // Background
            'bg-mono-50 dark:bg-mono-900',
            // Border
            'border border-mono-200 dark:border-mono-700',
            // Focus state
            'transition-all duration-300 ease-smooth resize-none',
            'focus:border-mono-400 dark:focus:border-mono-500 focus:outline-none',
            'focus:ring-2 focus:ring-mono-200/50 dark:focus:ring-mono-700/50',
            // Disabled
            'disabled:cursor-not-allowed disabled:bg-mono-100 dark:disabled:bg-mono-800 disabled:opacity-60',
            // Error state
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-mono-500 dark:text-mono-400">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
