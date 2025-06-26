# Taskmaster AI - Quick Start Guide

🤖 **Taskmaster AI** has been successfully initialized in your SwipeHire project! This AI-powered development assistant ensures code quality, consistency, and adherence to your project guidelines.

## 🚀 Quick Commands

### Generate Component Prompts
```powershell
# Interactive mode (recommended for beginners)
npm run taskmaster:interactive

# Direct component creation
npm run taskmaster:component -- -n UserCard -d "User profile card component"

# Page creation
npm run taskmaster:page -- -n Dashboard -d "User dashboard with analytics"

# Hook creation  
npm run taskmaster:hook -- -n useUserData -d "Custom hook for user data management"

# Service creation
npm run taskmaster:service -- -n AuthService -d "Authentication service with Firebase"
```

### View Configuration
```powershell
npm run taskmaster:config
```

### Get Help
```powershell
npm run taskmaster -- --help
```

## 📋 Example Usage

### 1. Create a Button Component
```powershell
npm run taskmaster:component -- -n PrimaryButton -d "Primary action button with loading states" -f "loading,disabled,variants"
```

This generates a comprehensive prompt including:
- DaisyUI button component suggestions
- TypeScript interface definitions
- Accessibility requirements (ARIA labels, keyboard navigation)
- Loading and disabled states
- Responsive design patterns
- Testing specifications

### 2. Create a Dashboard Page
```powershell
npm run taskmaster:page -- -n UserDashboard -d "User dashboard with job matches and analytics" -f "charts,filters,real-time-updates"
```

This generates a prompt with:
- Next.js App Router patterns
- Data fetching strategies
- SEO optimization
- Firebase integration patterns
- Responsive layout guidelines

### 3. Interactive Mode (Best for Complex Components)
```powershell
npm run taskmaster:interactive
```

Follow the guided prompts to specify:
- Component type and name
- Detailed description
- Required features
- Styling preferences
- State management needs

## 🎯 Generated Prompt Structure

Each generated prompt includes:

### 📊 **Component Analysis**
- Requirements breakdown
- Feature specifications
- Dependency analysis

### 🎨 **DaisyUI Integration**
- Recommended components
- Styling patterns
- Customization guidelines

### 🎨 **Tailwind CSS Guidelines**
- Utility-first approach
- Responsive design patterns
- Design token usage

### 📝 **TypeScript Requirements**
- Strict typing rules
- Interface design patterns
- Advanced TypeScript features

### ♿ **Accessibility Standards**
- WCAG 2.1 compliance
- Screen reader support
- Keyboard navigation

### ⚡ **Performance Optimization**
- React optimization patterns
- Bundle size considerations
- Runtime performance

### 🧪 **Testing Requirements**
- Unit testing strategies
- Integration testing
- Accessibility testing

## 🔧 Integration with Your Workflow

### In Your Components
```typescript
import { generateSwipeHireComponentPrompt, validateSwipeHireCode } from '@/lib/taskmaster';

// Generate prompts programmatically
const prompt = generateSwipeHireComponentPrompt(
  'JobCard',
  'Interactive job listing card with swipe actions'
);

// Validate your code
const validation = validateSwipeHireCode(code, filePath, 'JobCard');
```

### Pre-commit Validation
Add to your git hooks for automatic code quality checks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run taskmaster:validate"
    }
  }
}
```

## 📁 Project Structure Integration

Taskmaster AI follows your established project structure:
```
src/
├── components/          # Reusable UI components
├── pages/              # Next.js pages
├─�� hooks/              # Custom React hooks
├── services/           # API services
├── lib/                # Utilities and configurations
└── types/              # TypeScript definitions
```

## 🎨 SwipeHire-Specific Features

Taskmaster AI includes SwipeHire-specific patterns:

### Firebase Integration
- Centralized configuration patterns
- Authentication flows
- Real-time data handling
- Error handling with user feedback

### Job Matching Features
- Swipe interaction patterns
- Card-based layouts
- Real-time updates
- Performance optimization for large datasets

### User Experience
- Toast notifications
- Loading states
- Error boundaries
- Responsive design for mobile-first approach

## 🔍 Code Validation

Validate your code against project standards:
```powershell
# Validate specific file
npx tsx taskmaster-ai/cli/validate.ts src/components/JobCard.tsx

# Generate validation report
npx tsx taskmaster-ai/cli/validate.ts src/components/JobCard.tsx --report
```

## 📚 Advanced Usage

### Custom Component Requirements
```typescript
import { promptGenerator, ComponentRequirements } from './taskmaster-ai';

const requirements: ComponentRequirements = {
  name: 'AdvancedJobFilter',
  type: 'component',
  description: 'Advanced filtering component with multiple criteria',
  features: ['multi-select', 'date-range', 'salary-range', 'location-search'],
  styling: 'daisyui',
  responsive: true,
  accessibility: true,
  testing: true,
  stateManagement: 'useReducer',
  apiIntegration: true,
  animations: true
};

const prompt = promptGenerator.generateComponentPrompt(requirements);
```

### Batch Validation
```typescript
import { codeValidator } from './taskmaster-ai';

const files = ['src/components/JobCard.tsx', 'src/pages/dashboard.tsx'];
files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const result = codeValidator.validateCode(code, file);
  console.log(codeValidator.generateReport(result));
});
```

## 🛠️ Troubleshooting

### Common Issues

**Q: Command not found**
```powershell
# Ensure tsx is installed
npm install tsx --save-dev

# Run setup again
npm run taskmaster:setup
```

**Q: TypeScript errors in generated prompts**
```powershell
# Check TypeScript configuration
npx tsc --noEmit

# Verify taskmaster configuration
npm run taskmaster:config
```

**Q: Validation false positives**
```typescript
// Adjust validation rules in taskmaster-ai/config/taskmaster.config.ts
export const taskmasterConfig = {
  // Modify rules as needed
  typescript: {
    strictMode: true,
    avoidAny: false, // Disable if needed
    // ...
  }
};
```

## 🎉 Next Steps

1. **Try Interactive Mode**: Run `npm run taskmaster:interactive` to create your first component
2. **Explore Examples**: Check `taskmaster-ai/examples.ps1` for more command examples
3. **Read Documentation**: See `taskmaster-ai/README.md` for comprehensive documentation
4. **Integrate with IDE**: Set up validation in your editor for real-time feedback

## 📞 Support

- 📖 Full documentation: `taskmaster-ai/README.md`
- ⚙️ Configuration: `taskmaster-ai/config/taskmaster.config.ts`
- 🔧 CLI help: `npm run taskmaster -- --help`
- 📝 Examples: `taskmaster-ai/examples.ps1`

---

**Happy coding with Taskmaster AI! 🚀**