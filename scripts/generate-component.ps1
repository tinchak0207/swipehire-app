# Enhanced Component Generator Script
param(
    [Parameter(Mandatory=$true)]
    [string]$ComponentName,
    
    [Parameter(Mandatory=$false)]
    [string]$ComponentType = "component",
    
    [Parameter(Mandatory=$false)]
    [string]$Directory = "src/components",
    
    [Parameter(Mandatory=$false)]
    [switch]$WithStories,
    
    [Parameter(Mandatory=$false)]
    [switch]$WithTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$WithHook,
    
    [Parameter(Mandatory=$false)]
    [switch]$WithService
)

# Validate component name
if ($ComponentName -notmatch '^[A-Z][a-zA-Z0-9]*$') {
    Write-Error "Component name must start with uppercase letter and contain only alphanumeric characters"
    exit 1
}

# Create directory structure
$ComponentDir = "$Directory/$ComponentName"
if (Test-Path $ComponentDir) {
    Write-Error "Component directory already exists: $ComponentDir"
    exit 1
}

New-Item -ItemType Directory -Path $ComponentDir -Force | Out-Null
Write-Host "📁 Created directory: $ComponentDir" -ForegroundColor Green

# Generate component file
$ComponentContent = @"
'use client';

import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the $ComponentName component
 */
