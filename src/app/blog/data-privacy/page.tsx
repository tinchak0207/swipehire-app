'use client';

import { ArrowLeft, Calendar, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';

export default function DataPrivacyPage() {
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
              <span>10 min read</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Critical</span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-bold text-4xl leading-tight">
              Data Privacy in Recruitment: 8 Essential Practices to Protect Candidate Information in
              2024
            </h1>
            <ShareButton
              url={currentUrl}
              title="Data Privacy in Recruitment: 8 Essential Practices to Protect Candidate Information in 2024"
            />
          </div>

          <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/blog/data-privacy.jpg"
              alt="Data Privacy in Recruitment"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-8 rounded-lg bg-muted/50 p-6">
              <p className="lead font-medium text-lg">
                "Data breaches in recruitment can cost companies up to $3.86 million and result in a
                60% loss of candidate trust."
              </p>
              <p className="mt-4">
                In today's digital recruitment landscape, protecting candidate data is not just a
                legal requirement—it's a critical component of building trust and maintaining a
                strong employer brand. This comprehensive guide explores eight essential practices
                that organizations must implement to ensure data privacy and security throughout the
                recruitment process.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">Key Takeaways</h3>
              <ul className="space-y-2">
                <li>Implement robust data protection measures</li>
                <li>Ensure GDPR and CCPA compliance</li>
                <li>Secure candidate data storage and transmission</li>
                <li>Establish clear data retention policies</li>
                <li>Train staff on data privacy best practices</li>
              </ul>
            </div>

            {/* Main Content */}
            <h2>1. Understanding Data Privacy Regulations: The Legal Framework</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/privacy-regulations.jpg"
                alt="Data Privacy Regulations"
                fill
                className="object-cover"
              />
            </div>
            <p>Navigate the complex regulatory landscape:</p>
            <ul>
              <li>Comply with GDPR requirements</li>
              <li>Understand CCPA obligations</li>
              <li>Follow industry-specific regulations</li>
              <li>Stay updated on legal changes</li>
              <li>Document compliance measures</li>
            </ul>

            <h2>2. Secure Data Collection: Protecting Information from the Start</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/data-collection.jpg"
                alt="Secure Data Collection"
                fill
                className="object-cover"
              />
            </div>
            <p>Implement secure data collection practices:</p>
            <ul>
              <li>Use encrypted application forms</li>
              <li>Implement secure file uploads</li>
              <li>Collect only necessary information</li>
              <li>Obtain explicit consent</li>
              <li>Provide clear privacy notices</li>
            </ul>

            <h2>3. Data Storage and Security: Keeping Information Safe</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/data-storage.jpg"
                alt="Data Storage and Security"
                fill
                className="object-cover"
              />
            </div>
            <p>Ensure secure data storage:</p>
            <ul>
              <li>Use encrypted databases</li>
              <li>Implement access controls</li>
              <li>Regular security audits</li>
              <li>Backup data securely</li>
              <li>Monitor for breaches</li>
            </ul>

            <h2>4. Data Retention and Deletion: Managing Information Lifecycle</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/data-retention.jpg"
                alt="Data Retention and Deletion"
                fill
                className="object-cover"
              />
            </div>
            <p>Establish clear retention policies:</p>
            <ul>
              <li>Define retention periods</li>
              <li>Implement automated deletion</li>
              <li>Process deletion requests</li>
              <li>Document data lifecycle</li>
              <li>Regular data cleanup</li>
            </ul>

            <h2>5. Third-Party Vendor Management: Extending Security</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/vendor-management.jpg"
                alt="Third-Party Vendor Management"
                fill
                className="object-cover"
              />
            </div>
            <p>Manage vendor relationships securely:</p>
            <ul>
              <li>Vet vendors thoroughly</li>
              <li>Sign data processing agreements</li>
              <li>Monitor vendor compliance</li>
              <li>Regular security assessments</li>
              <li>Maintain vendor documentation</li>
            </ul>

            <h2>6. Candidate Rights: Respecting Privacy Choices</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/candidate-rights.jpg"
                alt="Candidate Rights"
                fill
                className="object-cover"
              />
            </div>
            <p>Honor candidate privacy rights:</p>
            <ul>
              <li>Process access requests</li>
              <li>Handle data corrections</li>
              <li>Respect opt-out requests</li>
              <li>Provide data portability</li>
              <li>Maintain request logs</li>
            </ul>

            <h2>7. Staff Training and Awareness: Building a Privacy Culture</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/privacy-training.jpg"
                alt="Staff Training and Awareness"
                fill
                className="object-cover"
              />
            </div>
            <p>Train staff on privacy practices:</p>
            <ul>
              <li>Regular privacy training</li>
              <li>Security awareness programs</li>
              <li>Incident response training</li>
              <li>Best practices guidelines</li>
              <li>Regular policy updates</li>
            </ul>

            <h2>8. Incident Response: Preparing for the Unexpected</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/incident-response.jpg"
                alt="Incident Response"
                fill
                className="object-cover"
              />
            </div>
            <p>Handle data incidents effectively:</p>
            <ul>
              <li>Develop response plans</li>
              <li>Train incident response teams</li>
              <li>Maintain incident logs</li>
              <li>Notify affected parties</li>
              <li>Learn from incidents</li>
            </ul>

            {/* Conclusion */}
            <div className="mt-8 rounded-lg bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold text-xl">Conclusion</h3>
              <p>
                Data privacy in recruitment is not just about compliance—it's about building trust
                and protecting candidate information. By implementing these eight essential
                practices, organizations can create a secure and privacy-focused recruitment process
                that respects candidate rights and maintains data security.
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-8 rounded-lg bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-xl">
                Ready to Enhance Your Data Privacy Practices?
              </h3>
              <p className="mb-4">
                Download our comprehensive guides to learn more about implementing effective data
                privacy measures and ensuring compliance in recruitment.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WhitepaperCard
                  title="Data Privacy in Recruitment Guide"
                  description="Complete guide to protecting candidate data"
                  imageUrl="/images/whitepapers/data-privacy-guide.jpg"
                  downloadUrl="/whitepapers/data-privacy-guide.pdf"
                  fileSize="2.4 MB"
                />
                <WhitepaperCard
                  title="GDPR Compliance Checklist"
                  description="Essential steps for GDPR compliance in recruitment"
                  imageUrl="/images/whitepapers/gdpr-checklist.jpg"
                  downloadUrl="/whitepapers/gdpr-checklist.pdf"
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
                Share your data privacy experiences. What challenges have you faced? What solutions
                have worked for your organization? Let's discuss in the comments below.
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
                <Link href="/blog/success-stories" className="group">
                  <div className="rounded-lg border p-6 transition-colors hover:border-primary">
                    <h3 className="font-semibold text-xl group-hover:text-primary">
                      Success Stories
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Discover how organizations have improved their recruitment process
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
