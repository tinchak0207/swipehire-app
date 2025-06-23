'use client';

import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  DocumentTextIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { ResumeTemplate, TargetJobInfo } from '@/lib/types/resume-optimizer';
import { fetchResumeTemplates } from '@/services/resumeOptimizerService';
import { TEMPLATE_CATEGORIES } from '@/lib/resume-types';

const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    description: 'Perfect for developers and technical roles',
    category: 'tech',
    content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [GitHub Profile]

PROFESSIONAL SUMMARY
Experienced software engineer with [X] years of experience in developing scalable web applications and systems. Proficient in modern programming languages and frameworks with a strong focus on clean code and best practices.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Spring Boot
• Databases: PostgreSQL, MongoDB, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD
• Tools: Git, Jest, Webpack, VS Code

PROFESSIONAL EXPERIENCE

Senior Software Engineer | [Company Name] | [Start Date] - Present
• Developed and maintained web applications serving [X] users
• Led technical architecture decisions for [specific project]
• Improved application performance by [X]% through optimization
• Mentored junior developers and conducted code reviews
• Collaborated with cross-functional teams to deliver features on time

Software Engineer | [Previous Company] | [Start Date] - [End Date]
• Built responsive web interfaces using React and modern JavaScript
• Implemented RESTful APIs and microservices architecture
• Wrote comprehensive unit and integration tests
• Participated in agile development processes and sprint planning

EDUCATION
Bachelor of Science in Computer Science | [University Name] | [Year]

PROJECTS
[Project Name] | [Technologies Used]
• Brief description of the project and your role
• Key achievements and impact

CERTIFICATIONS
• [Relevant certification name] | [Year]`,
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Ideal for product management and strategy roles',
    category: 'business',
    content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile]

PROFESSIONAL SUMMARY
Results-driven product manager with [X] years of experience leading cross-functional teams to deliver innovative products. Proven track record of driving user growth, increasing revenue, and improving customer satisfaction through data-driven decision making.

CORE COMPETENCIES
• Product Strategy & Roadmap Planning
• User Research & Market Analysis
• Agile/Scrum Methodologies
• Data Analysis & A/B Testing
• Stakeholder Management
• Go-to-Market Strategy
• UX/UI Collaboration
• Technical Product Management

PROFESSIONAL EXPERIENCE

Senior Product Manager | [Company Name] | [Start Date] - Present
• Led product strategy for [product/feature] serving [X] users
• Increased user engagement by [X]% through feature optimization
• Managed product roadmap and prioritized features based on user feedback
• Collaborated with engineering, design, and marketing teams
• Conducted user research and analyzed product metrics

Product Manager | [Previous Company] | [Start Date] - [End Date]
• Launched [X] new features resulting in [X]% increase in user adoption
• Defined product requirements and user stories for development team
• Performed competitive analysis and market research
• Managed product backlog and sprint planning sessions

EDUCATION
Master of Business Administration (MBA) | [University Name] | [Year]
Bachelor of Science in [Field] | [University Name] | [Year]

KEY ACHIEVEMENTS
• Launched [product/feature] that generated $[X] in revenue
• Improved customer satisfaction score from [X] to [X]
• Led successful product pivot that increased market share by [X]%

CERTIFICATIONS
• Certified Scrum Product Owner (CSPO) | [Year]
• Google Analytics Certified | [Year]`,
  },
  {
    id: 'marketing-specialist',
    name: 'Marketing Specialist',
    description: 'Great for marketing and communications roles',
    category: 'business',
    content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [Portfolio Website]

PROFESSIONAL SUMMARY
Creative and analytical marketing professional with [X] years of experience developing and executing successful marketing campaigns. Expertise in digital marketing, content creation, and brand management with a proven track record of driving engagement and conversions.

MARKETING SKILLS
• Digital Marketing Strategy
• Content Marketing & SEO
• Social Media Management
• Email Marketing Campaigns
• Google Ads & Facebook Ads
• Marketing Analytics & Reporting
• Brand Management
• Event Planning & Execution

PROFESSIONAL EXPERIENCE

Marketing Specialist | [Company Name] | [Start Date] - Present
• Developed and executed marketing campaigns that increased brand awareness by [X]%
• Managed social media accounts with [X] followers across platforms
• Created content that generated [X] leads per month
• Analyzed campaign performance and optimized for better ROI
• Collaborated with sales team to align marketing and sales strategies

Marketing Coordinator | [Previous Company] | [Start Date] - [End Date]
• Assisted in planning and executing marketing events and trade shows
• Created marketing materials including brochures, presentations, and web content
• Managed email marketing campaigns with [X]% open rate
• Conducted market research and competitor analysis

EDUCATION
Bachelor of Arts in Marketing | [University Name] | [Year]

ACHIEVEMENTS
• Increased website traffic by [X]% through SEO optimization
• Generated [X] qualified leads through content marketing
• Improved email campaign performance by [X]%

TOOLS & PLATFORMS
• Google Analytics, Google Ads, Facebook Business Manager
• HubSpot, Mailchimp, Hootsuite
• Adobe Creative Suite, Canva
• WordPress, HTML/CSS basics`,
  },
  {
    id: 'general-professional',
    name: 'General Professional',
    description: 'Versatile template for various professional roles',
    category: 'general',
    content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile]

PROFESSIONAL SUMMARY
Dedicated professional with [X] years of experience in [your field/industry]. Strong background in [key skills/areas] with a proven ability to [key achievement/strength]. Seeking to leverage expertise in [relevant area] to contribute to [type of organization/role].

CORE SKILLS
• [Skill 1]
• [Skill 2]
• [Skill 3]
• [Skill 4]
• [Skill 5]
• [Skill 6]

PROFESSIONAL EXPERIENCE

[Job Title] | [Company Name] | [Start Date] - Present
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]

[Previous Job Title] | [Previous Company] | [Start Date] - [End Date]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]

EDUCATION
[Degree] in [Field of Study] | [University Name] | [Year]

ADDITIONAL QUALIFICATIONS
• [Certification or additional qualification]
• [Language proficiency]
• [Volunteer experience or relevant activity]

ACHIEVEMENTS
• [Specific achievement with measurable impact]
• [Recognition or award received]
• [Process improvement or cost savings implemented]`,
  },
];

