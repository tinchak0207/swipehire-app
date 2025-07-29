import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'underline-offset-4 hover:underline text-primary',
};

const buttonSizes = {
  default: 'h-10 py-2 px-4 min-h-[44px] sm:h-10 sm:min-h-0', // 44px minimum for mobile touch targets
  sm: 'h-9 px-3 rounded-md min-h-[40px] sm:h-9 sm:min-h-0',
  lg: 'h-11 px-8 rounded-md min-h-[44px] sm:h-11 sm:min-h-0',
  icon: 'h-10 w-10 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90':
              variant === 'destructive',
            'border border-input hover:bg-accent hover:text-accent-foreground':
              variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2 min-h-[44px] sm:h-10 sm:min-h-0': size === 'default',
            'h-9 rounded-md px-3 min-h-[40px] sm:h-9 sm:min-h-0': size === 'sm',
            'h-11 rounded-md px-8 min-h-[44px] sm:h-11 sm:min-h-0': size === 'lg',
            'h-10 w-10 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0':
              size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
