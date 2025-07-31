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
            <p>TechCorp, a fast-growing software company, was struggling to keep up with its hiring demands. Their traditional recruitment process was slow, inefficient, and resulted in a high number of mis-hires. By implementing SwipeHire, TechCorp was able to revolutionize their tech recruitment process. They leveraged SwipeHire's AI-powered candidate screening to quickly identify the most qualified candidates, and used the platform's skills assessment tools to evaluate technical skills with a high degree of accuracy. The result was a 70% reduction in time-to-hire and a 45% improvement in candidate quality. But the benefits didn't stop there. SwipeHire also helped to enhance team collaboration by providing a centralized platform for communication and feedback. The streamlined interview process and improved candidate experience led to a significant increase in offer acceptance rates. "SwipeHire has been a game-changer for us," says Jane Doe, Head of Talent Acquisition at TechCorp. "We're now able to hire top tech talent faster and more efficiently than ever before."</p>

            <h2>2. Global Solutions: Scaling International Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/global-solutions.jpg"
                alt="Global Solutions Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Global Solutions, a multinational consulting firm, was facing the challenge of scaling its international hiring efforts. With offices in over 50 countries, they needed a recruitment platform that could handle the complexities of cross-border hiring, from compliance management to cultural fit assessment. SwipeHire provided the perfect solution. The platform's global capabilities allowed Global Solutions to streamline their international recruitment process, resulting in a 50% reduction in hiring costs and a significant improvement in compliance management. SwipeHire's cultural fit assessment tools also helped them to identify candidates who were not only qualified but also a good fit for the company's global culture. "SwipeHire has been an invaluable partner in our global expansion efforts," says John Smith, Global Head of Recruitment at Global Solutions. "The platform has allowed us to scale our hiring efforts quickly and efficiently, while ensuring that we maintain a high bar for quality and cultural fit."</p>

            <h2>3. StartupX: Building High-Performing Teams</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/startupx-success.jpg"
                alt="StartupX Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>StartupX, a high-growth tech startup, was in a race to build a high-performing team. They needed to hire top talent quickly, but they also needed to ensure that they were building a strong and cohesive culture. SwipeHire helped them to achieve both of these goals. The platform's streamlined workflow and automated processes allowed them to triple their team size in just six months. And the platform's focus on candidate engagement and experience helped them to build a strong employer brand and attract top talent. But the most impressive result was a 60% improvement in employee retention. By using SwipeHire to identify candidates who were a good fit for their culture, StartupX was able to build a team that was not only high-performing but also highly engaged and committed to the company's success. "SwipeHire has been instrumental in our success," says Sarah Lee, CEO of StartupX. "The platform has allowed us to build a world-class team and a culture that people love."</p>

            <h2>4. Enterprise Solutions: Modernizing Legacy Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/enterprise-success.jpg"
                alt="Enterprise Solutions Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Enterprise Solutions, a large and established company, was struggling with a legacy hiring process that was slow, cumbersome, and out of touch with the modern candidate. They knew they needed to modernize their approach to recruitment, but they were hesitant to make a change. SwipeHire provided them with a solution that was both powerful and easy to use. The platform's intuitive interface and streamlined workflows made it easy for their team to adopt, and the results were immediate. They saw a 65% reduction in hiring time and a significant improvement in candidate experience. But the biggest impact was on their ability to make data-driven decisions. SwipeHire's analytics and reporting tools provided them with the insights they needed to optimize their recruitment process and make more informed hiring decisions. "SwipeHire has brought our recruitment process into the 21st century," says David Chen, VP of HR at Enterprise Solutions. "We're now able to make smarter, faster, and more data-driven hiring decisions."</p>

            <h2>5. Healthcare Plus: Transforming Medical Recruitment</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/healthcare-success.jpg"
                alt="Healthcare Plus Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Healthcare Plus, a large hospital system, was facing a critical shortage of qualified medical professionals. They needed a recruitment solution that could help them to attract and hire top talent in a highly competitive market. SwipeHire provided them with a comprehensive solution that was tailored to the unique needs of the healthcare industry. The platform's advanced screening and credential verification tools helped them to ensure that they were hiring qualified and compliant professionals. And the platform's focus on candidate experience helped them to build a strong employer brand and attract top talent. The result was a significant improvement in candidate quality and a streamlined hiring process that reduced time-to-fill by 50%. "SwipeHire has been a lifesaver for us," says Maria Rodriguez, Chief Nursing Officer at Healthcare Plus. "The platform has allowed us to hire the qualified medical professionals we need to provide the best possible care to our patients."</p>

            <h2>6. Retail Giant: Scaling Seasonal Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/retail-success.jpg"
                alt="Retail Giant Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Retail Giant, a major retail chain, was facing the annual challenge of scaling their seasonal hiring efforts. They needed to hire thousands of temporary employees in a short period of time, and their manual process was simply not up to the task. SwipeHire provided them with a solution that was both scalable and efficient. The platform's automated workflow and bulk processing capabilities allowed them to reduce their hiring time by 80%. And the platform's mobile-friendly application process made it easy for candidates to apply from anywhere, at any time. The result was a significant improvement in candidate quality and a streamlined onboarding process that got new hires up to speed quickly. "SwipeHire has transformed our seasonal hiring process," says Tom Wilson, Head of Operations at Retail Giant. "We're now able to hire the staff we need to handle the holiday rush with ease."</p>

            <h2>7. Education First: Revolutionizing Academic Hiring</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/education-success.jpg"
                alt="Education First Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Education First, a leading university, was struggling to attract and hire top academic talent. Their traditional, paper-based hiring process was slow, inefficient, and out of touch with the expectations of modern academics. SwipeHire provided them with a solution that was tailored to the unique needs of the academic world. The platform's advanced screening and credential verification tools helped them to ensure that they were hiring qualified and experienced faculty. And the platform's collaborative review process made it easy for search committees to evaluate candidates and make informed decisions. The result was a significant improvement in faculty hiring and a streamlined interview process that improved the candidate experience. "SwipeHire has been a game-changer for our faculty recruitment efforts," says Dr. Emily Carter, Provost of Education First. "We're now able to attract and hire the best and brightest minds in academia."</p>

            <h2>8. Manufacturing Pro: Industrial Recruitment Success</h2>
            <div className="relative my-6 h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/blog/manufacturing-success.jpg"
                alt="Manufacturing Pro Success Story"
                fill
                className="object-cover"
              />
            </div>
            <p>Manufacturing Pro, a large industrial company, was facing a shortage of skilled labor. They needed a recruitment solution that could help them to attract and hire qualified workers in a tight labor market. SwipeHire provided them with a solution that was tailored to the unique needs of the manufacturing industry. The platform's skills assessment tools helped them to evaluate the technical skills of candidates with a high degree of accuracy. And the platform's focus on safety compliance helped them to ensure that they were hiring workers who were committed to a safe work environment. The result was a 60% reduction in hiring time and a significant improvement in candidate quality. "SwipeHire has helped us to build a skilled and safe workforce," says Mark Johnson, Plant Manager at Manufacturing Pro. "We're now able to meet our production goals and maintain a high level of quality and safety."</p>

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
