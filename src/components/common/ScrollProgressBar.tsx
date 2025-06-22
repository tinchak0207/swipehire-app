'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ScrollProgressBar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollHeight > 0) {
      const percentage = (scrollTop / scrollHeight) * 100;
      setScrollPercentage(percentage);
    } else {
      setScrollPercentage(0);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      className={cn(
        'fixed top-0 right-0 left-0 z-[60] h-1 bg-primary transition-all duration-100 ease-linear'
      )}
      style={{ width: `${scrollPercentage}%` }}
      role="progressbar"
      aria-valuenow={scrollPercentage}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Page scroll progress"
    />
  );
}
