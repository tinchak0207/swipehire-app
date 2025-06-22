import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MarketSalaryEnquiryPage from '../page';

// Mock the components
jest.mock('@/components/SalaryQueryForm', () => ({
  SalaryQueryForm: ({ onSubmitAction, loading }: any) => (
    <div data-testid="salary-query-form">
      <button
        onClick={() =>
          onSubmitAction({
            jobTitle: 'Software Engineer',
            industry: 'technology',
            region: 'north-america',
            experience: 'mid-level',
            education: 'bachelor',
            companySize: 'large',
          })
        }
        disabled={loading}
      >
        Search Salaries
      </button>
    </div>
  ),
}));

jest.mock('@/components/SalaryVisualizationChart', () => ({
  SalaryVisualizationChart: ({ data, loading, error }: any) => (
    <div data-testid="salary-visualization-chart">
      {loading && <div>Loading chart...</div>}
      {error && <div>Chart error: {error}</div>}
      {data && data.length > 0 && <div>Chart with {data.length} data points</div>}
    </div>
  ),
}));

jest.mock('@/components/SalaryDataTable', () => ({
  SalaryDataTable: ({ data, loading, error }: any) => (
    <div data-testid="salary-data-table">
      {loading && <div>Loading table...</div>}
      {error && <div>Table error: {error}</div>}
      {data && data.length > 0 && <div>Table with {data.length} rows</div>}
    </div>
  ),
}));

// Mock the hook
jest.mock('@/hooks/useSalaryQuery', () => ({
  useSalaryQuery: jest.fn(() => ({
    data: undefined,
    salaryData: [],
    statistics: undefined,
    metadata: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('MarketSalaryEnquiryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    expect(screen.getByText('Market Salary Enquiry')).toBeInTheDocument();
    expect(screen.getByText(/Discover competitive salary ranges/)).toBeInTheDocument();
  });

  it('renders the salary query form', () => {
    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    expect(screen.getByTestId('salary-query-form')).toBeInTheDocument();
    expect(screen.getByText('Search Salaries')).toBeInTheDocument();
  });

  it('shows getting started section when no search has been performed', () => {
    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('1. Search')).toBeInTheDocument();
    expect(screen.getByText('2. Analyze')).toBeInTheDocument();
    expect(screen.getByText('3. Decide')).toBeInTheDocument();
  });

  it('shows features section', () => {
    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    expect(screen.getByText('Why Use Our Salary Data?')).toBeInTheDocument();
    expect(screen.getByText('Verified Data')).toBeInTheDocument();
    expect(screen.getByText('Global Coverage')).toBeInTheDocument();
    expect(screen.getByText('Detailed Analytics')).toBeInTheDocument();
    expect(screen.getByText('Privacy First')).toBeInTheDocument();
  });

  it('handles form submission and shows results', async () => {
    const mockUseSalaryQuery = require('@/hooks/useSalaryQuery').useSalaryQuery;

    // Mock the hook to return data after form submission
    mockUseSalaryQuery.mockReturnValue({
      data: {
        data: [
          {
            id: '1',
            jobTitle: 'Software Engineer',
            industry: 'Technology',
            region: 'North America',
            baseSalary: 120000,
            totalCompensation: 150000,
          },
        ],
        statistics: {
          count: 1,
          median: 120000,
          mean: 120000,
          currency: 'USD',
        },
        metadata: {
          totalCount: 1,
          page: 1,
          pageSize: 20,
          hasMore: false,
        },
      },
      salaryData: [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          industry: 'Technology',
          region: 'North America',
          baseSalary: 120000,
          totalCompensation: 150000,
        },
      ],
      statistics: {
        count: 1,
        median: 120000,
        mean: 120000,
        currency: 'USD',
      },
      metadata: {
        totalCount: 1,
        page: 1,
        pageSize: 20,
        hasMore: false,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    // Click the search button
    fireEvent.click(screen.getByText('Search Salaries'));

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText(/Search Results for:/)).toBeInTheDocument();
    });

    // Check that components are rendered with data
    expect(screen.getByTestId('salary-visualization-chart')).toBeInTheDocument();
    expect(screen.getByTestId('salary-data-table')).toBeInTheDocument();
  });

  it('shows loading state during search', () => {
    const mockUseSalaryQuery = require('@/hooks/useSalaryQuery').useSalaryQuery;

    mockUseSalaryQuery.mockReturnValue({
      data: undefined,
      salaryData: [],
      statistics: undefined,
      metadata: undefined,
      isLoading: true,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    // Trigger search to show loading state
    fireEvent.click(screen.getByText('Search Salaries'));

    // Should show loading overlay
    expect(screen.getByText('Searching Salary Data')).toBeInTheDocument();
    expect(screen.getByText(/Please wait while we gather/)).toBeInTheDocument();
  });

  it('handles error state correctly', () => {
    const mockUseSalaryQuery = require('@/hooks/useSalaryQuery').useSalaryQuery;

    mockUseSalaryQuery.mockReturnValue({
      data: undefined,
      salaryData: [],
      statistics: undefined,
      metadata: undefined,
      isLoading: false,
      isFetching: false,
      error: new Error('Network error'),
      refetch: jest.fn(),
    });

    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    // Trigger search to show error
    fireEvent.click(screen.getByText('Search Salaries'));

    expect(screen.getByText('Error Loading Salary Data')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('handles retry functionality', () => {
    const mockRefetch = jest.fn();
    const mockUseSalaryQuery = require('@/hooks/useSalaryQuery').useSalaryQuery;

    mockUseSalaryQuery.mockReturnValue({
      data: undefined,
      salaryData: [],
      statistics: undefined,
      metadata: undefined,
      isLoading: false,
      isFetching: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
    });

    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    // Trigger search to show error
    fireEvent.click(screen.getByText('Search Salaries'));

    // Click retry button
    fireEvent.click(screen.getByText('Try Again'));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('converts form data to query criteria correctly', () => {
    const mockUseSalaryQuery = require('@/hooks/useSalaryQuery').useSalaryQuery;

    renderWithQueryClient(<MarketSalaryEnquiryPage />);

    // Click search to trigger form submission
    fireEvent.click(screen.getByText('Search Salaries'));

    // Check that useSalaryQuery was called with correct criteria
    expect(mockUseSalaryQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        jobTitle: 'Software Engineer',
        industry: 'technology',
        region: 'north-america',
        experienceLevel: 'mid',
        education: 'bachelor',
        companySize: 'large',
      }),
      1, // page
      20, // pageSize
      expect.any(Object) // options
    );
  });
});
