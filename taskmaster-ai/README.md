# Taskmaster AI

AI-powered development assistant that ensures code quality, consistency, and adherence to project guidelines for the SwipeHire application.

## Overview

Taskmaster AI is a comprehensive system that provides:

- **Intelligent Prompt Generation**: Creates detailed prompts for AI-assisted component creation
- **Code Validation**: Validates code against established project rules and best practices
- **CLI Tools**: Command-line interface for easy integration into development workflow
- **Configuration Management**: Centralized configuration for all development rules and guidelines

## Features

### 🎯 Prompt Generation
- Component-specific prompts with detailed requirements
- DaisyUI component suggestions
- Tailwind CSS styling guidelines
- TypeScript type definitions
- Accessibility considerations
- Performance optimization techniques
- Testing requirements

### 🔍 Code Validation
- TypeScript strict mode compliance
- React best practices validation
- Tailwind CSS usage validation
- Next.js pattern validation
- Accessibility compliance checking
- Performance optimization validation

### 🛠️ CLI Tools
- Interactive prompt generation
- Direct command-line usage
- Configuration viewing
- Output file generation

## Installation

Taskmaster AI is already integrated into your SwipeHire project. No additional installation required.

## Usage

### Quick Start

```typescript
import taskmaster from './taskmaster-ai';

// Generate a component prompt
const prompt = taskmaster.generateComponentPrompt(
  'UserProfile',
  'A reusable user profile component with avatar and details'
);

// Validate code
const validation = taskmaster.validateCode(code, filePath, 'UserProfile');
console.log(taskmaster.generateValidationReport(code, filePath, 'UserProfile'));
```

### CLI Usage

```powershell
# Interactive mode
npx tsx taskmaster-ai/cli/taskmaster.ts --interactive

# Direct mode
npx tsx taskmaster-ai/cli/taskmaster.ts -t component -n Button -d "Reusable button component"

# With features
npx tsx taskmaster-ai/cli/taskmaster.ts -t page -n Dashboard -d "User dashboard" -f "charts,filters,export"

# Save to file
npx tsx taskmaster-ai/cli/taskmaster.ts -t component -n Modal -d "Modal dialog" -o prompt.md

# View configuration
npx tsx taskmaster-ai/cli/taskmaster.ts --config
```

### Advanced Usage

```typescript
import { 
  promptGenerator, 
  codeValidator, 
  ComponentRequirements 
} from './taskmaster-ai';

// Custom component requirements
const requirements: ComponentRequirements = {
  name: 'DataTable',
  type: 'component',
  description: 'Advanced data table with sorting and filtering',
  features: ['sorting', 'filtering', 'pagination', 'export'],
  styling: 'daisyui',
  responsive: true,
  accessibility: true,
  testing: true,
  stateManagement: 'useReducer',
  apiIntegration: true,
  animations: true
};

const prompt = promptGenerator.generateComponentPrompt(requirements);

// Detailed validation
const validation = codeValidator.validateCode(code, filePath, 'DataTable');
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
  console.log('Validation warnings:', validation.warnings);
  console.log('Score:', validation.score);
}
```

## Configuration

The system is configured through `taskmaster.config.ts` with the following sections:

### TypeScript Rules
- Strict mode enforcement
- Explicit typing requirements
- Advanced TypeScript features usage
- Project structure guidelines

### Next.js Rules
- Dynamic routing patterns
- Data fetching strategies
- Performance optimizations
- Image optimization

### Styling Rules
- TailwindCSS utility-first approach
- DaisyUI component usage
- Responsive design requirements
- Design token consistency

### Development Rules
- Code review processes
- Testing requirements
- Commit conventions
- Biome integration

## Project Structure

```
taskmaster-ai/
├── config/
│   └── taskmaster.config.ts     # Main configuration
├── generators/
│   └── PromptGenerator.ts       # Prompt generation logic
├── validators/
│   └── CodeValidator.ts         # Code validation logic
├── cli/
│   └── taskmaster.ts           # CLI interface
├── index.ts                    # Main entry point
└── README.md                   # This file
```

## Component Creation Guidelines

When creating components, Taskmaster AI ensures:

### Reusability and Modularity
- Single responsibility principle
- Composable component APIs
- Flexible prop interfaces

### TypeScript Best Practices
- Strict typing with no `any` usage
- Explicit function signatures
- Advanced TypeScript features
- Comprehensive interfaces

### Styling Standards
- TailwindCSS utility classes
- DaisyUI component integration
- Responsive design patterns
- Consistent design tokens

### Accessibility Compliance
- WCAG 2.1 guidelines
- Screen reader support
- Keyboard navigation
- Proper ARIA attributes

### Performance Optimization
- React.memo usage
- Proper key props
- useCallback/useMemo optimization
- Bundle size considerations

### Testing Requirements
- Unit test coverage
- Integration testing
- Accessibility testing
- Error scenario testing

## Examples

### Generate Component Prompt

```powershell
npx tsx taskmaster-ai/cli/taskmaster.ts -t component -n SearchBar -d "Search input with autocomplete"
```

This generates a comprehensive prompt including:
- DaisyUI input component suggestions
- TypeScript interface definitions
- Accessibility requirements
- Testing specifications
- Performance considerations

### Validate Component Code

```typescript
import { validateCode, generateValidationReport } from './taskmaster-ai';

const code = `
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
  // Component implementation
};
`;

const report = generateValidationReport(code, 'components/SearchBar.tsx', 'SearchBar');
console.log(report);
```

## Integration with Development Workflow

### Pre-commit Hooks
Integrate validation into your git hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx tsx taskmaster-ai/cli/validate-staged.ts"
    }
  }
}
```

### CI/CD Pipeline
Add validation to your GitHub Actions:

```yaml
- name: Validate Code Quality
  run: npx tsx taskmaster-ai/cli/validate-all.ts
```

### IDE Integration
Use the validation API in your editor extensions for real-time feedback.

## Best Practices

1. **Always generate prompts before creating new components**
2. **Validate code before committing**
3. **Use interactive mode for complex components**
4. **Review validation reports regularly**
5. **Keep configuration updated with project evolution**

## Troubleshooting

### Common Issues

**Q: CLI command not found**
A: Make sure you're running from the project root and using `npx tsx`

**Q: Validation false positives**
A: Check the configuration in `taskmaster.config.ts` and adjust rules as needed

**Q: Prompt too generic**
A: Use more specific features and requirements in your component definition

## Contributing

When extending Taskmaster AI:

1. Follow the existing code patterns
2. Add comprehensive TypeScript types
3. Include validation rules for new features
4. Update documentation
5. Add tests for new functionality

## License

Part of the SwipeHire project. Internal use only.