export interface ${ComponentName}Props {
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: ReactNode;
  /** Component variant */
  variant?: 'default' | 'primary' | 'secondary';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * $ComponentName component
 * 
 * @description A reusable $ComponentName component built with TypeScript and Tailwind CSS
 * @example
 * ```tsx
 * <$ComponentName variant="primary" size="md">
 *   Content here
 * </$ComponentName>
 * ```
 */
export const $ComponentName: FC<${ComponentName}Props> = ({
  className,
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      onClick={disabled || loading ? undefined : onClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default $ComponentName;
"@

$ComponentFile = "$ComponentDir/$ComponentName.tsx"
Set-Content -Path $ComponentFile -Value $ComponentContent
Write-Host "📄 Created component: $ComponentFile" -ForegroundColor Green

# Generate index file
$IndexContent = @"
export { $ComponentName, type ${ComponentName}Props } from './$ComponentName';
export default $ComponentName;
"@

$IndexFile = "$ComponentDir/index.ts"
Set-Content -Path $IndexFile -Value $IndexContent
Write-Host "📄 Created index: $IndexFile" -ForegroundColor Green

# Generate test file if requested
if ($WithTests) {
    $TestContent = @"
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import $ComponentName, { type ${ComponentName}Props } from './$ComponentName';

// Mock dependencies if needed
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('$ComponentName', () => {
  const defaultProps: ${ComponentName}Props = {
    children: 'Test Content',
  };

  it('renders correctly with default props', () => {
    render(<$ComponentName {...defaultProps} />);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<$ComponentName {...defaultProps} className={customClass} />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveClass(customClass);
  });

  it('handles different variants', () => {
    const { rerender } = render(<$ComponentName {...defaultProps} variant="primary" />);
    
    let element = screen.getByRole('button');
    expect(element).toHaveClass('bg-primary');
    
    rerender(<$ComponentName {...defaultProps} variant="secondary" />);
    element = screen.getByRole('button');
    expect(element).toHaveClass('bg-secondary');
  });

  it('handles different sizes', () => {
    const { rerender } = render(<$ComponentName {...defaultProps} size="sm" />);
    
    let element = screen.getByRole('button');
    expect(element).toHaveClass('h-8');
    
    rerender(<$ComponentName {...defaultProps} size="lg" />);
    element = screen.getByRole('button');
    expect(element).toHaveClass('h-12');
  });

  it('handles disabled state', () => {
    render(<$ComponentName {...defaultProps} disabled />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-disabled', 'true');
    expect(element).toHaveClass('opacity-50');
  });

  it('handles loading state', () => {
    render(<$ComponentName {...defaultProps} loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('cursor-wait');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<$ComponentName {...defaultProps} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<$ComponentName {...defaultProps} onClick={handleClick} disabled />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(<$ComponentName {...defaultProps} onClick={handleClick} loading />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports accessibility attributes', () => {
    const ariaLabel = 'Custom aria label';
    render(<$ComponentName {...defaultProps} aria-label={ariaLabel} />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-label', ariaLabel);
  });

  it('has proper keyboard navigation', () => {
    render(<$ComponentName {...defaultProps} />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('tabIndex', '0');
  });

  it('removes from tab order when disabled', () => {
    render(<$ComponentName {...defaultProps} disabled />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('tabIndex', '-1');
  });
});
"@

    $TestFile = "$ComponentDir/$ComponentName.test.tsx"
    Set-Content -Path $TestFile -Value $TestContent
    Write-Host "🧪 Created test: $TestFile" -ForegroundColor Green
}

# Generate Storybook stories if requested
if ($WithStories) {
    $StoriesContent = @"
import type { Meta, StoryObj } from '@storybook/react';
import $ComponentName from './$ComponentName';

const meta: Meta<typeof $ComponentName> = {
  title: 'Components/$ComponentName',
  component: $ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable $ComponentName component with multiple variants and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary'],
      description: 'Visual variant of the component',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the component',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state',
    },
    children: {
      control: { type: 'text' },
      description: 'Content to display inside the component',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default $ComponentName',
    variant: 'default',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary $ComponentName',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary $ComponentName',
    variant: 'secondary',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    children: 'Small $ComponentName',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large $ComponentName',
    variant: 'primary',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled $ComponentName',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading $ComponentName',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom Styled $ComponentName',
    variant: 'primary',
    size: 'md',
    className: 'shadow-lg border-2 border-dashed',
  },
};
"@

    $StoriesFile = "$ComponentDir/$ComponentName.stories.tsx"
    Set-Content -Path $StoriesFile -Value $StoriesContent
    Write-Host "📚 Created stories: $StoriesFile" -ForegroundColor Green
}

# Generate hook if requested
if ($WithHook) {
    $HookContent = @"
'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Configuration options for use$ComponentName hook
 */
export interface Use${ComponentName}Options {
  /** Initial state */
  initialState?: boolean;
  /** Auto-reset after delay (ms) */
  autoReset?: number;
  /** Callback when state changes */
  onChange?: (state: boolean) => void;
}

/**
 * Return type for use$ComponentName hook
 */
export interface Use${ComponentName}Return {
  /** Current state */
  isActive: boolean;
  /** Toggle the state */
  toggle: () => void;
  /** Set state to true */
  activate: () => void;
  /** Set state to false */
  deactivate: () => void;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * Custom hook for managing $ComponentName state
 * 
 * @param options - Configuration options
 * @returns State management functions and current state
 * 
 * @example
 * ```tsx
 * const { isActive, toggle, activate, deactivate } = use$ComponentName({
 *   initialState: false,
 *   autoReset: 3000,
 *   onChange: (state) => console.log('State changed:', state),
 * });
 * ```
 */
export const use$ComponentName = (options: Use${ComponentName}Options = {}): Use${ComponentName}Return => {
  const { initialState = false, autoReset, onChange } = options;
  
  const [isActive, setIsActive] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const activate = useCallback(() => {
    setIsActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(initialState);
  }, [initialState]);

  // Handle onChange callback
  useEffect(() => {
    onChange?.(isActive);
  }, [isActive, onChange]);

  // Handle auto-reset
  useEffect(() => {
    if (autoReset && isActive) {
      const timer = setTimeout(() => {
        deactivate();
      }, autoReset);

      return () => clearTimeout(timer);
    }
  }, [isActive, autoReset, deactivate]);

  return {
    isActive,
    toggle,
    activate,
    deactivate,
    reset,
  };
};

export default use$ComponentName;
"@

    $HookFile = "$ComponentDir/use$ComponentName.ts"
    Set-Content -Path $HookFile -Value $HookContent
    Write-Host "🪝 Created hook: $HookFile" -ForegroundColor Green

    # Generate hook test
    $HookTestContent = @"
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import use$ComponentName, { type Use${ComponentName}Options } from './use$ComponentName';

describe('use$ComponentName', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => use$ComponentName());
    
    expect(result.current.isActive).toBe(false);
    expect(typeof result.current.toggle).toBe('function');
    expect(typeof result.current.activate).toBe('function');
    expect(typeof result.current.deactivate).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('initializes with custom initial state', () => {
    const { result } = renderHook(() => use$ComponentName({ initialState: true }));
    
    expect(result.current.isActive).toBe(true);
  });

  it('toggles state correctly', () => {
    const { result } = renderHook(() => use$ComponentName());
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isActive).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isActive).toBe(false);
  });

  it('activates state correctly', () => {
    const { result } = renderHook(() => use$ComponentName());
    
    act(() => {
      result.current.activate();
    });
    
    expect(result.current.isActive).toBe(true);
  });

  it('deactivates state correctly', () => {
    const { result } = renderHook(() => use$ComponentName({ initialState: true }));
    
    act(() => {
      result.current.deactivate();
    });
    
    expect(result.current.isActive).toBe(false);
  });

  it('resets to initial state', () => {
    const { result } = renderHook(() => use$ComponentName({ initialState: true }));
    
    act(() => {
      result.current.deactivate();
    });
    
    expect(result.current.isActive).toBe(false);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.isActive).toBe(true);
  });

  it('calls onChange callback when state changes', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => use$ComponentName({ onChange }));
    
    act(() => {
      result.current.activate();
    });
    
    expect(onChange).toHaveBeenCalledWith(true);
    
    act(() => {
      result.current.deactivate();
    });
    
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('auto-resets after specified delay', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => use$ComponentName({ autoReset: 1000 }));
    
    act(() => {
      result.current.activate();
    });
    
    expect(result.current.isActive).toBe(true);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.isActive).toBe(false);
    
    jest.useRealTimers();
  });

  it('clears auto-reset timer when component unmounts', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { result, unmount } = renderHook(() => use$ComponentName({ autoReset: 1000 }));
    
    act(() => {
      result.current.activate();
    });
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    jest.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });
});
"@

    $HookTestFile = "$ComponentDir/use$ComponentName.test.ts"
    Set-Content -Path $HookTestFile -Value $HookTestContent
    Write-Host "🧪 Created hook test: $HookTestFile" -ForegroundColor Green
}

# Generate service if requested
if ($WithService) {
    $ServiceContent = @"
/**
 * Configuration options for ${ComponentName}Service
 */
export interface ${ComponentName}ServiceConfig {
  /** API base URL */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** API key for authentication */
  apiKey?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Data model for $ComponentName
 */
export interface ${ComponentName}Data {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Active status */
  isActive: boolean;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Request payload for creating $ComponentName
 */
export interface Create${ComponentName}Request {
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Request payload for updating $ComponentName
 */
export interface Update${ComponentName}Request {
  /** Display name */
  name?: string;
  /** Description */
  description?: string;
  /** Active status */
  isActive?: boolean;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Service for managing $ComponentName operations
 * 
 * @example
 * ```typescript
 * const service = new ${ComponentName}Service({
 *   baseUrl: 'https://api.example.com',
 *   apiKey: 'your-api-key',
 *   timeout: 5000,
 * });
 * 
 * const items = await service.getAll();
 * const item = await service.create({ name: 'New Item' });
 * ```
 */
export class ${ComponentName}Service {
  private readonly config: Required<${ComponentName}ServiceConfig>;

  constructor(config: ${ComponentName}ServiceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? '/api',
      timeout: config.timeout ?? 10000,
      apiKey: config.apiKey ?? '',
      debug: config.debug ?? false,
    };
  }

  /**
   * Get all $ComponentName items
   */
  async getAll(): Promise<${ComponentName}Data[]> {
    try {
      const response = await this.makeRequest('GET', '/${ComponentName.toLowerCase()}s');
      return response.data;
    } catch (error) {
      this.handleError('Failed to fetch ${ComponentName.toLowerCase()}s', error);
      throw error;
    }
  }

  /**
   * Get a specific $ComponentName by ID
   */
  async getById(id: string): Promise<${ComponentName}Data> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      const response = await this.makeRequest('GET', `/${ComponentName.toLowerCase()}s/`${id}`);
      return response.data;
    } catch (error) {
      this.handleError(`Failed to fetch ${ComponentName.toLowerCase()} with ID: `${id}`, error);
      throw error;
    }
  }

  /**
   * Create a new $ComponentName
   */
  async create(data: Create${ComponentName}Request): Promise<${ComponentName}Data> {
    if (!data.name) {
      throw new Error('Name is required');
    }

    try {
      const response = await this.makeRequest('POST', '/${ComponentName.toLowerCase()}s', data);
      return response.data;
    } catch (error) {
      this.handleError('Failed to create ${ComponentName.toLowerCase()}', error);
      throw error;
    }
  }

  /**
   * Update an existing $ComponentName
   */
  async update(id: string, data: Update${ComponentName}Request): Promise<${ComponentName}Data> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      const response = await this.makeRequest('PUT', `/${ComponentName.toLowerCase()}s/`${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(`Failed to update ${ComponentName.toLowerCase()} with ID: `${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a $ComponentName
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      await this.makeRequest('DELETE', `/${ComponentName.toLowerCase()}s/`${id}`);
    } catch (error) {
      this.handleError(`Failed to delete ${ComponentName.toLowerCase()} with ID: `${id}`, error);
      throw error;
    }
  }

  /**
   * Search $ComponentName items
   */
  async search(query: string, filters?: Record<string, unknown>): Promise<${ComponentName}Data[]> {
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      const params = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await this.makeRequest('GET', `/${ComponentName.toLowerCase()}s/search?`${params.toString()}`);
      return response.data;
    } catch (error) {
      this.handleError(`Failed to search ${ComponentName.toLowerCase()}s`, error);
      throw error;
    }
  }

  /**
   * Make HTTP request with proper error handling
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown
  ): Promise<{ data: any; status: number }> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    if (this.config.debug) {
      console.log(`[${ComponentName}Service] ${method} ${url}`, data);
    }

    const response = await fetch(url, requestConfig);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    if (this.config.debug) {
      console.log(`[${ComponentName}Service] Response:`, responseData);
    }

    return {
      data: responseData,
      status: response.status,
    };
  }

  /**
   * Handle and log errors
   */
  private handleError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message}: ${errorMessage}`;

    if (this.config.debug) {
      console.error(`[${ComponentName}Service] ${fullMessage}`, error);
    }
  }
}

export default ${ComponentName}Service;
"@

    $ServiceFile = "$ComponentDir/${ComponentName}Service.ts"
    Set-Content -Path $ServiceFile -Value $ServiceContent
    Write-Host "🔧 Created service: $ServiceFile" -ForegroundColor Green

    # Generate service test
    $ServiceTestContent = @"
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import ${ComponentName}Service, {
  type ${ComponentName}Data,
  type Create${ComponentName}Request,
  type Update${ComponentName}Request,
} from './${ComponentName}Service';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('${ComponentName}Service', () => {
  let service: ${ComponentName}Service;

  beforeEach(() => {
    service = new ${ComponentName}Service({
      baseUrl: 'https://api.test.com',
      apiKey: 'test-key',
      timeout: 5000,
      debug: false,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockData: ${ComponentName}Data = {
    id: '1',
    name: 'Test ${ComponentName}',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    metadata: { test: true },
  };

  const createMockResponse = (data: any, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(data),
    } as Response);
  };

  describe('getAll', () => {
    it('fetches all items successfully', async () => {
      const mockResponse = [mockData];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await service.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/${ComponentName.toLowerCase()}s',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles fetch error', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}, 500));

      await expect(service.getAll()).rejects.toThrow('HTTP 500: Error');
    });
  });

  describe('getById', () => {
    it('fetches item by ID successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const result = await service.getById('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/${ComponentName.toLowerCase()}s/1',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('throws error for missing ID', async () => {
      await expect(service.getById('')).rejects.toThrow('ID is required');
    });
  });

  describe('create', () => {
    it('creates item successfully', async () => {
      const createData: Create${ComponentName}Request = {
        name: 'New ${ComponentName}',
        description: 'New description',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const result = await service.create(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/${ComponentName.toLowerCase()}s',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('throws error for missing name', async () => {
      const createData = { name: '' } as Create${ComponentName}Request;

      await expect(service.create(createData)).rejects.toThrow('Name is required');
    });
  });

  describe('update', () => {
    it('updates item successfully', async () => {
      const updateData: Update${ComponentName}Request = {
        name: 'Updated ${ComponentName}',
        isActive: false,
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const result = await service.update('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/${ComponentName.toLowerCase()}s/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('throws error for missing ID', async () => {
      await expect(service.update('', {})).rejects.toThrow('ID is required');
    });
  });

  describe('delete', () => {
    it('deletes item successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await service.delete('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/${ComponentName.toLowerCase()}s/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error for missing ID', async () => {
      await expect(service.delete('')).rejects.toThrow('ID is required');
    });
  });

  describe('search', () => {
    it('searches items successfully', async () => {
      const mockResponse = [mockData];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await service.search('test query', { category: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/${ComponentName.toLowerCase()}s/search?q=test+query&category=test',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error for missing query', async () => {
      await expect(service.search('')).rejects.toThrow('Search query is required');
    });
  });

  describe('configuration', () => {
    it('uses default configuration', () => {
      const defaultService = new ${ComponentName}Service();
      expect(defaultService).toBeInstanceOf(${ComponentName}Service);
    });

    it('handles requests without API key', async () => {
      const serviceWithoutKey = new ${ComponentName}Service({ apiKey: '' });
      mockFetch.mockResolvedValueOnce(createMockResponse([]));

      await serviceWithoutKey.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/${ComponentName.toLowerCase()}s',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });
});
"@

    $ServiceTestFile = "$ComponentDir/${ComponentName}Service.test.ts"
    Set-Content -Path $ServiceTestFile -Value $ServiceTestContent
    Write-Host "🧪 Created service test: $ServiceTestFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Component generation completed successfully!" -ForegroundColor Green
Write-Host "📁 Location: $ComponentDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "  📄 $ComponentName.tsx - Main component" -ForegroundColor White
Write-Host "  📄 index.ts - Export file" -ForegroundColor White

if ($WithTests) {
    Write-Host "  🧪 $ComponentName.test.tsx - Component tests" -ForegroundColor White
}

if ($WithStories) {
    Write-Host "  📚 $ComponentName.stories.tsx - Storybook stories" -ForegroundColor White
}

if ($WithHook) {
    Write-Host "  🪝 use$ComponentName.ts - Custom hook" -ForegroundColor White
    Write-Host "  🧪 use$ComponentName.test.ts - Hook tests" -ForegroundColor White
}

if ($WithService) {
    Write-Host "  🔧 ${ComponentName}Service.ts - Service class" -ForegroundColor White
    Write-Host "  🧪 ${ComponentName}Service.test.ts - Service tests" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review and customize the generated code" -ForegroundColor White
Write-Host "  2. Run tests: npm run test" -ForegroundColor White
Write-Host "  3. Run Biome checks: npm run check" -ForegroundColor White
Write-Host "  4. Import and use your component!" -ForegroundColor White