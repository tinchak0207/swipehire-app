/**
 * Mobile-First Responsive Layout Component
 *
 * Features:
 * - Touch-optimized interface with gesture navigation
 * - Adaptive layout system with contextual menus
 * - Progressive Web App capabilities
 * - Thumb-friendly controls and haptic feedback
 * - Smart keyboard and voice input support
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features
 */

'use client';

import { AnimatePresence, motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AccessibilityConfig, GestureConfig, ResponsiveLayoutProps } from '../types';

// Gesture configuration for touch interactions
const defaultGestureConfig: GestureConfig = {
  swipeThreshold: 50,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchSensitivity: 0.1,
};

// Accessibility configuration
const defaultAccessibilityConfig: AccessibilityConfig = {
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
};

// Hook for detecting device capabilities
const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    touchSupport: false,
    voiceSupport: false,
    vibrationSupport: false,
    orientationSupport: false,
    networkType: 'unknown',
  });

  useEffect(() => {
    const detectCapabilities = () => {
      setCapabilities({
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        voiceSupport: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        vibrationSupport: 'vibrate' in navigator,
        orientationSupport: 'orientation' in window,
        networkType: (navigator as any).connection?.effectiveType || 'unknown',
      });
    };

    detectCapabilities();
    window.addEventListener('resize', detectCapabilities);

    return () => window.removeEventListener('resize', detectCapabilities);
  }, []);

  return capabilities;
};