/**
 * Create from scratch page component
 * Provides resume templates for users to start with
 */
const ResumeCreatePage: NextPage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [targetJob, setTargetJob] = useState<TargetJobInfo>({
    title: '',
    keywords: '',
  });

  useEffect(() => {
    const loadTemplates = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const fetchedTemplates = await fetchResumeTemplates();
        setTemplates(fetchedTemplates);
        setFilteredTemplates(fetchedTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates. Using default templates.');
        // Use fallback templates
        setTemplates(resumeTemplates);
        setFilteredTemplates(resumeTemplates);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(template => template.category === selectedCategory));
    }
  }, [selectedCategory, templates]);

  const handleTemplateSelect = useCallback((template: ResumeTemplate): void => {
    setSelectedTemplate(template);
    setShowPreview(false);
  }, []);

  const handlePreviewToggle = useCallback((): void => {
    setShowPreview(prev => !prev);
  }, []);

  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!selectedTemplate || !targetJob.title.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      // Store data in sessionStorage for the analysis page
      sessionStorage.setItem('resumeOptimizerData', JSON.stringify({
        resumeText: selectedTemplate.content,
        targetJob,
        source: 'template',
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
      }));

      // Navigate to analysis page
      router.push('/resume-optimizer/analyze');
    } catch (error) {
      console.error('Error preparing analysis:', error);
      setError('Failed to prepare template for analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedTemplate, targetJob, router]);

  const handleInputChange = useCallback((field: keyof TargetJobInfo, value: string): void => {
    setTargetJob(prev => ({ ...prev, [field]: value }));
  }, []);

  const getCategoryColor = (category: ResumeTemplate['category']): string => {
    return TEMPLATE_CATEGORIES[category]?.color || 'badge-neutral';
  };

  const getCategoryIcon = (category: ResumeTemplate['category']): string => {
    return TEMPLATE_CATEGORIES[category]?.icon || '📄';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
              <p className="text-lg text-gray-600">Loading templates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/resume-optimizer" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Create from Scratch</h1>
        </div>

        {error && (
          <div className="alert alert-warning mb-8">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Choose a Template</h2>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
                  <FunnelIcon className="w-4 h-4 mr-1" />
                  Filter
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                  <li>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'active' : ''}
                    >
                      All Templates
                    </button>
                  </li>
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                    <li key={key}>
                      <button
                        onClick={() => setSelectedCategory(key)}
                        className={selectedCategory === key ? 'active' : ''}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`card bg-white shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getCategoryIcon(template.category)}</span>
                        <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircleIcon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h3 className="card-title text-lg">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`badge ${getCategoryColor(template.category)} badge-sm`}>
                        {TEMPLATE_CATEGORIES[template.category]?.label || template.category}
                      </span>
                      <div className="flex gap-2">
                        {selectedTemplate?.id === template.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewToggle();
                            }}
                            className="btn btn-sm btn-outline"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className={`btn btn-sm ${
                            selectedTemplate?.id === template.id ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          {selectedTemplate?.id === template.id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No templates found for the selected category.</p>
              </div>
            )}
          </div>

          {/* Target Job & Preview */}
          <div className="space-y-6">
            {/* Target Job Section */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Target Job Information</h2>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Target Job Title *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    value={targetJob.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Keywords (comma-separated)</span>
                  </label>
                  <textarea
                    placeholder="e.g., React, Node.js, TypeScript"
                    value={targetJob.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    className="textarea textarea-bordered w-full h-20"
                  />
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text font-medium">Company (optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Google, Microsoft"
                    value={targetJob.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedTemplate || !targetJob.title.trim() || isAnalyzing}
                  className="btn btn-success w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Preparing Template...
                    </>
                  ) : (
                    'Start with Template'
                  )}
                </button>
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="card-title">Template Preview</h3>
                    <button
                      onClick={handlePreviewToggle}
                      className="btn btn-sm btn-outline"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {showPreview ? 'Hide' : 'Show'} Full
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                      {showPreview 
                        ? selectedTemplate.content 
                        : `${selectedTemplate.content.substring(0, 500)}...`
                      }
                    </pre>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className={`badge ${getCategoryColor(selectedTemplate.category)} badge-sm`}>
                        {TEMPLATE_CATEGORIES[selectedTemplate.category]?.label || selectedTemplate.category}
                      </span>
                    </div>
                    {selectedTemplate.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedTemplate.tags.map((tag, index) => (
                          <span key={index} className="badge badge-outline badge-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    This template will be loaded into the editor where you can customize it for your
                    needs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="card bg-white shadow-lg mt-8">
          <div className="card-body">
            <h3 className="card-title mb-4">How to Use Templates</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-50 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl">1️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Choose Template</h4>
                <p className="text-sm text-gray-600">
                  Select a template that matches your career field
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-50 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl">2️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Add Job Details</h4>
                <p className="text-sm text-gray-600">
                  Enter your target job title and relevant keywords
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-50 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl">3️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Customize & Optimize</h4>
                <p className="text-sm text-gray-600">
                  Edit the template and get AI-powered optimization suggestions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCreatePage;
