import type { Metadata } from 'next';
import { AIEnhancedResumeOptimizer } from '@/components/resume-optimizer/AIEnhancedResumeOptimizer';

export const metadata: Metadata = {
  title: 'AI-Enhanced Resume Optimizer Demo | SwipeHire',
  description:
    'Experience our state-of-the-art AI-powered resume optimization tool that analyzes and improves your resume for maximum impact.',
  keywords: 'AI resume optimizer, resume analysis, ATS optimization, career tools, job search',
};

export default function AIResumeOptimizerDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">AI-Enhanced Resume Optimizer</h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-xl">
            Leverage cutting-edge artificial intelligence to analyze, optimize, and enhance your
            resume for maximum impact with hiring managers and ATS systems.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="rounded-lg border bg-white px-4 py-2 shadow-sm">
              <div className="font-medium text-gray-900 text-sm">🧠 Advanced AI Analysis</div>
              <div className="text-gray-500 text-xs">Mistral Large Latest</div>
            </div>
            <div className="rounded-lg border bg-white px-4 py-2 shadow-sm">
              <div className="font-medium text-gray-900 text-sm">⚡ Real-time Processing</div>
              <div className="text-gray-500 text-xs">30-60 seconds</div>
            </div>
            <div className="rounded-lg border bg-white px-4 py-2 shadow-sm">
              <div className="font-medium text-gray-900 text-sm">🎯 ATS Optimization</div>
              <div className="text-gray-500 text-xs">Industry Standard</div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Keyword Analysis</h3>
            <p className="text-gray-600 text-sm">
              AI-powered keyword matching and optimization for better ATS compatibility
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Grammar & Style</h3>
            <p className="text-gray-600 text-sm">
              Advanced grammar checking and professional writing style analysis
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Format Optimization</h3>
            <p className="text-gray-600 text-sm">
              Structure and formatting analysis for maximum readability and ATS parsing
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Impact Metrics</h3>
            <p className="text-gray-600 text-sm">
              Quantitative achievement analysis and suggestions for stronger impact
            </p>
          </div>
        </div>

        {/* Main Component */}
        <AIEnhancedResumeOptimizer />

        {/* How It Works Section */}
        <div className="mt-16 rounded-lg border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-center font-bold text-2xl text-gray-900">
            How Our AI Analysis Works
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <span className="font-bold text-2xl text-blue-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Input Analysis</h3>
              <p className="text-gray-600 text-sm">
                Our AI analyzes your resume content and target job requirements using advanced
                natural language processing techniques.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="font-bold text-2xl text-green-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Multi-Dimensional Scoring</h3>
              <p className="text-gray-600 text-sm">
                We evaluate keywords, grammar, format, and quantitative achievements using
                state-of-the-art AI models for comprehensive analysis.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <span className="font-bold text-2xl text-purple-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Actionable Recommendations</h3>
              <p className="text-gray-600 text-sm">
                Receive prioritized, specific suggestions with estimated impact scores to maximize
                your resume's effectiveness.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 rounded-lg bg-gray-50 p-8">
          <h2 className="mb-6 text-center font-bold text-2xl text-gray-900">
            Powered by State-of-the-Art Technology
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">AI Technology Stack</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-blue-500" />
                  Mistral Large Latest - Advanced language model
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-green-500" />
                  Natural Language Processing for content analysis
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                  Machine Learning for pattern recognition
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-orange-500" />
                  Semantic analysis for keyword optimization
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Analysis Capabilities</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-red-500" />
                  ATS compatibility scoring and optimization
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-yellow-500" />
                  Grammar and readability assessment
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-indigo-500" />
                  Quantitative achievement identification
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-pink-500" />
                  Industry-specific keyword analysis
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Data Section */}
        <div className="mt-12 rounded-lg bg-blue-50 p-8">
          <h2 className="mb-4 text-center font-bold text-2xl text-gray-900">
            Try It Out with Sample Data
          </h2>
          <p className="mb-6 text-center text-gray-600">
            Don't have a resume ready? Use our sample data to see the AI analysis in action.
          </p>

          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Sample Resume (Software Engineer)</h3>
            <div className="max-h-48 overflow-y-auto rounded bg-gray-50 p-4 font-mono text-gray-700 text-sm">
              {`John Doe
Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-2023
• Developed React applications serving 100,000+ users
• Improved system performance by 40% through optimization
• Led a team of 5 developers on critical projects

Software Engineer | StartupXYZ | 2018-2020
• Built scalable Node.js APIs handling 1M+ requests daily
• Implemented CI/CD pipelines reducing deployment time by 60%

EDUCATION
Bachelor of Science in Computer Science | University ABC | 2018

SKILLS
JavaScript, TypeScript, React, Node.js, AWS, Docker, Kubernetes`}
            </div>

            <div className="mt-4">
              <h4 className="mb-2 font-medium text-gray-900">Sample Target Job:</h4>
              <p className="text-gray-600 text-sm">
                <strong>Title:</strong> Senior Full Stack Developer
                <br />
                <strong>Company:</strong> Google
                <br />
                <strong>Keywords:</strong> React, Node.js, TypeScript, AWS, Docker, Kubernetes,
                Python, GraphQL
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This AI-enhanced resume optimizer represents the latest in career technology, helping
            job seekers optimize their resumes for maximum impact in today's competitive market.
          </p>
        </div>
      </div>
    </div>
  );
}
