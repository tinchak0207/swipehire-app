import { type NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ResumeTemplate } from '@/lib/types/resume-optimizer';

/**
 * Default resume templates
 */
const DEFAULT_TEMPLATES: ResumeTemplate[] = [
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
• Programming Languages: JavaScript, TypeScript, Python, Java, C++
• Frontend: React, Vue.js, Angular, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Spring Boot, FastAPI
• Databases: PostgreSQL, MongoDB, MySQL, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Jenkins
• Tools: Git, Jest, Webpack, VS Code, Postman

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
    tags: ['React', 'Node.js', 'JavaScript', 'Full Stack', 'API Development'],
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
    tags: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Roadmapping'],
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
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Analytics'],
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Specialized for data science and analytics roles',
    category: 'tech',
    content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [GitHub Profile]

PROFESSIONAL SUMMARY
Data scientist with [X] years of experience in machine learning, statistical analysis, and data visualization. Proven ability to extract actionable insights from complex datasets and drive business decisions through data-driven solutions.

TECHNICAL SKILLS
• Programming: Python, R, SQL, Scala, Java
• Machine Learning: Scikit-learn, TensorFlow, PyTorch, Keras
• Data Analysis: Pandas, NumPy, SciPy, Matplotlib, Seaborn
• Big Data: Spark, Hadoop, Kafka, Airflow
• Databases: PostgreSQL, MongoDB, Cassandra, Snowflake
• Cloud Platforms: AWS, GCP, Azure
• Visualization: Tableau, Power BI, Plotly, D3.js

PROFESSIONAL EXPERIENCE

Senior Data Scientist | [Company Name] | [Start Date] - Present
• Developed machine learning models that improved [metric] by [X]%
• Built predictive analytics solutions for [business area]
• Collaborated with product and engineering teams to implement ML solutions
• Mentored junior data scientists and established best practices

Data Scientist | [Previous Company] | [Start Date] - [End Date]
• Analyzed large datasets to identify trends and business opportunities
• Created automated reporting dashboards for stakeholders
• Implemented A/B testing frameworks for product optimization
• Presented findings to executive leadership and cross-functional teams

EDUCATION
Master of Science in Data Science | [University Name] | [Year]
Bachelor of Science in [Field] | [University Name] | [Year]

KEY PROJECTS
[Project Name] | [Technologies Used]
• Description of the project and business impact
• Quantifiable results and achievements

CERTIFICATIONS
• AWS Certified Machine Learning - Specialty | [Year]
• Google Cloud Professional Data Engineer | [Year]`,
    tags: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Big Data'],
  },
  {
    id: 'ux-designer',
    name: 'UX/UI Designer',
    description: 'Perfect for user experience and interface design roles',
    category: 'creative',
    content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [Portfolio Website]

PROFESSIONAL SUMMARY
Creative UX/UI designer with [X] years of experience creating user-centered digital experiences. Passionate about solving complex problems through intuitive design and improving user satisfaction through research-driven design decisions.

DESIGN SKILLS
• User Experience (UX) Design
• User Interface (UI) Design
�� User Research & Testing
• Information Architecture
• Interaction Design
• Prototyping & Wireframing
• Design Systems
• Accessibility Design

TOOLS & SOFTWARE
• Design: Figma, Sketch, Adobe XD, Adobe Creative Suite
• Prototyping: InVision, Principle, Framer
• Research: Miro, Optimal Workshop, UserTesting
• Development: HTML, CSS, JavaScript (basic)

PROFESSIONAL EXPERIENCE

Senior UX/UI Designer | [Company Name] | [Start Date] - Present
• Led design for [product/feature] used by [X] users
• Conducted user research and usability testing to inform design decisions
• Created and maintained design system for consistent user experience
• Collaborated with product managers and developers to implement designs
• Improved user satisfaction scores by [X]% through design optimization

UX/UI Designer | [Previous Company] | [Start Date] - [End Date]
• Designed mobile and web interfaces for [type of application]
• Created wireframes, prototypes, and high-fidelity mockups
• Conducted user interviews and analyzed user behavior data
• Participated in design sprints and cross-functional collaboration

EDUCATION
Bachelor of Fine Arts in Graphic Design | [University Name] | [Year]

KEY PROJECTS
[Project Name] | [Platform/Type]
• Brief description of the project and your role
• Impact on user experience and business metrics

CERTIFICATIONS
• Google UX Design Certificate | [Year]
• Nielsen Norman Group UX Certification | [Year]`,
    tags: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
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
    tags: ['Professional', 'Versatile', 'Adaptable', 'General Purpose'],
  },
];

/**
 * GET /api/resume-optimizer/templates
 * Returns available resume templates
 */
export async function GET(): Promise<NextResponse> {
  try {
    // In a real application, you might fetch templates from a database
    // For now, we'll return the default templates
    const response: ApiResponse<ResumeTemplate[]> = {
      success: true,
      data: DEFAULT_TEMPLATES,
      message: 'Templates retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching resume templates:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: 'Failed to fetch resume templates',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/resume-optimizer/templates
 * Creates a new resume template (admin functionality)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, description, category, content } = body;

    if (!name || !description || !category || !content) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Missing required fields: name, description, category, content',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // In a real application, you would save this to a database
    // For now, we'll just return a success response
    const newTemplate: ResumeTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description,
      category,
      content,
      tags: body.tags || [],
    };

    const response: ApiResponse<ResumeTemplate> = {
      success: true,
      data: newTemplate,
      message: 'Template created successfully',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating resume template:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: 'Failed to create resume template',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
