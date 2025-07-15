'use client';

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { CompanyInsight } from '@/lib/types';
import { researchCompany } from '@/services/interviewService';

interface CompanyResearchProps {
  onBack: () => void;
  isGuestMode?: boolean;
}

export function CompanyResearch({ onBack, isGuestMode }: CompanyResearchProps) {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!companyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a company name to research.',
        variant: 'destructive',
      });
      return;
    }

    if (isGuestMode) {
      // Show demo data for guest mode
      setCompanyData(getMockCompanyData(companyName));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await researchCompany({
        companyName,
        includeNews: true,
        includeFinancials: true,
        includePeople: true,
      });
      setCompanyData(result);
      toast({
        title: 'Research Complete',
        description: `Successfully researched ${companyName}`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to research company');
      setCompanyData(getMockCompanyData(companyName)); // Fallback to demo data
      toast({
        title: 'Using Demo Data',
        description: 'Research service unavailable, showing sample data.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockCompanyData = (name: string): CompanyInsight => ({
    id: 'mock-1',
    companyName: name,
    industry: 'Technology',
    description: `${name} is a leading technology company focused on innovation and digital transformation. The company has established itself as a key player in the industry with a strong commitment to excellence and customer satisfaction.`,
    recentNews: [
      {
        title: `${name} announces Q4 2023 financial results`,
        url: '#',
        publishedAt: '2024-01-15T00:00:00Z',
        source: 'TechCrunch',
        summary: 'Strong revenue growth and strategic partnerships announced.',
      },
      {
        title: `${name} launches new product line`,
        url: '#',
        publishedAt: '2024-01-10T00:00:00Z',
        source: 'Business Wire',
        summary: 'Expanding into new markets with innovative solutions.',
      },
      {
        title: `${name} receives industry award for innovation`,
        url: '#',
        publishedAt: '2024-01-05T00:00:00Z',
        source: 'Industry Today',
        summary: 'Recognition for outstanding technological achievements.',
      },
    ],
    keyPeople: [
      {
        name: 'Sarah Johnson',
        title: 'Chief Executive Officer',
        linkedinUrl: '#',
        bio: 'Experienced technology leader with 15+ years in the industry.',
      },
      {
        name: 'Michael Chen',
        title: 'Chief Technology Officer',
        linkedinUrl: '#',
        bio: 'Innovation-focused executive driving digital transformation.',
      },
      {
        name: 'Emily Rodriguez',
        title: 'Head of People Operations',
        linkedinUrl: '#',
        bio: 'HR leader passionate about building inclusive workplaces.',
      },
    ],
    financialHighlights: [
      {
        metric: 'Revenue',
        value: '$2.5B',
        period: '2023',
        change: '+12%',
      },
      {
        metric: 'Employees',
        value: '15,000+',
        period: '2024',
        change: '+8%',
      },
      {
        metric: 'Market Cap',
        value: '$45B',
        period: 'Current',
        change: '+18%',
      },
    ],
    cultureKeywords: ['Innovation', 'Collaboration', 'Diversity', 'Growth', 'Excellence'],
    interviewTips: [
      "Prepare examples of how you've driven innovation in previous roles",
      'Research their latest product launches and technical challenges',
      'Be ready to discuss how you work in collaborative, fast-paced environments',
      'Understand their mission and how your values align',
    ],
    commonQuestions: [
      'How do you stay current with technology trends?',
      'Describe a time when you had to learn a new technology quickly.',
      'How do you approach problem-solving in a team environment?',
    ],
    glassdoorRating: 4.2,
    linkedinFollowers: 250000,
    website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
    headquarters: 'San Francisco, CA',
    foundedYear: 2010,
    employeeCount: '10,001-50,000',
    competitors: ['TechCorp', 'InnovateCo', 'DigitalSolutions'],
    lastUpdated: new Date().toISOString(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="font-bold text-2xl">Company Research</h2>
          <p className="text-muted-foreground">
            Get comprehensive insights about your target company
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Research a Company
          </CardTitle>
          <CardDescription>Enter a company name to get detailed research insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <div className="flex space-x-2">
              <Input
                id="company-name"
                placeholder="e.g., Google, Microsoft, Apple"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              />
              <Button onClick={handleResearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Research
              </Button>
            </div>
          </div>

          {isGuestMode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Demo Mode</AlertTitle>
              <AlertDescription>
                Sign in to access real-time company research. Demo data will be shown for preview.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Research Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Company Research Results */}
      {companyData && (
        <div className="space-y-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  {companyData.companyName}
                </div>
                <div className="flex items-center space-x-2">
                  {companyData.glassdoorRating && (
                    <Badge variant="secondary" className="flex items-center">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {companyData.glassdoorRating}
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {companyData.headquarters}
                </span>
                <span>{companyData.industry}</span>
                <span>Founded {companyData.foundedYear}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{companyData.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {companyData.cultureKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Highlights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Financial Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {companyData.financialHighlights.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="font-bold text-2xl">{item.value}</div>
                    <div className="text-muted-foreground text-sm">{item.metric}</div>
                    {item.change && (
                      <div
                        className={`text-sm ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {item.change} YoY
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent News */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent News
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyData.recentNews.map((news, index) => (
                <div key={index} className="border-blue-500 border-l-4 pl-4">
                  <h4 className="font-medium">{news.title}</h4>
                  <p className="text-muted-foreground text-sm">{news.summary}</p>
                  <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
                    <span>{news.source}</span>
                    <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key People */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Key People
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companyData.keyPeople.map((person, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h4 className="font-medium">{person.name}</h4>
                    <p className="text-primary text-sm">{person.title}</p>
                    <p className="mt-2 text-muted-foreground text-xs">{person.bio}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Interview Tips for {companyData.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companyData.interviewTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Likely Interview Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companyData.commonQuestions.map((question, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <p className="text-sm">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
