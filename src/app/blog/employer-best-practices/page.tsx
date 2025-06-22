'use client';

import { ArrowLeft, Calendar, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';

export default function EmployerBestPracticesPage() {
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
              <span>March 12, 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>15 min read</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Essential</span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-bold text-4xl leading-tight">
              Employer Best Practices: 8 Strategies to Build a High-Performing Team in 2024
            </h1>
            <ShareButton
              url={currentUrl}
              title="Employer Best Practices: 8 Strategies to Build a High-Performing Team in 2024"
            />
          </div>

          <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/blog/employer-best-practices.jpg"
              alt="Employer Best Practices"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-8 rounded-lg bg-muted/50 p-6">
              <p className="lead font-medium text-lg">
                "Companies with strong employer practices see 50% higher employee retention and 30%
                better performance metrics."
              </p>
              <p className="mt-4">
                In today's competitive job market, attracting and retaining top talent requires more
                than just offering competitive salaries. This comprehensive guide explores eight
                essential strategies that modern employers must implement to build and maintain
                high-performing teams, from recruitment to retention and everything in between.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">Key Takeaways</h3>
              <ul className="space-y-2">
                <li>Implement data-driven recruitment strategies</li>
                <li>Create an inclusive and diverse workplace</li>
                <li>Develop comprehensive onboarding programs</li>
                <li>Foster continuous learning and growth</li>
                <li>Build a strong company culture</li>
              </ul>
            </div>

            {/* Main Content */}
            <h2>1. Modern Recruitment Strategies: Beyond Traditional Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/recruitment-strategies.jpg"
                alt="Modern Recruitment Strategies"
                fill
                className="object-cover"
              />
            </div>
            <p>Transform your hiring process:</p>
            <ul>
              <li>Use AI-powered candidate screening</li>
              <li>Implement skills-based assessments</li>
              <li>Leverage video interviews effectively</li>
              <li>Build a strong employer brand</li>
              <li>Create efficient hiring workflows</li>
            </ul>

            <h2>2. Diversity and Inclusion: Building a Stronger Team</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/diversity-inclusion.jpg"
                alt="Diversity and Inclusion"
                fill
                className="object-cover"
              />
            </div>
            <p>Create an inclusive workplace:</p>
            <ul>
              <li>Develop D&I policies and programs</li>
              <li>Implement bias-free hiring practices</li>
              <li>Foster inclusive leadership</li>
              <li>Create employee resource groups</li>
              <li>Measure and track D&I metrics</li>
            </ul>

            <h2>3. Onboarding Excellence: Setting Up for Success</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/onboarding.jpg"
                alt="Onboarding Excellence"
                fill
                className="object-cover"
              />
            </div>
            <p>Design an effective onboarding program:</p>
            <ul>
              <li>Create structured onboarding plans</li>
              <li>Assign mentors and buddies</li>
              <li>Set clear expectations and goals</li>
              <li>Provide necessary resources</li>
              <li>Gather feedback and improve</li>
            </ul>

            <h2>4. Employee Development: Investing in Growth</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/employee-development.jpg"
                alt="Employee Development"
                fill
                className="object-cover"
              />
            </div>
            <p>Foster continuous learning:</p>
            <ul>
              <li>Create learning and development programs</li>
              <li>Offer career advancement opportunities</li>
              <li>Provide mentorship programs</li>
              <li>Support skill development</li>
              <li>Encourage knowledge sharing</li>
            </ul>

            <h2>5. Performance Management: Driving Excellence</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/performance-management.jpg"
                alt="Performance Management"
                fill
                className="object-cover"
              />
            </div>
            <p>Implement effective performance management:</p>
            <ul>
              <li>Set clear performance metrics</li>
              <li>Conduct regular check-ins</li>
              <li>Provide constructive feedback</li>
              <li>Recognize and reward achievements</li>
              <li>Address performance issues promptly</li>
            </ul>

            <h2>6. Employee Engagement: Building Connection</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/employee-engagement.jpg"
                alt="Employee Engagement"
                fill
                className="object-cover"
              />
            </div>
            <p>Boost employee engagement:</p>
            <ul>
              <li>Create meaningful work</li>
              <li>Foster team collaboration</li>
              <li>Recognize and appreciate contributions</li>
              <li>Provide work-life balance</li>
              <li>Build strong team culture</li>
            </ul>

            <h2>7. Remote Work Management: Leading Distributed Teams</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-management.jpg"
                alt="Remote Work Management"
                fill
                className="object-cover"
              />
            </div>
            <p>Effectively manage remote teams:</p>
            <ul>
              <li>Set clear communication guidelines</li>
              <li>Use collaboration tools effectively</li>
              <li>Build trust and accountability</li>
              <li>Maintain team connection</li>
              <li>Support remote work success</li>
            </ul>

            <h2>8. Future of Work: Staying Ahead</h2>
            <p>
              The workplace continues to evolve. Stay adaptable and embrace new technologies, work
              models, and management approaches. The future belongs to organizations that can
              effectively navigate change and maintain high performance in any environment.
            </p>

            {/* Conclusion */}
            <div className="mt-8 rounded-lg bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold text-xl">Conclusion</h3>
              <p>
                Building and maintaining a high-performing team requires a comprehensive approach to
                employer practices. By implementing these eight strategies, you'll be well-equipped
                to attract top talent, foster growth, and drive organizational success. Remember,
                the key to success is consistency and continuous improvement.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">
                Ready to Transform Your Employer Practices?
              </h3>
              <p className="mb-4">
                Download our comprehensive guides to learn more about implementing effective
                employer practices and building high-performing teams.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WhitepaperCard
                  title="Employer Best Practices Guide"
                  description="Complete guide to implementing effective employer practices"
                  imageUrl="/images/whitepapers/employer-guide.jpg"
                  downloadUrl="/whitepapers/employer-guide.pdf"
                  fileSize="2.5 MB"
                />
                <WhitepaperCard
                  title="Building High-Performing Teams"
                  description="Strategies for creating and managing successful teams"
                  imageUrl="/images/whitepapers/team-building-guide.jpg"
                  downloadUrl="/whitepapers/team-building-guide.pdf"
                  fileSize="2.2 MB"
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
                Share your employer practices experiences. What strategies have worked for your
                organization? What challenges have you faced? Let's discuss in the comments below.
              </p>
            </div>

            {/* Related Articles */}
            <div className="mt-12 border-t pt-8">
              <h2 className="mb-6 font-bold text-2xl">Related Articles</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Link href="/blog/remote-work-guide" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Remote Work Guide
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Learn how to effectively manage remote teams
                    </p>
                  </div>
                </Link>
                <Link href="/blog/data-privacy" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Data Privacy in Recruitment
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Understand best practices for handling candidate data
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
