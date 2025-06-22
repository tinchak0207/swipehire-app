'use client';

import { ArrowLeft, Calendar, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';

export default function AIRecruitmentTrendsPage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <div className="mb-4 flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>March 15, 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>8 min read</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Trending</span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-bold text-4xl leading-tight">
              AI in Recruitment: 8 Game-Changing Trends That Will Transform Hiring in 2024
            </h1>
            <ShareButton
              url={currentUrl}
              title="AI in Recruitment: 8 Game-Changing Trends That Will Transform Hiring in 2024"
            />
          </div>

          <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/blog/ai-recruitment.jpg"
              alt="AI in Recruitment"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-8 rounded-lg bg-muted/50 p-6">
              <p className="lead font-medium text-lg">
                "By 2025, 75% of companies will use AI in their recruitment process, revolutionizing
                how we find and hire talent."
              </p>
              <p className="mt-4">
                Artificial Intelligence is not just changing recruitment—it's completely
                transforming it. From automated screening to predictive analytics, AI is making
                hiring more efficient, objective, and candidate-friendly. In this comprehensive
                guide, we'll explore the eight most impactful AI trends that are reshaping the
                recruitment landscape in 2024.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">Key Takeaways</h3>
              <ul className="space-y-2">
                <li>AI is reducing time-to-hire by up to 75%</li>
                <li>Automated screening improves candidate matching by 50%</li>
                <li>Predictive analytics reduces turnover by 35%</li>
                <li>AI-powered chatbots handle 80% of initial candidate interactions</li>
                <li>Video interview analysis provides deeper candidate insights</li>
              </ul>
            </div>

            {/* Main Content */}
            <h2>1. AI-Powered Candidate Screening: Beyond Keywords</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/ai-screening.jpg"
                alt="AI Candidate Screening"
                fill
                className="object-cover"
              />
            </div>
            <p>Traditional resume screening is becoming obsolete. Modern AI systems can now:</p>
            <ul>
              <li>Analyze thousands of resumes in seconds</li>
              <li>Identify the best candidates based on skills and experience</li>
              <li>Match candidates to job requirements with high accuracy</li>
              <li>Reduce bias in the screening process</li>
              <li>Provide detailed candidate insights</li>
            </ul>

            <h2>2. Predictive Analytics: The Future of Hiring Decisions</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/predictive-analytics.jpg"
                alt="Predictive Analytics"
                fill
                className="object-cover"
              />
            </div>
            <p>Predictive analytics is revolutionizing hiring decisions by:</p>
            <ul>
              <li>Analyzing historical hiring data</li>
              <li>Predicting candidate success rates</li>
              <li>Identifying potential retention issues</li>
              <li>Optimizing job descriptions</li>
              <li>Improving diversity in hiring</li>
            </ul>

            <h2>3. Chatbots and Virtual Assistants: 24/7 Candidate Support</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/recruitment-chatbot.jpg"
                alt="Recruitment Chatbot"
                fill
                className="object-cover"
              />
            </div>
            <p>AI-powered chatbots are transforming candidate engagement:</p>
            <ul>
              <li>Providing instant responses to candidate queries</li>
              <li>Scheduling interviews automatically</li>
              <li>Collecting initial candidate information</li>
              <li>Offering personalized job recommendations</li>
              <li>Maintaining consistent communication</li>
            </ul>

            <h2>4. Video Interview Analysis: Beyond the Surface</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/video-interview.jpg"
                alt="Video Interview Analysis"
                fill
                className="object-cover"
              />
            </div>
            <p>AI is revolutionizing video interviews by:</p>
            <ul>
              <li>Analyzing facial expressions and body language</li>
              <li>Evaluating communication skills</li>
              <li>Assessing cultural fit</li>
              <li>Providing objective feedback</li>
              <li>Reducing interview bias</li>
            </ul>

            <h2>5. Skills Assessment and Learning: The New Standard</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/skills-assessment.jpg"
                alt="Skills Assessment"
                fill
                className="object-cover"
              />
            </div>
            <p>AI-driven skills assessment is changing how we evaluate candidates:</p>
            <ul>
              <li>Creating personalized assessment challenges</li>
              <li>Evaluating technical skills in real-time</li>
              <li>Identifying learning potential</li>
              <li>Recommending skill development paths</li>
              <li>Matching candidates to suitable roles</li>
            </ul>

            <h2>6. Bias Reduction: Building More Inclusive Teams</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/bias-reduction.jpg"
                alt="Bias Reduction in Hiring"
                fill
                className="object-cover"
              />
            </div>
            <p>AI is helping create more diverse and inclusive workplaces by:</p>
            <ul>
              <li>Removing demographic information from screening</li>
              <li>Focusing on skills and qualifications</li>
              <li>Identifying and eliminating biased language</li>
              <li>Promoting diverse candidate pools</li>
              <li>Ensuring fair evaluation processes</li>
            </ul>

            <h2>7. Candidate Experience Enhancement: The Human Touch</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/candidate-experience.jpg"
                alt="Candidate Experience"
                fill
                className="object-cover"
              />
            </div>
            <p>AI is personalizing the candidate experience through:</p>
            <ul>
              <li>Tailored job recommendations</li>
              <li>Automated status updates</li>
              <li>Personalized communication</li>
              <li>Streamlined application processes</li>
              <li>Improved feedback mechanisms</li>
            </ul>

            <h2>8. Future Outlook: The Evolution Continues</h2>
            <p>
              As AI technology continues to evolve, we can expect even more sophisticated
              recruitment solutions. The key will be finding the right balance between automation
              and human touch, ensuring that technology enhances rather than replaces the human
              element in hiring.
            </p>

            {/* Conclusion */}
            <div className="mt-8 rounded-lg bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold text-xl">Conclusion</h3>
              <p>
                AI is not just a trend in recruitment—it's becoming a fundamental part of the hiring
                process. Organizations that embrace these technologies will gain a significant
                competitive advantage in attracting and retaining top talent. The future of
                recruitment is here, and it's powered by AI.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">
                Ready to Transform Your Hiring Process?
              </h3>
              <p className="mb-4">
                Download our comprehensive whitepapers to learn more about implementing AI in your
                recruitment strategy and building an AI-ready recruitment team.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WhitepaperCard
                  title="The Future of AI in Recruitment"
                  description="A comprehensive guide to implementing AI in your hiring process"
                  imageUrl="/images/whitepapers/ai-recruitment-whitepaper.jpg"
                  downloadUrl="/whitepapers/ai-recruitment-whitepaper.pdf"
                  fileSize="2.4 MB"
                />
                <WhitepaperCard
                  title="Building an AI-Ready Recruitment Team"
                  description="Strategies for adapting your recruitment team to AI-driven hiring"
                  imageUrl="/images/whitepapers/ai-team-whitepaper.jpg"
                  downloadUrl="/whitepapers/ai-team-whitepaper.pdf"
                  fileSize="1.8 MB"
                />
              </div>
            </div>

            {/* Engagement Section */}
            <div className="mt-12 border-t pt-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-2xl">Join the Conversation</h2>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Leave a Comment
                </Button>
              </div>
              <p className="mb-6 text-muted-foreground">
                Share your thoughts on AI in recruitment. How is your organization leveraging these
                technologies? What challenges have you faced? Let's discuss in the comments below.
              </p>
            </div>

            {/* Related Articles */}
            <div className="mt-12 border-t pt-8">
              <h2 className="mb-6 font-bold text-2xl">Related Articles</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Link href="/blog/video-resume-tips" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Video Resume Tips
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Learn how to create compelling video resumes that stand out
                    </p>
                  </div>
                </Link>
                <Link href="/blog/employer-best-practices" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Employer Best Practices
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Discover how to optimize your hiring process with AI
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
