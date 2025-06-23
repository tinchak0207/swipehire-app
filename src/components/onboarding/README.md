# Interactive Onboarding Wizard

A comprehensive, multi-step onboarding wizard for SwipeHire that provides personalized setup experiences for both job seekers and recruiters.

## Features

### 🎯 Core Functionality
- **Multi-step flow** with 5 progressive steps
- **Conditional branching** based on user type (candidate/company)
- **Progress saving** using UserPreferencesContext
- **Skip functionality** with option to complete later
- **Responsive design** optimized for all devices
- **Accessibility features** with proper ARIA labels and keyboard navigation

### 📋 Wizard Steps

#### 1. Welcome & Role Selection
- Explains wizard purpose and benefits
- User type selection (job seeker vs recruiter)
- Sets initial preferences and expectations

#### 2. Profile Setup
- **For Job Seekers**: Career questionnaire integration, professional headline, experience summary, skills, work preferences
- **For Recruiters**: Company information, industry details, hiring needs, culture highlights
- **AI Integration**: Optional career questionnaire for enhanced profile building

#### 3. Preferences Configuration
- **Theme Selection**: Light, dark, or system preference
- **Notification Channels**: Email, SMS, in-app notifications
- **Subscription Management**: Granular control over notification types
- **Privacy Settings**: Transparent data usage preferences

#### 4. Goal Setting
- **Short-term Goals**: 3-6 month objectives
- **Mid-term Goals**: 6-12 month targets
- **Long-term Goals**: 1+ year aspirations
- **Skill Development**: Learning and growth objectives
- **Career Dashboard Integration**: Goals sync with tracking system

#### 5. Completion
- **Success Celebration**: Confetti animation on completion
- **Setup Summary**: Profile completeness and goals overview
- **Next Steps Guide**: Clear direction for immediate actions
- **Pro Tips**: Optimization suggestions for better results

## Technical Implementation

### 🏗️ Architecture

```
src/components/onboarding/
├── WizardContainer.tsx          # Main wizard orchestrator
├── ProgressIndicator.tsx        # Progress visualization
├── OnboardingWrapper.tsx        # App integration component
├── steps/
│   ├── WelcomeStep.tsx         # Step 1: Welcome & role selection
│   ├── ProfileSetupStep.tsx    # Step 2: Profile configuration
│   ├── PreferencesStep.tsx     # Step 3: Preferences setup
│   ├── GoalSettingStep.tsx     # Step 4: Goal definition
│   └── CompletionStep.tsx      # Step 5: Success & next steps
├── index.ts                    # Component exports
└── README.md                   # Documentation
```

### 🔧 Key Components

#### WizardContainer
- **State Management**: Centralized wizard data handling
- **Progress Persistence**: Automatic saving to backend
- **Step Navigation**: Forward/backward flow control
- **Error Handling**: Graceful failure recovery

#### ProgressIndicator
- **Visual Progress**: Step-by-step completion tracking
- **Responsive Design**: Desktop and mobile optimized
- **Accessibility**: Screen reader compatible

#### Individual Steps
- **Modular Design**: Self-contained step components
- **Validation Logic**: Input validation and requirements
- **Dynamic Content**: Role-based content adaptation
- **User Experience**: Intuitive interfaces with helpful guidance

### 🎨 UI/UX Design

#### DaisyUI Integration
- **Consistent Styling**: Leverages DaisyUI component library
- **Theme Support**: Respects user theme preferences
- **Responsive Components**: Mobile-first design approach
- **Accessibility**: Built-in accessibility features

#### Visual Elements
- **Progress Indicators**: Clear completion status
- **Interactive Cards**: Engaging selection interfaces
- **Animations**: Smooth transitions and confetti celebration
- **Icons**: Meaningful visual cues throughout

### 🔌 Integration Points

#### UserPreferencesContext
- **State Persistence**: Wizard data saved to user preferences
- **Real-time Updates**: Immediate context synchronization
- **Backend Integration**: Automatic API calls for data persistence

