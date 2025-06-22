'use client';

import { ArrowLeft, Calendar, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';

export default function SuccessStoriesPage() {
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
              <span>March 11, 2024</span>
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
              Success Stories: How SwipeHire Transformed Recruitment for 8 Leading Companies
            </h1>
            <ShareButton
              url={currentUrl}
              title="Success Stories: How SwipeHire Transformed Recruitment for 8 Leading Companies"
            />
          </div>

          <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/blog/success-stories.jpg"
              alt="Success Stories"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-8 rounded-lg bg-muted/50 p-6">
              <p className="lead font-medium text-lg">
                "Companies using SwipeHire have seen a 65% reduction in time-to-hire and a 40%
                increase in candidate quality."
              </p>
              <p className="mt-4">
                Discover how leading organizations have revolutionized their recruitment process
                with SwipeHire. From tech startups to established enterprises, these success stories
                showcase the transformative power of modern recruitment technology and best
                practices.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">Key Takeaways</h3>
              <ul className="space-y-2">
                <li>65% reduction in time-to-hire</li>
                <li>40% increase in candidate quality</li>
                <li>50% cost reduction in recruitment</li>
                <li>85% improvement in candidate experience</li>
                <li>70% increase in team productivity</li>
              </ul>
            </div>

            {/* Main Content */}
            <h2>1. TechCorp: Revolutionizing Tech Recruitment</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/techcorp-success.jpg"
                alt="TechCorp Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>How TechCorp transformed their hiring process:</p>
            <ul>
              <li>Reduced time-to-hire by 70%</li>
              <li>Improved candidate quality by 45%</li>
              <li>Enhanced team collaboration</li>
              <li>Streamlined interview process</li>
              <li>Better candidate experience</li>
            </ul>

            <h2>2. Global Solutions: Scaling International Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/global-solutions.jpg"
                alt="Global Solutions Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Global Solutions' international recruitment success:</p>
            <ul>
              <li>Expanded to 15 new countries</li>
              <li>Reduced hiring costs by 50%</li>
              <li>Improved compliance management</li>
              <li>Enhanced cross-border hiring</li>
              <li>Better cultural fit assessment</li>
            </ul>

            <h2>3. StartupX: Building High-Performing Teams</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/startupx-success.jpg"
                alt="StartupX Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>StartupX's journey to building great teams:</p>
            <ul>
              <li>Tripled team size in 6 months</li>
              <li>Improved retention by 60%</li>
              <li>Enhanced employer branding</li>
              <li>Better candidate engagement</li>
              <li>Streamlined onboarding</li>
            </ul>

            <h2>4. Enterprise Solutions: Modernizing Legacy Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/enterprise-success.jpg"
                alt="Enterprise Solutions Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>How Enterprise Solutions modernized their process:</p>
            <ul>
              <li>Reduced hiring time by 65%</li>
              <li>Improved candidate experience</li>
              <li>Enhanced data-driven decisions</li>
              <li>Better team collaboration</li>
              <li>Streamlined workflows</li>
            </ul>

            <h2>5. Healthcare Plus: Transforming Medical Recruitment</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/healthcare-success.jpg"
                alt="Healthcare Plus Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Healthcare Plus's recruitment transformation:</p>
            <ul>
              <li>Improved candidate quality</li>
              <li>Enhanced compliance management</li>
              <li>Better credential verification</li>
              <li>Streamlined hiring process</li>
              <li>Improved staff satisfaction</li>
            </ul>

            <h2>6. Retail Giant: Scaling Seasonal Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/retail-success.jpg"
                alt="Retail Giant Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Retail Giant's seasonal hiring success:</p>
            <ul>
              <li>Reduced hiring time by 80%</li>
              <li>Improved candidate quality</li>
              <li>Enhanced seasonal planning</li>
              <li>Better candidate experience</li>
              <li>Streamlined onboarding</li>
            </ul>

            <h2>7. Education First: Revolutionizing Academic Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/education-success.jpg"
                alt="Education First Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Education First's academic recruitment success:</p>
            <ul>
              <li>Improved faculty hiring</li>
              <li>Enhanced candidate screening</li>
              <li>Better credential verification</li>
              <li>Streamlined interview process</li>
              <li>Improved candidate experience</li>
            </ul>

            <h2>8. Manufacturing Pro: Industrial Recruitment Success</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/manufacturing-success.jpg"
                alt="Manufacturing Pro Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Manufacturing Pro's industrial hiring success:</p>
            <ul>
              <li>Reduced hiring time by 60%</li>
              <li>Improved candidate quality</li>
              <li>Enhanced safety compliance</li>
              <li>Better skill assessment</li>
              <li>Streamlined onboarding</li>
            </ul>

            {/* Conclusion */}
            <div className="mt-8 rounded-lg bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold text-xl">Conclusion</h3>
              <p>
                These success stories demonstrate how SwipeHire has transformed recruitment across
                various industries. From tech startups to established enterprises, organizations are
                achieving remarkable results in terms of efficiency, quality, and candidate
                experience. The key to success lies in embracing modern recruitment technology and
                best practices.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">
                Ready to Transform Your Recruitment Process?
              </h3>
              <p className="mb-4">
                Download our comprehensive case studies to learn more about how these organizations
                achieved their recruitment goals and how you can implement similar strategies.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WhitepaperCard
                  title="Success Stories Collection"
                  description="Detailed case studies of successful implementations"
                  imageUrl="/images/whitepapers/success-stories.jpg"
                  downloadUrl="/whitepapers/success-stories.pdf"
                  fileSize="3.2 MB"
                />
                <WhitepaperCard
                  title="Implementation Guide"
                  description="Step-by-step guide to successful implementation"
                  imageUrl="/images/whitepapers/implementation-guide.jpg"
                  downloadUrl="/whitepapers/implementation-guide.pdf"
                  fileSize="2.8 MB"
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
                Share your success story with SwipeHire. How has it transformed your recruitment
                process? What results have you achieved? Let's discuss in the comments below.
              </p>
            </div>

            {/* Related Articles */}
            <div className="mt-12 border-t pt-8">
              <h2 className="mb-6 font-bold text-2xl">Related Articles</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Link href="/blog/employer-best-practices" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Employer Best Practices
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Learn how to implement effective recruitment practices
                    </p>
                  </div>
                </Link>
                <Link href="/blog/data-privacy" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Data Privacy in Recruitment
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Essential practices for protecting candidate information
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
