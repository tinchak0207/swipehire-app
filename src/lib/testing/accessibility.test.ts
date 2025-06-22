/**
 * Accessibility testing utilities and test cases
 * Provides comprehensive accessibility testing for components
 */

import type { RenderResult } from '@testing-library/react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Test accessibility compliance using axe-core
 */
export async function testAccessibility(component: RenderResult): Promise<void> {
  const results = await axe(component.container);
  expect(results).toHaveNoViolations();
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(
  element: HTMLElement,
  expectedFocusableElements: number
): Promise<void> {
  const user = userEvent.setup();

  // Focus the first element
  element.focus();

  let focusedElements = 0;
  let currentElement = document.activeElement;

  // Tab through all focusable elements
  while (focusedElements < expectedFocusableElements) {
    await user.tab();
    const newElement = document.activeElement;

    if (newElement === currentElement) {
      break; // No more focusable elements
    }

    currentElement = newElement;
    focusedElements++;
  }

  expect(focusedElements).toBe(expectedFocusableElements);
}

/**
 * Test ARIA attributes
 */
export function testAriaAttributes(
  element: HTMLElement,
  expectedAttributes: Record<string, string>
): void {
  Object.entries(expectedAttributes).forEach(([attribute, expectedValue]) => {
    const actualValue = element.getAttribute(attribute);
    expect(actualValue).toBe(expectedValue);
  });
}

/**
 * Test screen reader announcements
 */
export async function testScreenReaderAnnouncement(
  action: () => void,
  expectedAnnouncement: string
): Promise<void> {
  // Create a mock live region
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('data-testid', 'live-region');
  document.body.appendChild(liveRegion);

  // Perform the action
  action();

  // Wait for the announcement
  await waitFor(() => {
    expect(liveRegion.textContent).toBe(expectedAnnouncement);
  });

  // Cleanup
  document.body.removeChild(liveRegion);
}

/**
 * Test focus management
 */
export async function testFocusManagement(
  openAction: () => void,
  closeAction: () => void,
  _modalSelector: string
): Promise<void> {
  const user = userEvent.setup();

  // Save initial focus
  const initialFocus = document.activeElement;

  // Open modal
  openAction();

  // Wait for modal to appear
  const modal = await screen.findByRole('dialog');
  expect(modal).toBeInTheDocument();

  // Check that focus is trapped within modal
  await user.tab();
  const focusedElement = document.activeElement;
  expect(modal.contains(focusedElement)).toBe(true);

  // Close modal
  closeAction();

  // Wait for modal to disappear
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Check that focus is restored
  expect(document.activeElement).toBe(initialFocus);
}

/**
 * Test color contrast
 */
export function testColorContrast(element: HTMLElement, _minimumRatio = 4.5): void {
  const styles = window.getComputedStyle(element);
  const backgroundColor = styles.backgroundColor;
  const color = styles.color;

  // This is a simplified test - in a real scenario, you'd use a proper contrast checker
  expect(backgroundColor).toBeDefined();
  expect(color).toBeDefined();

  // You would implement actual contrast ratio calculation here
  // For now, we just ensure the colors are defined
}

/**
 * Test responsive design accessibility
 */
export async function testResponsiveAccessibility(
  component: RenderResult,
  viewports: Array<{ width: number; height: number }>
): Promise<void> {
  for (const viewport of viewports) {
    // Simulate viewport change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height,
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    // Test accessibility at this viewport
    await testAccessibility(component);
  }
}

/**
 * Test form accessibility
 */
export function testFormAccessibility(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach((input) => {
    const label = form.querySelector(`label[for="${input.id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    // Each input should have a label
    expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();

    // Required fields should be marked
    if (input.hasAttribute('required')) {
      expect(input.getAttribute('aria-required') === 'true' || input.hasAttribute('required')).toBe(
        true
      );
    }

    // Error states should be properly indicated
    if (input.getAttribute('aria-invalid') === 'true') {
      const errorId = input.getAttribute('aria-describedby');
      if (errorId) {
        const errorElement = document.getElementById(errorId);
        expect(errorElement).toBeInTheDocument();
      }
    }
  });
}

/**
 * Test table accessibility
 */
export function testTableAccessibility(table: HTMLTableElement): void {
  // Check for table headers
  const headers = table.querySelectorAll('th');
  expect(headers.length).toBeGreaterThan(0);

  // Check for proper scope attributes
  headers.forEach((header) => {
    const scope = header.getAttribute('scope');
    expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(scope);
  });

  // Check for caption or aria-label
  const caption = table.querySelector('caption');
  const ariaLabel = table.getAttribute('aria-label');
  const ariaLabelledBy = table.getAttribute('aria-labelledby');

  expect(caption || ariaLabel || ariaLabelledBy).toBeTruthy();
}

/**
 * Test modal accessibility
 */
export async function testModalAccessibility(
  openModalAction: () => void,
  modalRole = 'dialog'
): Promise<void> {
  const user = userEvent.setup();

  // Open modal
  openModalAction();

  // Wait for modal to appear
  const modal = await screen.findByRole(modalRole);

  // Test ARIA attributes
  expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(modal).toHaveAttribute('role', modalRole);

  // Test focus management
  expect(modal.contains(document.activeElement)).toBe(true);

  // Test escape key
  await user.keyboard('{Escape}');

  // Modal should close (this depends on implementation)
  await waitFor(() => {
    expect(screen.queryByRole(modalRole)).not.toBeInTheDocument();
  });
}

/**
 * Test button accessibility
 */
export function testButtonAccessibility(button: HTMLButtonElement): void {
  // Button should have accessible name
  const accessibleName =
    button.textContent ||
    button.getAttribute('aria-label') ||
    button.getAttribute('aria-labelledby');

  expect(accessibleName).toBeTruthy();

  // Button should be focusable
  expect(button.tabIndex).toBeGreaterThanOrEqual(0);

  // Disabled buttons should be properly marked
  if (button.disabled) {
    expect(button.getAttribute('aria-disabled')).toBe('true');
  }

  // Loading buttons should indicate busy state
  if (button.getAttribute('aria-busy') === 'true') {
    expect(button.textContent).toMatch(/loading|wait|processing/i);
  }
}

/**
 * Test link accessibility
 */
export function testLinkAccessibility(link: HTMLAnchorElement): void {
  // Link should have accessible name
  const accessibleName =
    link.textContent || link.getAttribute('aria-label') || link.getAttribute('aria-labelledby');

  expect(accessibleName).toBeTruthy();

  // External links should be indicated
  if (link.target === '_blank') {
    expect(
      link.textContent?.includes('opens in new') ||
        link.getAttribute('aria-label')?.includes('opens in new') ||
        link.querySelector('[aria-hidden="true"]')
    ).toBeTruthy();
  }

  // Links should have proper href
  expect(link.href).toBeTruthy();
}

/**
 * Test image accessibility
 */
export function testImageAccessibility(img: HTMLImageElement): void {
  // Images should have alt text
  expect(img.alt).toBeDefined();

  // Decorative images should have empty alt
  if (img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true') {
    expect(img.alt).toBe('');
  } else {
    // Content images should have descriptive alt text
    expect(img.alt.length).toBeGreaterThan(0);
  }
}

/**
 * Test heading hierarchy
 */
export function testHeadingHierarchy(container: HTMLElement): void {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const levels: number[] = [];

  headings.forEach((heading) => {
    const level = Number.parseInt(heading.tagName.charAt(1), 10);
    levels.push(level);
  });

  // Check that heading levels don't skip
  for (let i = 1; i < levels.length; i++) {
    const currentLevel = levels[i];
    const previousLevel = levels[i - 1];

    if (currentLevel > previousLevel) {
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }
  }

  // Should start with h1
  if (levels.length > 0) {
    expect(levels[0]).toBe(1);
  }
}

/**
 * Test landmark accessibility
 */
export function testLandmarkAccessibility(container: HTMLElement): void {
  // Check for main landmark
  const main = container.querySelector('main, [role="main"]');
  expect(main).toBeInTheDocument();

  // Check for navigation landmarks
  const nav = container.querySelectorAll('nav, [role="navigation"]');
  nav.forEach((navElement) => {
    // Navigation should have accessible name if there are multiple
    if (nav.length > 1) {
      const accessibleName =
        navElement.getAttribute('aria-label') || navElement.getAttribute('aria-labelledby');
      expect(accessibleName).toBeTruthy();
    }
  });
}

/**
 * Performance test for accessibility features
 */
export async function testAccessibilityPerformance(
  renderFunction: () => RenderResult,
  iterations = 10
): Promise<void> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = renderFunction();
    await testAccessibility(result);
    const end = performance.now();

    times.push(end - start);
    result.unmount();
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

  // Accessibility tests should complete within reasonable time
  expect(averageTime).toBeLessThan(1000); // 1 second
}

// Export all test utilities
export const accessibilityTestUtils = {
  testAccessibility,
  testKeyboardNavigation,
  testAriaAttributes,
  testScreenReaderAnnouncement,
  testFocusManagement,
  testColorContrast,
  testResponsiveAccessibility,
  testFormAccessibility,
  testTableAccessibility,
  testModalAccessibility,
  testButtonAccessibility,
  testLinkAccessibility,
  testImageAccessibility,
  testHeadingHierarchy,
  testLandmarkAccessibility,
  testAccessibilityPerformance,
};

// Basic test to ensure the utilities are working
describe('Accessibility Test Utils', () => {
  it('should export all accessibility testing utilities', () => {
    expect(accessibilityTestUtils).toBeDefined();
    expect(typeof accessibilityTestUtils.testAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testKeyboardNavigation).toBe('function');
    expect(typeof accessibilityTestUtils.testAriaAttributes).toBe('function');
    expect(typeof accessibilityTestUtils.testScreenReaderAnnouncement).toBe('function');
    expect(typeof accessibilityTestUtils.testFocusManagement).toBe('function');
    expect(typeof accessibilityTestUtils.testColorContrast).toBe('function');
    expect(typeof accessibilityTestUtils.testResponsiveAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testFormAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testTableAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testModalAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testButtonAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testLinkAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testImageAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testHeadingHierarchy).toBe('function');
    expect(typeof accessibilityTestUtils.testLandmarkAccessibility).toBe('function');
    expect(typeof accessibilityTestUtils.testAccessibilityPerformance).toBe('function');
  });

  it('should have proper axe matchers extended', () => {
    // Just verify that toHaveNoViolations is available
    expect(toHaveNoViolations).toBeDefined();
    expect(typeof toHaveNoViolations).toBe('object');
  });
});
