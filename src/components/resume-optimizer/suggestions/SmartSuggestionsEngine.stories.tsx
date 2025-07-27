/**
 * Smart Suggestions Engine Storybook Stories
 *
 * Interactive stories for the Smart Suggestions Engine component
 */

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { SmartSuggestionsEngine } from './SmartSuggestionsEngine';

const meta: Meta<typeof SmartSuggestionsEngine> = {
  title: 'Resume Optimizer/Smart Suggestions Engine',
  component: SmartSuggestionsEngine,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Smart Suggestions Engine provides AI-powered, context-aware recommendations for resume optimization. 
It analyzes content in real-time and generates suggestions for keywords, grammar, style, ATS optimization, 
and quantifiable results.

## Features

- **Real-time Analysis**: Analyzes content as you type with intelligent debouncing
- **Industry-Specific Keywords**: Suggests relevant keywords based on target industry
- **Experience-Level Adaptation**: Tailors action verbs and suggestions to experience level
- **ATS Optimization**: Identifies and fixes ATS compatibility issues
- **Grammar & Style**: Improves writing quality and professional tone
- **Quantification Opportunities**: Suggests adding metrics and numbers
- **Interactive Suggestions**: Apply, dismiss, or expand suggestions with detailed explanations
- **Performance Metrics**: Real-time analysis metrics and impact tracking
- **Filtering & Sorting**: Organize suggestions by type, priority, confidence, or impact

## Usage

The component integrates seamlessly with resume editors and provides contextual suggestions
based on the target role, industry, and experience level. It supports both real-time and
manual analysis modes.
        `,
      },
    },
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The resume content to analyze',
    },
    targetRole: {
      control: 'text',
      description: 'Target job role for optimization',
    },
    targetIndustry: {
      control: 'select',
      options: ['technology', 'finance', 'marketing', 'healthcare', 'consulting'],
      description: 'Target industry for keyword suggestions',
    },
    experienceLevel: {
      control: 'select',
      options: ['entry', 'mid', 'senior', 'executive'],
      description: 'Experience level for appropriate action verbs',
    },
    enableRealTime: {
      control: 'boolean',
      description: 'Enable real-time analysis as content changes',
    },
    enableMLSuggestions: {
      control: 'boolean',
      description: 'Enable machine learning enhanced suggestions',
    },
  },
  args: {
    onSuggestionGenerated: action('suggestion-generated'),
    onSuggestionApplied: action('suggestion-applied'),
    onSuggestionDismissed: action('suggestion-dismissed'),
    onContentUpdate: action('content-updated'),
  },
};

export default meta;
type Story = StoryObj<typeof SmartSuggestionsEngine>;

// Default story with basic content
export const Default: Story = {
  args: {
    content:
      'I helped with various tasks and was responsible for managing projects. I worked on different initiatives and assisted team members.',
    targetRole: 'Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
};

// Entry-level resume with weak language
export const EntryLevel: Story = {
  args: {
    content:
      'I helped with coding tasks and assisted senior developers. I was responsible for testing and participated in team meetings. I worked on small features and learned new technologies.',
    targetRole: 'Junior Developer',
    targetIndustry: 'technology',
    experienceLevel: 'entry',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Entry-level resume with weak action verbs and passive language that needs improvement.',
      },
    },
  },
};

// Senior-level resume needing quantification
export const SeniorLevel: Story = {
  args: {
    content:
      'Led development teams and managed large projects. Improved system performance and reduced costs. Implemented new technologies and mentored junior developers. Delivered successful products and increased customer satisfaction.',
    targetRole: 'Senior Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'senior',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Senior-level resume with good action verbs but missing quantifiable results and specific metrics.',
      },
    },
  },
};

// Executive-level resume
export const ExecutiveLevel: Story = {
  args: {
    content:
      'Spearheaded digital transformation initiatives across multiple business units. Orchestrated strategic partnerships and drove revenue growth. Established new market presence and optimized operational efficiency. Championed innovation and accelerated product development cycles.',
    targetRole: 'Chief Technology Officer',
    targetIndustry: 'technology',
    experienceLevel: 'executive',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Executive-level resume with strong language but could benefit from industry-specific keywords.',
      },
    },
  },
};

// Finance industry resume
export const FinanceIndustry: Story = {
  args: {
    content:
      'Managed investment portfolios and analyzed market trends. Developed financial models and prepared reports for senior management. Worked with clients to understand their needs and provided recommendations.',
    targetRole: 'Financial Analyst',
    targetIndustry: 'finance',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Finance industry resume missing key financial terminology and quantifiable results.',
      },
    },
  },
};

// Marketing industry resume
export const MarketingIndustry: Story = {
  args: {
    content:
      'Created marketing campaigns and managed social media accounts. Worked with design teams to develop creative content. Analyzed campaign performance and reported results to stakeholders.',
    targetRole: 'Digital Marketing Manager',
    targetIndustry: 'marketing',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Marketing resume lacking industry-specific keywords and metrics.',
      },
    },
  },
};

// Healthcare industry resume
export const HealthcareIndustry: Story = {
  args: {
    content:
      'Provided patient care and maintained medical records. Worked with healthcare teams to coordinate treatment plans. Assisted with clinical procedures and ensured compliance with regulations.',
    targetRole: 'Registered Nurse',
    targetIndustry: 'healthcare',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Healthcare resume needing medical terminology and compliance keywords.',
      },
    },
  },
};

// ATS-problematic resume
export const ATSProblematic: Story = {
  args: {
    content:
      '• Managed projects using special characters ◦ Worked with tëams on various initiativés • Delivered résults with 100% success rate ◦ Implemented solutions using advanced tëchnologies',
    targetRole: 'Project Manager',
    targetIndustry: 'technology',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Resume with ATS compatibility issues including special characters and non-standard formatting.',
      },
    },
  },
};

// Perfect resume with minimal suggestions
export const OptimizedResume: Story = {
  args: {
    content:
      'Spearheaded agile development of cloud-based microservices architecture, increasing system performance by 40% and reducing deployment time by 60%. Led cross-functional team of 8 engineers to deliver scalable solutions serving 1M+ users. Implemented CI/CD pipelines using Docker and Kubernetes, resulting in 99.9% uptime and $200K annual cost savings.',
    targetRole: 'Senior Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'senior',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Well-optimized resume with strong action verbs, quantifiable results, and industry keywords.',
      },
    },
  },
};

// Manual analysis mode
export const ManualAnalysis: Story = {
  args: {
    content: 'I helped with various tasks and was responsible for managing projects.',
    targetRole: 'Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'mid',
    enableRealTime: false,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Manual analysis mode where suggestions are generated only when the Analyze button is clicked.',
      },
    },
  },
};

// Without ML suggestions
export const WithoutMLSuggestions: Story = {
  args: {
    content: 'I helped with various tasks and was responsible for managing projects.',
    targetRole: 'Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic suggestions without machine learning enhancements.',
      },
    },
  },
};

// Consulting industry resume
export const ConsultingIndustry: Story = {
  args: {
    content:
      'Worked with clients to solve business problems and improve processes. Analyzed data and prepared presentations for stakeholders. Helped implement new strategies and managed project timelines.',
    targetRole: 'Management Consultant',
    targetIndustry: 'consulting',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Consulting resume needing strategic terminology and client impact metrics.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    content: 'Type your resume content here to see real-time suggestions...',
    targetRole: 'Software Engineer',
    targetIndustry: 'technology',
    experienceLevel: 'mid',
    enableRealTime: true,
    enableMLSuggestions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test the suggestions engine with your own content.',
      },
    },
  },
};
