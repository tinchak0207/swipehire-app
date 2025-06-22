import type React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SwipeCard({ children, className }: SwipeCardProps) {
  return (
    <Card
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl bg-card shadow-lg hover:shadow-xl', // Default bg-card might be overridden by theme class
        className // This is where theme classes like 'card-theme-ocean' will be applied
      )}
    >
      {children}
    </Card>
  );
}
