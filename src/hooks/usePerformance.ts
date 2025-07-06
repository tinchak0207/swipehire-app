/**
 * React hooks for performance optimization
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  debounce,
  MemoryMonitor,
  type PerformanceMetrics,
  ResourceAnalyzer,
  type ResourceTiming,
  throttle,
  ViewportLoader,
  WebVitalsReporter,
} from '../lib/performance';

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  return useMemo(() => throttle(func, limit), [func, limit]) as T;
}

/**
 * Hook for debouncing function calls
 */
export function useDebounceCallback<T extends (...args: any[]) => void>(func: T, delay: number): T {
  return useMemo(() => debounce(func, delay), [func, delay]) as T;
}

/**
 * Hook for monitoring Web Vitals
 */
export function useWebVitals(onMetric?: (name: string, value: number) => void) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const reporterRef = useRef<WebVitalsReporter | null>(null);

  useEffect(() => {
    const handleMetric = (name: string, value: number) => {
      setMetrics((prev) => ({ ...prev, [name.toLowerCase()]: value }));
      onMetric?.(name, value);
    };

    reporterRef.current = new WebVitalsReporter(handleMetric);

    return () => {
      reporterRef.current?.disconnect();
    };
  }, [onMetric]);

  return metrics;
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoaded(false);
  }, []);

  return {
    imgRef,
    src: isInView ? src : undefined,
    isLoaded,
    isInView,
    onLoad: handleLoad,
    onError: handleError,
  };
}

/**
 * Hook for viewport-based loading
 */
export function useViewportLoader<T extends Element>(
  onLoad: (element: T) => void,
  options?: IntersectionObserverInit
) {
  const loaderRef = useRef<ViewportLoader | null>(null);
  const elementsRef = useRef<Set<T>>(new Set());

  useEffect(() => {
    loaderRef.current = new ViewportLoader((element) => onLoad(element as T), options);

    return () => {
      loaderRef.current?.disconnect();
    };
  }, [onLoad, options]);

  const observe = useCallback((element: T) => {
    if (loaderRef.current && !elementsRef.current.has(element)) {
      elementsRef.current.add(element);
      loaderRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: T) => {
    if (loaderRef.current && elementsRef.current.has(element)) {
      elementsRef.current.delete(element);
      loaderRef.current.unobserve(element);
    }
  }, []);

  return { observe, unobserve };
}

/**
 * Hook for monitoring resource performance
 */
export function useResourceMonitor() {
  const [resources, setResources] = useState<ResourceTiming[]>([]);
  const analyzerRef = useRef(new ResourceAnalyzer());

  const updateResources = useCallback(() => {
    const resourceTimings = analyzerRef.current.getResourceTimings();
    setResources(resourceTimings);
  }, []);

  useEffect(() => {
    // Initial load
    updateResources();

    // Update on navigation
    const handleLoad = () => {
      setTimeout(updateResources, 1000); // Wait for resources to load
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [updateResources]);

  const getSlowResources = useCallback((threshold = 1000) => {
    return analyzerRef.current.getSlowResources(threshold);
  }, []);

  const getLargeResources = useCallback((threshold = 100000) => {
    return analyzerRef.current.getLargeResources(threshold);
  }, []);

  return {
    resources,
    updateResources,
    getSlowResources,
    getLargeResources,
  };
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);
  const [isHighPressure, setIsHighPressure] = useState(false);
  const monitorRef = useRef(new MemoryMonitor());

  const updateMemoryInfo = useCallback(() => {
    const info = monitorRef.current.getMemoryInfo();
    const highPressure = monitorRef.current.isMemoryPressureHigh();

    setMemoryInfo(info);
    setIsHighPressure(highPressure);
  }, []);

  useEffect(() => {
    updateMemoryInfo();

    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  return {
    memoryInfo,
    isHighPressure,
    updateMemoryInfo,
  };
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const [_entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (observerEntries) => {
        setEntries(observerEntries);
        setEntry(observerEntries[0] || null);
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
        ...options,
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options]);

  const observe = useCallback((element: Element) => {
    if (observerRef.current && !elementsRef.current.has(element)) {
      elementsRef.current.add(element);
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current && elementsRef.current.has(element)) {
      elementsRef.current.delete(element);
      observerRef.current.unobserve(element);
    }
  }, []);

  const disconnect = useCallback(() => {
    observerRef.current?.disconnect();
    elementsRef.current.clear();
  }, []);

  return {
    entries,
    observe,
    unobserve,
    disconnect,
  };
}

/**
 * Hook for preloading resources
 */
export function usePreloader() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }, []);

  const preloadStylesheet = useCallback((href: string): Promise<void> => {
    if (preloadedResources.current.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.onload = () => {
        preloadedResources.current.add(href);
        resolve();
      };
      link.onerror = reject;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadStylesheet,
  };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const [averageRenderTime, setAverageRenderTime] = useState<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;

    setAverageRenderTime((prev) => {
      const count = renderCountRef.current;
      return (prev * (count - 1) + renderTime) / count;
    });

    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (>16ms threshold)`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    averageRenderTime,
  };
}

/**
 * Hook for managing idle callbacks
 */
export function useIdleCallback(callback: () => void, options?: IdleRequestOptions) {
  const callbackRef = useRef(callback);
  const idleIdRef = useRef<number | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const scheduleIdleCallback = useCallback(() => {
    if (idleIdRef.current) {
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleIdRef.current);
      } else {
        clearTimeout(idleIdRef.current);
      }
    }

    if ('requestIdleCallback' in window) {
      idleIdRef.current = requestIdleCallback(() => callbackRef.current(), options);
    } else {
      // Fallback for browsers without requestIdleCallback
      idleIdRef.current = setTimeout(() => callbackRef.current(), 0) as unknown as number;
    }
  }, [options]);

  const cancelIdleCallback = useCallback((id: number) => {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (idleIdRef.current) {
        cancelIdleCallback(idleIdRef.current);
      }
    };
  }, [cancelIdleCallback]);

  return scheduleIdleCallback;
}

/**
 * Hook for managing virtual scrolling
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}
