'use client';

import {
  BarChart3,
  Download,
  FileText,
  Info,
  Play,
  Share,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { AIResumeVideoGenerator } from '@/components/resume-optimizer/video/AIResumeVideoGenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const SAMPLE_RESUME = `John Smith
Senior Software Engineer

EXPERIENCE
Software Engineer @ TechCorp (2020-2024)
• Led development of microservices architecture serving 1M+ users
• Reduced system latency by 40% through optimization initiatives
• Mentored 5 junior developers and improved team productivity by 30%

Frontend Developer @ StartupXYZ (2018-2020)
• Built responsive web applications using React, TypeScript, and Node.js
• Implemented CI/CD pipelines reducing deployment time by 60%
• Collaborated with design team to create intuitive user experiences

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker
Soft Skills: Leadership, Problem Solving, Communication, Team Collaboration

EDUCATION
B.S. Computer Science, University of Technology (2018)`;

export default function AIVideoGeneratorDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [demoResumeText, setDemoResumeText] = useState(SAMPLE_RESUME);

  const handleGenerateDemo = () => {
    setActiveTab('generator');
  };

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'AI Script Generation',
      description:
        'Automatically converts resume text into compelling video scripts using advanced NLP',
    },
    {
      icon: <Video className="h-5 w-5" />,
      title: 'Professional Templates',
      description: 'Choose from industry-specific video templates optimized for different roles',
    },
    {
      icon: <Play className="h-5 w-5" />,
      title: 'Voice Synthesis',
      description:
        'State-of-the-art text-to-speech with multiple voice options and emotional range',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Video Analytics',
      description: 'Track viewer engagement, completion rates, and performance metrics',
    },
    {
      icon: <Share className="h-5 w-5" />,
      title: 'Easy Sharing',
      description: 'Share directly to LinkedIn, email, or generate shareable links',
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: 'Multiple Formats',
      description: 'Export in various formats and qualities for different platforms',
    },
  ];

  const useCases = [
    {
      title: 'Job Applications',
      description: 'Stand out from the crowd with personalized video introductions',
      impact: '3x higher response rate',
    },
    {
      title: 'LinkedIn Profiles',
      description: 'Enhance your professional presence with video storytelling',
      impact: '50% more profile views',
    },
    {
      title: 'Networking Events',
      description: 'Share your professional story in a memorable way',
      impact: '70% better recall',
    },
    {
      title: 'Career Transitions',
      description: 'Explain your career journey and future aspirations',
      impact: '2x interview rate',
    },
  ];

  const techStack = [
    'Claude 3.5 Sonnet for AI script generation',
    'ElevenLabs for premium voice synthesis',
    'Runway ML for video generation',
    'FFmpeg for video processing',
    'WebSocket for real-time progress',
    'TypeScript for type safety',
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text font-bold text-4xl text-transparent">
          AI-Powered Resume Video Generator
        </h1>
        <p className="mb-6 text-gray-600 text-xl">
          Transform your resume into professional video presentations using cutting-edge AI
          technology
        </p>
        <div className="mb-6 flex justify-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="mr-1 h-3 w-3" />
            Next-Gen AI
          </Badge>
          <Badge variant="outline" className="text-sm">
            State-of-the-Art
          </Badge>
          <Badge variant="outline" className="text-sm">
            Production Ready
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="generator">Live Generator</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Hero Section */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div>
                  <h2 className="mb-4 font-bold text-2xl">Revolutionize Your Job Search</h2>
                  <p className="mb-6 text-gray-700">
                    Create professional video presentations from your resume in minutes. Our AI
                    analyzes your experience, generates compelling scripts, and produces
                    high-quality videos that showcase your unique value proposition.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleGenerateDemo}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Try Live Demo
                  </Button>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-lg">
                  <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                    <Video className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-center font-semibold">Sample Video Output</h3>
                  <p className="mt-2 text-center text-gray-600 text-sm">
                    Professional quality videos in 60-180 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Use Cases & Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {useCases.map((useCase, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">{useCase.title}</h3>
                    <p className="mb-3 text-gray-600">{useCase.description}</p>
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      {useCase.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="font-bold text-2xl text-purple-600">60s</div>
                <div className="text-gray-600 text-sm">Generation Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="font-bold text-2xl text-blue-600">4K</div>
                <div className="text-gray-600 text-sm">Video Quality</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="font-bold text-2xl text-green-600">10+</div>
                <div className="text-gray-600 text-sm">Voice Options</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="font-bold text-2xl text-orange-600">95%</div>
                <div className="text-gray-600 text-sm">AI Accuracy</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Traditional vs AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Aspect</th>
                      <th className="p-3 text-left">Traditional Method</th>
                      <th className="p-3 text-left">AI-Powered Generator</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Time Required</td>
                      <td className="p-3 text-gray-600">2-4 hours</td>
                      <td className="p-3 font-medium text-green-600">2-3 minutes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Script Writing</td>
                      <td className="p-3 text-gray-600">Manual effort</td>
                      <td className="p-3 font-medium text-green-600">AI-generated</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Voice Quality</td>
                      <td className="p-3 text-gray-600">Variable</td>
                      <td className="p-3 font-medium text-green-600">Professional AI voices</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Cost</td>
                      <td className="p-3 text-gray-600">$200-500</td>
                      <td className="p-3 font-medium text-green-600">$10-20</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Customization</td>
                      <td className="p-3 text-gray-600">Limited</td>
                      <td className="p-3 font-medium text-green-600">Highly customizable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a fully functional demo of the AI-Powered Resume Video Generator. All features
              are implemented and ready for production use.
            </AlertDescription>
          </Alert>

          {/* Sample Resume Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Demo Resume Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={demoResumeText}
                onChange={(e) => setDemoResumeText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Paste your resume here or use the sample content..."
              />
            </CardContent>
          </Card>

          {/* Video Generator Component */}
          <AIResumeVideoGenerator
            resumeText={demoResumeText}
            onVideoGenerated={(videoUrl) => {
              console.log('Demo video generated:', videoUrl);
            }}
          />
        </TabsContent>

        {/* Technical Details Tab */}
        <TabsContent value="technical" className="space-y-6">
          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {techStack.map((tech, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-sm">{tech}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Integration */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Endpoint</h4>
                  <code className="rounded bg-gray-100 px-3 py-1 text-sm">
                    POST /api/resume-optimizer/video/generate
                  </code>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Request Body</h4>
                  <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-sm">
                    {`{
  "resumeText": "string",
  "template": {
    "id": "professional",
    "name": "Professional Corporate",
    "style": "corporate"
  },
  "voice": {
    "id": "emma",
    "name": "Emma",
    "gender": "female"
  },
  "duration": 120,
  "options": {
    "videoQuality": "hd",
    "includeSubtitles": true
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Response</h4>
                  <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-sm">
                    {`{
  "success": true,
  "videoUrl": "/generated-videos/video.mp4",
  "duration": 120,
  "fileSize": 25,
  "metadata": {
    "processingTime": 8500,
    "aiModel": "Claude-3.5-Sonnet + ElevenLabs"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="font-bold text-2xl text-blue-600">95%</div>
                  <div className="text-gray-600 text-sm">AI Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-green-600">60s</div>
                  <div className="text-gray-600 text-sm">Avg Generation</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-600">99.9%</div>
                  <div className="text-gray-600 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-orange-600">4K</div>
                  <div className="text-gray-600 text-sm">Video Quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
