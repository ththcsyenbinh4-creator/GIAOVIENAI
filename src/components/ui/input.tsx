'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {leftIcon}
            </div>
          )}
          <input
            type={isPassword && showPassword ? 'text' : type}
            id={inputId}
            className={cn(
              // Base styles
              'h-11 w-full rounded-xl px-4',
              'text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              // Background
              'bg-[var(--bg-surface)]',
              // Border
              'border border-[var(--border-default)]',
              // Focus state
              'transition-all duration-300 ease-smooth',
              'focus:border-[var(--border-strong)] focus:outline-none',
              'focus:ring-2 focus:ring-[var(--accent-soft)]',
              // Disabled
              'disabled:cursor-not-allowed disabled:bg-[var(--bg-soft)] disabled:opacity-60',
              // Icons padding
              leftIcon && 'pl-11',
              (rightIcon || isPassword) && 'pr-11',
              // Error state
              error && 'border-error focus:border-error focus:ring-error/20',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Eye className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
