/**
 * Performance Provider for monitoring and optimizing application performance
 * Tracks Web Vitals, resource usage, and provides performance insights
 */

'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useMemoryMonitor, useResourceMonitor, useWebVitals } from '../hooks/usePerformance';
import {
  type PerformanceMetrics,
  type ResourceTiming,
  registerServiceWorker,
} from '../lib/performance';

interface PerformanceContextType {
  metrics: Partial<PerformanceMetrics>;
  memoryInfo: {
    used: number;
    total: number;
    limit: number;
  } | null;
  isHighMemoryPressure: boolean;
  resources: ResourceTiming[];
  slowResources: ResourceTiming[];
  largeResources: ResourceTiming[];
  reportMetric: (name: string, value: number) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: ReactNode;
  enableServiceWorker?: boolean;
  enableAnalytics?: boolean;
  performanceBudget?: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };
}

export function PerformanceProvider({
  children,
  enableServiceWorker = true,
  enableAnalytics = false,
  performanceBudget = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
  },
}: PerformanceProviderProps) {
  const [reportedMetrics, setReportedMetrics] = useState<Record<string, number>>({});

  // Monitor Web Vitals
  const metrics = useWebVitals((name, value) => {
    setReportedMetrics((prev) => ({ ...prev, [name]: value }));

    // Report to analytics if enabled
    if (enableAnalytics && typeof window !== 'undefined') {
      // Report to Google Analytics 4
      if ('gtag' in window) {
        (window as any).gtag('event', name, {
          event_category: 'Web Vitals',
          value: Math.round(value),
          non_interaction: true,
        });
      }

      // Report to custom analytics endpoint
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metric: name,
            value,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          }),
        }).catch(console.error);
      }
    }

    // Check against performance budget
    const budgetKey = name.toLowerCase() as keyof typeof performanceBudget;
    const budgetValue = performanceBudget[budgetKey];

    if (budgetValue && value > budgetValue) {
      console.warn(`Performance budget exceeded for ${name}: ${value} > ${budgetValue}`);

      // Report budget violation
      if (enableAnalytics && 'gtag' in window) {
        (window as any).gtag('event', 'performance_budget_exceeded', {
          event_category: 'Performance',
          metric: name,
          value: Math.round(value),
          budget: budgetValue,
        });
      }
    }
  });

  // Monitor memory usage
  const { memoryInfo, isHighPressure } = useMemoryMonitor();

  // Monitor resource performance
  const { resources, getSlowResources, getLargeResources } = useResourceMonitor();

  // Register service worker for caching
  useEffect(() => {
    if (enableServiceWorker && process.env.NODE_ENV === 'production') {
      registerServiceWorker('/sw.js').then((registration) => {
        if (registration) {
          console.log('Service Worker registered successfully');
        }
      });
    }
  }, [enableServiceWorker]);

  // Monitor for performance issues
  useEffect(() => {
    if (isHighPressure) {
      console.warn('High memory pressure detected');

      if (enableAnalytics && 'gtag' in window) {
        (window as any).gtag('event', 'high_memory_pressure', {
          event_category: 'Performance',
          memory_used: memoryInfo?.used,
          memory_limit: memoryInfo?.limit,
        });
      }
    }
    return undefined;
  }, [isHighPressure, memoryInfo, enableAnalytics]);

  // Performance observer for long tasks
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              // Long task threshold
              console.warn(`Long task detected: ${entry.duration}ms`);

              if (enableAnalytics && 'gtag' in window) {
                (window as any).gtag('event', 'long_task', {
                  event_category: 'Performance',
                  value: Math.round(entry.duration),
                });
              }
            }
          });
        });

        observer.observe({ type: 'longtask', buffered: true });

        return () => observer.disconnect();
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
    return undefined;
  }, [enableAnalytics]);

  // Monitor for layout shifts
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          let clsValue = 0;

          list.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });

          if (clsValue > 0.1) {
            // CLS threshold
            console.warn(`High Cumulative Layout Shift: ${clsValue}`);
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        return () => observer.disconnect();
      } catch (error) {
        console.warn('Layout shift observer not supported:', error);
      }
    }
    return undefined;
  }, []);

  // Report custom metrics
  const reportMetric = (name: string, value: number) => {
    setReportedMetrics((prev) => ({ ...prev, [name]: value }));

    if (enableAnalytics && 'gtag' in window) {
      (window as any).gtag('event', 'custom_metric', {
        event_category: 'Performance',
        metric_name: name,
        value: Math.round(value),
      });
    }
  };

  // Get slow and large resources
  const slowResources = getSlowResources(1000); // > 1s
  const largeResources = getLargeResources(100000); // > 100KB

  // Log performance summary in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        console.group('Performance Summary');
        console.log('Web Vitals:', metrics);
        console.log('Memory Info:', memoryInfo);
        console.log('Slow Resources:', slowResources);
        console.log('Large Resources:', largeResources);
        console.groupEnd();
      }, 5000); // Wait 5s for metrics to be collected

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [metrics, memoryInfo, slowResources, largeResources]);

  const contextValue: PerformanceContextType = {
    metrics: { ...metrics, ...reportedMetrics },
    memoryInfo,
    isHighMemoryPressure: isHighPressure,
    resources,
    slowResources,
    largeResources,
    reportMetric,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}

      {/* Performance monitoring styles */}
      <style jsx global>{`
        /* Optimize font loading */
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/inter-regular.woff2') format('woff2');
        }
        
        /* Critical CSS for above-the-fold content */
        .hero-section {
          contain: layout style paint;
        }
        
        /* Optimize animations for performance */
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Optimize images for performance */
        img {
          content-visibility: auto;
        }
        
        /* Optimize large lists */
        .virtual-list {
          contain: strict;
          height: 400px;
          overflow-y: auto;
        }
        
        /* Optimize off-screen content */
        .below-fold {
          content-visibility: auto;
          contain-intrinsic-size: 200px;
        }
        
        /* Performance-optimized loading states */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        /* Optimize for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .skeleton {
            animation: none;
            background: #f0f0f0;
          }
        }
        
        /* Performance hints for browsers */
        .will-change-transform {
          will-change: transform;
        }
        
        .will-change-opacity {
          will-change: opacity;
        }
        
        /* GPU acceleration for smooth animations */
        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </PerformanceContext.Provider>
  );
}
