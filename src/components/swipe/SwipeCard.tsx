
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
        "w-full rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out flex flex-col bg-card", // Ensure bg-card for visibility
        // Removed fixed min-height, relies on parent snap item for height (e.g., h-full)
        className
      )}
    >
      {children}
    </Card>
  );
}
