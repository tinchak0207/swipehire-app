/**
 * SmartTemplates Component
 *
 * Provides AI-powered template suggestions based on:
 * - Target role and industry
 * - Experience level
 * - Skills and qualifications
 * - Current market trends
 *
 * Features:
 * - Personalized template recommendations
 * - Real-time preview
 * - Template comparison
 * - One-click application
 * - Mobile-responsive design
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, TrendingUp } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  bestFor: string[];
  popularity: number;
  matchScore: number;
  previewImage: string;
  features: string[];
}

interface SmartTemplatesProps {
  targetRole: string;
  targetIndustry: string;
  experienceLevel: string;
  currentSkills: string[];
  onTemplateSelect: (templateId: string) => void;
}

const SmartTemplates: React.FC<SmartTemplatesProps> = ({
  targetRole,
  targetIndustry,
  experienceLevel,
  onTemplateSelect,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate fetching templates based on user profile
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);

      // Mock template data
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Executive Professional',
          description: 'Clean, sophisticated design for senior-level positions',
          category: 'Professional',
          bestFor: ['Management', 'Director', 'VP roles'],
          popularity: 92,
          matchScore: 95,
          previewImage: '/templates/executive.png',
          features: [
            'Single column',
            'Minimal design',
            'ATS optimized',
            'Executive summary section',
          ],
        },
        {
          id: '2',
          name: 'Creative Portfolio',
          description: 'Modern layout with visual elements for creative professionals',
          category: 'Creative',
          bestFor: ['Design', 'Marketing', 'Media'],
          popularity: 87,
          matchScore: 82,
          previewImage: '/templates/creative.png',
          features: ['Two columns', 'Visual elements', 'Portfolio section', 'Color accents'],
        },
        {
          id: '3',
          name: 'Tech Developer',
          description: 'Technical focus with skills and project highlights',
          category: 'Technical',
          bestFor: ['Software Engineer', 'Developer', 'Data Scientist'],
          popularity: 95,
          matchScore: 98,
          previewImage: '/templates/tech.png',
          features: [
            'Skills matrix',
            'Project showcase',
            'GitHub integration',
            'Technical summary',
          ],
        },
        {
          id: '4',
          name: 'Academic Research',
          description: 'Emphasis on publications, research, and education',
          category: 'Academic',
          bestFor: ['Research', 'Education', 'Scientific roles'],
          popularity: 76,
          matchScore: 75,
          previewImage: '/templates/academic.png',
          features: [
            'Publication list',
            'Research highlights',
            'Grant funding',
            'Conference presentations',
          ],
        },
        {
          id: '5',
          name: 'Modern Minimalist',
          description: 'Clean, modern design with focus on content',
          category: 'Modern',
          bestFor: ['All roles', 'Career changers', 'Recent graduates'],
          popularity: 88,
          matchScore: 85,
          previewImage: '/templates/minimalist.png',
          features: ['ATS optimized', 'Clean design', 'Easy to customize', 'Universal appeal'],
        },
        {
          id: '6',
          name: 'Business Professional',
          description: 'Traditional business format with modern touches',
          category: 'Business',
          bestFor: ['Finance', 'Consulting', 'Sales', 'Operations'],
          popularity: 90,
          matchScore: 89,
          previewImage: '/templates/business.png',
          features: [
            'Quantified achievements',
            'Leadership section',
            'Business metrics',
            'Professional summary',
          ],
        },
      ];

      // Simulate AI recommendation logic
      const recommended = [...mockTemplates]
        .sort((a, b) => {
          // Higher match score first
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          // Then by popularity
          return b.popularity - a.popularity;
        })
        .slice(0, 3);

      setTemplates(mockTemplates);
      setRecommendedTemplates(recommended);
      setLoading(false);
    };

    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect(templateId);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-blue-500 border-t-2 border-b-2" />
        <span className="ml-3">Finding the perfect templates for you...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white"
      >
        <div className="flex items-start">
          <Sparkles className="mt-1 mr-2 h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-xl">AI-Powered Template Recommendations</h3>
            <p className="mt-1 opacity-90">
              Based on your profile as a {experienceLevel}-level {targetRole} in {targetIndustry},
              we've identified the templates that will maximize your impact.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recommended Templates */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-xl">Recommended For You</h2>
          <Badge variant="secondary" className="flex items-center">
            <TrendingUp className="mr-1 h-3 w-3" />
            AI-Powered
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AnimatePresence>
            {recommendedTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {template.name}
                          {selectedTemplate === template.id && (
                            <Check className="ml-2 h-4 w-4 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                        <span className="text-gray-500">Template Preview</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Match Score</span>
                        <Badge variant="default">{template.matchScore}%</Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Key Features:</h4>
                        <ul className="space-y-1 text-xs">
                          {template.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <Check className="mr-1 h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template.id);
                        }}
                      >
                        {selectedTemplate === template.id ? 'Selected' : 'Use Template'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* All Templates */}
      <section>
        <h2 className="mb-4 font-bold text-xl">All Templates</h2>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {template.name}
                          {selectedTemplate === template.id && (
                            <Check className="ml-2 h-4 w-4 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                        <span className="text-gray-500">Template Preview</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Match Score</span>
                        <Badge variant="default">{template.matchScore}%</Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Best For:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.bestFor.slice(0, 2).map((role, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template.id);
                        }}
                      >
                        {selectedTemplate === template.id ? 'Selected' : 'Use Template'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="professional" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates
                .filter((t) => t.category === 'Professional')
                .map((template) => (
                  <Card
                    key={template.id}
                    className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            {template.name}
                            {selectedTemplate === template.id && (
                              <Check className="ml-2 h-4 w-4 text-green-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                          <span className="text-gray-500">Template Preview</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Match Score</span>
                          <Badge variant="default">{template.matchScore}%</Badge>
                        </div>

                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template.id);
                          }}
                        >
                          {selectedTemplate === template.id ? 'Selected' : 'Use Template'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Other tabs would follow the same pattern */}
        </Tabs>
      </section>
    </div>
  );
};

export default SmartTemplates;
