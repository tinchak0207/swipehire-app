import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import SalaryQueryForm from '../SalaryQueryForm';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('SalaryQueryForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSubmitAction: mockOnSubmit,
    loading: false,
  };

  describe('Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/education level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company size/i)).toBeInTheDocument();
    });

    it('renders form title', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      expect(screen.getByText('Salary Query Form')).toBeInTheDocument();
    });

    it('renders submit and reset buttons', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /search salaries/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('shows required field indicators', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(6); // All fields are required
    });
  });

  describe('Initial Data', () => {
    it('populates form with initial data when provided', () => {
      const initialData = {
        jobTitle: 'Software Engineer',
        industry: 'technology',
        region: 'north-america',
        experience: 'mid-level',
        education: 'bachelor',
        companySize: 'medium',
      };

      render(<SalaryQueryForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Technology')).toBeInTheDocument();
      expect(screen.getByDisplayValue('North America')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mid Level (3-5 years)')).toBeInTheDocument();
      expect(screen.getByDisplayValue("Bachelor's Degree")).toBeInTheDocument();
      expect(screen.getByDisplayValue('Medium (201-1000 employees)')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('updates job title input correctly', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      const jobTitleInput = screen.getByLabelText(/job title/i);
      await user.type(jobTitleInput, 'Product Manager');

      expect(jobTitleInput).toHaveValue('Product Manager');
    });

    it('updates select fields correctly', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      const industrySelect = screen.getByLabelText(/industry/i);
      await user.selectOptions(industrySelect, 'technology');

      expect(industrySelect).toHaveValue('technology');
    });

    it('clears form when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      // Fill some fields
      const jobTitleInput = screen.getByLabelText(/job title/i);
      const industrySelect = screen.getByLabelText(/industry/i);

      await user.type(jobTitleInput, 'Test Job');
      await user.selectOptions(industrySelect, 'technology');

      expect(jobTitleInput).toHaveValue('Test Job');
      expect(industrySelect).toHaveValue('technology');

      // Reset form
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(jobTitleInput).toHaveValue('');
      expect(industrySelect).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Job title is required')).toBeInTheDocument();
        expect(screen.getByText('Industry is required')).toBeInTheDocument();
        expect(screen.getByText('Region is required')).toBeInTheDocument();
        expect(screen.getByText('Experience level is required')).toBeInTheDocument();
        expect(screen.getByText('Education level is required')).toBeInTheDocument();
        expect(screen.getByText('Company size is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates job title length', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      const jobTitleInput = screen.getByLabelText(/job title/i);
      const longTitle = 'a'.repeat(101); // Exceeds 100 character limit

      await user.type(jobTitleInput, longTitle);

      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Job title must be less than 100 characters')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Job title is required')).toBeInTheDocument();
      });

      // Start typing to clear error
      const jobTitleInput = screen.getByLabelText(/job title/i);
      await user.type(jobTitleInput, 'Test');

      await waitFor(() => {
        expect(screen.queryByText('Job title is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      // Fill all required fields
      await user.type(screen.getByLabelText(/job title/i), 'Software Engineer');
      await user.selectOptions(screen.getByLabelText(/industry/i), 'technology');
      await user.selectOptions(screen.getByLabelText(/region/i), 'north-america');
      await user.selectOptions(screen.getByLabelText(/experience level/i), 'mid-level');
      await user.selectOptions(screen.getByLabelText(/education level/i), 'bachelor');
      await user.selectOptions(screen.getByLabelText(/company size/i), 'medium');

      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          jobTitle: 'Software Engineer',
          industry: 'technology',
          region: 'north-america',
          experience: 'mid-level',
          education: 'bachelor',
          companySize: 'medium',
        });
      });
    });

    it('prevents form submission with invalid data', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      // Only fill job title, leave others empty
      await user.type(screen.getByLabelText(/job title/i), 'Software Engineer');

      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Industry is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables form inputs when loading', () => {
      render(<SalaryQueryForm {...defaultProps} loading={true} />);

      expect(screen.getByLabelText(/job title/i)).toBeDisabled();
      expect(screen.getByLabelText(/industry/i)).toBeDisabled();
      expect(screen.getByLabelText(/region/i)).toBeDisabled();
      expect(screen.getByLabelText(/experience level/i)).toBeDisabled();
      expect(screen.getByLabelText(/education level/i)).toBeDisabled();
      expect(screen.getByLabelText(/company size/i)).toBeDisabled();
    });

    it('disables buttons when loading', () => {
      render(<SalaryQueryForm {...defaultProps} loading={true} />);

      expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
    });

    it('shows loading text on submit button', () => {
      render(<SalaryQueryForm {...defaultProps} loading={true} />);

      expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /search salaries/i })).not.toBeInTheDocument();
    });

    it('adds loading class to submit button', () => {
      render(<SalaryQueryForm {...defaultProps} loading={true} />);

      const submitButton = screen.getByRole('button', { name: /searching/i });
      expect(submitButton).toHaveClass('loading');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SalaryQueryForm {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates labels with form controls', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/education level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company size/i)).toBeInTheDocument();
    });

    it('provides aria-invalid attributes for invalid fields', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/job title/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/industry/i)).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('provides aria-describedby for error messages', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /search salaries/i });
      await user.click(submitButton);

      await waitFor(() => {
        const jobTitleInput = screen.getByLabelText(/job title/i);
        const ariaDescribedBy = jobTitleInput.getAttribute('aria-describedby');
        expect(ariaDescribedBy).toBeTruthy();
        expect(ariaDescribedBy).toMatch(/-jobTitle-error$/);
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SalaryQueryForm {...defaultProps} />);

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/job title/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/industry/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/region/i)).toHaveFocus();
    });
  });

  describe('Form Options', () => {
    it('includes all industry options', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      const industrySelect = screen.getByLabelText(/industry/i);
      const options = Array.from(industrySelect.querySelectorAll('option')).map(
        (option) => option.textContent
      );

      expect(options).toContain('Technology');
      expect(options).toContain('Finance');
      expect(options).toContain('Healthcare');
      expect(options).toContain('Education');
    });

    it('includes all region options', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      const regionSelect = screen.getByLabelText(/region/i);
      const options = Array.from(regionSelect.querySelectorAll('option')).map(
        (option) => option.textContent
      );

      expect(options).toContain('North America');
      expect(options).toContain('Europe');
      expect(options).toContain('Asia Pacific');
    });

    it('includes all experience level options', () => {
      render(<SalaryQueryForm {...defaultProps} />);

      const experienceSelect = screen.getByLabelText(/experience level/i);
      const options = Array.from(experienceSelect.querySelectorAll('option')).map(
        (option) => option.textContent
      );

      expect(options).toContain('Entry Level (0-2 years)');
      expect(options).toContain('Mid Level (3-5 years)');
      expect(options).toContain('Senior Level (6-10 years)');
      expect(options).toContain('Executive Level (10+ years)');
    });
  });
});
