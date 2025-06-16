const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const whitepapers = [
  {
    title: 'The Future of AI in Recruitment',
    filename: 'ai-recruitment-whitepaper.pdf',
    content: [
      {
        title: 'Introduction',
        content: `Artificial Intelligence is revolutionizing the recruitment landscape, bringing unprecedented efficiency and precision to the hiring process. This whitepaper explores the current state of AI in recruitment and its future implications.`
      },
      {
        title: 'Current State of AI in Recruitment',
        content: `AI is already being used in various aspects of recruitment:
• Automated resume screening
• Candidate matching
• Interview scheduling
• Initial candidate assessment
• Predictive analytics for hiring success`
      },
      {
        title: 'Key Technologies',
        content: `The main technologies driving AI recruitment include:
• Natural Language Processing (NLP)
• Machine Learning algorithms
• Predictive analytics
• Computer vision for video interviews
• Chatbots and virtual assistants`
      },
      {
        title: 'Benefits of AI in Recruitment',
        content: `Organizations implementing AI in recruitment report:
• 75% reduction in time-to-hire
• 50% decrease in cost-per-hire
• Improved candidate experience
• Reduced bias in hiring
• Better quality of hires`
      },
      {
        title: 'Implementation Guide',
        content: `Steps to implement AI in recruitment:
1. Assess current recruitment processes
2. Identify areas for AI integration
3. Choose appropriate AI solutions
4. Train recruitment team
5. Monitor and optimize results`
      },
      {
        title: 'Future Trends',
        content: `Emerging trends in AI recruitment:
• Advanced video interview analysis
• Predictive candidate success modeling
• Automated skill assessment
• Enhanced candidate experience
• Integration with HR analytics`
      },
      {
        title: 'Conclusion',
        content: `AI is not just a trend in recruitment; it's becoming a fundamental part of the hiring process. Organizations that embrace AI recruitment tools will gain a significant competitive advantage in attracting and retaining top talent.`
      }
    ]
  },
  {
    title: 'Building an AI-Ready Recruitment Team',
    filename: 'ai-team-whitepaper.pdf',
    content: [
      {
        title: 'Introduction',
        content: `As AI becomes increasingly integral to recruitment processes, organizations must prepare their recruitment teams for this technological shift. This whitepaper provides a comprehensive guide to building an AI-ready recruitment team.`
      },
      {
        title: 'Understanding AI in Recruitment',
        content: `Key concepts for recruitment teams:
• How AI enhances recruitment processes
• Common AI recruitment tools
• Benefits and limitations of AI
• Human-AI collaboration models`
      },
      {
        title: 'Skills Development',
        content: `Essential skills for AI-ready recruiters:
• Data literacy
• AI tool proficiency
• Analytical thinking
• Process optimization
• Change management`
      },
      {
        title: 'Team Structure',
        content: `Recommended team structure:
• AI specialists
• Data analysts
• Traditional recruiters
• Process experts
• Change management specialists`
      },
      {
        title: 'Training Programs',
        content: `Key training areas:
• AI tool usage
• Data analysis
• Process optimization
• Candidate experience
• Ethical considerations`
      },
      {
        title: 'Implementation Strategy',
        content: `Steps for successful implementation:
1. Assess current capabilities
2. Develop training programs
3. Implement AI tools gradually
4. Monitor and adjust
5. Scale successful initiatives`
      },
      {
        title: 'Measuring Success',
        content: `Key metrics to track:
• Time-to-hire
• Cost-per-hire
• Quality of hire
• Candidate satisfaction
• Team productivity`
      },
      {
        title: 'Conclusion',
        content: `Building an AI-ready recruitment team is essential for organizations to remain competitive in the modern hiring landscape. With proper preparation and training, recruitment teams can leverage AI to achieve better results while maintaining the human touch in hiring.`
      }
    ]
  },
  {
    title: 'Remote Work Success Guide',
    filename: 'remote-work-guide.pdf',
    content: [
      {
        title: 'Introduction',
        content: `Remote work has become a permanent fixture in the modern workplace. This whitepaper provides a comprehensive guide to succeeding in remote work environments, from setting up your workspace to maintaining productivity and work-life balance.`
      },
      {
        title: 'Setting Up Your Remote Workspace',
        content: `Essential elements for a productive remote workspace:
• Ergonomic furniture and equipment
• Reliable technology and internet
• Proper lighting and ventilation
• Noise management solutions
• Organizational systems`
      },
      {
        title: 'Time Management Strategies',
        content: `Effective time management techniques for remote workers:
• The Pomodoro Technique
• Time blocking
• Task prioritization
• Digital calendar management
• Break scheduling`
      },
      {
        title: 'Communication Best Practices',
        content: `Key communication strategies for remote work:
• Regular team check-ins
• Clear documentation
• Video conferencing etiquette
• Asynchronous communication
• Feedback mechanisms`
      },
      {
        title: 'Work-Life Balance',
        content: `Maintaining balance while working remotely:
• Setting boundaries
• Creating routines
• Taking breaks
• Physical activity
• Social connection`
      },
      {
        title: 'Professional Development',
        content: `Growing your career remotely:
• Online learning resources
• Virtual networking
• Skill development
• Career planning
• Remote work certifications`
      },
      {
        title: 'Conclusion',
        content: `Remote work success requires intentional effort in creating the right environment, developing effective habits, and maintaining professional growth. With the right strategies and tools, remote work can be highly productive and fulfilling.`
      }
    ]
  },
  {
    title: 'Building Remote Teams',
    filename: 'remote-teams-guide.pdf',
    content: [
      {
        title: 'Introduction',
        content: `Building and managing effective remote teams requires specific strategies and tools. This whitepaper explores best practices for creating cohesive, productive remote teams that deliver results.`
      },
      {
        title: 'Team Structure and Roles',
        content: `Key considerations for remote team structure:
• Clear role definitions
• Reporting relationships
• Communication channels
• Decision-making processes
• Team size optimization`
      },
      {
        title: 'Hiring Remote Team Members',
        content: `Best practices for remote hiring:
• Skills assessment
• Communication evaluation
• Self-motivation testing
• Cultural fit assessment
• Remote work experience`
      },
      {
        title: 'Team Communication',
        content: `Effective communication strategies:
• Communication tools selection
• Meeting protocols
• Documentation standards
• Feedback mechanisms
• Conflict resolution`
      },
      {
        title: 'Performance Management',
        content: `Managing remote team performance:
• Goal setting
• Progress tracking
• Performance metrics
• Regular reviews
• Recognition systems`
      },
      {
        title: 'Team Building and Culture',
        content: `Building strong remote team culture:
• Virtual team building
• Cultural activities
• Recognition programs
• Social connections
• Shared values`
      },
      {
        title: 'Tools and Technology',
        content: `Essential tools for remote teams:
• Project management
• Communication platforms
• Collaboration tools
• Time tracking
• Security solutions`
      },
      {
        title: 'Conclusion',
        content: `Successful remote teams require careful planning, the right tools, and strong leadership. By implementing these best practices, organizations can build high-performing remote teams that thrive in the digital workplace.`
      }
    ]
  },
  {
    title: 'Data Privacy in Recruitment',
    filename: 'data-privacy-guide.pdf',
    content: [
      {
        title: 'Introduction',
        content: `Data privacy is crucial in modern recruitment. This whitepaper explores best practices for protecting candidate data, complying with regulations, and maintaining trust in the hiring process.`
      },
      {
        title: 'Data Protection Regulations',
        content: `Key regulations affecting recruitment:
• GDPR requirements
• CCPA compliance
• Industry-specific regulations
• International data transfers
• Compliance frameworks`
      },
      {
        title: 'Candidate Data Management',
        content: `Best practices for data handling:
• Data collection limits
• Storage security
• Access controls
• Retention policies
• Deletion procedures`
      },
      {
        title: 'Privacy by Design',
        content: `Implementing privacy in recruitment:
• Privacy-first approach
• Data minimization
• Security measures
• Transparency
• User control`
      },
      {
        title: 'Third-Party Vendors',
        content: `Managing vendor relationships:
• Vendor assessment
• Data processing agreements
• Security requirements
• Monitoring
• Compliance verification`
      },
      {
        title: 'Candidate Rights',
        content: `Respecting candidate privacy rights:
• Data access
• Correction rights
• Deletion requests
• Consent management
• Privacy notices`
      },
      {
        title: 'Security Measures',
        content: `Protecting recruitment data:
• Encryption
• Access controls
• Security audits
• Incident response
• Staff training`
      },
      {
        title: 'Conclusion',
        content: `Data privacy in recruitment is not just a legal requirement but a crucial aspect of building trust with candidates. Organizations must implement robust privacy practices to protect candidate data and maintain compliance.`
      }
    ]
  }
];

// Create whitepapers directory if it doesn't exist
const whitepapersDir = path.join(__dirname, '../public/whitepapers');
if (!fs.existsSync(whitepapersDir)) {
  fs.mkdirSync(whitepapersDir, { recursive: true });
}

// Generate each whitepaper
whitepapers.forEach(whitepaper => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  const outputPath = path.join(whitepapersDir, whitepaper.filename);
  doc.pipe(fs.createWriteStream(outputPath));

  // Add title
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(whitepaper.title, { align: 'center' })
     .moveDown(2);

  // Add content
  whitepaper.content.forEach(section => {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(section.title)
       .moveDown(1);

    doc.fontSize(12)
       .font('Helvetica')
       .text(section.content)
       .moveDown(2);
  });

  doc.end();
  console.log(`Generated ${whitepaper.filename}`);
}); 