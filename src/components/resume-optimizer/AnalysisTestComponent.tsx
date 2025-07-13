/**
 * Resume Analysis Test Component
 * Comprehensive testing component for the backend AI integration
 * Tests various scenarios including error handling and different resume lengths
 */

'use client';

import type React from 'react';
import { useState } from 'react';
import type { TargetJobInfo } from '@/lib/types/resume-optimizer';
import { AnalysisRequestComponent } from './AnalysisRequestComponent';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  resumeText: string;
  targetJob: TargetJobInfo;
  expectedBehavior: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'valid-long',
    name: 'Valid Long Resume',
    description: 'A comprehensive resume with all sections',
    resumeText: `John Smith
Email: john.smith@email.com | Phone: (555) 123-4567 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience developing scalable web applications and systems. Proficient in modern programming languages and frameworks with a strong focus on clean code and best practices. Led multiple cross-functional teams and delivered high-impact projects that improved user experience and system performance.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java, Go
• Frontend: React, Vue.js, Angular, HTML5, CSS3, Tailwind CSS, Next.js
• Backend: Node.js, Express, Django, Spring Boot, FastAPI, GraphQL
• Databases: PostgreSQL, MongoDB, MySQL, Redis, Elasticsearch
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Jenkins, Terraform
• Tools: Git, Jest, Webpack, VS Code, Postman, Jira

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | March 2021 - Present
San Francisco, CA
• Developed and maintained web applications serving 100,000+ users daily
• Led technical architecture decisions for microservices platform migration
• Improved application performance by 40% through code optimization and caching strategies
• Mentored 3 junior developers and conducted regular code reviews
• Collaborated with product managers and designers to deliver features on time
• Implemented automated testing that reduced bug reports by 60%

Software Engineer | StartupXYZ | June 2019 - February 2021
San Francisco, CA
• Built responsive web interfaces using React and modern JavaScript
• Implemented RESTful APIs and microservices architecture
• Wrote comprehensive unit and integration tests achieving 90% code coverage
• Participated in agile development processes and sprint planning
• Contributed to open-source projects and technical documentation

Junior Software Developer | DevSolutions | August 2018 - May 2019
San Francisco, CA
• Developed web applications using HTML, CSS, JavaScript, and PHP
• Assisted in database design and optimization
• Fixed bugs and implemented minor feature enhancements
• Learned modern development practices and version control

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2018
GPA: 3.7/4.0
Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems

PROJECTS
E-commerce Platform | React, Node.js, PostgreSQL | 2021
• Built full-stack e-commerce application with payment integration
• Implemented user authentication, product catalog, and order management
• Deployed on AWS with CI/CD pipeline

Task Management App | Vue.js, Express, MongoDB | 2020
• Created collaborative task management application
• Implemented real-time updates using WebSockets
• Designed responsive UI with mobile-first approach

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate | 2022
• Google Cloud Professional Developer | 2021`,
    targetJob: {
      title: 'Senior Software Engineer',
      keywords:
        'React, Node.js, JavaScript, TypeScript, AWS, Docker, Kubernetes, microservices, API development',
      description:
        'We are looking for a Senior Software Engineer to join our team and help build scalable web applications.',
      company: 'Tech Innovations Inc.',
    },
    expectedBehavior: 'Should successfully analyze and provide comprehensive feedback',
  },
  {
    id: 'valid-short',
    name: 'Valid Short Resume',
    description: 'A minimal but valid resume',
    resumeText: `Jane Doe
jane.doe@email.com | (555) 987-6543

SUMMARY
Marketing professional with 3 years of experience in digital marketing and social media management.

EXPERIENCE
Marketing Specialist | ABC Company | 2021-2024
• Managed social media accounts with 10K+ followers
• Increased website traffic by 25% through SEO optimization
• Created content for email marketing campaigns

EDUCATION
Bachelor of Arts in Marketing | State University | 2021

SKILLS
Social Media Marketing, SEO, Content Creation, Google Analytics`,
    targetJob: {
      title: 'Digital Marketing Manager',
      keywords: 'digital marketing, SEO, social media, content marketing, Google Analytics',
      description: 'Looking for a Digital Marketing Manager to lead our marketing efforts.',
      company: 'Marketing Solutions Co.',
    },
    expectedBehavior: 'Should analyze successfully but suggest more detailed content',
  },
  {
    id: 'too-short',
    name: 'Too Short Resume',
    description: 'Resume that is too short to analyze',
    resumeText: 'John Smith - Software Engineer',
    targetJob: {
      title: 'Software Engineer',
      keywords: 'programming, software development',
      description: 'Software engineering position',
      company: 'Tech Co.',
    },
    expectedBehavior: 'Should show validation error for insufficient content',
  },
  {
    id: 'missing-job-title',
    name: 'Missing Job Title',
    description: 'Valid resume but missing target job title',
    resumeText: `Professional with experience in various fields.
Experience includes project management, team leadership, and strategic planning.
Education: MBA from Top University.
Skills: Leadership, Communication, Project Management.`,
    targetJob: {
      title: '',
      keywords: 'management, leadership, strategy',
      description: 'Management position',
      company: 'Business Corp.',
    },
    expectedBehavior: 'Should show validation error for missing job title',
  },
  {
    id: 'keyword-mismatch',
    name: 'Keyword Mismatch',
    description: "Resume with skills that don't match target job",
    resumeText: `Art Director
Creative professional with 5 years of experience in graphic design and visual arts.

EXPERIENCE
Art Director | Creative Agency | 2019-2024
• Designed marketing materials and brand identities
• Led creative teams on advertising campaigns
• Managed client relationships and project timelines

SKILLS
Adobe Creative Suite, Graphic Design, Typography, Brand Development, Creative Direction

EDUCATION
Bachelor of Fine Arts | Art Institute | 2019`,
    targetJob: {
      title: 'Software Engineer',
      keywords: 'JavaScript, React, Node.js, Python, programming, software development',
      description: 'Looking for a software engineer to build web applications.',
      company: 'Tech Startup',
    },
    expectedBehavior: 'Should analyze but show low keyword match score and suggest relevant skills',
  },
  {
    id: 'perfect-match',
    name: 'Perfect Match',
    description: 'Resume that perfectly matches the target job',
    resumeText: `React Developer
Experienced React developer with expertise in modern JavaScript frameworks and cloud technologies.

PROFESSIONAL EXPERIENCE
Senior React Developer | Web Solutions Inc. | 2020-2024
• Built scalable React applications using TypeScript and Next.js
• Implemented state management with Redux and Context API
• Developed RESTful APIs using Node.js and Express
• Deployed applications on AWS using Docker containers
• Collaborated with cross-functional teams in Agile environment

TECHNICAL SKILLS
• Frontend: React, TypeScript, Next.js, Redux, HTML5, CSS3
• Backend: Node.js, Express, RESTful APIs
• Cloud: AWS, Docker, CI/CD
• Tools: Git, Jest, Webpack, VS Code

EDUCATION
Bachelor of Science in Computer Science | Tech University | 2020`,
    targetJob: {
      title: 'React Developer',
      keywords:
        'React, TypeScript, Node.js, JavaScript, Next.js, Redux, AWS, Docker, API development',
      description:
        'We need a React developer to build modern web applications using TypeScript and cloud technologies.',
      company: 'Modern Web Co.',
    },
    expectedBehavior: 'Should show high scores across all categories with minimal suggestions',
  },
];

