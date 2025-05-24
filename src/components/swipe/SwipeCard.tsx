
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils"; // Added this import

interface SwipeCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SwipeCard({ children, className }: SwipeCardProps) {
  return (
    <Card 
      className={cn(
        "w-full max-w-sm sm:max-w-md md:max-w-lg rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out min-h-[550px] sm:min-h-[650px] flex flex-col",
        className
      )}
      // Add animation/transform classes here for swipe effects if implemented
      // e.g., hover:scale-105
    >
      {children}
    </Card>
  );
}
