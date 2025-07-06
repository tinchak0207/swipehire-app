/**
 * Taskmaster AI Prompt Generator
 *
 * This module generates comprehensive prompts for AI-assisted component creation
 * following the established rules and guidelines.
 */

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
    return `## Component Analysis\n\n**Component Name:** ${requirements.name}\n**Type:** ${requirements.type}\n**Description:** ${requirements.description}\n\n**Required Features:**\n${requirements.features.map((feature) => `- ${feature}`).join('\n')}\n\n**Dependencies:** ${requirements.dependencies?.join(', ') || 'None specified'}\n\nAnalyze the component requirements thoroughly and ensure all specified features are implemented with proper TypeScript typing and error handling.`;
  }

  private generateDaisyUISection(requirements: ComponentRequirements): string {
    if (requirements.styling !== 'daisyui' && requirements.styling !== undefined) {
      return '';
    }

    return `## DaisyUI Component Suggestions\n\nUse the following DaisyUI components where appropriate:\n- **Layout:** container, divider, drawer, footer, hero, indicator, join, mask, stack\n- **Navigation:** breadcrumbs, bottom-navigation, link, menu, navbar, pagination, steps, tab\n- **Data Display:** accordion, avatar, badge, card, carousel, chat, collapse, countdown, diff, kbd, stat, table, timeline\n- **Data Input:** checkbox, file-input, radio, range, rating, select, text-input, textarea, toggle\n- **Actions:** button, dropdown, modal, swap\n- **Feedback:** alert, loading, progress, radial-progress, skeleton, toast, tooltip\n\nCustomize DaisyUI components only when absolutely necessary. Prefer using built-in variants and modifiers.`;
  }

  private generateTailwindSection(_requirements: ComponentRequirements): string {
    return `## Tailwind CSS Styling Requirements\n\n**Utility Classes:**\n- Use TailwindCSS utility classes exclusively\n- Avoid custom CSS unless absolutely necessary\n- Maintain consistent class order: layout → spacing → sizing → colors → typography → effects\n\n**Responsive Design:**\n- Implement mobile-first responsive design\n- Use Tailwind's responsive variants (sm:, md:, lg:, xl:, 2xl:)\n- Ensure proper breakpoint handling\n\n**Design Tokens:**\n- Use design tokens defined in tailwind.config.js\n- Maintain consistent spacing, colors, and typography scales\n- Follow the project's design system`;
  }

  private generateTypeScriptSection(_requirements: ComponentRequirements): string {
    return `## TypeScript Requirements\n\n**Strict Typing:**\n- Enable strict TypeScript mode\n- Avoid \'any\' type, prefer \'unknown\' with runtime checks\n- Explicitly type all function inputs and outputs\n- Use advanced TypeScript features (type guards, mapped types, conditional types)\n\n**Interface Design:**\n- Create comprehensive interfaces for all props\n- Use \'interface\' for extendable object shapes\n- Use \'type\' for unions, intersections, and primitive compositions\n- Implement proper prop validation\n\n**Type Safety:**\n- Validate and sanitize all inputs\n- Use discriminated unions for complex state management\n- Document complex types with JSDoc comments`;
  }

  private generateResponsiveSection(requirements: ComponentRequirements): string {
    if (!requirements.responsive) return '';

    return `## Responsive Design Instructions\n\n**Breakpoint Strategy:**\n- Mobile-first approach (min-width breakpoints)\n- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px\n\n**Layout Considerations:**\n- Flexible grid systems using CSS Grid or Flexbox\n- Responsive typography scaling\n- Touch-friendly interactive elements (min 44px touch targets)\n- Proper spacing adjustments across breakpoints\n\n**Testing Requirements:**\n- Test on multiple device sizes\n- Verify touch interactions on mobile devices\n- Ensure proper content reflow`;
  }

  private generateNextJSSection(_requirements: ComponentRequirements): string {
    return `## Next.js Integration\n\n**Routing:**\n- Use dynamic routes with bracket notation ([id].tsx) when applicable\n- Validate and sanitize route parameters\n- Prefer flat, descriptive route structures\n\n**Data Fetching:**\n- Use getServerSideProps for dynamic data\n- Use getStaticProps\/getStaticPaths for static content\n- Implement Incremental Static Regeneration (ISR) where appropriate\n\n**Performance:**\n- Use next\/image for optimized images\n- Configure image layout, priority, sizes, and srcSet attributes\n- Implement proper loading states and error boundaries`;
  }

  private generateStateManagementSection(requirements: ComponentRequirements): string {
    if (!requirements.stateManagement) return '';

    const stateGuidance = {
      useState: 'Use useState for simple local state management',
      useReducer: 'Use useReducer for complex state logic with multiple sub-values',
      context: 'Use React Context for state that needs to be shared across multiple components',
      external: 'Integrate with external state management libraries as needed',
    };

    return `## State Management\n\n**Recommended Approach:** ${stateGuidance[requirements.stateManagement]}\n\n**Implementation Guidelines:**\n- Separate concerns: presentational components vs. business logic\n- Use custom hooks for reusable state logic\n- Implement proper error boundaries\n- Handle loading and error states appropriately`;
  }

  private generateAccessibilitySection(requirements: ComponentRequirements): string {
    if (!requirements.accessibility) return '';

    return `## Accessibility Considerations\n\n**WCAG 2.1 Compliance:**\n- Ensure proper semantic HTML structure\n- Implement ARIA labels and roles where necessary\n- Maintain proper color contrast ratios (4.5:1 for normal text, 3:1 for large text)\n- Support keyboard navigation\n\n**Screen Reader Support:**\n- Use descriptive alt text for images\n- Implement proper heading hierarchy (h1-h6)\n- Provide skip links for navigation\n- Use live regions for dynamic content updates\n\n**Interactive Elements:**\n- Ensure all interactive elements are keyboard accessible\n- Provide clear focus indicators\n- Implement proper tab order`;
  }

  private generateIconsAssetsSection(_requirements: ComponentRequirements): string {
    return `## Icons and Assets\n\n**Icon Library:**\n- Use Lucide React icons (already installed)\n- Ensure consistent icon sizing and styling\n- Implement proper accessibility attributes for decorative vs. informative icons\n\n**Asset Optimization:**\n- Use next\/image for all images\n- Implement proper lazy loading\n- Provide appropriate alt text and captions\n- Consider WebP format for better compression`;
  }

  private generateErrorHandlingSection(_requirements: ComponentRequirements): string {
    return `## Error Handling and Loading States\n\n**Error Boundaries:**\n- Implement React Error Boundaries for component-level error handling\n- Provide meaningful error messages to users\n- Log errors appropriately for debugging\n\n**Loading States:**\n- Show loading indicators for async operations\n- Use skeleton screens for better perceived performance\n- Implement timeout handling for long-running operations\n\n**Validation:**\n- Validate all user inputs\n- Provide clear validation error messages\n- Use Zod for runtime type validation where appropriate`;
  }

  private generateAnimationsSection(requirements: ComponentRequirements): string {
    if (!requirements.animations) return '';

    return `## Animations and Transitions\n\n**Animation Library:**\n- Use tailwindcss-animate for CSS-based animations\n- Consider Framer Motion for complex animations\n- Implement AOS (Animate On Scroll) for scroll-triggered animations\n\n**Performance Considerations:**\n- Use CSS transforms and opacity for smooth animations\n- Avoid animating layout properties\n- Respect user\'s motion preferences (prefers-reduced-motion)\n\n**Accessibility:**\n- Provide options to disable animations\n- Ensure animations don\'t cause seizures or vestibular disorders`;
  }

  private generateAPIIntegrationSection(requirements: ComponentRequirements): string {
    if (!requirements.apiIntegration) return '';

    return `## API Integration and Data Fetching\n\n**Data Fetching Strategy:**\n- Use React Query (@tanstack\/react-query) for server state management\n- Implement proper caching strategies\n- Handle loading, error, and success states\n\n**Error Handling:**\n- Implement retry logic for failed requests\n- Provide meaningful error messages\n- Use proper HTTP status code handling\n\n**Type Safety:**\n- Define TypeScript interfaces for API responses\n- Validate API responses at runtime\n- Use proper error typing`;
  }

  private generatePerformanceSection(_requirements: ComponentRequirements): string {
    return `## Performance Optimization\n\n**React Optimization:**\n- Use React.memo for expensive components\n- Implement proper key props for lists\n- Use useCallback and useMemo judiciously\n- Avoid unnecessary re-renders\n\n**Bundle Optimization:**\n- Use dynamic imports for code splitting\n- Implement proper tree shaking\n- Minimize bundle size with proper imports\n\n**Runtime Performance:**\n- Optimize expensive calculations\n- Use Web Workers for heavy computations\n- Implement proper virtualization for large lists`;
  }

  private generateTestingSection(requirements: ComponentRequirements): string {
    if (!requirements.testing) return '';

    return `## Testing Requirements\n\n**Unit Testing:**\n- Use Jest and React Testing Library\n- Test component behavior, not implementation details\n- Achieve meaningful test coverage, not just high percentages\n\n**Integration Testing:**\n- Test component interactions\n- Mock external dependencies appropriately\n- Test error scenarios and edge cases\n\n**Accessibility Testing:**\n- Use jest-axe for automated accessibility testing\n- Test keyboard navigation\n- Verify screen reader compatibility`;
  }

  private generateDocumentationSection(_requirements: ComponentRequirements): string {
    return `## Documentation Requirements\n\n**Component Documentation:**\n- Document all props with JSDoc comments\n- Provide usage examples\n- Document any complex logic or algorithms\n\n**README Updates:**\n- Update component documentation\n- Include installation and usage instructions\n- Document any breaking changes\n\n**Type Documentation:**\n- Document complex TypeScript types\n- Provide examples of proper usage\n- Explain any non-obvious type constraints`;
  }

  private generateGeneralGuidelinesSection(): string {
    return `## General Component Creation Guidelines\n\n**Reusability and Modularity:**\n- Design components for maximum reusability\n- Follow single responsibility principle\n- Create composable component APIs\n\n**Naming Conventions:**\n- Use PascalCase for component names\n- Use camelCase for props and functions\n- Use descriptive, self-documenting names\n\n**React Best Practices:**\n- Follow React patterns and conventions\n- Implement proper prop validation\n- Use functional components with hooks\n\n**Internationalization:**\n- Consider i18n requirements from the start\n- Use proper text externalization\n- Support RTL languages where applicable\n\n**SEO Optimization:**\n- Use proper semantic HTML\n- Implement structured data where appropriate\n- Ensure proper meta tags and descriptions\n\n**Browser Compatibility:**\n- Test across different browsers and devices\n- Use appropriate polyfills when necessary\n- Follow progressive enhancement principles`;
  }

  private generateProjectStructureSection(): string {
    return `## Project Structure Guidelines\n\n**File Organization:**\n- components\/ - Reusable UI components\n- pages\/ - Next.js pages and route handlers\n- hooks\/ - Custom React hooks\n- utils\/ - Utility functions and helpers\n- styles\/ - Global styles and theme configuration\n- contracts\/ - TypeScript interfaces and types\n- services\/ - API services and external integrations\n\n**Component Structure:**\n- Each component in its own directory\n- Include component file, types, tests, and stories\n- Use index.ts for clean imports\n\n**Import Organization:**\n- External libraries first\n- Internal imports second\n- Relative imports last\n- Use absolute imports where possible`;
  }

  private generateBiomeSection(): string {
    return `## Biome Configuration\n\n**Code Quality:**\n- Use Biome for code formatting and linting\n- Follow Biome\'s recommended rules\n- Configure as pre-commit hook\n\n**Import Organization:**\n- Use Biome\'s organize imports feature\n- Maintain clean import statements\n- Remove unused imports automatically\n\n**CI\/CD Integration:**\n- Include Biome checks in CI pipeline\n- Address all warnings and errors\n- Keep Biome updated to latest stable version`;
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
        baseRequirements.styling = 'custom';
        break;
      case 'service':
        baseRequirements.features = ['API integration', 'Error handling', 'Type safety'];
        baseRequirements.responsive = false;
        baseRequirements.styling = 'custom';
        baseRequirements.apiIntegration = true;
        break;
      case 'utility':
        baseRequirements.features = ['Pure functions', 'Type safety', 'Performance'];
        baseRequirements.responsive = false;
        baseRequirements.styling = 'custom';
        break;
    }

    return this.generateComponentPrompt(baseRequirements);
  }
}

export const promptGenerator = new PromptGenerator();
