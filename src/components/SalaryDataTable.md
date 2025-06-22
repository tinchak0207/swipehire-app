# SalaryDataTable Component

A comprehensive, accessible data table component for displaying salary information with advanced sorting, filtering, and pagination capabilities.

## Features

- **Sortable Columns**: Click column headers to sort data in ascending/descending order
- **Advanced Filtering**: Filter by job title, industry, region, experience level, education, company size, and salary range
- **Pagination**: Handle large datasets efficiently with configurable page sizes
- **Statistics Summary**: Display key statistics like median, mean, min, max, and percentiles
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Accessibility**: Full WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Loading States**: Built-in loading and error state handling
- **Row Interactions**: Optional row click handlers for detailed views
- **Data Formatting**: Automatic currency, date, and text formatting
- **Verification Status**: Visual indicators for verified vs unverified data

## Installation

The component is part of the SwipeHire application and uses the following dependencies:

```bash
npm install react @types/react
```

## Basic Usage

```tsx
import { SalaryDataTable } from '@/components/SalaryDataTable';
import type { SalaryDataPoint, SalaryStatistics } from '@/services/salaryDataService';

const MyComponent = () => {
  const salaryData: SalaryDataPoint[] = [
    // Your salary data
  ];

  const statistics: SalaryStatistics = {
    // Your statistics data
  };

  return (
    <SalaryDataTable
      data={salaryData}
      statistics={statistics}
    />
  );
};
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `SalaryDataPoint[]` | Array of salary data points to display |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `statistics` | `SalaryStatistics` | `undefined` | Statistics summary to display above the table |
| `loading` | `boolean` | `false` | Shows loading state when true |
| `error` | `string \| null` | `null` | Error message to display |
| `className` | `string` | `''` | Additional CSS classes for the container |
| `showStatistics` | `boolean` | `true` | Whether to show the statistics summary |
| `enableFiltering` | `boolean` | `true` | Whether to enable the filter bar |
| `enableSorting` | `boolean` | `true` | Whether to enable column sorting |
| `pageSize` | `number` | `50` | Number of rows per page |
| `onRowClick` | `(dataPoint: SalaryDataPoint) => void` | `undefined` | Callback when a row is clicked |
| `emptyStateMessage` | `string` | `'No salary data available'` | Message shown when no data is available |

## Data Types

### SalaryDataPoint

```typescript
interface SalaryDataPoint {
  id: string;
  jobTitle: string;
  industry: string;
  region: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  education: 'high_school' | 'bachelor' | 'master' | 'phd';
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
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

## Advanced Usage

### With Custom Configuration

```tsx
<SalaryDataTable
  data={salaryData}
  statistics={statistics}
  loading={isLoading}
  error={errorMessage}
  showStatistics={true}
  enableFiltering={true}
  enableSorting={true}
  pageSize={25}
  onRowClick={(dataPoint) => {
    console.log('Clicked row:', dataPoint);
    // Navigate to detail view or show modal
  }}
  className="my-custom-table"
  emptyStateMessage="No salary data matches your criteria"
/>
```

### With React Query Integration

```tsx
import { useSalaryQuery } from '@/hooks/useSalaryQuery';

const SalaryTableWithQuery = () => {
  const { data, statistics, isLoading, error } = useSalaryQuery({
    jobTitle: 'Software Engineer',
    region: 'San Francisco',
  });

  return (
    <SalaryDataTable
      data={data?.data || []}
      statistics={statistics}
      loading={isLoading}
      error={error?.message}
    />
  );
};
```

## Styling

The component uses DaisyUI classes and can be customized with Tailwind CSS:

```tsx
<SalaryDataTable
  data={salaryData}
  className="shadow-2xl border-2 border-primary"
/>
```

### Custom CSS Classes

You can override default styles by targeting these classes:

- `.table` - Main table element
- `.table-zebra` - Zebra striping
- `.table-pin-rows` - Sticky header
- `.card` - Container card
- `.stat` - Statistics items

## Accessibility

The component is fully accessible and includes:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Logical tab order and focus indicators
- **Screen Reader Support**: Descriptive text and status announcements
- **High Contrast**: Compatible with high contrast modes
- **Semantic HTML**: Proper table structure with headers and cells

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between interactive elements |
| `Enter` / `Space` | Activate buttons and sortable headers |
| `Arrow Keys` | Navigate table cells (when focused) |
| `Escape` | Clear focus from interactive elements |

## Performance

The component is optimized for performance:

- **Virtualization**: Only renders visible rows when paginated
- **Memoization**: Uses React.memo and useMemo for expensive calculations
- **Efficient Filtering**: Client-side filtering with optimized algorithms
- **Lazy Loading**: Supports lazy loading of large datasets

### Performance Tips

1. Use pagination for datasets larger than 100 rows
2. Implement server-side filtering for very large datasets
3. Consider virtualization for tables with many columns
4. Use React.memo for parent components that don't change frequently

## Testing

The component includes comprehensive tests:

```bash
# Run tests
npm test SalaryDataTable

# Run with coverage
npm test SalaryDataTable -- --coverage

# Run accessibility tests
npm test SalaryDataTable -- --testNamePattern="accessibility"
```

### Test Coverage

- ✅ Rendering with different props
- ✅ Sorting functionality
- ✅ Filtering functionality
- ✅ Pagination
- ✅ Row interactions
- ✅ Loading and error states
- ✅ Accessibility compliance
- ✅ Performance with large datasets
- ✅ Edge cases and error handling

## Examples

### Basic Table

```tsx
<SalaryDataTable data={salaryData} />
```

### Table with Statistics

```tsx
<SalaryDataTable
  data={salaryData}
  statistics={statistics}
  showStatistics={true}
/>
```

### Read-only Table

```tsx
<SalaryDataTable
  data={salaryData}
  enableFiltering={false}
  enableSorting={false}
/>
```

### Interactive Table

```tsx
<SalaryDataTable
  data={salaryData}
  onRowClick={(row) => navigate(`/salary/${row.id}`)}
  pageSize={20}
/>
```

## Common Patterns

### Loading State Management

```tsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await salaryService.getData();
    setData(result.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

return (
  <SalaryDataTable
    data={data}
    loading={loading}
    error={error}
  />
);
```

### Filter Integration

```tsx
const [filters, setFilters] = useState({});
const filteredData = useMemo(() => 
  data.filter(item => matchesFilters(item, filters)),
  [data, filters]
);

return (
  <SalaryDataTable
    data={filteredData}
    enableFiltering={true}
  />
);
```

## Troubleshooting

### Common Issues

1. **Table not rendering**: Check that `data` prop is an array
2. **Sorting not working**: Ensure `enableSorting` is true and data has sortable fields
3. **Filters not applying**: Verify filter values match data field values exactly
4. **Performance issues**: Consider reducing `pageSize` or implementing server-side pagination
5. **Accessibility warnings**: Ensure all interactive elements have proper ARIA labels

### Debug Mode

Enable debug logging:

```tsx
// Add to your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('SalaryDataTable data:', data);
    console.log('SalaryDataTable statistics:', statistics);
  }
}, [data, statistics]);
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When contributing to this component:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test with screen readers
6. Verify performance with large datasets

## Changelog

### v1.0.0
- Initial release with core functionality
- Sorting, filtering, and pagination
- Accessibility compliance
- Comprehensive test suite
- Documentation and examples