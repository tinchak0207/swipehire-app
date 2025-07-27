'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Mobile breakpoints following Tailwind CSS conventions
 */
export const MOBILE_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Device type detection
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenSize = keyof typeof MOBILE_BREAKPOINTS;

/**
 * Touch capabilities detection
 */
interface TouchCapabilities {
  hasTouch: boolean;
  maxTouchPoints: number;
  isCoarsePointer: boolean;
}

/**
 * Mobile optimization hook return type
 */
interface MobileOptimizations {
  // Device detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  screenSize: ScreenSize;

  // Screen dimensions
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;

  // Touch capabilities
  touchCapabilities: TouchCapabilities;

  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  orientation: 'portrait' | 'landscape';

  // Safe areas (for mobile devices with notches)
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // Performance optimizations
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;

  // Network information
  connectionType: string;
  isSlowConnection: boolean;

  // Utility functions
  isBreakpoint: (breakpoint: ScreenSize) => boolean;
  isAboveBreakpoint: (breakpoint: ScreenSize) => boolean;
  isBelowBreakpoint: (breakpoint: ScreenSize) => boolean;
}

/**
 * Comprehensive Mobile Optimization Hook
 *
 * Provides detailed device detection, screen information, and optimization
 * utilities for creating responsive, mobile-first applications.
 *
 * Features:
 * - Device type detection (mobile/tablet/desktop)
 * - Screen size and breakpoint utilities
 * - Touch capability detection
 * - Orientation tracking
 * - Safe area support for modern mobile devices
 * - Performance preference detection
 * - Network condition awareness
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     isMobile,
 *     isTablet,
 *     touchCapabilities,
 *     orientation,
 *     isAboveBreakpoint,
 *     prefersReducedMotion
 *   } = useMobileOptimizations();
 *
 *   return (
 *     <div className={cn(
 *       "p-4",
 *       isMobile && "p-2",
 *       isAboveBreakpoint('lg') && "p-8"
 *     )}>
 *       {isMobile ? <MobileLayout /> : <DesktopLayout />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMobileOptimizations(): MobileOptimizations {
  // Screen dimensions state
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Device state
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Touch capabilities
  const [touchCapabilities, setTouchCapabilities] = useState<TouchCapabilities>({
    hasTouch: false,
    maxTouchPoints: 0,
    isCoarsePointer: false,
  });

  // Safe area insets
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  // User preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  // Network information
  const [connectionType, setConnectionType] = useState('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Initialize and update dimensions
  const updateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenW = window.screen.width;
    const screenH = window.screen.height;

    setViewportWidth(width);
    setViewportHeight(height);
    setScreenWidth(screenW);
    setScreenHeight(screenH);

    // Determine device type based on screen size and touch capabilities
    let newDeviceType: DeviceType = 'desktop';

    if (width < MOBILE_BREAKPOINTS.md) {
      newDeviceType = 'mobile';
    } else if (width < MOBILE_BREAKPOINTS.lg && touchCapabilities.hasTouch) {
      newDeviceType = 'tablet';
    }

    setDeviceType(newDeviceType);

    // Update orientation
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, [touchCapabilities.hasTouch]);

  // Initialize touch capabilities
  const updateTouchCapabilities = useCallback(() => {
    if (typeof window === 'undefined') return;

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // Check for coarse pointer (touch devices)
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    setTouchCapabilities({
      hasTouch,
      maxTouchPoints,
      isCoarsePointer,
    });
  }, []);

  // Update safe area insets
  const updateSafeAreaInsets = useCallback(() => {
    if (typeof window === 'undefined') return;

    const computedStyle = getComputedStyle(document.documentElement);

    setSafeAreaInsets({
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
    });
  }, []);

  // Update user preferences
  const updateUserPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPrefersHighContrast(window.matchMedia('(prefers-contrast: high)').matches);
    setPrefersDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  // Update network information
  const updateNetworkInfo = useCallback(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
      setIsSlowConnection(
        connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          connection.saveData === true
      );
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    updateTouchCapabilities();
    updateDimensions();
    updateSafeAreaInsets();
    updateUserPreferences();
    updateNetworkInfo();
  }, [
    updateTouchCapabilities,
    updateDimensions,
    updateSafeAreaInsets,
    updateUserPreferences,
    updateNetworkInfo,
  ]);

  // Listen for resize events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      updateDimensions();
      updateSafeAreaInsets();
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        updateDimensions();
        updateSafeAreaInsets();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateDimensions, updateSafeAreaInsets]);

  // Listen for media query changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(pointer: coarse)'),
    ];

    const handleMediaQueryChange = () => {
      updateUserPreferences();
      updateTouchCapabilities();
    };

    mediaQueries.forEach((mq) => {
      mq.addEventListener('change', handleMediaQueryChange);
    });

    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener('change', handleMediaQueryChange);
      });
    };
  }, [updateUserPreferences, updateTouchCapabilities]);

  // Listen for network changes
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
    return undefined;
  }, [updateNetworkInfo]);

  // Utility functions
  const getCurrentScreenSize = useCallback((): ScreenSize => {
    if (viewportWidth >= MOBILE_BREAKPOINTS['2xl']) return '2xl';
    if (viewportWidth >= MOBILE_BREAKPOINTS.xl) return 'xl';
    if (viewportWidth >= MOBILE_BREAKPOINTS.lg) return 'lg';
    if (viewportWidth >= MOBILE_BREAKPOINTS.md) return 'md';
    if (viewportWidth >= MOBILE_BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, [viewportWidth]);

  const isBreakpoint = useCallback(
    (breakpoint: ScreenSize): boolean => {
      return getCurrentScreenSize() === breakpoint;
    },
    [getCurrentScreenSize]
  );

  const isAboveBreakpoint = useCallback(
    (breakpoint: ScreenSize): boolean => {
      return viewportWidth >= MOBILE_BREAKPOINTS[breakpoint];
    },
    [viewportWidth]
  );

  const isBelowBreakpoint = useCallback(
    (breakpoint: ScreenSize): boolean => {
      return viewportWidth < MOBILE_BREAKPOINTS[breakpoint];
    },
    [viewportWidth]
  );

  // Derived values
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isPortrait = orientation === 'portrait';
  const isLandscape = orientation === 'landscape';
  const screenSize = getCurrentScreenSize();

  return {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    screenSize,

    // Screen dimensions
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,

    // Touch capabilities
    touchCapabilities,

    // Orientation
    isPortrait,
    isLandscape,
    orientation,

    // Safe areas
    safeAreaInsets,

    // Performance optimizations
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,

    // Network information
    connectionType,
    isSlowConnection,

    // Utility functions
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
  };
}

/**
 * Hook for responsive values based on breakpoints
 *
 * @example
 * ```tsx
 * const columns = useResponsiveValue({
 *   xs: 1,
 *   sm: 2,
 *   md: 3,
 *   lg: 4,
 *   xl: 5,
 *   '2xl': 6
 * });
 * ```
 */
export function useResponsiveValue<T>(values: Partial<Record<ScreenSize, T>>): T | undefined {
  const { isAboveBreakpoint } = useMobileOptimizations();

  // Find the appropriate value for current screen size
  const breakpointOrder: ScreenSize[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

  for (const breakpoint of breakpointOrder) {
    if (values[breakpoint] !== undefined && isAboveBreakpoint(breakpoint)) {
      return values[breakpoint];
    }
  }

  // Fallback to the smallest defined value
  for (const breakpoint of [...breakpointOrder].reverse()) {
    if (values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }

  return undefined;
}

export default useMobileOptimizations;
