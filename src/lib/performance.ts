/**
 * Performance optimization utilities for SwipeHire application
 * Provides comprehensive performance monitoring and optimization features
 */

// Performance metrics types
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy loading utility for images
 */
export function createLazyImageObserver(
  callback?: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.remove('lazy');
          observer.unobserve(img);

          if (callback) {
            callback(entry);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  return observer;
}

/**
 * Preload critical resources
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch',
  crossorigin?: 'anonymous' | 'use-credentials'
): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }

  if (as === 'font') {
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resources for future navigation
 */
export function prefetchResource(href: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Measure and report Core Web Vitals
 */
export class WebVitalsReporter {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor(private onMetric?: (name: string, value: number) => void) {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // First Contentful Paint
    this.observePerformanceEntries('paint', (entries) => {
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.onMetric?.('FCP', fcpEntry.startTime);
      }
    });

    // Largest Contentful Paint
    this.observePerformanceEntries('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        this.metrics.lcp = lcpEntry.startTime;
        this.onMetric?.('LCP', lcpEntry.startTime);
      }
    });

    // First Input Delay
    this.observePerformanceEntries('first-input', (entries) => {
      const fidEntry = entries[0];
      if (fidEntry) {
        this.metrics.fid = (fidEntry as any).processingStart - fidEntry.startTime;
        this.onMetric?.('FID', this.metrics.fid);
      }
    });

    // Cumulative Layout Shift
    this.observePerformanceEntries('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.metrics.cls = clsValue;
      this.onMetric?.('CLS', clsValue);
    });

    // Time to First Byte
    this.measureTTFB();
  }

  private observePerformanceEntries(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  private measureTTFB(): void {
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.onMetric?.('TTFB', this.metrics.ttfb);
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Resource loading performance analyzer
 */
export class ResourceAnalyzer {
  public getResourceTimings(): ResourceTiming[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name),
    }));
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'js':
        return 'script';
      case 'css':
        return 'stylesheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font';
      default:
        return 'other';
    }
  }

  public getSlowResources(threshold = 1000): ResourceTiming[] {
    return this.getResourceTimings().filter((resource) => resource.duration > threshold);
  }

  public getLargeResources(threshold = 100000): ResourceTiming[] {
    return this.getResourceTimings().filter((resource) => resource.size > threshold);
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  public getMemoryInfo(): {
    used: number;
    total: number;
    limit: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  public isMemoryPressureHigh(): boolean {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return false;

    return memoryInfo.used / memoryInfo.limit > 0.8;
  }
}

/**
 * Bundle size analyzer
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          console.log(`Bundle: ${entry.name}, Size: ${(entry as any).transferSize} bytes`);
        }
      });
    });

    observer.observe({ type: 'resource', buffered: true });
  }
}

/**
 * Critical resource hints
 */
export function addCriticalResourceHints(): void {
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.swipehire.com',
  ];

  preconnectDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // DNS prefetch for other domains
  const dnsPrefetchDomains = [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ];

  dnsPrefetchDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

/**
 * Image optimization utilities
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function generateSrcSet(src: string, widths: number[]): string {
  return widths.map((width) => `${src}?w=${width} ${width}w`).join(', ');
}

export function generateSizes(breakpoints: { [key: string]: string }): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ');
}

/**
 * Service Worker utilities for caching
 */
export function registerServiceWorker(
  swPath = '/sw.js'
): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    return navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('SW registered: ', registration);
        return registration;
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
        return null;
      });
  }
  return Promise.resolve(null);
}

/**
 * Critical CSS inlining utility
 */
export function inlineCriticalCSS(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

/**
 * Viewport-based loading strategy
 */
export class ViewportLoader {
  private observer: IntersectionObserver;
  private loadedElements = new Set<Element>();

  constructor(
    private onLoad: (element: Element) => void,
    options: IntersectionObserverInit = {}
  ) {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadedElements.add(entry.target);
        this.onLoad(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  public observe(element: Element): void {
    this.observer.observe(element);
  }

  public unobserve(element: Element): void {
    this.observer.unobserve(element);
    this.loadedElements.delete(element);
  }

  public disconnect(): void {
    this.observer.disconnect();
    this.loadedElements.clear();
  }
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  bundleSize: number;
}

export function checkPerformanceBudget(
  metrics: Partial<PerformanceMetrics>,
  budget: PerformanceBudget
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.fcp && metrics.fcp > budget.fcp) {
    violations.push(`FCP: ${metrics.fcp}ms exceeds budget of ${budget.fcp}ms`);
  }

  if (metrics.lcp && metrics.lcp > budget.lcp) {
    violations.push(`LCP: ${metrics.lcp}ms exceeds budget of ${budget.lcp}ms`);
  }

  if (metrics.fid && metrics.fid > budget.fid) {
    violations.push(`FID: ${metrics.fid}ms exceeds budget of ${budget.fid}ms`);
  }

  if (metrics.cls && metrics.cls > budget.cls) {
    violations.push(`CLS: ${metrics.cls} exceeds budget of ${budget.cls}`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
