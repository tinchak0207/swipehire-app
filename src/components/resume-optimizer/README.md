# Target Job Input Form Component

A comprehensive React component for collecting target job information in the resume optimization workflow. Built with TypeScript, DaisyUI, and accessibility best practices.

## Features

- ✅ **Real-time validation** with comprehensive error messages
- ✅ **Keywords parsing** with visual badge display (comma-separated)
- ✅ **Accessibility support** with proper ARIA attributes and labels
- ✅ **Loading states** with disabled inputs during processing
- ✅ **Form summary** showing entered information
- ✅ **Responsive design** using DaisyUI components
- ✅ **TypeScript support** with strict typing
- ✅ **Custom validation** support for advanced use cases
- ✅ **Comprehensive testing** with Jest and React Testing Library

## Installation

The component is part of the SwipeHire app and uses the following dependencies:

```bash
npm install @heroicons/react
```

## Basic Usage

```tsx
import TargetJobInputForm, { useTargetJobForm } from '@/components/resume-optimizer/TargetJobInputForm';

function MyComponent() {
  const { formData, isValid, handleChange } = useTargetJobForm();

  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
    // Process the form data
  };

  return (
    <TargetJobInputForm
      initialData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      showSubmitButton
      validateOnChange
    />
  );
}
```

## Advanced Usage

```tsx
import TargetJobInputForm from '@/components/resume-optimizer/TargetJobInputForm';
import type { TargetJobFormData, ValidationResult } from '@/components/resume-optimizer/TargetJobInputForm';

function AdvancedComponent() {
  const [isLoading, setIsLoading] = useState(false);

  // Custom validation function
  const customValidation = (data: TargetJobFormData): ValidationResult => {
    const errors: Record<string, string> = {};
    
    if (data.title && !data.title.toLowerCase().includes('senior')) {
      errors.title = 'Title must include "Senior" for this role';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const handleSubmit = async (data: TargetJobFormData) => {
    setIsLoading(true);
    try {
      await submitToAPI(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TargetJobInputForm
      initialData={{
        title: 'Senior Software Engineer',
        keywords: 'React, TypeScript, Node.js',
        company: 'Tech Startup',
      }}
      onChange={(data, isValid) => {
        console.log('Form changed:', { data, isValid });
      }}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      showSubmitButton
      submitButtonText="Analyze Resume"
      validateOnChange
      customValidation={customValidation}
      className="max-w-2xl mx-auto"
    />
  );
}
```

## Props

### TargetJobInputFormProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | `Partial<TargetJobFormData>` | `{}` | Initial form data to populate fields |
| `onChange` | `(data: TargetJobFormData, isValid: boolean) => void` | - | Callback when form data changes |
| `onSubmit` | `(data: TargetJobFormData) => void` | - | Callback when form is submitted |
| `isLoading` | `boolean` | `false` | Whether the form is in loading state |
| `showSubmitButton` | `boolean` | `false` | Whether to show the submit button |
| `submitButtonText` | `string` | `'Continue'` | Text for the submit button |
| `className` | `string` | `''` | Additional CSS classes |
| `validateOnChange` | `boolean` | `true` | Whether to validate on every change |
| `customValidation` | `(data: TargetJobFormData) => ValidationResult` | - | Custom validation function |

### TargetJobFormData

```tsx
interface TargetJobFormData {
  title: string;           // Required: Target job title
  keywords: string;        // Optional: Comma-separated skills/keywords
  company?: string;        // Optional: Target company name
  description?: string;    // Optional: Job description
}
```

### ValidationResult

```tsx
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

## Hook: useTargetJobForm

A custom hook for managing target job form state:

```tsx
const {
  formData,              // Current form data
  isValid,               // Whether form is valid
  handleChange,          // Function to handle form changes
  reset,                 // Function to reset form
  convertToTargetJobInfo // Convert to TargetJobInfo type
} = useTargetJobForm(initialData);
```

### Hook Methods

- **`handleChange(data, isValid)`**: Updates form data and validation state
- **`reset(newData?)`**: Resets form to initial state or provided data
- **`convertToTargetJobInfo()`**: Converts form data to `TargetJobInfo` type

## Validation Rules

### Job Title (Required)
- Must not be empty
- Minimum 2 characters
- Maximum 100 characters

### Keywords (Optional)
- If provided, minimum 3 characters
- Maximum 500 characters
- Automatically parsed and displayed as badges

### Company (Optional)
- Maximum 100 characters

### Description (Optional)
- Maximum 1000 characters
- Character count displayed

## Accessibility Features

- **Proper labeling**: All form fields have associated labels using `htmlFor`
- **ARIA attributes**: Error messages are properly associated with inputs
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Descriptive labels and error messages
- **Focus management**: Visual focus indicators and focus trapping

## Styling

The component uses DaisyUI classes and can be customized with:

- **Theme colors**: Primary, secondary, accent, error, success, info
- **Component classes**: `input`, `textarea`, `btn`, `badge`, `alert`
- **Custom styling**: Pass additional classes via `className` prop

### Custom Styling Example

```tsx
<TargetJobInputForm
  className="[&_.input]:bg-blue-50 [&_.textarea]:bg-blue-50 [&_.badge]:badge-primary"
  // ... other props
/>
```

## Testing

The component includes comprehensive tests covering:

- **Rendering**: All form fields render correctly
- **Validation**: Error states and validation messages
- **User interaction**: Form input and submission
- **Accessibility**: ARIA attributes and keyboard navigation
- **Keywords parsing**: Badge display and parsing logic
- **Loading states**: Disabled inputs during loading

### Running Tests

```bash
npm test -- --testPathPattern="TargetJobInputForm.test.tsx"
```

## Integration with Resume Optimizer

The component is designed to integrate seamlessly with the resume optimizer workflow:

```tsx
// In resume optimizer page
const { formData, isValid, handleChange, convertToTargetJobInfo } = useTargetJobForm();

const handleAnalyze = async () => {
  if (!isValid) return;
  
  const targetJob = convertToTargetJobInfo();
  
  // Store for analysis
  sessionStorage.setItem('resumeOptimizerData', JSON.stringify({
    resumeText: selectedTemplate.content,
    targetJob,
    source: 'template',
  }));
  
  router.push('/resume-optimizer/analyze');
};
```

## Storybook

The component includes Storybook stories for development and documentation:

```bash
npm run storybook
```

Stories include:
- Default state
- With initial data
- Loading state
- Validation errors
- Different job types (tech, business, creative)
- Custom validation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When contributing to this component:

1. **Follow TypeScript strict mode** - No `any` types
2. **Add tests** for new features
3. **Update Storybook** stories
4. **Maintain accessibility** standards
5. **Follow DaisyUI** design patterns
6. **Document** new props and features

## License

Part of the SwipeHire application. See main project license.