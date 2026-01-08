'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'glass' | 'outline';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = 'lg', variant = 'default', ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    const variantClasses = {
      default: [
        'bg-[var(--bg-surface)]',
        'border border-[var(--border-default)]',
        'shadow-subtle',
      ].join(' '),
      elevated: [
        'bg-[var(--bg-surface)]',
        'border border-[var(--border-default)]',
        'shadow-soft',
      ].join(' '),
      glass: [
        'backdrop-blur-lg bg-[var(--bg-surface)]/80',
        'border border-[var(--border-default)]',
        'shadow-soft',
      ].join(' '),
      outline: [
        'bg-transparent',
        'border border-[var(--border-default)]',
      ].join(' '),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 ease-smooth',
          variantClasses[variant],
          paddingClasses[padding],
          hover && [
            'cursor-pointer',
            'hover:border-[var(--border-hover)]',
            'hover:shadow-medium',
            'hover:-translate-y-0.5',
          ].join(' '),
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-[var(--text-primary)] tracking-tight', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[var(--text-secondary)] mt-1', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 flex items-center gap-3', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
