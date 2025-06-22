# SalaryVisualizationChart Component

## Overview

The `SalaryVisualizationChart` component is a comprehensive, interactive data visualization component built with Recharts that displays salary data in multiple chart formats. It provides rich interactivity, accessibility features, and responsive design for displaying salary statistics and trends.

## Features

- **Multiple Chart Types**: Bar, Line, Area, Pie, and Composed charts
- **Interactive Chart Type Switching**: Users can switch between different visualization types
- **Statistics Summary**: Displays key salary statistics (median, mean, percentiles, etc.)
- **Responsive Design**: Adapts to different screen sizes and containers
- **Accessibility**: Full WCAG 2.1 AA compliance with proper ARIA labels and keyboard navigation
- **Loading and Error States**: Graceful handling of loading and error conditions
- **Currency Formatting**: Proper internationalization support for different currencies
- **Metadata Display**: Shows data source, timestamp, and other relevant information
- **Custom Styling**: Supports custom color schemes and CSS classes
- **Performance Optimized**: Efficient rendering with large datasets

## Installation

The component requires the following dependencies:

```bash
npm install recharts date-fns
```

## Basic Usage

```tsx
import { SalaryVisualizationChart } from '@/components/SalaryVisualizationChart';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';

const salaryData: SalaryDataPoint[] = [
  {
    id: '1',
    jobTitle: 'Software Engineer',
    industry: 'Technology',
    region: 'San Francisco, CA',
    experienceLevel: 'mid',
    education: 'bachelor',
    companySize: 'large',
    baseSalary: 130000,
    totalCompensation: 180000,
    bonus: 20000,
    equity: 30000,
    benefits: ['Health Insurance', '401k', 'Stock Options'],
    currency: 'USD',
    timestamp: '2024-01-15T10:00:00Z',
    source: 'company-survey',
    verified: true,
  },
  // ... more data points
];

const statistics: SalaryStatistics = {
  count: 100,
  median: 150000,
  mean: 155000,
  min: 80000,
  max: 300000,
  percentile25: 120000,
  percentile75: 200000,
  percentile90: 250000,
  standardDeviation: 45000,
  currency: 'USD',
  lastUpdated: '2024-01-17T12:00:00Z',
};

function SalaryDashboard() {
  return (
    <SalaryVisualizationChart
      data={salaryData}
      statistics={statistics}
      title="Software Engineer Salaries"
      chartType="bar"
      height={400}
      showMetadata={true}
    />
  );
}
```

## Advanced Usage

```tsx
import { useState } from 'react';
import { SalaryVisualizationChart } from '@/components/SalaryVisualizationChart';
import type { ChartType } from '@/components/SalaryVisualizationChart';

function AdvancedSalaryChart() {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [loading, setLoading] = useState(false);

  const handleChartTypeChange = (newType: ChartType) => {
    setLoading(true);
    setChartType(newType);
    
    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <SalaryVisualizationChart
      data={salaryData}
      statistics={statistics}
      chartType={chartType}
      title="Interactive Salary Analysis"
      height={500}
      loading={loading}
      showMetadata={true}
      showTooltips={true}
      showLegend={true}
      currency="USD"
      colorScheme={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
      onChartTypeChange={handleChartTypeChange}
      className="my-custom-chart"
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `SalaryDataPoint[]` | Array of salary data points to visualize |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `statistics` | `SalaryStatistics` | `undefined` | Salary statistics for summary display |
| `chartType` | `ChartType` | `'bar'` | Type of chart to display |
| `title` | `string` | `'Salary Visualization'` | Chart title |
| `height` | `number` | `400` | Chart height in pixels |
| `showMetadata` | `boolean` | `true` | Whether to show data source and timestamp |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string` | `undefined` | Error message to display |
| `colorScheme` | `string[]` | Default colors | Custom color palette |
| `showTooltips` | `boolean` | `true` | Whether to show interactive tooltips |
| `showLegend` | `boolean` | `true` | Whether to show chart legend |
| `currency` | `string` | `'USD'` | Currency code for formatting |
| `onChartTypeChange` | `(chartType: ChartType) => void` | `undefined` | Callback when chart type changes |
| `className` | `string` | `''` | Additional CSS classes |

### Chart Types

The component supports the following chart types:

- `'bar'`: Bar chart showing base salary and total compensation
- `'line'`: Line chart showing salary trends
- `'area'`: Area chart with stacked salary components
- `'pie'`: Pie chart grouped by experience level
- `'composed'`: Combined bar and line chart

## Data Types

### SalaryDataPoint

