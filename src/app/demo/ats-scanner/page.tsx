'use client';

import { BarChart3, FileText, Play, Settings, Shield, Sparkles, Target, Zap } from 'lucide-react';
import { useState } from 'react';
import { RealTimeATSScanner } from '@/components/resume-optimizer/ats/RealTimeATSScanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const SAMPLE_RESUMES = {
  tech: `John Smith
Software Engineer
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years developing web applications using React, Node.js, and Python. Passionate about creating scalable solutions and improving user experience.

WORK EXPERIENCE
Software Engineer | TechCorp Inc. | 2020 - Present
• Developed responsive web applications using React and TypeScript
• Collaborated with cross-functional teams to deliver features
• Improved application performance by 30%
• Mentored junior developers

Junior Developer | StartupXYZ | 2019 - 2020
• Built REST APIs using Node.js and Express
• Worked on database optimization
• Participated in agile development process

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2019

SKILLS
Programming: JavaScript, Python, TypeScript, Java
Frameworks: React, Node.js, Express, Django
Databases: PostgreSQL, MongoDB
Tools: Git, Docker, AWS`,

  marketing: `Sarah Johnson
Digital Marketing Specialist
sarah.j@email.com | (555) 987-6543

Summary
Marketing professional with experience in digital campaigns and social media management.

Experience
Marketing Coordinator | ABC Company | 2021-Present
- Managed social media accounts
- Created marketing materials
- Helped with campaigns

Marketing Intern | XYZ Agency | 2020-2021
- Assisted with various tasks
- Learned about marketing

Education
Bachelor's Degree in Marketing | State University | 2020

Skills
Social media, marketing, communication`,

  finance: `Michael Chen, CFA
Senior Financial Analyst
m.chen@finance.com | (555) 456-7890 | linkedin.com/in/michaelchen

PROFESSIONAL SUMMARY
Results-driven Senior Financial Analyst with 7+ years of experience in investment analysis, financial modeling, and portfolio management. CFA charterholder with proven track record of generating alpha through quantitative research and risk assessment.

PROFESSIONAL EXPERIENCE

Senior Financial Analyst | Goldman Sachs | 2019 - Present
• Conducted comprehensive financial analysis for $2.5B equity portfolio
• Developed DCF and comparable company analysis models for 50+ securities
• Generated 15% alpha through sector rotation and security selection strategies
• Collaborated with portfolio managers to optimize risk-adjusted returns
• Presented investment recommendations to senior management and clients

Financial Analyst | JPMorgan Chase | 2017 - 2019
• Performed fundamental analysis on mid-cap technology and healthcare stocks
• Built Monte Carlo simulation models for risk assessment and scenario analysis
• Achieved 18% annual return through systematic value investing approach
• Monitored portfolio performance and implemented rebalancing strategies

EDUCATION
Master of Business Administration (Finance) | Wharton School | 2017
Bachelor of Science in Economics | University of Chicago | 2015

CERTIFICATIONS
• Chartered Financial Analyst (CFA) | 2018
• Financial Risk Manager (FRM) | 2019

TECHNICAL SKILLS
Financial Modeling: Excel, Python, R, MATLAB, Bloomberg Terminal
Analysis: DCF, Comparable Company Analysis, Monte Carlo Simulation
Software: FactSet, Capital IQ, Morningstar Direct, VBA Programming`,
};

const SAMPLE_JOB_DESCRIPTIONS = {
  tech: `We are seeking a Senior Software Engineer to join our growing team. The ideal candidate will have:

- 5+ years of experience in full-stack development
- Proficiency in React, Node.js, TypeScript, and cloud platforms (AWS/Azure)
- Experience with microservices architecture and containerization (Docker, Kubernetes)
- Strong understanding of software engineering best practices
- Experience with agile/scrum methodologies
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Design and develop scalable web applications
- Collaborate with product managers and designers
- Mentor junior developers
- Participate in code reviews and technical discussions
- Contribute to architecture decisions`,

  marketing: `Digital Marketing Manager - Growing SaaS Company

We're looking for an experienced Digital Marketing Manager to drive our online presence and lead generation efforts.

Requirements:
- 5+ years of digital marketing experience
- Expertise in SEO/SEM, content marketing, and marketing automation
- Experience with HubSpot, Google Analytics, and social media platforms
- Strong analytical skills and data-driven approach
- Experience in B2B SaaS marketing preferred
- Bachelor's degree in Marketing, Communications, or related field

Key Responsibilities:
- Develop and execute comprehensive digital marketing strategies
- Manage multi-channel campaigns (email, social, PPC, content)
- Optimize conversion rates and customer acquisition costs
- Lead marketing automation and nurture campaigns
- Collaborate with sales team to align on lead quality and conversion`,

  finance: `Senior Investment Analyst - Hedge Fund

Elite hedge fund seeking a Senior Investment Analyst to join our equity research team.

Requirements:
- CFA designation required
- 5+ years of buy-side or sell-side equity research experience
- Strong financial modeling and valuation skills
- Experience with alternative data and quantitative analysis
- Python/R programming skills preferred
- Advanced degree in Finance, Economics, or related field

Responsibilities:
- Conduct fundamental analysis on large-cap equities
- Build comprehensive financial models and perform valuation analysis
- Generate actionable investment ideas and recommendations
- Present research findings to portfolio managers and investment committee
- Monitor portfolio positions and market developments`,
};

