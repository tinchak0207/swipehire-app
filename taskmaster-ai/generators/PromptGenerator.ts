/**
 * Taskmaster AI Prompt Generator
 *
 * This module generates comprehensive prompts for AI-assisted component creation
 * following the established rules and guidelines.
 */

import { taskmasterConfig } from '../config/taskmaster.config';

export interface ComponentRequirements {
  name: string;
  type: 'page' | 'component' | 'hook' | 'service' | 'utility';
  description: string;
  features: string[];
  dependencies?: string[];
  styling?: 'tailwind' | 'daisyui' | 'custom';
  responsive?: boolean;
  accessibility?: boolean;
  testing?: boolean;
  stateManagement?: 'useState' | 'useReducer' | 'context' | 'external';
  apiIntegration?: boolean;
  animations?: boolean;
}

export class PromptGenerator {
  private config = taskmasterConfig;

  /**
   * Generates a comprehensive prompt for component creation
   */
  generateComponentPrompt(requirements: ComponentRequirements): string {
    const sections = [
      this.generateAnalysisSection(requirements),
      this.generateDaisyUISection(requirements),
      this.generateTailwindSection(requirements),
      this.generateTypeScriptSection(requirements),
      this.generateResponsiveSection(requirements),
      this.generateNextJSSection(requirements),
      this.generateStateManagementSection(requirements),
      this.generateAccessibilitySection(requirements),
      this.generateIconsAssetsSection(requirements),
      this.generateErrorHandlingSection(requirements),
      this.generateAnimationsSection(requirements),
      this.generateAPIIntegrationSection(requirements),
      this.generatePerformanceSection(requirements),
      this.generateTestingSection(requirements),
      this.generateDocumentationSection(requirements),
      this.generateGeneralGuidelinesSection(),
      this.generateProjectStructureSection(),
      this.generateBiomeSection(),
    ];

    return sections.filter((section) => section.trim()).join('\n\n');
  }

  private generateAnalysisSection(requirements: ComponentRequirements): string {
    return `## Component Analysis

**Component Name:** ${requirements.name}
**Type:** ${requirements.type}
**Description:** ${requirements.description}

**Required Features:**
${requirements.features.map((feature) => `- ${feature}`).join('\n')}

**Dependencies:** ${requirements.dependencies?.join(', ') || 'None specified'}

Analyze the component requirements thoroughly and ensure all specified features are implemented with proper TypeScript typing and error handling.`;
  }

  private generateDaisyUISection(requirements: ComponentRequirements): string {
    if (requirements.styling !== 'daisyui' && requirements.styling !== undefined) {
      return '';
    }

    return `## DaisyUI Component Suggestions

Use the following DaisyUI components where appropriate:
- **Layout:** container, divider, drawer, footer, hero, indicator, join, mask, stack
- **Navigation:** breadcrumbs, bottom-navigation, link, menu, navbar, pagination, steps, tab
- **Data Display:** accordion, avatar, badge, card, carousel, chat, collapse, countdown, diff, kbd, stat, table, timeline
- **Data Input:** checkbox, file-input, radio, range, rating, select, text-input, textarea, toggle
- **Actions:** button, dropdown, modal, swap
- **Feedback:** alert, loading, progress, radial-progress, skeleton, toast, tooltip

Customize DaisyUI components only when absolutely necessary. Prefer using built-in variants and modifiers.`;
  }

  private generateTailwindSection(_requirements: ComponentRequirements): string {
    return `## Tailwind CSS Styling Requirements

**Utility Classes:**
- Use TailwindCSS utility classes exclusively
- Avoid custom CSS unless absolutely necessary
- Maintain consistent class order: layout → spacing → sizing → colors → typography → effects

**Responsive Design:**
- Implement mobile-first responsive design
- Use Tailwind's responsive variants (sm:, md:, lg:, xl:, 2xl:)
- Ensure proper breakpoint handling

**Design Tokens:**
- Use design tokens defined in tailwind.config.js
- Maintain consistent spacing, colors, and typography scales
- Follow the project's design system`;
  }

  private generateTypeScriptSection(_requirements: ComponentRequirements): string {
    return `## TypeScript Requirements

**Strict Typing:**
- Enable strict TypeScript mode
- Avoid 'any' type, prefer 'unknown' with runtime checks
- Explicitly type all function inputs and outputs
- Use advanced TypeScript features (type guards, mapped types, conditional types)

**Interface Design:**
- Create comprehensive interfaces for all props
- Use 'interface' for extendable object shapes
- Use 'type' for unions, intersections, and primitive compositions
- Implement proper prop validation

**Type Safety:**
- Validate and sanitize all inputs
- Use discriminated unions for complex state management
- Document complex types with JSDoc comments`;
  }

