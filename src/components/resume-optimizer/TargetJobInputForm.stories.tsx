import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import TargetJobInputForm from './TargetJobInputForm';
import type { TargetJobFormData } from './TargetJobInputForm';

const meta: Meta<typeof TargetJobInputForm> = {
  title: 'Resume Optimizer/TargetJobInputForm',
  component: TargetJobInputForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The TargetJobInputForm component provides a comprehensive form for users to specify their target job information. 
It includes validation, real-time feedback, and accessibility features.

## Features
- **Required job title field** with validation
- **Keywords field** with comma-separated parsing and badge display
- **Optional company and description fields**
- **Real-time validation** with error messages
- **Accessibility support** with ARIA attributes
- **Loading states** for async operations
- **Form summary** showing entered information
- **Responsive design** using DaisyUI components

## Usage
This component is designed to be used in the resume optimization workflow where users need to specify 
their target job information for AI-powered resume analysis and optimization.
        `,
      },
    },
  },
  argTypes: {
    initialData: {
      control: 'object',
      description: 'Initial form data to populate the fields',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback when form data changes',
    },
    onSubmit: {
      action: 'onSubmit',
      description: 'Callback when form is submitted',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the form is in loading state',
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Whether to show the submit button',
    },
    submitButtonText: {
      control: 'text',
      description: 'Text for the submit button',
    },
    validateOnChange: {
      control: 'boolean',
      description: 'Whether to validate on every change',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TargetJobInputForm>;

// Default story
export const Default: Story = {
  args: {
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

// With initial data
export const WithInitialData: Story = {
  args: {
    initialData: {
      title: 'Senior Software Engineer',
      keywords: 'React, TypeScript, Node.js, AWS, Docker, Kubernetes',
      company: 'Google',
      description: 'Looking for a senior software engineer role at a leading tech company with focus on full-stack development and cloud technologies.',
    },
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

// With submit button
export const WithSubmitButton: Story = {
  args: {
    showSubmitButton: true,
    submitButtonText: 'Analyze Resume',
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    isLoading: true,
    showSubmitButton: true,
    submitButtonText: 'Analyzing...',
    initialData: {
      title: 'Product Manager',
      keywords: 'Product Strategy, Agile, Scrum, Analytics',
    },
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
  },
};

// Validation errors
export const WithValidationErrors: Story = {
  args: {
    initialData: {
      title: 'A', // Too short
      keywords: 'AB', // Too short
      company: 'A'.repeat(101), // Too long
    },
    validateOnChange: true,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
  },
};

// Different job types
export const TechRole: Story = {
  args: {
    initialData: {
      title: 'Full Stack Developer',
      keywords: 'JavaScript, React, Vue.js, Node.js, Python, Django, PostgreSQL, MongoDB, AWS, Docker, Git, Agile',
      company: 'Tech Startup',
      description: 'Seeking a full-stack developer position at an innovative startup where I can work with modern technologies and contribute to product development.',
    },
    showSubmitButton: true,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

export const BusinessRole: Story = {
  args: {
    initialData: {
      title: 'Marketing Manager',
      keywords: 'Digital Marketing, SEO, SEM, Social Media, Content Marketing, Analytics, Campaign Management, Brand Strategy',
      company: 'Fortune 500',
      description: 'Looking for a marketing manager role at a large corporation with opportunities to lead digital marketing initiatives and drive brand growth.',
    },
    showSubmitButton: true,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

export const CreativeRole: Story = {
  args: {
    initialData: {
      title: 'UX/UI Designer',
      keywords: 'User Experience, User Interface, Figma, Sketch, Adobe Creative Suite, Prototyping, User Research, Wireframing',
      company: 'Design Agency',
      description: 'Passionate about creating intuitive and beautiful user experiences. Seeking a UX/UI designer role at a creative agency.',
    },
    showSubmitButton: true,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

// Custom validation
export const CustomValidation: Story = {
  args: {
    customValidation: (data: TargetJobFormData) => {
      const errors: Record<string, string> = {};
      
      if (data.title && !data.title.toLowerCase().includes('senior')) {
        errors.title = 'Title must include "Senior" for this example';
      }
      
      if (data.keywords && data.keywords.split(',').length < 3) {
        errors.keywords = 'Please provide at least 3 keywords';
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    validateOnChange: true,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
  },
};

// Minimal form
export const MinimalForm: Story = {
  args: {
    className: 'max-w-md',
    validateOnChange: false,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
  },
};

// Form with many keywords
export const ManyKeywords: Story = {
  args: {
    initialData: {
      title: 'Senior Full Stack Engineer',
      keywords: 'JavaScript, TypeScript, React, Vue.js, Angular, Node.js, Express, Python, Django, Flask, Java, Spring Boot, C#, .NET, PHP, Laravel, Ruby, Rails, Go, Rust, HTML5, CSS3, SASS, LESS, Tailwind CSS, Bootstrap, PostgreSQL, MySQL, MongoDB, Redis, AWS, Azure, GCP, Docker, Kubernetes, Jenkins, GitLab CI, GitHub Actions, Terraform, Ansible',
    },
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
    validateOnChange: true,
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    showSubmitButton: true,
    submitButtonText: 'Continue',
    validateOnChange: true,
    onChange: action('onChange'),
    onSubmit: action('onSubmit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use this story to interact with the component and test different scenarios.',
      },
    },
  },
};