export const AnalysisTestComponent: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>(
    TEST_SCENARIOS[0] || ({} as TestScenario)
  );
  const [customResumeText, setCustomResumeText] = useState('');
  const [customTargetJob, setCustomTargetJob] = useState<TargetJobInfo>({
    title: '',
    keywords: '',
    description: '',
    company: '',
  });
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);

  const handleAnalysisComplete = (analysisId: string) => {
    setAnalysisResults((prev) => [
      `Analysis ${analysisId} completed at ${new Date().toLocaleTimeString()}`,
      ...prev.slice(0, 9),
    ]);
  };

  const handleError = (error: string) => {
    setAnalysisResults((prev) => [
      `Error: ${error} at ${new Date().toLocaleTimeString()}`,
      ...prev.slice(0, 9),
    ]);
  };

  const currentResumeText = useCustomInput ? customResumeText : selectedScenario.resumeText;
  const currentTargetJob = useCustomInput ? customTargetJob : selectedScenario.targetJob;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Resume Analysis Integration Test</h1>
        <p className="text-base-content/70">
          Test the backend AI integration with various scenarios and edge cases
        </p>
      </div>

      {/* Test Scenario Selection */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Test Scenarios</h2>

          <div className="form-control mb-4">
            <label className="label cursor-pointer">
              <span className="label-text">Use Custom Input</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={useCustomInput}
                onChange={(e) => setUseCustomInput(e.target.checked)}
              />
            </label>
          </div>

          {!useCustomInput ? (
            <div className="space-y-3">
              {TEST_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`card cursor-pointer transition-all ${
                    selectedScenario.id === scenario.id
                      ? 'bg-primary/10 border-primary border-2'
                      : 'bg-base-200 hover:bg-base-300'
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <div className="card-body p-4">
                    <h3 className="font-semibold">{scenario.name}</h3>
                    <p className="text-sm opacity-75">{scenario.description}</p>
                    <p className="text-xs opacity-60 mt-2">Expected: {scenario.expectedBehavior}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Resume Text</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32"
                  placeholder="Enter resume text..."
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="e.g., Software Engineer"
                    value={customTargetJob.title}
                    onChange={(e) =>
                      setCustomTargetJob((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Company</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="e.g., Tech Corp"
                    value={customTargetJob.company}
                    onChange={(e) =>
                      setCustomTargetJob((prev) => ({ ...prev, company: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Keywords (comma-separated)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g., React, JavaScript, Node.js"
                  value={customTargetJob.keywords}
                  onChange={(e) =>
                    setCustomTargetJob((prev) => ({ ...prev, keywords: e.target.value }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Enter job description..."
                  value={customTargetJob.description}
                  onChange={(e) =>
                    setCustomTargetJob((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Test Data Preview */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Current Test Data</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Resume Text ({currentResumeText.length} chars)</h3>
              <div className="bg-base-200 p-3 rounded text-sm max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{currentResumeText}</pre>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Target Job</h3>
              <div className="bg-base-200 p-3 rounded text-sm space-y-2">
                <div>
                  <strong>Title:</strong> {currentTargetJob.title || 'Not specified'}
                </div>
                <div>
                  <strong>Company:</strong> {currentTargetJob.company || 'Not specified'}
                </div>
                <div>
                  <strong>Keywords:</strong> {currentTargetJob.keywords || 'Not specified'}
                </div>
                {currentTargetJob.description && (
                  <div>
                    <strong>Description:</strong> {currentTargetJob.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Component */}
      <AnalysisRequestComponent
        resumeText={currentResumeText}
        targetJob={currentTargetJob}
        onAnalysisComplete={handleAnalysisComplete}
        onError={handleError}
      />

      {/* Analysis Results Log */}
      {analysisResults.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Analysis Results Log</h2>
            <div className="space-y-2">
              {analysisResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    result.startsWith('Error:')
                      ? 'bg-error/10 text-error'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
            <button className="btn btn-sm btn-outline mt-3" onClick={() => setAnalysisResults([])}>
              Clear Log
            </button>
          </div>
        </div>
      )}

      {/* Testing Instructions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Testing Instructions</h2>
          <div className="prose max-w-none">
            <ol>
              <li>
                <strong>Backend Availability:</strong> Check if the AI service status shows "AI
                Enhanced" or "Local Mode"
              </li>
              <li>
                <strong>Valid Analysis:</strong> Try the "Valid Long Resume" scenario - should
                complete successfully
              </li>
              <li>
                <strong>Error Handling:</strong> Try the "Too Short Resume" scenario - should show
                validation error
              </li>
              <li>
                <strong>Network Errors:</strong> Disconnect internet and try analysis - should
                fallback to local mode
              </li>
              <li>
                <strong>Loading States:</strong> Watch the progress bar and stage indicators during
                analysis
              </li>
              <li>
                <strong>Retry Logic:</strong> If an error occurs, check if retry button appears for
                retryable errors
              </li>
              <li>
                <strong>Custom Input:</strong> Toggle custom input and test with your own resume and
                job data
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisTestComponent;