  private generateResponsiveSection(requirements: ComponentRequirements): string {
    if (!requirements.responsive) return '';

    return `## Responsive Design Instructions

**Breakpoint Strategy:**
- Mobile-first approach (min-width breakpoints)
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

**Layout Considerations:**
- Flexible grid systems using CSS Grid or Flexbox
- Responsive typography scaling
- Touch-friendly interactive elements (min 44px touch targets)
- Proper spacing adjustments across breakpoints

**Testing Requirements:**
- Test on multiple device sizes
- Verify touch interactions on mobile devices
- Ensure proper content reflow`;
  }

  private generateNextJSSection(_requirements: ComponentRequirements): string {
    return `## Next.js Integration

**Routing:**
- Use dynamic routes with bracket notation ([id].tsx) when applicable
- Validate and sanitize route parameters
- Prefer flat, descriptive route structures

**Data Fetching:**
- Use getServerSideProps for dynamic data
- Use getStaticProps/getStaticPaths for static content
- Implement Incremental Static Regeneration (ISR) where appropriate

**Performance:**
- Use next/image for optimized images
- Configure image layout, priority, sizes, and srcSet attributes
- Implement proper loading states and error boundaries`;
  }

  private generateStateManagementSection(requirements: ComponentRequirements): string {
    if (!requirements.stateManagement) return '';

    const stateGuidance = {
      useState: 'Use useState for simple local state management',
      useReducer: 'Use useReducer for complex state logic with multiple sub-values',
      context: 'Use React Context for state that needs to be shared across multiple components',
      external: 'Integrate with external state management libraries as needed',
    };

    return `## State Management

**Recommended Approach:** ${stateGuidance[requirements.stateManagement]}

**Implementation Guidelines:**
- Separate concerns: presentational components vs. business logic
- Use custom hooks for reusable state logic
- Implement proper error boundaries
- Handle loading and error states appropriately`;
  }

  private generateAccessibilitySection(requirements: ComponentRequirements): string {
    if (!requirements.accessibility) return '';

    return `## Accessibility Considerations

**WCAG 2.1 Compliance:**
- Ensure proper semantic HTML structure
- Implement ARIA labels and roles where necessary
- Maintain proper color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Support keyboard navigation

**Screen Reader Support:**
- Use descriptive alt text for images
- Implement proper heading hierarchy (h1-h6)
- Provide skip links for navigation
- Use live regions for dynamic content updates

**Interactive Elements:**
- Ensure all interactive elements are keyboard accessible
- Provide clear focus indicators
- Implement proper tab order`;
  }

  private generateIconsAssetsSection(_requirements: ComponentRequirements): string {
    return `## Icons and Assets

**Icon Library:**
- Use Lucide React icons (already installed)
- Ensure consistent icon sizing and styling
- Implement proper accessibility attributes for decorative vs. informative icons

**Asset Optimization:**
- Use next/image for all images
- Implement proper lazy loading
- Provide appropriate alt text and captions
- Consider WebP format for better compression`;
  }

  private generateErrorHandlingSection(_requirements: ComponentRequirements): string {
    return `## Error Handling and Loading States

**Error Boundaries:**
- Implement React Error Boundaries for component-level error handling
- Provide meaningful error messages to users
- Log errors appropriately for debugging

**Loading States:**
- Show loading indicators for async operations
- Use skeleton screens for better perceived performance
- Implement timeout handling for long-running operations

**Validation:**
- Validate all user inputs
- Provide clear validation error messages
- Use Zod for runtime type validation where appropriate`;
  }

  private generateAnimationsSection(requirements: ComponentRequirements): string {
    if (!requirements.animations) return '';

    return `## Animations and Transitions

**Animation Library:**
- Use tailwindcss-animate for CSS-based animations
- Consider Framer Motion for complex animations
- Implement AOS (Animate On Scroll) for scroll-triggered animations

**Performance Considerations:**
- Use CSS transforms and opacity for smooth animations
- Avoid animating layout properties
- Respect user's motion preferences (prefers-reduced-motion)

**Accessibility:**
- Provide options to disable animations
- Ensure animations don't cause seizures or vestibular disorders`;
  }

  private generateAPIIntegrationSection(requirements: ComponentRequirements): string {
    if (!requirements.apiIntegration) return '';

    return `## API Integration and Data Fetching

**Data Fetching Strategy:**
- Use React Query (@tanstack/react-query) for server state management
- Implement proper caching strategies
- Handle loading, error, and success states

**Error Handling:**
- Implement retry logic for failed requests
- Provide meaningful error messages
- Use proper HTTP status code handling

**Type Safety:**
- Define TypeScript interfaces for API responses
- Validate API responses at runtime
- Use proper error typing`;
  }