#### Career Components
- **CareerQuestionnaire**: Integrated AI-powered assessment
- **CareerDashboard**: Goal tracking and progress monitoring
- **Profile Management**: Seamless profile data integration

## Usage

### Basic Implementation

```tsx
import { WizardContainer } from '@/components/onboarding';

function App() {
  const handleComplete = () => {
    // Handle wizard completion
    router.push('/');
  };

  const handleSkip = () => {
    // Handle wizard skip
    router.push('/?onboarding=skipped');
  };

  return (
    <WizardContainer 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
```

### App Integration

```tsx
import { OnboardingWrapper } from '@/components/onboarding';

function AppLayout({ children }) {
  return (
    <OnboardingWrapper>
      {children}
    </OnboardingWrapper>
  );
}
```

### Hook Usage

```tsx
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

function Dashboard() {
  const { shouldShowWizard, isLoading } = useOnboardingWizard();

  if (shouldShowWizard) {
    return <OnboardingPrompt />;
  }

  return <DashboardContent />;
}
```

## Data Flow

### Wizard Data Structure
```typescript
interface WizardData {
  userType: UserRole | null;
  profileData: {
    // Job seeker fields
    headline?: string;
    experienceSummary?: string;
    skills?: string[];
    // ... other profile fields
    
    // Company fields
    companyName?: string;
    companyIndustry?: string;
    // ... other company fields
  };
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notificationChannels?: NotificationChannels;
    notificationSubscriptions?: NotificationSubscriptions;
  };
  goals: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
    skillDevelopment: string[];
  };
}
```

### Backend Integration
- **User Updates**: Automatic profile synchronization
- **Progress Tracking**: Wizard completion status
- **Preference Storage**: Notification and theme settings
- **Goal Management**: Career objective persistence

## Customization

### Theme Customization
The wizard respects DaisyUI theme configurations and can be customized through:
- CSS custom properties
- DaisyUI theme variables
- Component-level styling overrides

### Content Customization
- **Step Content**: Modify step-specific content and validation
- **Role-based Logic**: Customize flows for different user types
- **Integration Points**: Add custom components or external services

### Behavior Customization
- **Validation Rules**: Adjust step completion requirements
- **Navigation Logic**: Modify step flow and branching
- **Persistence Strategy**: Customize data saving behavior

## Performance Considerations

### Optimization Features
- **Lazy Loading**: Steps loaded on demand
- **Debounced Saves**: Efficient progress persistence
- **Memoized Components**: Optimized re-rendering
- **Progressive Enhancement**: Core functionality without JavaScript

### Bundle Size
- **Tree Shaking**: Only used components included
- **Code Splitting**: Step-based code separation
- **Asset Optimization**: Optimized images and animations

## Accessibility

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Meets WCAG AA standards
- **Focus Management**: Logical focus flow

### Inclusive Design
- **Multiple Input Methods**: Touch, mouse, and keyboard support
- **Flexible Timing**: No time-based restrictions
- **Clear Instructions**: Helpful guidance throughout
- **Error Prevention**: Validation and confirmation patterns

## Testing

### Component Testing
```bash
# Run component tests
npm test src/components/onboarding

# Run specific step tests
npm test src/components/onboarding/steps
```

### Integration Testing
```bash
# Test wizard flow
npm test src/components/onboarding/WizardContainer.test.tsx

# Test hook functionality
npm test src/hooks/useOnboardingWizard.test.ts
```

### E2E Testing
```bash
# Full wizard flow testing
npm run test:e2e onboarding
```

## Future Enhancements

### Planned Features
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: User behavior tracking
- **A/B Testing**: Conversion optimization
- **Video Tutorials**: Interactive guidance
- **Social Integration**: Profile import from LinkedIn/GitHub

### Technical Improvements
- **Offline Support**: Progressive Web App features
- **Advanced Animations**: Micro-interactions
- **Voice Navigation**: Accessibility enhancement
- **AI Recommendations**: Personalized suggestions

## Contributing

### Development Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm test`
4. Build for production: `npm run build`

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

## Support

For questions, issues, or contributions:
- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: All changes require peer review