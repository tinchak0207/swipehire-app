import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TargetJobFormData } from './TargetJobInputForm';
import TargetJobInputForm, { useTargetJobForm } from './TargetJobInputForm';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  BriefcaseIcon: () => <div data-testid="briefcase-icon" />,
  BuildingOfficeIcon: () => <div data-testid="building-office-icon" />,
  TagIcon: () => <div data-testid="tag-icon" />,
  ExclamationCircleIcon: () => <div data-testid="exclamation-circle-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  InformationCircleIcon: () => <div data-testid="information-circle-icon" />,
}));

describe('TargetJobInputForm', () => {
  const defaultProps = {
    onChange: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<TargetJobInputForm {...defaultProps} />);

      expect(screen.getByLabelText(/target job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/key skills & keywords/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    it('renders with initial data', () => {
      const initialData = {
        title: 'Senior Developer',
        keywords: 'React, TypeScript',
        company: 'Google',
        description: 'Test description',
      };

      render(<TargetJobInputForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByDisplayValue('Senior Developer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('React, TypeScript')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Google')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });

    it('shows submit button when showSubmitButton is true', () => {
      render(<TargetJobInputForm {...defaultProps} showSubmitButton />);

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('hides submit button by default', () => {
      render(<TargetJobInputForm {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty job title', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} validateOnChange />);

      const titleInput = screen.getByLabelText(/target job title/i);
      await user.click(titleInput);
      await user.clear(titleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/job title is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for job title that is too short', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} validateOnChange />);

      const titleInput = screen.getByLabelText(/target job title/i);
      await user.type(titleInput, 'A');

      await waitFor(() => {
        expect(
          screen.getByText(/job title must be at least 2 characters long/i)
        ).toBeInTheDocument();
      });
    });

    it('shows error for job title that is too long', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} validateOnChange />);

      const titleInput = screen.getByLabelText(/target job title/i);
      const longTitle = 'A'.repeat(101);
      await user.type(titleInput, longTitle);

      await waitFor(() => {
        expect(screen.getByText(/job title must be less than 100 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error for keywords that are too short', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} validateOnChange />);

      const keywordsInput = screen.getByLabelText(/key skills & keywords/i);
      await user.type(keywordsInput, 'AB');

      await waitFor(() => {
        expect(
          screen.getByText(/keywords must be at least 3 characters long/i)
        ).toBeInTheDocument();
      });
    });

    it('accepts valid form data', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<TargetJobInputForm onChange={onChange} validateOnChange />);

      const titleInput = screen.getByLabelText(/target job title/i);
      await user.type(titleInput, 'Senior Developer');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Senior Developer',
          }),
          true
        );
      });
    });
  });

  describe('Keywords Parsing', () => {
    it('parses and displays keywords as badges', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} />);

      const keywordsInput = screen.getByLabelText(/key skills & keywords/i);
      await user.type(keywordsInput, 'React, TypeScript, Node.js');

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js')).toBeInTheDocument();
      });
    });

    it('limits displayed keywords to 10 and shows count for more', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} />);

      const keywords = Array.from({ length: 15 }, (_, i) => `Skill${i + 1}`).join(', ');
      const keywordsInput = screen.getByLabelText(/key skills & keywords/i);
      await user.type(keywordsInput, keywords);

      await waitFor(() => {
        expect(screen.getByText('+5 more')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    it('calls onChange when form data changes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<TargetJobInputForm onChange={onChange} />);

      const titleInput = screen.getByLabelText(/target job title/i);
      await user.type(titleInput, 'Developer');

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Developer',
        }),
        expect.any(Boolean)
      );
    });

    it('calls onSubmit when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(
        <TargetJobInputForm
          onSubmit={onSubmit}
          showSubmitButton
          initialData={{ title: 'Senior Developer' }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Senior Developer',
        })
      );
    });

    it('does not call onSubmit when form is invalid', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(<TargetJobInputForm onSubmit={onSubmit} showSubmitButton />);

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables form fields when loading', () => {
      render(<TargetJobInputForm {...defaultProps} isLoading />);

      expect(screen.getByLabelText(/target job title/i)).toBeDisabled();
      expect(screen.getByLabelText(/key skills & keywords/i)).toBeDisabled();
      expect(screen.getByLabelText(/target company/i)).toBeDisabled();
      expect(screen.getByLabelText(/job description/i)).toBeDisabled();
    });

    it('shows loading state on submit button', () => {
      render(<TargetJobInputForm {...defaultProps} isLoading showSubmitButton />);

      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });

  describe('Form Summary', () => {
    it('shows form summary when data is entered', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/target job title/i);
      await user.type(titleInput, 'Senior Developer');

      await waitFor(() => {
        expect(screen.getByText(/target job summary/i)).toBeInTheDocument();
        expect(screen.getByText(/position: senior developer/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('associates error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<TargetJobInputForm {...defaultProps} validateOnChange />);

      const titleInput = screen.getByLabelText(/target job title/i);
      await user.click(titleInput);
      await user.clear(titleInput);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/job title is required/i);
        expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
        expect(errorMessage.closest('[id="title-error"]')).toBeInTheDocument();
      });
    });

    it('marks required fields appropriately', () => {
      render(<TargetJobInputForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/target job title/i);
      expect(titleInput).toHaveAttribute('required');
    });
  });
});

describe('useTargetJobForm Hook', () => {
  const TestComponent = ({ initialData }: { initialData?: Partial<TargetJobFormData> }) => {
    const { formData, isValid, handleChange, reset, convertToTargetJobInfo } =
      useTargetJobForm(initialData);

    return (
      <div>
        <div data-testid="form-data">{JSON.stringify(formData)}</div>
        <div data-testid="is-valid">{isValid.toString()}</div>
        <button
          onClick={() =>
            handleChange({ title: 'Test', keywords: '', company: '', description: '' }, true)
          }
        >
          Change
        </button>
        <button onClick={() => reset()}>Reset</button>
        <button onClick={() => convertToTargetJobInfo()}>Convert</button>
      </div>
    );
  };

  it('initializes with default values', () => {
    render(<TestComponent />);

    const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
    expect(formData).toEqual({
      title: '',
      keywords: '',
      company: '',
      description: '',
    });
    expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
  });

  it('initializes with provided initial data', () => {
    const initialData = { title: 'Developer', keywords: 'React' };
    render(<TestComponent initialData={initialData} />);

    const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
    expect(formData.title).toBe('Developer');
    expect(formData.keywords).toBe('React');
  });

  it('updates form data and validity when handleChange is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Change'));

    const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
    expect(formData.title).toBe('Test');
    expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
  });

  it('resets form data when reset is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent initialData={{ title: 'Initial' }} />);

    await user.click(screen.getByText('Change'));
    await user.click(screen.getByText('Reset'));

    const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
    expect(formData.title).toBe('');
    expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
  });
});
