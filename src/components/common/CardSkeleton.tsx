
"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  count?: number;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  linesInContent?: number;
}

export function CardSkeleton({
  count = 1,
  className,
  showHeader = true,
  showFooter = true,
  linesInContent = 3,
}: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={cn("shadow-md w-full", className)}>
          {showHeader && (
            <CardHeader className="flex flex-row items-center space-x-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </CardHeader>
          )}
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-4/5 mb-2" /> {/* Title-like line */}
            {Array.from({ length: linesInContent }).map((_, lineIndex) => (
              <Skeleton
                key={lineIndex}
                className={cn(
                  "h-3",
                  lineIndex === linesInContent - 1 ? "w-3/5" : "w-full"
                )}
              />
            ))}
            <div className="flex flex-wrap gap-1 mt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </CardContent>
          {showFooter && (
            <CardFooter className="p-4 flex justify-between items-center">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          )}
        </Card>
      ))}
    </>
  );
}
