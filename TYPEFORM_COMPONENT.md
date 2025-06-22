# Typeform-Style Salary Query Component

## Overview

The `TypeformSalaryQuery` component is a modern, animated, step-by-step form interface inspired by Typeform's design philosophy. It provides an engaging user experience for collecting salary query information with smooth transitions, visual feedback, and intuitive navigation.

## Features

### 🎨 Visual Design
- **Gradient Background**: Subtle gradient from slate-900 via blue-900/50 to indigo-900/30
- **Glassmorphism Effects**: Semi-transparent cards with backdrop blur
- **Smooth Animations**: CSS transitions with duration-300 to duration-500
- **Progress Indicator**: Top-mounted progress bar showing completion status
- **Emoji Icons**: Visual indicators for each option to enhance user experience

### 🚀 User Experience
- **Step-by-Step Flow**: One question at a time to reduce cognitive load
- **Keyboard Navigation**: Enter key to proceed, arrow keys for navigation
- **Real-time Validation**: Immediate feedback on input errors
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Visual feedback during form submission

### 🛠️ Technical Features
- **TypeScript**: Fully typed with strict mode enabled
- **React Hooks**: useState, useCallback, useEffect for state management
- **Zod Validation**: Schema-based form validation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Optimized re-renders with useCallback

## Component Structure

### Main Components

1. **TypeformSalaryQuery** - Main form component
2. **ProgressIndicator** - Top progress bar
3. **StepNavigation** - Previous/Next buttons with step counter
4. **InputStep** - Text input step component
5. **SelectStep** - Multiple choice step component

### Form Steps

1. **Job Title** (Input) - Text input for job position
2. **Industry** (Select) - Industry selection with emojis
3. **Region** (Select) - Geographic region selection
4. **Experience** (Select) - Experience level selection
5. **Education** (Select) - Education level selection
6. **Company Size** (Select) - Company size selection

## Usage

### Basic Implementation

```tsx
import { TypeformSalaryQuery } from '@/components/TypeformSalaryQuery';
import type { SalaryQueryFormData } from '@/components/TypeformSalaryQuery';

function MyPage() {
  const handleSubmit = (data: SalaryQueryFormData) => {
    console.log('Form submitted:', data);
    // Process the form data
  };

  return (
    <TypeformSalaryQuery
      onSubmitAction={handleSubmit}
      loading={false}
    />
  );
}
```

### With Initial Data

```tsx
const initialData = {
  jobTitle: 'Software Engineer',
  industry: 'technology'
};

<TypeformSalaryQuery
  onSubmitAction={handleSubmit}
  loading={isLoading}
  initialData={initialData}
  className="custom-class"
/>
```

## Props Interface

```tsx
interface TypeformSalaryQueryProps {
  onSubmitAction: (data: SalaryQueryFormData) => void;
  loading?: boolean;
  initialData?: Partial<SalaryQueryFormData>;
  className?: string;
}
```

## Data Structure

```tsx
interface SalaryQueryFormData {
  jobTitle: string;
  industry: string;
  region: string;
  experience: string;
  education: string;
  companySize: string;
}
```

## Styling Classes

### Key Tailwind Classes Used

- **Background**: `bg-gradient-to-br from-slate-900 via-blue-900/50 to-indigo-900/30`
- **Cards**: `bg-white/10 backdrop-blur-sm border-white/20`
- **Buttons**: `btn btn-primary` with hover effects
- **Inputs**: `input-lg bg-white/10 backdrop-blur-sm`
- **Animations**: `transition-all duration-300 ease-out`

### Responsive Design

- Mobile-first approach with `md:` breakpoints
- Flexible grid layouts: `grid gap-3 md:gap-4`
- Responsive text sizes: `text-3xl md:text-4xl`
- Adaptive spacing: `p-4 md:p-6`

## Animation Details

### Transitions
- **Step Changes**: 500ms ease-out with opacity and transform
- **Button Hovers**: 200ms duration for smooth interactions
- **Progress Bar**: 500ms ease-out for progress updates
- **Input Focus**: 300ms transition for border and background

### Transform Effects
- **Step Entry**: `translate-y-0` from `translate-y-8`
- **Button Hover**: `scale-[1.02]` with shadow effects
- **Loading States**: Built-in DaisyUI loading animations

## Accessibility Features

### ARIA Support
- `aria-describedby` for error messages
- `aria-invalid` for validation states
- `aria-label` for navigation buttons
- Proper heading hierarchy

### Keyboard Navigation
- Enter key to proceed to next step
- Tab navigation through interactive elements
- Focus management on step changes
- Escape key support (can be added)

### Screen Reader Support
- Semantic HTML structure
- Descriptive labels and help text
- Error message announcements
- Progress indication

## Performance Optimizations

### React Optimizations
- `useCallback` for event handlers to prevent unnecessary re-renders
- `useState` with functional updates for better performance
- Conditional rendering to avoid mounting unused components

### CSS Optimizations
- Hardware-accelerated transforms
- Efficient transition properties
- Minimal DOM manipulation
- Optimized class combinations

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: CSS Grid, Flexbox, CSS Transforms, Backdrop Filter

## Testing

### Unit Tests
```bash
npm test TypeformSalaryQuery
```

### Integration Tests
```bash
npm run test:integration
```

### Accessibility Tests
```bash
npm run test:a11y
```

## Demo Pages

1. **Standalone Demo**: `/typeform-demo` - Pure form experience
2. **Integration Demo**: `/salary-data-integration` - Full workflow with results

## Customization

### Theme Customization
Modify the gradient and color scheme in the component:

```tsx
// Change background gradient
className="bg-gradient-to-br from-purple-900 via-pink-900/50 to-red-900/30"

// Customize card backgrounds
className="bg-white/20 backdrop-blur-md border-white/30"
```

### Step Customization
Add or modify steps in the `FORM_STEPS` array:

```tsx
const CUSTOM_STEP: FormStep = {
  id: 'customField',
  title: 'Custom Question?',
  subtitle: 'Additional context for the question',
  type: 'select',
  options: [
    { value: 'option1', label: 'Option 1', emoji: '🎯' }
  ],
  validation: (value: string) => (!value ? 'Required' : null)
};
```

## Best Practices

### Form Design
1. Keep questions concise and clear
2. Use emojis sparingly but effectively
3. Provide helpful subtitle context
4. Validate inputs in real-time
5. Show progress clearly

### Performance
1. Use React.memo for expensive components
2. Implement proper error boundaries
3. Optimize images and assets
4. Use code splitting for large forms

### Accessibility
1. Test with screen readers
2. Ensure keyboard navigation works
3. Provide clear error messages
4. Use semantic HTML elements

## Future Enhancements

### Planned Features
- [ ] Multi-language support (i18n)
- [ ] Custom validation rules
- [ ] Conditional step logic
- [ ] File upload steps
- [ ] Integration with form libraries
- [ ] Advanced animations
- [ ] Voice input support
- [ ] Auto-save functionality

### Performance Improvements
- [ ] Virtual scrolling for long option lists
- [ ] Lazy loading of step components
- [ ] Optimized bundle splitting
- [ ] Service worker caching

## Contributing

When contributing to this component:

1. Follow TypeScript strict mode
2. Add proper JSDoc comments
3. Include unit tests for new features
4. Test accessibility compliance
5. Update this documentation
6. Follow the existing code style

## License

This component is part of the SwipeHire application and follows the project's licensing terms.