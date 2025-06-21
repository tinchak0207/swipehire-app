# Career AI Components

This directory contains AI-powered career development components for SwipeHire.

## Components

### CareerDashboard

A comprehensive career management dashboard that provides personalized career insights, goal tracking, and progress monitoring.

#### Features

- **Career Stage Detection**: Automatically identifies user's current career stage (exploration, early, mid, late, transition)
- **AI-Powered Career Paths**: Displays personalized career recommendations with growth potential and salary ranges
- **Goal Management**: Set, track, and manage short-term, mid-term, and long-term career goals
- **Progress Tracking**: Visual progress indicators for goals and skill development
- **Responsive Design**: Optimized for desktop and mobile devices using DaisyUI components

#### Props

```typescript
interface CareerDashboardProps {
  userData: {
    education: string
    experience: string[]
    skills: string[]
    interests: string[]
    values: string[]
    careerExpectations: string
  }
}
```

#### Usage

```tsx
import CareerDashboard from '@/components/career-ai/CareerDashboard'

const userData = {
  education: 'Bachelor in Computer Science',
  experience: ['Software Engineer at TechCorp', 'Junior Developer at StartupXYZ'],
  skills: ['JavaScript', 'React', 'Node.js'],
  interests: ['Web Development', 'AI/ML'],
  values: ['Innovation', 'Work-life balance'],
  careerExpectations: 'Senior Software Engineer'
}

function MyPage() {
  return <CareerDashboard userData={userData} />
}
```

#### Tabs

1. **Career Paths**: Displays AI-recommended career paths with:
   - Job titles and descriptions
   - Required skills as badges
   - Growth potential (1-10 scale)
   - Salary ranges
   - Education requirements

2. **Goals**: Goal management interface with:
   - Add goals by type (short/mid/long term)
   - Mark goals as completed
   - Delete goals
   - Goal categorization with color coding

3. **Progress**: Progress tracking dashboard with:
   - Goal completion statistics
   - Skills development recommendations
   - Career stage progression visualization

#### Career Stages

- **Exploration** 🔍: Discovering interests and potential career paths
- **Early Career** 🌱: Building foundational skills and gaining experience
- **Mid Career** 🚀: Developing expertise and taking on leadership roles
- **Late Career** 👑: Senior leadership and mentoring others
- **Career Transition** 🔄: Changing career paths or industries

#### Error Handling

- Loading states with spinners
- Error alerts for API failures
- Graceful fallbacks for invalid data
- Empty states with helpful guidance

#### Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- High contrast color schemes
- Focus management

#### Testing

Comprehensive test suite covering:
- Component rendering
- API integration
- User interactions
- Error scenarios
- State management
- Accessibility features

Run tests with:
```bash
npm test CareerDashboard
```

### CareerQuestionnaire

An AI-powered questionnaire component for comprehensive career assessment.

#### Features

- Multi-step questionnaire flow
- Dynamic question branching
- Progress tracking
- Data validation
- Integration with CareerDashboard

#### Usage

```tsx
import CareerQuestionnaire from '@/components/career-ai/CareerQuestionnaire'

function OnboardingPage() {
  const handleSubmit = (data) => {
    // Process questionnaire data
    console.log('Career assessment data:', data)
  }

  return <CareerQuestionnaire onSubmit={handleSubmit} />
}
```

## API Integration

### Career Service

The components integrate with the career service for AI-powered recommendations:

```typescript
import { getCareerRecommendations } from '@/services/careerService'

// Convert user data to API format
const candidateProfile: CandidateProfileForAI = {
  id: 'user-id',
  role: userData.careerExpectations,
  experienceSummary: userData.experience.join('\n'),
  skills: userData.skills,
  // ... other fields
}

// Get recommendations
const recommendations = await getCareerRecommendations(candidateProfile)
```

### Data Flow

1. User data is converted to `CandidateProfileForAI` format
2. API call to `getCareerRecommendations` service
3. Response is processed and validated
4. Career stage is safely assigned with fallbacks
5. Career paths are converted to display format
6. UI is updated with new data

## Styling

### DaisyUI Components Used

- `card`: Content containers
- `tabs`: Navigation tabs
- `badge`: Skill tags and labels
- `btn`: Interactive buttons
- `checkbox`: Goal completion toggles
- `progress`: Progress bars
- `alert`: Error and info messages
- `loading`: Loading spinners
- `steps`: Career stage progression

### Color Scheme

- **Primary**: Main actions and current states
- **Success**: Completed items and positive metrics
- **Warning**: Mid-term goals and cautions
- **Error**: Errors and delete actions
- **Info**: Information and exploration stage
- **Secondary**: Transitions and secondary actions

### Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Collapsible navigation
- Touch-friendly interactions
- Optimized typography scaling

## Performance Optimizations

### Code Splitting

Components are lazy-loaded to reduce initial bundle size:

```typescript
const CareerDashboard = lazy(() => import('./CareerDashboard'))
```

### Memoization

Expensive calculations are memoized:

```typescript
const careerStageInfo = useMemo(() => getCareerStageInfo(careerStage), [careerStage])
```

### Debounced Updates

API calls are debounced to prevent excessive requests:

```typescript
const debouncedSave = useCallback(
  debounce((data) => saveCareerData(data), 500),
  []
)
```

## Future Enhancements

### Planned Features

- **AI Chat Assistant**: Interactive career guidance
- **Skill Gap Analysis**: Detailed skill assessment
- **Learning Recommendations**: Personalized course suggestions
- **Mentor Matching**: Connect with industry mentors
- **Career Timeline**: Visual career progression tracking
- **Industry Insights**: Market trends and opportunities

### Technical Improvements

- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: PWA capabilities for offline access
- **Advanced Analytics**: Detailed progress metrics
- **Export Features**: PDF reports and data export
- **Integration APIs**: Third-party service connections

## Contributing

### Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm test`
4. Build for production: `npm run build`

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Jest**: Unit and integration testing
- **Testing Library**: Component testing

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

## Support

For questions or issues:
- Check component documentation
- Review test files for usage examples
- Create GitHub issues for bugs
- Use discussions for questions