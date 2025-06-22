'use client';

import { ArrowLeft, Calendar, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';

export default function RemoteWorkGuidePage() {
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
              <span>March 13, 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>12 min read</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Featured</span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-bold text-4xl leading-tight">
              The Ultimate Remote Work Guide: 8 Essential Strategies for Success in 2024
            </h1>
            <ShareButton
              url={currentUrl}
              title="The Ultimate Remote Work Guide: 8 Essential Strategies for Success in 2024"
            />
          </div>

          <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/blog/remote-work-main.jpg"
              alt="Remote Work Guide"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-8 rounded-lg bg-muted/50 p-6">
              <p className="lead font-medium text-lg">
                "Remote workers report 22% higher productivity and 50% lower turnover rates compared
                to in-office employees."
              </p>
              <p className="mt-4">
                The remote work revolution is here to stay, and success in this new environment
                requires more than just a laptop and internet connection. In this comprehensive
                guide, we'll explore eight essential strategies to help you thrive in a remote work
                environment, from setting up your workspace to maintaining work-life balance and
                advancing your career.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">Key Takeaways</h3>
              <ul className="space-y-2">
                <li>Create a dedicated workspace for maximum productivity</li>
                <li>Establish clear boundaries between work and personal life</li>
                <li>Master digital communication and collaboration tools</li>
                <li>Develop a consistent daily routine and schedule</li>
                <li>Prioritize mental health and work-life balance</li>
              </ul>
            </div>

            {/* Main Content */}
            <h2>1. Setting Up Your Home Office: The Foundation of Success</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-office.jpg"
                alt="Home Office Setup"
                fill
                className="object-cover"
              />
            </div>
            <p>Create an optimal workspace for productivity:</p>
            <ul>
              <li>Choose a quiet, dedicated space</li>
              <li>Invest in ergonomic furniture</li>
              <li>Ensure proper lighting and ventilation</li>
              <li>Set up reliable technology and internet</li>
              <li>Minimize distractions and interruptions</li>
            </ul>

            <h2>2. Time Management: Mastering Your Schedule</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-productivity.jpg"
                alt="Time Management"
                fill
                className="object-cover"
              />
            </div>
            <p>Develop effective time management strategies:</p>
            <ul>
              <li>Create a consistent daily routine</li>
              <li>Use time-blocking techniques</li>
              <li>Set clear priorities and goals</li>
              <li>Take regular breaks</li>
              <li>Track and optimize your productivity</li>
            </ul>

            <h2>3. Communication and Collaboration: Staying Connected</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-communication.jpg"
                alt="Communication and Collaboration"
                fill
                className="object-cover"
              />
            </div>
            <p>Master remote communication:</p>
            <ul>
              <li>Choose the right communication tools</li>
              <li>Set clear communication expectations</li>
              <li>Schedule regular check-ins</li>
              <li>Practice active listening</li>
              <li>Maintain team connections</li>
            </ul>

            <h2>4. Work-Life Balance: Setting Boundaries</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-balance.jpg"
                alt="Work-Life Balance"
                fill
                className="object-cover"
              />
            </div>
            <p>Maintain healthy boundaries:</p>
            <ul>
              <li>Set clear work hours</li>
              <li>Create physical and mental separation</li>
              <li>Take regular breaks</li>
              <li>Practice self-care</li>
              <li>Communicate availability clearly</li>
            </ul>

            <h2>5. Professional Development: Growing Remotely</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-development.jpg"
                alt="Professional Development"
                fill
                className="object-cover"
              />
            </div>
            <p>Continue your career growth:</p>
            <ul>
              <li>Seek out online learning opportunities</li>
              <li>Join virtual professional communities</li>
              <li>Set clear career goals</li>
              <li>Request regular feedback</li>
              <li>Build your online presence</li>
            </ul>

            <h2>6. Mental Health and Wellbeing: Taking Care of Yourself</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-wellbeing.jpg"
                alt="Mental Health and Wellbeing"
                fill
                className="object-cover"
              />
            </div>
            <p>Prioritize your mental health:</p>
            <ul>
              <li>Maintain a healthy routine</li>
              <li>Stay physically active</li>
              <li>Practice mindfulness</li>
              <li>Connect with others</li>
              <li>Seek support when needed</li>
            </ul>

            <h2>7. Career Advancement: Standing Out Remotely</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/remote-work-career.jpg"
                alt="Career Advancement"
                fill
                className="object-cover"
              />
            </div>
            <p>Advance your career in a remote environment:</p>
            <ul>
              <li>Take initiative on projects</li>
              <li>Build strong relationships</li>
              <li>Showcase your achievements</li>
              <li>Seek leadership opportunities</li>
              <li>Stay visible and engaged</li>
            </ul>

            <h2>8. Future of Remote Work: Staying Ahead</h2>
            <p>
              The remote work landscape continues to evolve. Stay adaptable and open to new
              technologies, tools, and ways of working. The future belongs to those who can
              effectively navigate and thrive in remote environments.
            </p>

            {/* Conclusion */}
            <div className="mt-8 rounded-lg bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold text-xl">Conclusion</h3>
              <p>
                Remote work success requires a combination of the right tools, mindset, and
                strategies. By implementing these eight essential strategies, you'll be
                well-equipped to thrive in the remote work environment. Remember, the key to success
                is finding what works best for you and your unique situation.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">Ready to Master Remote Work?</h3>
              <p className="mb-4">
                Download our comprehensive guides to learn more about remote work success and
                building effective remote teams.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WhitepaperCard
                  title="Remote Work Success Guide"
                  description="Complete guide to thriving in a remote work environment"
                  imageUrl="/images/whitepapers/remote-work-guide.jpg"
                  downloadUrl="/whitepapers/remote-work-guide.pdf"
                  fileSize="2.3 MB"
                />
                <WhitepaperCard
                  title="Building Remote Teams"
                  description="Strategies for creating and managing effective remote teams"
                  imageUrl="/images/whitepapers/remote-teams-guide.jpg"
                  downloadUrl="/whitepapers/remote-teams-guide.pdf"
                  fileSize="2.1 MB"
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
                Share your remote work experiences. What strategies have worked for you? What
                challenges have you faced? Let's discuss in the comments below.
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
                      Learn how to create compelling video resumes for remote positions
                    </p>
                  </div>
                </Link>
                <Link href="/blog/employer-best-practices" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Employer Best Practices
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Discover how to build and manage remote teams effectively
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
