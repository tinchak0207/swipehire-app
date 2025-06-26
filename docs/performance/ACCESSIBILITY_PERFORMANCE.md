# Accessibility and Performance Guide

This document outlines the comprehensive accessibility and performance practices implemented in the SwipeHire application.

## Table of Contents

1. [Accessibility Features](#accessibility-features)
2. [Performance Optimizations](#performance-optimizations)
3. [Testing](#testing)
4. [Development Guidelines](#development-guidelines)
5. [Monitoring and Analytics](#monitoring-and-analytics)

## Accessibility Features

### Core Accessibility Utilities

The application includes comprehensive accessibility utilities in `src/lib/accessibility.ts`:

- **Focus Management**: Trap focus in modals, restore focus after interactions
- **Screen Reader Support**: ARIA live regions, announcements, and proper labeling
- **Keyboard Navigation**: Full keyboard support with proper focus indicators
- **Color Contrast**: Utilities to validate and ensure WCAG compliance
- **User Preferences**: Respect for reduced motion and high contrast preferences

### Accessible Components

#### AccessibleButton
```tsx
import { AccessibleButton } from '@/components/ui/AccessibleButton';

<AccessibleButton
  variant="primary"
  loading={isLoading}
  announcement="Form submitted successfully"
  leftIcon={<SaveIcon />}
>
  Save Changes
</AccessibleButton>
```

Features:
- Loading states with proper ARIA attributes
- Screen reader announcements
- Keyboard navigation support
- Multiple variants with DaisyUI integration

#### AccessibleModal
```tsx
import { AccessibleModal } from '@/components/ui/AccessibleModal';

<AccessibleModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  description="This action cannot be undone"
>
  <p>Are you sure you want to continue?</p>
</AccessibleModal>
```

Features:
- Focus trapping and restoration
- Escape key handling
- Backdrop click handling
- Proper ARIA attributes

#### AccessibleForm Components
```tsx
import { AccessibleInput, AccessibleSelect } from '@/components/ui/AccessibleForm';

<AccessibleInput
  label="Email Address"
  type="email"
  required
  error={errors.email}
  helperText="We'll never share your email"
/>
```

Features:
- Proper labeling and error handling
- ARIA attributes for validation states
- Required field indicators
- Helper text support

### Accessibility Hooks

#### useFocusTrap
```tsx
import { useFocusTrap } from '@/hooks/useAccessibility';

const MyModal = ({ isOpen }) => {
  const focusTrapRef = useFocusTrap(isOpen);
  
  return (
    <div ref={focusTrapRef} role="dialog">
      {/* Modal content */}
    </div>
  );
};
```

#### useScreenReaderAnnouncement
```tsx
import { useScreenReaderAnnouncement } from '@/hooks/useAccessibility';

const MyComponent = () => {
  const announce = useScreenReaderAnnouncement();
  
  const handleSave = () => {
    // Save logic
    announce('Changes saved successfully');
  };
};
```

### Accessibility Provider

The `AccessibilityProvider` manages global accessibility features:

```tsx
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';

function App() {
  return (
    <AccessibilityProvider>
      <YourApp />
    </AccessibilityProvider>
  );
}
```

Features:
- Global skip links management
- User preference detection (reduced motion, high contrast)
- Global announcement system
- Accessibility-focused CSS

## Performance Optimizations

### Core Performance Utilities

The application includes performance utilities in `src/lib/performance.ts`:

- **Web Vitals Monitoring**: FCP, LCP, FID, CLS tracking
- **Resource Analysis**: Monitor slow and large resources
- **Memory Monitoring**: Track memory usage and pressure
- **Lazy Loading**: Viewport-based loading strategies
- **Caching**: Service worker integration

### Performance Hooks

#### useWebVitals
```tsx
import { useWebVitals } from '@/hooks/usePerformance';

const MyComponent = () => {
  const metrics = useWebVitals((name, value) => {
    console.log(`${name}: ${value}`);
  });
  
  return <div>LCP: {metrics.lcp}ms</div>;
};
```

#### useLazyImage
```tsx
import { useLazyImage } from '@/hooks/usePerformance';

const LazyImage = ({ src, alt }) => {
  const { imgRef, src: lazySrc, isLoaded } = useLazyImage(src);
  
  return (
    <img
      ref={imgRef}
      src={lazySrc}
      alt={alt}
      style={{ opacity: isLoaded ? 1 : 0 }}
    />
  );
};
```

#### useVirtualScroll
```tsx
import { useVirtualScroll } from '@/hooks/usePerformance';

const VirtualList = ({ items }) => {
  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    items,
    50, // item height
    400 // container height
  );
  
  return (
    <div style={{ height: 400, overflow: 'auto' }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, paddingTop: offsetY }}>
        {visibleItems.map(({ item, index }) => (
          <div key={index} style={{ height: 50 }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Optimized Components

#### OptimizedImage
```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority // For above-the-fold images
  lazy={false}
  aspectRatio="16/9"
  fallbackSrc="/placeholder.jpg"
/>
```

Features:
- Lazy loading with intersection observer
- Fallback image support
- Loading states
- Responsive image support
- Accessibility features

### Performance Provider

The `PerformanceProvider` manages global performance monitoring:

```tsx
import { PerformanceProvider } from '@/providers/PerformanceProvider';

function App() {
  return (
    <PerformanceProvider
      enableServiceWorker={true}
      enableAnalytics={true}
      performanceBudget={{
        fcp: 1800,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
      }}
    >
      <YourApp />
    </PerformanceProvider>
  );
}
```

Features:
- Web Vitals tracking
- Performance budget monitoring
- Resource analysis
- Memory monitoring
- Analytics integration

## Testing

### Accessibility Testing

The application includes comprehensive accessibility testing utilities:

```tsx
import { accessibilityTestUtils } from '@/lib/testing/accessibility.test';

describe('MyComponent', () => {
  it('should be accessible', async () => {
    const { container } = render(<MyComponent />);
    await accessibilityTestUtils.testAccessibility({ container });
  });
  
  it('should support keyboard navigation', async () => {
    const { container } = render(<MyComponent />);
    await accessibilityTestUtils.testKeyboardNavigation(
      container.firstChild,
      3 // expected focusable elements
    );
  });
});
```

### Performance Testing

```bash
# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance

# Generate Lighthouse report
npm run lighthouse

# Run Lighthouse in CI
npm run lighthouse:ci
```

### Test Coverage

The testing setup includes:
- Axe-core for accessibility violations
- Jest-axe for React component testing
- Lighthouse for performance auditing
- Custom utilities for specific accessibility patterns

## Development Guidelines

### Accessibility Guidelines

1. **Always provide alternative text** for images
2. **Use semantic HTML** elements when possible
3. **Ensure keyboard navigation** works for all interactive elements
4. **Provide clear focus indicators** for keyboard users
5. **Use ARIA attributes** appropriately
6. **Test with screen readers** regularly
7. **Respect user preferences** (reduced motion, high contrast)
8. **Maintain proper heading hierarchy**
9. **Ensure sufficient color contrast** (4.5:1 for normal text, 3:1 for large text)
10. **Provide clear error messages** and validation feedback

### Performance Guidelines

1. **Optimize images** with proper formats and sizes
2. **Use lazy loading** for below-the-fold content
3. **Minimize bundle size** with code splitting
4. **Implement caching strategies** with service workers
5. **Monitor Web Vitals** regularly
6. **Use performance budgets** to prevent regressions
7. **Optimize for mobile** devices and slow networks
8. **Minimize layout shifts** with proper sizing
9. **Preload critical resources** for faster loading
10. **Use virtual scrolling** for large lists

### Code Quality

1. **Enable strict TypeScript** mode
2. **Use Biome** for consistent formatting and linting
3. **Write comprehensive tests** for accessibility and performance
4. **Follow React best practices** and patterns
5. **Use proper error boundaries** for graceful error handling
6. **Implement proper loading states** for better UX
7. **Use semantic versioning** for dependencies
8. **Document complex accessibility patterns**
9. **Regular dependency updates** for security and performance
10. **Code reviews** with accessibility and performance focus

## Monitoring and Analytics

### Web Vitals Tracking

The application automatically tracks Core Web Vitals:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Budget

Performance budgets are enforced to prevent regressions:
- Bundle size limits
- Image size limits
- Third-party script limits
- Performance metric thresholds

### Accessibility Monitoring

- Automated accessibility testing in CI/CD
- Regular manual testing with assistive technologies
- User feedback collection for accessibility issues
- Accessibility audit reports

### Analytics Integration

The performance provider can integrate with:
- Google Analytics 4 for Web Vitals tracking
- Custom analytics endpoints for detailed metrics
- Error tracking services for performance issues
- Real User Monitoring (RUM) for production insights

## Browser Support

### Accessibility Support
- Screen readers: NVDA, JAWS, VoiceOver, TalkBack
- Keyboard navigation: All modern browsers
- High contrast mode: Windows, macOS
- Reduced motion: All modern browsers

### Performance Support
- Service Workers: All modern browsers
- Intersection Observer: All modern browsers (with polyfill for older browsers)
- Performance Observer: All modern browsers
- Web Vitals: All modern browsers

## Resources

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

### Performance Resources
- [Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/fast/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

### Testing Resources
- [Jest Axe Documentation](https://github.com/nickcolley/jest-axe)
- [Testing Library Accessibility](https://testing-library.com/docs/guide-which-query/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)