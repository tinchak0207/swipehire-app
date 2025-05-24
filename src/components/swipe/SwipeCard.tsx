import React from 'react';
import { Card } from '@/components/ui/card';

interface SwipeCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SwipeCard({ children, className }: SwipeCardProps) {
  return (
    <Card 
      className={`w-full max-w-sm sm:max-w-md md:max-w-lg rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${className}`}
      // Add animation/transform classes here for swipe effects if implemented
      // e.g., hover:scale-105
    >
      {children}
    </Card>
  );
}
