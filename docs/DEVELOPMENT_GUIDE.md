# Development Guide

This guide outlines the development practices, tools, and workflows for the SwipeHire application.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Component Development](#component-development)
- [Testing Strategy](#testing-strategy)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   └── layout/            # Layout components
├── hooks/                 # Custom React hooks
├── services/              # API services and business logic
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── contracts/             # Interface definitions
├── contexts/              # React contexts
├── providers/             # React providers
└── lib/                   # Library configurations
```

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd swipehire-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev                 # Start development server with Turbopack
npm run build              # Build for production
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint:biome         # Run Biome linting
npm run lint:biome:fix     # Fix Biome issues
npm run format             # Format code with Biome
npm run format:check       # Check code formatting
npm run check              # Run all Biome checks
npm run check:fix          # Fix all Biome issues
npm run typecheck          # TypeScript type checking

# Testing
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:a11y          # Run accessibility tests
npm run test:performance   # Run performance tests

# Component Generation
npm run taskmaster:component  # Generate new component
npm run taskmaster:page      # Generate new page
npm run taskmaster:hook      # Generate new hook
npm run taskmaster:service   # Generate new service

# Performance
npm run lighthouse         # Run Lighthouse audit
npm run lighthouse:ci      # Run Lighthouse in CI mode
```

## Code Standards

### TypeScript Configuration

We use strict TypeScript configuration with enhanced type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "useUnknownInCatchVariables": true
  }
}
```

### Biome Configuration

We use Biome for code formatting and linting:

- **Formatting**: 2 spaces, semicolons, single quotes
- **Linting**: Strict rules for TypeScript and React
- **Import Organization**: Automatic import sorting
- **Pre-commit Hooks**: Automatic formatting and linting

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserData.ts`)
- **Services**: PascalCase with `Service` suffix (`UserService.ts`)
- **Types**: PascalCase (`UserData`, `ApiResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`)
- **Files**: kebab-case for non-component files (`user-utils.ts`)

## Component Development

### Component Structure

```tsx
'use client';

import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the Component
 */
export interface ComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: ReactNode;
  /** Component variant */
  variant?: 'default' | 'primary' | 'secondary';
  /** Disabled state */
  disabled?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * Component description
 * 
 * @example
 * ```tsx
 * <Component variant="primary">
 *   Content here
 * </Component>
 * ```
 */
export const Component: FC<ComponentProps> = ({
  className,
  children,
  variant = 'default',
  disabled = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'primary' && 'primary-classes',
        disabled && 'disabled-classes',
        className
      )}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
};

export default Component;
```

### Component Generation

Use the PowerShell script to generate components:

```powershell
# Basic component
.\scripts\generate-component.ps1 -ComponentName "UserCard"

# Component with tests and stories
.\scripts\generate-component.ps1 -ComponentName "UserCard" -WithTests -WithStories

# Component with hook and service
.\scripts\generate-component.ps1 -ComponentName "UserCard" -WithHook -WithService

# Custom directory
.\scripts\generate-component.ps1 -ComponentName "UserCard" -Directory "src/components/user"
```

### DaisyUI Integration

We use DaisyUI for rapid component development:

```tsx
// Use DaisyUI classes
<button className="btn btn-primary btn-lg">
  Primary Button
</button>

// Combine with custom Tailwind classes
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Card Title</h2>
    <p>Card content</p>
  </div>
</div>
```

### Responsive Design

Use Tailwind's responsive variants:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

<button className="btn btn-sm md:btn-md lg:btn-lg">
  Responsive Button
</button>
```

## Testing Strategy

### Test Structure

```
src/
├── components/
│   └── UserCard/
│       ├── UserCard.tsx
│       ├── UserCard.test.tsx
│       └── UserCard.stories.tsx
├── hooks/
│   └── useUserData/
│       ├── useUserData.ts
│       └── useUserData.test.ts
└── services/
    └── UserService/
        ├── UserService.ts
        └── UserService.test.ts
```

### Testing Guidelines

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Use jest-axe for a11y testing
4. **Performance Tests**: Test rendering performance
5. **E2E Tests**: Test complete user workflows

### Test Examples

```tsx
// Component Test
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(<UserCard user={user} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledWith(user);
  });
});
```

```tsx
// Hook Test
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import useUserData from './useUserData';

describe('useUserData', () => {
  it('fetches user data correctly', async () => {
    const { result } = renderHook(() => useUserData('user-id'));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      // Wait for data to load
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeDefined();
  });
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<UserCard user={mockUser} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Optimization

### Next.js Optimization

1. **Image Optimization**: Use `next/image` for optimized images
2. **Dynamic Imports**: Use dynamic imports for code splitting
3. **Static Generation**: Use ISR for dynamic content
4. **Bundle Analysis**: Analyze bundle size regularly

### React Optimization

1. **Memoization**: Use `React.memo`, `useMemo`, `useCallback`
2. **Lazy Loading**: Use `React.lazy` for component lazy loading
3. **Virtual Scrolling**: For large lists
4. **Error Boundaries**: Implement error boundaries

### Tailwind Optimization

1. **Purge Unused CSS**: Configure purge in production
2. **JIT Mode**: Use Just-In-Time compilation
3. **Custom Utilities**: Create reusable utility classes

## Deployment

### Build Process

```bash
# Production build
npm run build

# Type checking
npm run typecheck

# Run tests
npm run test

# Lighthouse audit
npm run lighthouse:ci
```

### Environment Variables

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-dev-key

# Production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-prod-key
```

### CI/CD Pipeline

1. **Code Quality**: Biome checks, TypeScript compilation
2. **Testing**: Unit tests, integration tests, accessibility tests
3. **Performance**: Lighthouse audits
4. **Security**: Dependency scanning
5. **Deployment**: Automated deployment to staging/production

## Best Practices

### Code Organization

1. **Single Responsibility**: Each component/function has one purpose
2. **Composition over Inheritance**: Use composition patterns
3. **Explicit Dependencies**: Clearly define dependencies
4. **Error Handling**: Implement comprehensive error handling

### Performance

1. **Minimize Re-renders**: Use React optimization techniques
2. **Optimize Images**: Use Next.js image optimization
3. **Code Splitting**: Split code at route and component level
4. **Caching**: Implement appropriate caching strategies

### Accessibility

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Provide appropriate ARIA attributes
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Screen Reader Support**: Test with screen readers

### Security

1. **Input Validation**: Validate all user inputs
2. **XSS Prevention**: Sanitize user content
3. **CSRF Protection**: Implement CSRF protection
4. **Dependency Updates**: Keep dependencies updated

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Check strict mode configuration
2. **Build Failures**: Verify all dependencies are installed
3. **Test Failures**: Check test environment setup
4. **Performance Issues**: Use React DevTools Profiler

### Debug Tools

1. **React DevTools**: Component debugging
2. **Next.js DevTools**: Next.js specific debugging
3. **Lighthouse**: Performance auditing
4. **Biome**: Code quality issues

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Follow code standards**
4. **Write tests**
5. **Submit a pull request**

### Pull Request Guidelines

1. **Clear Description**: Describe changes and reasoning
2. **Test Coverage**: Include tests for new features
3. **Documentation**: Update documentation as needed
4. **Code Review**: Address review feedback promptly

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com)
- [Biome Documentation](https://biomejs.dev)
- [Testing Library Documentation](https://testing-library.com)