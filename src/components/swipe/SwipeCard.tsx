
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SwipeCard({ children, className }: SwipeCardProps) {
  return (
    <Card 
      className={cn(
        "w-full rounded-xl shadow-lg hover:shadow-xl overflow-hidden flex flex-col bg-card",
        className
      )}
    >
      {children}
    </Card>
  );
}
