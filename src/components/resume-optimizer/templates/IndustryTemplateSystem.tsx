'use client';

import {
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Building,
  Calculator,
  CheckCircle,
  Code,
  Download,
  Eye,
  FileText,
  Globe,
  Lightbulb,
  Megaphone,
  Palette,
  Search,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type {
  AITemplateRecommendation,
  IndustryTemplate,
  TemplateAnalytics,
  TemplateCategory,
  TemplateCustomization,
  UserProfile,
} from '@/lib/types/templates';

interface IndustryTemplateSystemProps {
  userProfile: UserProfile;
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  onTemplateSelect: (template: IndustryTemplate, customizations?: TemplateCustomization) => void;
  onTemplatePreview: (template: IndustryTemplate) => void;
  className?: string;
}

// Industry icons mapping
const industryIcons = {
  technology: Code,
  healthcare: Stethoscope,
  finance: Calculator,
  marketing: Megaphone,
  engineering: Wrench,
  education: BookOpen,
  consulting: Building,
  design: Palette,
  sales: TrendingUp,
  research: Lightbulb,
  legal: Shield,
  nonprofit: Users,
  government: Globe,
  default: Briefcase,
};

// Mock template data - in production, this would come from an API
const mockTemplates: IndustryTemplate[] = [
  {
    id: 'tech-swe-modern',
    name: 'Modern Software Engineer',
    industry: 'technology',
    category: 'engineering',
    experienceLevel: ['mid', 'senior'],
    description:
      'Clean, technical resume optimized for software engineering roles at top tech companies',
    features: [
      'ATS-optimized',
      'Technical skills showcase',
      'Project highlights',
      'GitHub integration',
    ],
    atsScore: 95,
    popularity: 4.8,
    usageCount: 15420,
    previewUrl: '/templates/previews/tech-swe-modern.png',
    tags: ['react', 'python', 'aws', 'agile', 'microservices'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'projects', 'skills', 'education'],
    layout: 'modern',
    colorScheme: 'blue',
    typography: 'clean',
  },
  {
    id: 'healthcare-nurse-professional',
    name: 'Professional Healthcare',
    industry: 'healthcare',
    category: 'clinical',
    experienceLevel: ['entry', 'mid', 'senior'],
    description:
      'Professional template for healthcare professionals emphasizing certifications and patient care',
    features: [
      'Certification highlights',
      'Clinical experience focus',
      'Patient care metrics',
      'Compliance ready',
    ],
    atsScore: 92,
    popularity: 4.7,
    usageCount: 8930,
    previewUrl: '/templates/previews/healthcare-nurse-professional.png',
    tags: ['nursing', 'patient-care', 'certifications', 'clinical-skills'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'certifications', 'education', 'skills'],
    layout: 'professional',
    colorScheme: 'green',
    typography: 'traditional',
  },
  {
    id: 'finance-analyst-executive',
    name: 'Executive Finance',
    industry: 'finance',
    category: 'analysis',
    experienceLevel: ['senior', 'executive'],
    description: 'Sophisticated template for finance executives and senior analysts',
    features: [
      'Financial metrics focus',
      'Leadership highlights',
      'ROI achievements',
      'Executive summary',
    ],
    atsScore: 94,
    popularity: 4.9,
    usageCount: 6750,
    previewUrl: '/templates/previews/finance-analyst-executive.png',
    tags: ['financial-analysis', 'leadership', 'roi', 'strategic-planning'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'executive-summary', 'experience', 'achievements', 'education', 'skills'],
    layout: 'executive',
    colorScheme: 'navy',
    typography: 'elegant',
  },
  {
    id: 'marketing-creative-modern',
    name: 'Creative Marketing',
    industry: 'marketing',
    category: 'creative',
    experienceLevel: ['entry', 'mid'],
    description: 'Eye-catching template for marketing professionals with creative flair',
    features: [
      'Campaign showcases',
      'Creative portfolio',
      'Metrics dashboard',
      'Brand storytelling',
    ],
    atsScore: 88,
    popularity: 4.6,
    usageCount: 12340,
    previewUrl: '/templates/previews/marketing-creative-modern.png',
    tags: ['digital-marketing', 'campaigns', 'analytics', 'creative'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'campaigns', 'skills', 'portfolio'],
    layout: 'creative',
    colorScheme: 'purple',
    typography: 'modern',
  },
  {
    id: 'consulting-strategy-premium',
    name: 'Strategy Consultant',
    industry: 'consulting',
    category: 'strategy',
    experienceLevel: ['mid', 'senior', 'executive'],
    description: 'Premium template for management consultants and strategy professionals',
    features: [
      'Case study highlights',
      'Client impact metrics',
      'Problem-solving focus',
      'Global experience',
    ],
    atsScore: 96,
    popularity: 4.9,
    usageCount: 4560,
    previewUrl: '/templates/previews/consulting-strategy-premium.png',
    tags: ['strategy', 'consulting', 'case-studies', 'client-impact'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'case-studies', 'education', 'skills'],
    layout: 'premium',
    colorScheme: 'gold',
    typography: 'elegant',
  },
];

const templateCategories: TemplateCategory[] = [
  { id: 'all', name: 'All Templates', count: mockTemplates.length },
  { id: 'ai-recommended', name: 'AI Recommended', count: 3 },
  { id: 'popular', name: 'Most Popular', count: 5 },
  { id: 'new', name: 'New Templates', count: 2 },
  {
    id: 'ats-optimized',
    name: 'ATS Optimized',
    count: mockTemplates.filter((t) => t.atsScore >= 90).length,
  },
];

export const IndustryTemplateSystem: React.FC<IndustryTemplateSystemProps> = ({
  targetIndustry,
  experienceLevel,
  onTemplateSelect,
  onTemplatePreview,
  className = '',
}) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AITemplateRecommendation[]>([]);
  const [templateAnalytics, setTemplateAnalytics] = useState<TemplateAnalytics | null>(null);
  const [customizations, setCustomizations] = useState<TemplateCustomization>({
    colorScheme: 'blue',
    typography: 'modern',
    layout: 'standard',
    sections: [],
    personalBranding: {
      includePhoto: false,
      includeSocialLinks: true,
      includePortfolio: false,
    },
  });

  // Generate AI recommendations based on user profile
  const generateAIRecommendations = useCallback(async () => {
    setIsGeneratingRecommendations(true);

    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const recommendations: AITemplateRecommendation[] = [
        {
          templateId: 'tech-swe-modern',
          confidence: 0.95,
          reasoning:
            'Perfect match for your software engineering background and target role at tech companies',
          expectedImprovements: {
            atsScore: 15,
            interviewRate: 25,
            responseRate: 30,
          },
          customizationSuggestions: [
            'Highlight your React and Python experience',
            'Add your GitHub portfolio link',
            'Emphasize your microservices architecture experience',
          ],
          industryAlignment: 0.9,
          roleAlignment: 0.95,
          experienceAlignment: 0.85,
        },
        {
          templateId: 'consulting-strategy-premium',
          confidence: 0.78,
          reasoning:
            'Your analytical skills and problem-solving experience align well with consulting templates',
          expectedImprovements: {
            atsScore: 12,
            interviewRate: 20,
            responseRate: 18,
          },
          customizationSuggestions: [
            'Focus on quantifiable business impact',
            'Highlight cross-functional collaboration',
            'Emphasize strategic thinking capabilities',
          ],
          industryAlignment: 0.8,
          roleAlignment: 0.85,
          experienceAlignment: 0.7,
        },
      ];

      setAiRecommendations(recommendations);

      toast({
        title: 'AI Recommendations Generated',
        description: `Found ${recommendations.length} templates optimized for your profile`,
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to generate AI recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }, [toast]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let filtered = mockTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'ai-recommended': {
          const recommendedIds = aiRecommendations.map((r) => r.templateId);
          filtered = filtered.filter((t) => recommendedIds.includes(t.id));
          break;
        }
        case 'popular':
          filtered = filtered.filter((t) => t.popularity >= 4.7);
          break;
        case 'new':
          filtered = filtered.slice(-2); // Last 2 templates as "new"
          break;
        case 'ats-optimized':
          filtered = filtered.filter((t) => t.atsScore >= 90);
          break;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.industry.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by user criteria
    if (targetIndustry) {
      filtered = filtered.filter((t) => t.industry === targetIndustry);
    }

    if (experienceLevel) {
      filtered = filtered.filter((t) => t.experienceLevel.includes(experienceLevel));
    }

    return filtered;
  }, [selectedCategory, searchQuery, targetIndustry, experienceLevel, aiRecommendations]);

  // Get template analytics
  const getTemplateAnalytics = useCallback(async (templateId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const analytics: TemplateAnalytics = {
        templateId,
        usageStats: {
          totalDownloads: Math.floor(Math.random() * 50000) + 10000,
          successRate: Math.floor(Math.random() * 20) + 75,
          averageInterviewRate: Math.floor(Math.random() * 30) + 15,
          industryRanking: Math.floor(Math.random() * 10) + 1,
        },
        userFeedback: {
          averageRating: 4.2 + Math.random() * 0.7,
          totalReviews: Math.floor(Math.random() * 1000) + 100,
          commonPraise: ['Clean design', 'ATS-friendly', 'Easy to customize'],
          improvementSuggestions: ['More color options', 'Additional sections'],
        },
        performanceMetrics: {
          atsPassRate: Math.floor(Math.random() * 15) + 85,
          avgTimeToInterview: Math.floor(Math.random() * 10) + 5,
          responseRate: Math.floor(Math.random() * 25) + 20,
        },
      };

      setTemplateAnalytics(analytics);
    } catch (error) {
      console.error('Failed to fetch template analytics:', error);
    }
  }, []);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (template: IndustryTemplate) => {
      setSelectedTemplate(template);
      getTemplateAnalytics(template.id);
    },
    [getTemplateAnalytics]
  );

  // Handle template application
  const handleApplyTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    onTemplateSelect(selectedTemplate, customizations);

    toast({
      title: 'Template Applied',
      description: `${selectedTemplate.name} has been applied to your resume`,
    });
  }, [selectedTemplate, customizations, onTemplateSelect, toast]);

  // Generate AI recommendations on mount
  useEffect(() => {
    generateAIRecommendations();
  }, [generateAIRecommendations]);

  const getIndustryIcon = (industry: string) => {
    const IconComponent =
      industryIcons[industry as keyof typeof industryIcons] || industryIcons.default;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className={`mx-auto max-w-7xl space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Industry-Specific Template System
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Choose from professionally designed templates optimized for your industry and role
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Search Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <Input
                  placeholder="Search by industry, role, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templateCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.map((rec) => {
                    const template = mockTemplates.find((t) => t.id === rec.templateId);
                    if (!template) return null;

                    return (
                      <div key={rec.templateId} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(rec.confidence * 100)}% match
                          </Badge>
                        </div>
                        <p className="mb-2 text-gray-600 text-xs">{rec.reasoning}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span>+{rec.expectedImprovements.interviewRate}% interviews</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isGeneratingRecommendations && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 animate-pulse text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Generating AI Recommendations...</p>
                    <p className="text-gray-600 text-xs">Analyzing your profile and target role</p>
                  </div>
                </div>
                <Progress value={33} className="mt-3" />
              </CardContent>
            </Card>
          )}

          {/* Template Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => {
              const isRecommended = aiRecommendations.some((r) => r.templateId === template.id);
              const recommendation = aiRecommendations.find((r) => r.templateId === template.id);

              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  } ${isRecommended ? 'border-blue-200 bg-blue-50/50' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getIndustryIcon(template.industry)}
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {isRecommended && (
                          <Badge variant="default" className="text-xs">
                            <Brain className="mr-1 h-3 w-3" />
                            AI Pick
                          </Badge>
                        )}
                        {template.aiOptimized && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="mr-1 h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs">{template.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Preview Image Placeholder */}
                    <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-gray-100">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>

                    {/* Template Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-green-500" />
                        <span>ATS: {template.atsScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{template.popularity}/5</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-1">
                      <p className="font-medium text-xs">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* AI Recommendation Details */}
                    {recommendation && (
                      <div className="rounded bg-blue-50 p-2 text-xs">
                        <p className="font-medium text-blue-800">AI Insights:</p>
                        <p className="text-blue-700">
                          +{recommendation.expectedImprovements.interviewRate}% interview rate
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTemplatePreview(template);
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 font-medium text-lg">No Templates Found</h3>
                <p className="mb-4 text-gray-600">
                  Try adjusting your search criteria or browse different categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template Details Modal/Panel */}
      {selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getIndustryIcon(selectedTemplate.industry)}
              {selectedTemplate.name}
              <Badge variant="secondary">{selectedTemplate.industry}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="customization">Customization</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">Template Features</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">Template Sections</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.sections.map((section, index) => (
                        <Badge key={index} variant="outline">
                          {section.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleApplyTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Apply Template
                  </Button>
                  <Button variant="outline" onClick={() => onTemplatePreview(selectedTemplate)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Full Preview
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="customization" className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label className="font-medium text-sm">Color Scheme</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {['blue', 'green', 'purple', 'navy', 'gold', 'red'].map((color) => (
                        <Button
                          key={color}
                          variant={customizations.colorScheme === color ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setCustomizations((prev) => ({ ...prev, colorScheme: color as any }))
                          }
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-sm">Typography</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {['modern', 'traditional', 'elegant', 'clean'].map((typography) => (
                        <Button
                          key={typography}
                          variant={customizations.typography === typography ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setCustomizations((prev) => ({
                              ...prev,
                              typography: typography as any,
                            }))
                          }
                        >
                          {typography}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {templateAnalytics ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-blue-600">
                            {templateAnalytics.usageStats.totalDownloads.toLocaleString()}
                          </div>
                          <p className="text-gray-600 text-sm">Total Downloads</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-green-600">
                            {templateAnalytics.performanceMetrics.atsPassRate}%
                          </div>
                          <p className="text-gray-600 text-sm">ATS Pass Rate</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-purple-600">
                            {templateAnalytics.userFeedback.averageRating.toFixed(1)}
                          </div>
                          <p className="text-gray-600 text-sm">User Rating</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-gray-600">Loading analytics...</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default IndustryTemplateSystem;
