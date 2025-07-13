'use client';

import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { TEMPLATE_CATEGORIES } from '@/lib/resume-types';
import type { ResumeTemplate, TargetJobInfo } from '@/lib/types/resume-optimizer';
import { fetchResumeTemplates } from '@/services/resumeOptimizerService';

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
  const [currentStep, setCurrentStep] = useState<'template' | 'details'>('template');

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
      setFilteredTemplates(templates.filter((template) => template.category === selectedCategory));
    }
  }, [selectedCategory, templates]);

  const handleTemplateSelect = useCallback((template: ResumeTemplate): void => {
    setSelectedTemplate(template);
    setShowPreview(false);
    // Auto-advance to details step after template selection
    setTimeout(() => setCurrentStep('details'), 300);
  }, []);

  const handlePreviewToggle = useCallback((): void => {
    setShowPreview((prev) => !prev);
  }, []);

  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!selectedTemplate || !targetJob.title.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      // Store data in sessionStorage for the analysis page
      sessionStorage.setItem(
        'resumeOptimizerData',
        JSON.stringify({
          resumeText: selectedTemplate.content,
          targetJob,
          source: 'template',
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
        })
      );

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
    setTargetJob((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getCategoryColor = (category: ResumeTemplate['category']): string => {
    const colors = {
      tech: 'from-blue-500 to-cyan-500',
      business: 'from-green-500 to-emerald-500',
      creative: 'from-purple-500 to-pink-500',
      general: 'from-gray-500 to-slate-500',
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-slate-500';
  };

  const getCategoryIcon = (category: ResumeTemplate['category']): JSX.Element => {
    const icons = {
      tech: <DocumentTextIcon className="h-6 w-6" />,
      business: <BriefcaseIcon className="h-6 w-6" />,
      creative: <SparklesIcon className="h-6 w-6" />,
      general: <DocumentTextIcon className="h-6 w-6" />,
    };
    return icons[category as keyof typeof icons] || <DocumentTextIcon className="h-6 w-6" />;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="animate-fade-in text-center">
          <div className="relative">
            <div className="mx-auto mb-8 h-20 w-20 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <SparklesIcon className="absolute top-1/2 left-1/2 h-8 w-8 transform -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
          <h2 className="mb-2 font-bold text-2xl text-white">Loading Templates</h2>
          <p className="text-white/70">Preparing your resume creation experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="border-white/20 border-b bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/resume-optimizer"
                  className="group flex items-center space-x-2 rounded-lg px-3 py-2 text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeftIcon className="group-hover:-translate-x-1 h-5 w-5 transition-transform duration-200" />
                  <span className="font-medium">Back</span>
                </Link>
                <div className="h-6 w-px bg-white/20" />
                <h1 className="text-2xl font-bold text-white">Create Your Resume</h1>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center space-x-2 rounded-full px-3 py-1 transition-all duration-300 ${
                    currentStep === 'template'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      currentStep === 'template' ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                  <span className="text-sm font-medium">Template</span>
                </div>
                <div
                  className={`flex items-center space-x-2 rounded-full px-3 py-1 transition-all duration-300 ${
                    currentStep === 'details'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      currentStep === 'details' ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                  <span className="text-sm font-medium">Details</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="container mx-auto max-w-7xl px-6 py-4">
            <div className="animate-fade-in rounded-xl border border-yellow-500/30 bg-yellow-500/20 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-yellow-400" />
                <span className="text-yellow-100">{error}</span>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto max-w-7xl px-6 py-8">
          {currentStep === 'template' ? (
            /* Template Selection Step */
            <div className="animate-fade-in">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-bold text-4xl text-white">Choose Your Starting Point</h2>
                <p className="mx-auto max-w-2xl text-white/70 text-xl">
                  Select a professionally crafted template that matches your career field and goals
                </p>
              </div>

              {/* Category Filter */}
              <div className="mb-8 flex justify-center">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
                        selectedCategory === 'all'
                          ? 'bg-white text-purple-900 shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      All Templates
                    </button>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`flex items-center space-x-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
                          selectedCategory === key
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className={`group relative animate-fade-in cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-2xl ${
                      selectedTemplate?.id === template.id
                        ? 'scale-105 bg-white/20 shadow-2xl ring-2 ring-white'
                        : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {/* Template Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`rounded-xl bg-gradient-to-r p-3 ${getCategoryColor(template.category)} shadow-lg`}
                      >
                        {getCategoryIcon(template.category)}
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="animate-bounce rounded-full bg-green-500 p-2">
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Template Content */}
                    <h3 className="mb-2 font-bold text-white text-xl">{template.name}</h3>
                    <p className="mb-4 line-clamp-2 text-white/70">{template.description}</p>

                    {/* Template Footer */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full bg-gradient-to-r px-3 py-1 font-medium text-xs ${getCategoryColor(template.category)} text-white shadow-lg`}
                      >
                        {TEMPLATE_CATEGORIES[template.category]?.label || template.category}
                      </span>

                      <div className="flex space-x-2">
                        {selectedTemplate?.id === template.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewToggle();
                            }}
                            className="rounded-lg bg-white/20 p-2 transition-all duration-200 hover:bg-white/30"
                          >
                            <EyeIcon className="h-4 w-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="animate-fade-in py-16 text-center">
                  <DocumentTextIcon className="mx-auto mb-4 h-16 w-16 text-white/40" />
                  <h3 className="mb-2 font-semibold text-white text-xl">No Templates Found</h3>
                  <p className="text-white/70">
                    Try selecting a different category to see more templates.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Job Details Step */
            <div className="mx-auto max-w-2xl animate-fade-in">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-bold text-4xl text-white">
                  Tell Us About Your Target Role
                </h2>
                <p className="text-white/70 text-xl">
                  Help us optimize your resume for the perfect job match
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
                {/* Selected Template Preview */}
                {selectedTemplate && (
                  <div className="mb-8 rounded-xl border border-white/20 bg-white/10 p-4">
                    <div className="mb-2 flex items-center space-x-3">
                      <div
                        className={`rounded-lg bg-gradient-to-r p-2 ${getCategoryColor(selectedTemplate.category)}`}
                      >
                        {getCategoryIcon(selectedTemplate.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{selectedTemplate.name}</h3>
                        <p className="text-sm text-white/70">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep('template')}
                      className="text-sm text-white/80 transition-colors duration-200 hover:text-white"
                    >
                      ← Change template
                    </button>
                  </div>
                )}

                {/* Job Details Form */}
                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text flex items-center space-x-2 font-semibold text-lg text-white">
                        <BriefcaseIcon className="h-5 w-5" />
                        <span>Target Job Title *</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      value={targetJob.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="input input-lg w-full border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/50 focus:border-white/50 focus:bg-white/30"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text flex items-center space-x-2 font-semibold text-lg text-white">
                        <TagIcon className="h-5 w-5" />
                        <span>Key Skills & Keywords</span>
                      </span>
                    </label>
                    <textarea
                      placeholder="e.g., React, Node.js, TypeScript, AWS, Agile, Team Leadership"
                      value={targetJob.keywords}
                      onChange={(e) => handleInputChange('keywords', e.target.value)}
                      className="textarea textarea-lg h-32 w-full resize-none border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/50 focus:border-white/50 focus:bg-white/30"
                    />
                    <div className="label">
                      <span className="label-text-alt text-white/60">
                        Separate multiple keywords with commas
                      </span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text flex items-center space-x-2 font-semibold text-lg text-white">
                        <BuildingOfficeIcon className="h-5 w-5" />
                        <span>Target Company (Optional)</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Google, Microsoft, Startup"
                      value={targetJob.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="input input-lg w-full border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/50 focus:border-white/50 focus:bg-white/30"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => setCurrentStep('template')}
                    className="btn btn-lg flex-1 border-white/30 bg-white/20 text-white transition-all duration-200 hover:border-white/50 hover:bg-white/30"
                  >
                    ← Back to Templates
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedTemplate || !targetJob.title.trim() || isAnalyzing}
                    className="btn btn-lg flex-1 border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2" />
                        Creating Your Resume...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 h-5 w-5" />
                        Start Building
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Template Preview Modal */}
          {showPreview && selectedTemplate && (
            <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-gray-200 border-b p-6">
                  <h3 className="font-bold text-gray-900 text-xl">Template Preview</h3>
                  <button onClick={handlePreviewToggle} className="btn btn-sm btn-circle btn-ghost">
                    ✕
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-6">
                  <pre className="whitespace-pre-wrap font-mono text-gray-700 text-sm leading-relaxed">
                    {selectedTemplate.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCreatePage;