```typescript
interface SalaryDataPoint {
  id: string;
  jobTitle: string;
  industry: string;
  region: string;
  experienceLevel: string;
  education: string;
  companySize: string;
  baseSalary: number;
  totalCompensation: number;
  bonus?: number;
  equity?: number;
  benefits?: string[];
  currency: string;
  timestamp: string;
  source: string;
  verified: boolean;
}
```

### SalaryStatistics

```typescript
interface SalaryStatistics {
  count: number;
  median: number;
  mean: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
  standardDeviation: number;
  currency: string;
  lastUpdated: string;
}
```

## Accessibility Features

The component implements comprehensive accessibility features:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Color Contrast**: High contrast colors meeting WCAG AA standards
- **Focus Management**: Proper focus indicators and management
- **Screen Reader Support**: Descriptive text for chart content
- **Semantic HTML**: Proper use of semantic elements and roles

### ARIA Attributes

- `role="img"` on chart container with descriptive `aria-label`
- `aria-label` on all interactive buttons
- `aria-describedby` for form associations
- `aria-invalid` for error states

## Responsive Design

The component is fully responsive and adapts to different screen sizes:

- **Mobile**: Stacked layout with simplified chart types
- **Tablet**: Optimized spacing and font sizes
- **Desktop**: Full feature set with optimal layout

### Breakpoints

- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up

## Performance Considerations

- **Memoization**: Uses React.useMemo for expensive calculations
- **Lazy Loading**: Chart components are loaded on demand
- **Virtualization**: Efficient rendering for large datasets
- **Debounced Updates**: Prevents excessive re-renders during interactions

## Styling and Theming

The component uses DaisyUI classes and supports custom styling:

### CSS Classes Used

- `card`, `card-body`, `card-title` - Card layout
- `btn`, `btn-primary`, `btn-outline` - Buttons
- `stat`, `stat-title`, `stat-value` - Statistics display
- `alert`, `alert-error` - Error states
- `loading`, `loading-spinner` - Loading states

### Custom Styling

```tsx
<SalaryVisualizationChart
  className="shadow-2xl border-2 border-primary"
  colorScheme={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']}
  // ... other props
/>
```

## Error Handling

The component gracefully handles various error conditions:

- **Network Errors**: Shows user-friendly error messages
- **Data Validation**: Handles malformed or missing data
- **Rendering Errors**: Fallback UI for chart rendering issues
- **Loading States**: Smooth transitions between states

## Testing

The component includes comprehensive tests:

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interactions
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Large dataset handling
- **Visual Regression Tests**: UI consistency

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test SalaryVisualizationChart.test.tsx

# Run accessibility tests
npm run test:a11y

# Run with coverage
npm run test:coverage
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Screen readers (NVDA, JAWS, VoiceOver)

## Migration Guide

### From v1.x to v2.x

```tsx
// Old API
<SalaryChart 
  salaryData={data} 
  type="bar" 
/>

// New API
<SalaryVisualizationChart 
  data={data} 
  chartType="bar" 
/>
```

## Contributing

When contributing to this component:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure accessibility compliance
5. Test with real data scenarios

## Related Components

- `SalaryQueryForm` - Form for querying salary data
- `SalaryDataTable` - Tabular display of salary data
- `ReportDownloadButton` - Export functionality

## Examples

### Basic Bar Chart

```tsx
<SalaryVisualizationChart
  data={salaryData}
  chartType="bar"
  title="Salary Comparison"
/>
```

### Interactive Dashboard

```tsx
<SalaryVisualizationChart
  data={salaryData}
  statistics={statistics}
  chartType="composed"
  title="Comprehensive Salary Analysis"
  height={600}
  showMetadata={true}
  onChartTypeChange={(type) => console.log('Chart type changed:', type)}
/>
```

### Custom Styled Chart

```tsx
<SalaryVisualizationChart
  data={salaryData}
  colorScheme={['#FF6B6B', '#4ECDC4', '#45B7D1']}
  className="border-2 border-primary rounded-xl"
  currency="EUR"
/>
```

## Troubleshooting

### Common Issues

1. **Chart not rendering**: Ensure Recharts is properly installed
2. **Data not displaying**: Check data format matches SalaryDataPoint interface
3. **Accessibility warnings**: Verify all interactive elements have proper labels
4. **Performance issues**: Consider data pagination for large datasets

### Debug Mode

Enable debug logging:

```tsx
<SalaryVisualizationChart
  data={salaryData}
  // Add debug prop in development
  {...(process.env.NODE_ENV === 'development' && { debug: true })}
/>
```