'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium',
    'rounded-xl transition-all duration-300 ease-smooth',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-400/30 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--btn-primary-bg)]',
          'text-[var(--btn-primary-text)]',
          'hover:opacity-90',
          'shadow-subtle hover:shadow-soft',
        ].join(' '),
        secondary: [
          'bg-[var(--bg-soft)]',
          'text-[var(--text-primary)]',
          'hover:opacity-80',
          'border border-[var(--border-default)]',
        ].join(' '),
        ghost: [
          'text-[var(--text-secondary)]',
          'hover:bg-[var(--bg-soft)]',
          'hover:text-[var(--text-primary)]',
        ].join(' '),
        destructive: [
          'bg-error text-white',
          'hover:bg-red-600',
          'shadow-subtle hover:shadow-soft',
        ].join(' '),
        outline: [
          'border border-[var(--border-default)]',
          'bg-transparent',
          'text-[var(--text-primary)]',
          'hover:bg-[var(--bg-soft)]',
          'hover:border-[var(--border-hover)]',
        ].join(' '),
        subtle: [
          'bg-[var(--bg-soft)]',
          'text-[var(--text-secondary)]',
          'hover:opacity-80',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-[15px]',
        lg: 'h-[52px] px-7 text-base',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
