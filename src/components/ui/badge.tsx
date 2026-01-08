import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
    'text-xs font-medium',
    'transition-colors duration-200',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-mono-100 dark:bg-mono-800',
          'text-mono-600 dark:text-mono-400',
        ].join(' '),
        primary: [
          'bg-mono-900 dark:bg-mono-100',
          'text-mono-50 dark:text-mono-900',
        ].join(' '),
        success: [
          'bg-success/10 dark:bg-success/20',
          'text-success',
        ].join(' '),
        warning: [
          'bg-warning/10 dark:bg-warning/20',
          'text-warning',
        ].join(' '),
        error: [
          'bg-error/10 dark:bg-error/20',
          'text-error',
        ].join(' '),
        outline: [
          'bg-transparent',
          'border border-mono-200 dark:border-mono-700',
          'text-mono-600 dark:text-mono-400',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}