  private generatePerformanceSection(_requirements: ComponentRequirements): string {
    return `## Performance Optimization

**React Optimization:**
- Use React.memo for expensive components
- Implement proper key props for lists
- Use useCallback and useMemo judiciously
- Avoid unnecessary re-renders

**Bundle Optimization:**
- Use dynamic imports for code splitting
- Implement proper tree shaking
- Minimize bundle size with proper imports

**Runtime Performance:**
- Optimize expensive calculations
- Use Web Workers for heavy computations
- Implement proper virtualization for large lists`;
  }

  private generateTestingSection(requirements: ComponentRequirements): string {
    if (!requirements.testing) return '';

    return `## Testing Requirements

**Unit Testing:**
- Use Jest and React Testing Library
- Test component behavior, not implementation details
- Achieve meaningful test coverage, not just high percentages

**Integration Testing:**
- Test component interactions
- Mock external dependencies appropriately
- Test error scenarios and edge cases

**Accessibility Testing:**
- Use jest-axe for automated accessibility testing
- Test keyboard navigation
- Verify screen reader compatibility`;
  }

  private generateDocumentationSection(_requirements: ComponentRequirements): string {
    return `## Documentation Requirements

**Component Documentation:**
- Document all props with JSDoc comments
- Provide usage examples
- Document any complex logic or algorithms

**README Updates:**
- Update component documentation
- Include installation and usage instructions
- Document any breaking changes

**Type Documentation:**
- Document complex TypeScript types
- Provide examples of proper usage
- Explain any non-obvious type constraints`;
  }

  private generateGeneralGuidelinesSection(): string {
    return `## General Component Creation Guidelines

**Reusability and Modularity:**
- Design components for maximum reusability
- Follow single responsibility principle
- Create composable component APIs

**Naming Conventions:**
- Use PascalCase for component names
- Use camelCase for props and functions
- Use descriptive, self-documenting names

**React Best Practices:**
- Follow React patterns and conventions
- Implement proper prop validation
- Use functional components with hooks

**Internationalization:**
- Consider i18n requirements from the start
- Use proper text externalization
- Support RTL languages where applicable

**SEO Optimization:**
- Use proper semantic HTML
- Implement structured data where appropriate
- Ensure proper meta tags and descriptions

**Browser Compatibility:**
- Test across different browsers and devices
- Use appropriate polyfills when necessary
- Follow progressive enhancement principles`;
  }

  private generateProjectStructureSection(): string {
    return `## Project Structure Guidelines

**File Organization:**
- components/ - Reusable UI components
- pages/ - Next.js pages and route handlers
- hooks/ - Custom React hooks
- utils/ - Utility functions and helpers
- styles/ - Global styles and theme configuration
- contracts/ - TypeScript interfaces and types
- services/ - API services and external integrations

**Component Structure:**
- Each component in its own directory
- Include component file, types, tests, and stories
- Use index.ts for clean imports

**Import Organization:**
- External libraries first
- Internal imports second
- Relative imports last
- Use absolute imports where possible`;
  }

  private generateBiomeSection(): string {
    return `## Biome Configuration

**Code Quality:**
- Use Biome for code formatting and linting
- Follow Biome's recommended rules
- Configure as pre-commit hook

**Import Organization:**
- Use Biome's organize imports feature
- Maintain clean import statements
- Remove unused imports automatically

**CI/CD Integration:**
- Include Biome checks in CI pipeline
- Address all warnings and errors
- Keep Biome updated to latest stable version`;
  }

  /**
   * Generates a prompt for creating a specific component type
   */
  generateSpecificPrompt(
    type: ComponentRequirements['type'],
    name: string,
    description: string
  ): string {
    const baseRequirements: ComponentRequirements = {
      name,
      type,
      description,
      features: [],
      styling: 'daisyui',
      responsive: true,
      accessibility: true,
      testing: true,
      stateManagement: 'useState',
      apiIntegration: false,
      animations: false,
    };

    // Customize based on component type
    switch (type) {
      case 'page':
        baseRequirements.features = ['SEO optimization', 'Loading states', 'Error boundaries'];
        baseRequirements.apiIntegration = true;
        break;
      case 'component':
        baseRequirements.features = ['Reusable props', 'Flexible styling', 'Event handling'];
        break;
      case 'hook':
        baseRequirements.features = ['State management', 'Side effects', 'Cleanup'];
        baseRequirements.responsive = false;
        baseRequirements.styling = undefined;
        break;
      case 'service':
        baseRequirements.features = ['API integration', 'Error handling', 'Type safety'];
        baseRequirements.responsive = false;
        baseRequirements.styling = undefined;
        baseRequirements.apiIntegration = true;
        break;
      case 'utility':
        baseRequirements.features = ['Pure functions', 'Type safety', 'Performance'];
        baseRequirements.responsive = false;
        baseRequirements.styling = undefined;
        break;
    }

    return this.generateComponentPrompt(baseRequirements);
  }
}

export const promptGenerator = new PromptGenerator();