export default function ATSScannerDemo() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior' | 'executive'>(
    'mid'
  );
  const [selectedDemo, setSelectedDemo] = useState<keyof typeof SAMPLE_RESUMES>('tech');

  const loadSampleResume = (type: keyof typeof SAMPLE_RESUMES) => {
    setSelectedDemo(type);
    setResumeText(SAMPLE_RESUMES[type]);
    setJobDescription(SAMPLE_JOB_DESCRIPTIONS[type]);

    // Set appropriate defaults based on sample
    switch (type) {
      case 'tech':
        setTargetRole('Senior Software Engineer');
        setTargetIndustry('Technology');
        setExperienceLevel('senior');
        break;
      case 'marketing':
        setTargetRole('Digital Marketing Manager');
        setTargetIndustry('Marketing');
        setExperienceLevel('mid');
        break;
      case 'finance':
        setTargetRole('Senior Investment Analyst');
        setTargetIndustry('Finance');
        setExperienceLevel('senior');
        break;
    }
  };

  const clearAll = () => {
    setResumeText('');
    setTargetRole('');
    setTargetIndustry('');
    setJobDescription('');
    setExperienceLevel('mid');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-bold text-4xl text-transparent">
              AI-Powered ATS Scanner
            </h1>
          </div>
          <p className="mx-auto max-w-3xl text-gray-600 text-xl">
            State-of-the-art Applicant Tracking System compatibility analysis with real-time
            scoring, intelligent suggestions, and industry-specific optimization recommendations.
          </p>

          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="mr-2 h-4 w-4" />
              Real-time Analysis
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="mr-2 h-4 w-4" />
              ATS Optimized
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Target className="mr-2 h-4 w-4" />
              Industry Specific
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="demo" className="space-x-2">
              <Play className="h-4 w-4" />
              <span>Live Demo</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Analysis Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sample Resume Loader */}
                <div className="space-y-3">
                  <Label>Quick Start with Sample Resume</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedDemo === 'tech' ? 'default' : 'outline'}
                      onClick={() => loadSampleResume('tech')}
                      className="space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Tech Resume</span>
                    </Button>
                    <Button
                      variant={selectedDemo === 'marketing' ? 'default' : 'outline'}
                      onClick={() => loadSampleResume('marketing')}
                      className="space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Marketing Resume</span>
                    </Button>
                    <Button
                      variant={selectedDemo === 'finance' ? 'default' : 'outline'}
                      onClick={() => loadSampleResume('finance')}
                      className="space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Finance Resume</span>
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Resume Input */}
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Text</Label>
                  <Textarea
                    id="resume"
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                {/* Target Role and Industry */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Target Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Senior Software Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Target Industry</Label>
                    <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={(value: any) => setExperienceLevel(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
                      <SelectItem value="executive">Executive Level (15+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="job-desc">Job Description (Optional)</Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Paste the job description to get targeted recommendations..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            {resumeText ? (
              <RealTimeATSScanner
                resumeText={resumeText}
                targetRole={targetRole}
                targetIndustry={targetIndustry}
                jobDescription={jobDescription}
                experienceLevel={experienceLevel}
                onSuggestionApplied={(suggestion) => {
                  console.log('Applied suggestion:', suggestion);
                  // Here you could update the resume text with the applied suggestion
                }}
              />
            ) : (
              <Card className="border-2 border-gray-300 border-dashed">
                <CardContent className="py-12 pt-6 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-xl">No Resume Content</h3>
                  <p className="mx-auto mb-6 max-w-md text-gray-600">
                    Add resume content in the Configuration tab or load a sample resume to see the
                    ATS scanner in action.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={() => loadSampleResume('tech')} variant="default">
                      Load Tech Sample
                    </Button>
                    <Button onClick={() => loadSampleResume('finance')} variant="outline">
                      Load Finance Sample
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-center">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full bg-blue-100 p-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium">Real-time Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Instant ATS compatibility scoring as you type with live feedback
                </p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full bg-green-100 p-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">Smart Suggestions</h4>
                <p className="text-gray-600 text-sm">
                  AI-powered recommendations with before/after examples and impact scoring
                </p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full bg-purple-100 p-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">Section Breakdown</h4>
                <p className="text-gray-600 text-sm">
                  Detailed analysis of formatting, keywords, structure, and readability
                </p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full bg-orange-100 p-3">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-medium">Risk Assessment</h4>
                <p className="text-gray-600 text-sm">
                  Identify and mitigate factors that could harm ATS parsing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
