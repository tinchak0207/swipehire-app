export const WIZARD_STEPS = [
  {
    title: '🚀 Welcome to the Resume Optimizer!',
    content: `
      <p>This interactive guide will walk you through our state-of-the-art, AI-powered resume optimization platform.</p>
      <p>In just a few steps, you'll learn how to transform your resume and significantly boost your career opportunities.</p>
    `,
  },
  {
    title: '🎯 Step 1: Choose Your Starting Point',
    content: `
      <p>You have three ways to begin:</p>
      <ul>
        <li><strong>Upload Resume:</strong> Use our drag-and-drop interface for PDF or DOCX files.</li>
        <li><strong>Import from Profile:</strong> Instantly use your existing SwipeHire profile data.</li>
        <li><strong>Create from Scratch:</strong> Let our AI guide you in building a new resume.</li>
      </ul>
      <p>For this guide, let's assume you're uploading a resume.</p>
    `,
  },
  {
    title: '🔍 Step 2: The AI-Powered Analysis',
    content: `
      <p>Once uploaded, our AI engine, powered by <strong>Mistral Large Latest</strong>, analyzes your resume in under 60 seconds.</p>
      <p>It scores your resume across four key dimensions:</p>
      <ul>
        <li><strong>Keywords (35%):</strong> Industry-relevant terms.</li>
        <li><strong>Grammar (25%):</strong> Clarity and language quality.</li>
        <li><strong>Format (25%):</strong> Structure and visual appeal.</li>
        <li><strong>Quantitative (15%):</strong> Measurable achievements.</li>
      </ul>
    `,
    command: "# Start-Process npm -ArgumentList 'run dev' -NoNewWindow",
  },
  {
    title: '⚡ Step 3: Real-Time ATS Compatibility',
    content: `
      <p>Our scanner checks your resume against 10+ major Applicant Tracking Systems (ATS) like Workday and Greenhouse.</p>
      <p>You'll get instant feedback with a risk assessment (high, medium, low) and actionable solutions.</p>
    `,
  },
  {
    title: '🎬 Step 4: AI Video Generation',
    content: `
      <p>This revolutionary feature creates a professional video from your resume using:</p>
      <ul>
        <li><strong>Claude 3.5 Sonnet</strong> for AI script generation.</li>
        <li><strong>ElevenLabs</strong> for premium voice synthesis.</li>
        <li>Professional templates and HD/4K output.</li>
      </ul>
    `,
  },
  {
    title: '📊 Step 5: The Advanced Analytics Dashboard',
    content: `
      <p>Track your progress with real-time metrics, performance benchmarks, and predictive modeling for improvement forecasting.</p>
      <p>You can export comprehensive reports in various formats.</p>
    `,
    command: `Invoke-RestMethod -Uri "http://localhost:3000/api/resume-optimizer/export" -Method POST -Body '{"format":"pdf"}'`,
  },
  {
    title: '🤝 Step 6: Real-Time Collaboration',
    content: `
      <p>Invite mentors or peers to collaborate on your resume in real-time.</p>
      <p>Features include live cursors, threaded comments, and a Git-like version history with rollback capabilities.</p>
    `,
  },
  {
    title: "🚀 You're Ready to Optimize!",
    content: `
      <p>You've completed the tour! You're now equipped to use the full power of SwipeHire's Resume Optimizer.</p>
      <p>Remember to use the AI Writing Assistant for suggestions and explore the Template Marketplace for industry-specific designs.</p>
      <p>Good luck!</p>
    `,
  },
];