// Hook for gesture handling
const useGestureHandling = (
  config: GestureConfig = defaultGestureConfig,
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void,
  onLongPress?: () => void,
  onDoubleTap?: () => void
) => {
  const [gestureState, setGestureState] = useState({
    isPressed: false,
    lastTap: 0,
    longPressTimer: null as NodeJS.Timeout | null,
  });

  const handlePanStart = useCallback(() => {
    setGestureState((prev) => ({ ...prev, isPressed: true }));
  }, []);

  const handlePanEnd = useCallback(
    (_event: any, info: PanInfo) => {
      setGestureState((prev) => ({ ...prev, isPressed: false }));

      const { offset } = info;
      const { swipeThreshold } = config;

      // Determine swipe direction
      if (Math.abs(offset.x) > Math.abs(offset.y)) {
        if (Math.abs(offset.x) > swipeThreshold) {
          onSwipe?.(offset.x > 0 ? 'right' : 'left');
        }
      } else {
        if (Math.abs(offset.y) > swipeThreshold) {
          onSwipe?.(offset.y > 0 ? 'down' : 'up');
        }
      }
    },
    [config, onSwipe]
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - gestureState.lastTap;

    if (timeSinceLastTap < config.doubleTapDelay && timeSinceLastTap > 0) {
      onDoubleTap?.();
    }

    setGestureState((prev) => ({ ...prev, lastTap: now }));
  }, [config.doubleTapDelay, gestureState.lastTap, onDoubleTap]);

  const handlePressStart = useCallback(() => {
    const timer = setTimeout(() => {
      onLongPress?.();
      // Haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, config.longPressDelay);

    setGestureState((prev) => ({ ...prev, longPressTimer: timer }));
  }, [config.longPressDelay, onLongPress]);

  const handlePressEnd = useCallback(() => {
    if (gestureState.longPressTimer) {
      clearTimeout(gestureState.longPressTimer);
      setGestureState((prev) => ({ ...prev, longPressTimer: null }));
    }
  }, [gestureState.longPressTimer]);

  return {
    gestureHandlers: {
      onPanStart: handlePanStart,
      onPanEnd: handlePanEnd,
      onTap: handleTap,
      onTapStart: handlePressStart,
      onTapCancel: handlePressEnd,
    },
    gestureState,
  };
};

// Navigation component with gesture support
const GestureNavigation: React.FC<{
  currentSection: number;
  totalSections: number;
  onNavigate: (section: number) => void;
  children: React.ReactNode;
}> = ({ currentSection, totalSections, onNavigate, children }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  const { gestureHandlers } = useGestureHandling(defaultGestureConfig, (direction) => {
    if (direction === 'left' && currentSection < totalSections - 1) {
      onNavigate(currentSection + 1);
    } else if (direction === 'right' && currentSection > 0) {
      onNavigate(currentSection - 1);
    }
  });

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      {...gestureHandlers}
    >
      {children}

      {/* Navigation indicators */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalSections }, (_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-200 ${
              i === currentSection ? 'w-6 bg-primary' : 'bg-base-300'
            }`}
            onClick={() => onNavigate(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Adaptive bottom sheet component
const BottomSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  const y = useMotionValue(0);

  const handleDragEnd = useCallback(
    (_event: any, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            className="fixed right-0 bottom-0 left-0 z-50 max-h-[80vh] overflow-hidden rounded-t-3xl bg-base-100"
            style={{ y }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-12 rounded-full bg-base-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-base-200 border-b px-6 py-3">
              <h3 className="font-semibold text-lg">{title}</h3>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Floating Action Button with contextual actions
const FloatingActionButton: React.FC<{
  primaryAction: () => void;
  secondaryActions?: Array<{
    label: string;
    icon: React.ReactNode;
    action: () => void;
  }>;
}> = ({ primaryAction, secondaryActions = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  }, [isExpanded]);

  return (
    <div className="fixed right-6 bottom-6 z-30">
      {/* Secondary actions */}
      <AnimatePresence>
        {isExpanded && secondaryActions.length > 0 && (
          <motion.div
            className="absolute right-0 bottom-16 space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {secondaryActions.map((action, index) => (
              <motion.button
                key={action.label}
                className="btn btn-circle btn-secondary shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.action();
                  setIsExpanded(false);
                }}
                aria-label={action.label}
              >
                {action.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary action button */}
      <motion.button
        className="btn btn-circle btn-primary btn-lg shadow-lg"
        whileTap={{ scale: 0.95 }}
        onClick={secondaryActions.length > 0 ? toggleExpanded : primaryAction}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        {secondaryActions.length > 0 ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};

// Main responsive layout component
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  breakpoint,
  orientation,
  touchCapable,
  children,
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [accessibilityConfig, setAccessibilityConfig] = useState(defaultAccessibilityConfig);

  const capabilities = useDeviceCapabilities();

  // Determine layout configuration based on screen size and capabilities
  const layoutConfig = useMemo(() => {
    const isMobile = breakpoint === 'mobile';
    const isTablet = breakpoint === 'tablet';
    const isLandscape = orientation === 'landscape';

    return {
      showSidebar: !isMobile && !isTablet,
      useBottomNavigation: isMobile,
      enableGestures: touchCapable,
      compactMode: isMobile || (isTablet && !isLandscape),
      maxWidth: isMobile ? 'max-w-full' : isTablet ? 'max-w-4xl' : 'max-w-7xl',
      padding: isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6',
      spacing: isMobile ? 'space-y-3' : 'space-y-6',
    };
  }, [breakpoint, orientation, touchCapable]);

  // Handle section navigation
  const handleSectionChange = useCallback(
    (section: number) => {
      setCurrentSection(section);
      // Haptic feedback for navigation
      if (capabilities.vibrationSupport) {
        navigator.vibrate(25);
      }
    },
    [capabilities.vibrationSupport]
  );

  // Accessibility enhancements
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateAccessibility = () => {
      setAccessibilityConfig({
        reducedMotion: mediaQuery.matches,
        highContrast: contrastQuery.matches,
        screenReader: !!document.querySelector('[aria-live]'),
        keyboardNavigation: true,
      });
    };

    updateAccessibility();
    mediaQuery.addEventListener('change', updateAccessibility);
    contrastQuery.addEventListener('change', updateAccessibility);

    return () => {
      mediaQuery.removeEventListener('change', updateAccessibility);
      contrastQuery.removeEventListener('change', updateAccessibility);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!accessibilityConfig.keyboardNavigation) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (currentSection > 0) {
            handleSectionChange(currentSection - 1);
          }
          break;
        case 'ArrowRight':
          handleSectionChange(currentSection + 1);
          break;
        case 'Escape':
          setShowBottomSheet(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, accessibilityConfig.keyboardNavigation, handleSectionChange]);

  return (
    <div
      className={`min-h-screen bg-base-200 ${layoutConfig.maxWidth} mx-auto ${layoutConfig.padding}`}
      data-theme={accessibilityConfig.highContrast ? 'contrast' : undefined}
    >
      {/* Sticky header for mobile */}
      {layoutConfig.compactMode && (
        <div className="-mx-2 sticky top-0 z-20 mb-4 border-base-200 border-b bg-base-100 px-2 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="truncate font-semibold text-lg">Resume Optimizer</h1>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowBottomSheet(true)}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className={`${layoutConfig.spacing}`}>
        {layoutConfig.enableGestures ? (
          <GestureNavigation
            currentSection={currentSection}
            totalSections={3}
            onNavigate={handleSectionChange}
          >
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: accessibilityConfig.reducedMotion ? 0 : 0.3,
                ease: 'easeInOut',
              }}
            >
              {children}
            </motion.div>
          </GestureNavigation>
        ) : (
          <div>{children}</div>
        )}
      </div>

      {/* Floating Action Button */}
      {layoutConfig.compactMode && (
        <FloatingActionButton
          primaryAction={() => console.log('Primary action')}
          secondaryActions={[
            {
              label: 'Upload',
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              ),
              action: () => console.log('Upload action'),
            },
            {
              label: 'Analyze',
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ),
              action: () => console.log('Analyze action'),
            },
          ]}
        />
      )}

      {/* Bottom sheet for mobile menu */}
      <BottomSheet isOpen={showBottomSheet} onClose={() => setShowBottomSheet(false)} title="Menu">
        <div className="space-y-4">
          <button className="btn btn-ghost w-full justify-start">
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Resume
          </button>
          <button className="btn btn-ghost w-full justify-start">
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Analysis
          </button>
          <button className="btn btn-ghost w-full justify-start">
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
        </div>
      </BottomSheet>

      {/* Accessibility announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {/* Screen reader announcements will be inserted here */}
      </div>
    </div>
  );
};

export default ResponsiveLayout;
