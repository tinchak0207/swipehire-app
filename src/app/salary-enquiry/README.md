# Market Salary Enquiry Page

## Overview

The Market Salary Enquiry Page is a comprehensive salary research tool that allows users to search, analyze, and visualize compensation data across different industries, roles, and regions. This implementation fulfills Task #9 requirements by integrating the `SalaryQueryForm`, `SalaryVisualizationChart`, and `SalaryDataTable` components with the `useSalaryQuery` hook.

## Features

### 🔍 Advanced Search Capabilities
- **Job Title Search**: Find salaries for specific roles
- **Industry Filtering**: Filter by technology, finance, healthcare, etc.
- **Geographic Filtering**: Search by region or location
- **Experience Level**: Filter by entry, mid, senior, or executive levels
- **Education Requirements**: Filter by education level
- **Company Size**: Filter by startup to enterprise companies

### 📊 Data Visualization
- **Multiple Chart Types**: Bar, line, area, pie, and composed charts
- **Interactive Charts**: Hover tooltips and responsive design
- **Statistics Summary**: Median, mean, percentiles, and distribution data
- **Real-time Chart Type Switching**: Dynamic visualization updates

### 📋 Detailed Data Analysis
- **Comprehensive Data Table**: Sortable and filterable salary data
- **Advanced Filtering**: Client-side filtering with multiple criteria
- **Pagination**: Efficient data loading and navigation
- **Export Capabilities**: Data export functionality (future enhancement)

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **DaisyUI Components**: Consistent design system
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: Comprehensive error boundaries and retry mechanisms
- **Accessibility**: WCAG compliant with proper ARIA labels

## Technical Implementation

### Architecture
```
/salary-enquiry/
├── page.tsx          # Main page component
├── layout.tsx        # Layout with metadata and SEO
├── loading.tsx       # Loading skeleton UI
├── error.tsx         # Error boundary component
└── README.md         # This documentation
```

### Key Components Integration

#### SalaryQueryForm
- Handles user input for search criteria
- Form validation with Zod schema
- Converts form data to API query format
- Loading states during search

#### SalaryVisualizationChart
- Displays salary data in multiple chart formats
- Interactive chart type switching
- Statistics summary display
- Responsive design with proper tooltips

#### SalaryDataTable
- Tabular display of detailed salary data
- Advanced filtering and sorting
- Pagination for large datasets
- Row click handlers for detailed views

#### useSalaryQuery Hook
- React Query integration for data fetching
- Caching and background updates
- Error handling and retry logic
- Loading state management

### Data Flow
1. User submits search form
2. Form data converted to `SalaryQueryCriteria`
3. `useSalaryQuery` hook fetches data from API
4. Data displayed in chart and table components
5. User can interact with visualizations and filters

### State Management
- **Search Criteria**: Managed at page level
- **Pagination**: Controlled pagination state
- **Chart Type**: User preference for visualization
- **Loading States**: Comprehensive loading indicators
- **Error States**: Error boundaries with recovery options

## API Integration

### Salary Data Service
The page integrates with the `salaryDataService` which provides:
- Salary data querying with criteria
- Statistics calculation
- Trending data analysis
- Data contribution capabilities

### Query Parameters
- `jobTitle`: String search for job titles
- `industry`: Industry category filter
- `region`: Geographic location filter
- `experienceLevel`: Career level (entry|mid|senior|executive)
- `education`: Education requirement (high_school|bachelor|master|phd)
- `companySize`: Company size (startup|small|medium|large|enterprise)

## SEO and Performance

### Metadata
- Comprehensive meta tags for search engines
- Open Graph tags for social sharing
- Twitter Card integration
- JSON-LD structured data

### Performance Optimizations
- React Query caching
- Lazy loading of chart components
- Optimized re-renders with useMemo and useCallback
- Efficient pagination

### Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## Error Handling

### Error Boundaries
- Page-level error boundary with recovery options
- Component-level error states
- Network error handling with retry logic
- Validation error display

### Fallback Data
- Mock data for development and testing
- Graceful degradation when API is unavailable
- User-friendly error messages

## Testing Strategy

### Unit Tests
- Component rendering tests
- Hook functionality tests
- Utility function tests
- Form validation tests

### Integration Tests
- API integration tests
- Component interaction tests
- Data flow tests
- Error scenario tests

### E2E Tests
- Complete user journey tests
- Cross-browser compatibility
- Mobile responsiveness tests
- Performance benchmarks

## Future Enhancements

### Planned Features
- **Data Export**: CSV/PDF export functionality
- **Saved Searches**: User search history and favorites
- **Salary Alerts**: Notifications for new data
- **Comparison Tool**: Side-by-side salary comparisons
- **Trend Analysis**: Historical salary trend charts
- **Location Maps**: Geographic salary visualization

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Advanced Filtering**: More granular filter options
- **Data Visualization**: Additional chart types
- **Performance**: Virtual scrolling for large datasets
- **Offline Support**: PWA capabilities

## Dependencies

### Core Dependencies
- Next.js 15.3.3 (App Router)
- React 18+ with TypeScript
- Tailwind CSS + DaisyUI
- React Query (@tanstack/react-query)
- Recharts for data visualization
- Zod for validation

### Development Dependencies
- TypeScript for type safety
- Biome for linting and formatting
- Jest for unit testing
- Playwright for E2E testing

## Usage Examples

### Basic Search
```typescript
// Search for software engineer salaries
const criteria = {
  jobTitle: 'Software Engineer',
  industry: 'technology',
  region: 'north-america',
  experienceLevel: 'mid'
};
```

### Advanced Filtering
```typescript
// Complex search with multiple criteria
const criteria = {
  jobTitle: 'Product Manager',
  industry: 'technology',
  region: 'europe',
  experienceLevel: 'senior',
  education: 'master',
  companySize: 'large'
};
```

## Contributing

When contributing to this page:
1. Follow the established TypeScript patterns
2. Maintain accessibility standards
3. Add appropriate tests for new features
4. Update documentation for changes
5. Follow the existing code style with Biome

## Support

For issues or questions about the salary enquiry page:
- Check the error boundary for troubleshooting tips
- Review the browser console for detailed error messages
- Contact the development team with error IDs for faster resolution