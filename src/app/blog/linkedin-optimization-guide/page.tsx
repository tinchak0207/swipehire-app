'use client';

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LinkedInOptimizationGuidePage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <article className="mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          {/* Meta Info */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>January 15, 2025</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>15 min read</span>
            </div>
            <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 font-semibold text-white text-xs">
              Essential Guide
            </span>
          </div>

          {/* Title & Author */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="mb-2 font-extrabold text-5xl text-gray-900 leading-tight">
              The Complete LinkedIn Optimization Guide: Transform Your Profile Into a Career Magnet
            </h1>
            <ShareButton
              url={currentUrl}
              title="The Complete LinkedIn Optimization Guide: Transform Your Profile Into a Career Magnet"
            />
          </div>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <span className="text-gray-400">
                <Users className="h-6 w-6" />
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Michael Rodriguez</span>
              <div className="text-gray-500 text-xs">LinkedIn Strategy Expert & Career Coach</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src="/images/blog/digital-personal-branding.jpg"
              alt="LinkedIn Optimization Guide"
              fill
              className="object-cover"
              priority
            />
          </div>

          <section className="prose prose-lg max-w-none text-gray-700">
            {/* Quote Block */}
            <blockquote className="mb-8 rounded-md border-blue-500 border-l-4 bg-blue-50 p-4 font-medium text-gray-700 text-lg">
              "Your LinkedIn profile is your 24/7 personal brand ambassador. In today's
              digital-first world, 87% of recruiters use LinkedIn to evaluate candidates, making
              your profile optimization crucial for career success."
            </blockquote>

            {/* Introduction */}
            <p>
              LinkedIn has evolved far beyond a simple networking platform—it's now the world's
              largest professional community with over 900 million members. Whether you're actively
              job hunting, looking to advance in your current role, or building your professional
              brand, your LinkedIn profile serves as your digital business card, portfolio, and
              networking hub all rolled into one. This comprehensive guide will walk you through
              every aspect of LinkedIn optimization, from crafting compelling headlines to building
              meaningful connections that drive career opportunities.
            </p>

            <p>
              The statistics speak for themselves: professionals with complete LinkedIn profiles are
              40 times more likely to receive opportunities through the platform. Yet, despite this
              compelling data, many professionals treat their LinkedIn profiles as afterthoughts,
              missing countless opportunities for career advancement, business development, and
              professional growth. This guide will change that, providing you with actionable
              strategies to transform your profile into a powerful career catalyst.
            </p>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg border-blue-500 border-l-4 bg-blue-50 p-6">
              <h3 className="mb-4 font-semibold text-blue-700 text-xl">Key Takeaways</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li>Optimize every section of your LinkedIn profile for maximum visibility</li>
                <li>Craft compelling headlines and summaries that showcase your unique value</li>
                <li>Build strategic connections and engage meaningfully with your network</li>
                <li>Leverage LinkedIn's publishing platform to establish thought leadership</li>
                <li>Use data and analytics to continuously improve your profile performance</li>
                <li>Master LinkedIn's algorithm to increase your content reach and engagement</li>
              </ul>
            </div>

            {/* Main Content Sections */}
            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              1. Profile Foundation: Creating Your Digital First Impression
            </h2>

            <Card className="border-l-4 border-blue-500 bg-blue-50/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Zap className="mr-2 h-6 w-6" /> The Power of Professional Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-900">
                <p>
                  Your profile photo is the first thing people notice, and profiles with
                  professional photos receive 21 times more profile views and 36 times more
                  messages. Invest in a high-quality headshot where you're smiling, making eye
                  contact with the camera, and dressed appropriately for your industry. The
                  background should be neutral and non-distracting. Avoid selfies, group photos, or
                  images with poor lighting—these immediately diminish your professional
                  credibility.
                </p>
              </CardContent>
            </Card>

            <p>
              Your LinkedIn headline is prime real estate—it appears next to your name in search
              results, connection requests, and posts. Instead of simply listing your job title,
              craft a compelling headline that showcases your value proposition. Use relevant
              keywords that your target audience might search for, and consider including measurable
              achievements or unique qualifications. For example, instead of "Marketing Manager,"
              try "Digital Marketing Manager | Driving 300% ROI Growth | B2B SaaS Specialist |
              Content Strategy Expert."
            </p>

            <p>
              The summary section is your elevator pitch in written form. This is where you tell
              your professional story, highlighting your expertise, achievements, and career
              aspirations. Start with a hook that grabs attention, then dive into your professional
              background, key accomplishments, and what you're passionate about. Use bullet points
              to break up text and make it more scannable. Include relevant keywords naturally
              throughout your summary to improve search visibility, but avoid keyword stuffing that
              makes your content sound robotic.
            </p>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              2. Experience Section: Showcasing Your Professional Journey
            </h2>

            <p>
              Your experience section should read like a collection of success stories rather than a
              dry list of job duties. For each role, start with a brief overview of the company and
              your position, then dive into specific achievements and outcomes. Use action verbs and
              quantify your results whenever possible. Instead of saying "responsible for managing
              social media," write "Developed and executed social media strategy that increased
              follower engagement by 150% and generated $2M in attributed revenue over 18 months."
            </p>

            <p>
              Many professionals make the mistake of treating their LinkedIn experience section like
              a traditional resume, focusing on responsibilities rather than results. LinkedIn gives
              you more space to tell your story, so use it wisely. Include context about challenges
              you faced, strategies you implemented, and results you achieved. This narrative
              approach helps potential employers or clients understand not just what you did, but
              how you think and solve problems.
            </p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Use the STAR method (Situation, Task, Action, Result) to structure your experience
                descriptions. This framework helps you tell compelling stories that demonstrate your
                problem-solving abilities and impact. For each significant achievement, briefly
                describe the situation, explain the task or challenge, detail the actions you took,
                and highlight the measurable results.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              3. Skills and Recommendations: Building Social Proof
            </h2>

            <p>
              The skills section is more than just a list—it's a strategic tool for improving your
              search visibility and demonstrating your expertise. LinkedIn allows you to list up to
              50 skills, but focus on quality over quantity. Prioritize skills that are most
              relevant to your career goals and industry. Pin your top three skills to ensure
              they're prominently displayed. Regularly audit and update your skills list to reflect
              your current expertise and market demands.
            </p>

            <p>
              Recommendations are powerful social proof that can set you apart from other
              professionals. Reach out to former colleagues, managers, clients, or direct reports
              who can speak to your work quality and character. When requesting recommendations,
              make it easy for the recommender by providing specific talking points or achievements
              you'd like them to highlight. Offer to write recommendations in return—this reciprocal
              approach often yields better results and strengthens professional relationships.
            </p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                When requesting recommendations, provide a draft or bullet points highlighting key
                achievements. This makes it easier for the recommender and ensures important
                accomplishments are included. Remember, quality recommendations from relevant
                professionals carry more weight than numerous generic ones.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              4. Content Strategy: Establishing Thought Leadership
            </h2>

            <p>
              Consistent content creation is crucial for LinkedIn success, but many professionals
              struggle with what to post. Focus on sharing valuable insights, industry trends,
              professional experiences, and lessons learned. Mix different content types: text
              posts, images, videos, and articles. Share others' content with thoughtful commentary
              that adds your unique perspective. The key is providing value to your network while
              showcasing your expertise and personality.
            </p>

            <p>
              LinkedIn's publishing platform offers an excellent opportunity to establish thought
              leadership through long-form content. Write articles about industry trends, career
              advice, case studies, or professional insights. Well-written articles can
              significantly boost your profile visibility and position you as an expert in your
              field. Share your articles across other social media platforms and with your email
              list to maximize reach and engagement.
            </p>

            <Card className="border-l-4 border-green-500 bg-green-50/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <TrendingUp className="mr-2 h-6 w-6" /> Understanding LinkedIn's Algorithm
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-900">
                <p>
                  LinkedIn's algorithm prioritizes content that generates engagement within the
                  first hour of posting. Focus on posting when your audience is most active
                  (typically Tuesday through Thursday, 9 AM to 12 PM). Use native video when
                  possible, as it receives 5x more engagement than other content types. Ask
                  questions to encourage comments, and respond quickly to engagement to boost your
                  post's visibility further.
                </p>
              </CardContent>
            </Card>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              5. Networking Strategy: Building Meaningful Connections
            </h2>

            <p>
              Quality trumps quantity when it comes to LinkedIn connections. Focus on building
              relationships with people in your industry, potential collaborators, and professionals
              whose careers you admire. When sending connection requests, always include a
              personalized message explaining why you'd like to connect. Generic connection requests
              are often ignored and can hurt your networking efforts.
            </p>

            <p>
              Once connected, nurture these relationships through meaningful engagement. Comment
              thoughtfully on their updates, share their content when relevant, and reach out with
              congratulations on achievements or job changes. Remember birthdays and work
              anniversaries—LinkedIn makes this easy with notifications. These small gestures help
              maintain relationships and keep you top-of-mind for opportunities.
            </p>

            <p>
              Leverage LinkedIn Groups to expand your network and establish expertise. Join groups
              relevant to your industry, interests, and career goals. Participate actively in
              discussions, share valuable insights, and connect with other engaged members. Groups
              provide a natural conversation starter when reaching out to new connections and can
              significantly expand your professional network beyond your immediate circles.
            </p>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              6. Advanced Features: Maximizing LinkedIn's Potential
            </h2>

            <p>
              LinkedIn offers several advanced features that many professionals underutilize. The
              "Open to Work" banner discreetly signals to recruiters that you're job searching while
              allowing you to specify the types of opportunities you're interested in. LinkedIn
              Learning provides an excellent opportunity to acquire new skills and showcase your
              commitment to professional development—completed courses appear on your profile.
            </p>

            <p>
              LinkedIn Sales Navigator, while primarily designed for sales professionals, can be
              valuable for job seekers and networkers. It provides advanced search capabilities,
              lead recommendations, and insights about companies and professionals. If your industry
              involves business development or client relationships, consider investing in this
              premium tool to enhance your networking and opportunity identification capabilities.
            </p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Use LinkedIn's messaging feature strategically. Instead of immediately pitching
                yourself or your services, focus on building relationships. Ask thoughtful
                questions, offer help, or share relevant resources. This approach builds trust and
                often leads to more meaningful opportunities than direct solicitation.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              7. Analytics and Optimization: Measuring Your Success
            </h2>

            <p>
              LinkedIn provides valuable analytics about your profile and content performance.
              Regularly review your profile views, search appearances, and post engagement metrics.
              These insights help you understand what's working and what needs improvement. If
              certain types of content consistently perform well, create more similar content. If
              your profile views are declining, consider updating your headline, summary, or posting
              frequency.
            </p>

            <p>
              Set up Google Alerts for your name and industry keywords to stay informed about
              mentions and trends. This intelligence can inform your content strategy and help you
              join relevant conversations. Track your connection growth, but focus more on
              engagement quality than quantity. A smaller network of engaged professionals is more
              valuable than thousands of passive connections.
            </p>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              8. Common Mistakes to Avoid
            </h2>

            <p>
              Many professionals sabotage their LinkedIn success through common mistakes. Avoid
              posting controversial political or personal content that could alienate potential
              connections or employers. Don't use LinkedIn as a platform for complaints about
              current or former employers—this reflects poorly on your professionalism. Resist the
              urge to connect with everyone; focus on building a strategic network of relevant
              professionals.
            </p>

            <p>
              Another critical mistake is treating LinkedIn as a one-way broadcasting platform.
              Social media is inherently social, so engage with others' content regularly. Comment
              thoughtfully on posts, share valuable content from your network, and participate in
              meaningful conversations. This engagement increases your visibility and builds
              stronger professional relationships.
            </p>

            <div className="my-6 rounded-md border-red-400 border-l-4 bg-red-50 p-4">
              <span className="mb-1 block font-semibold text-red-700">Common Pitfall:</span>
              <span>
                Avoid the "spray and pray" approach to connection requests. Sending generic
                invitations to hundreds of people rarely results in meaningful connections and can
                get your account flagged for spam. Instead, focus on quality connections with
                personalized messages that explain the mutual benefit of connecting.
              </span>
            </div>

            {/* Conclusion */}
            <div className="my-8 rounded-lg border-blue-500 border-l-4 bg-blue-50 p-6">
              <h3 className="mb-2 font-semibold text-blue-700 text-xl">
                Your LinkedIn Transformation Journey
              </h3>
              <p>
                Optimizing your LinkedIn profile is not a one-time task—it's an ongoing process that
                requires consistent attention and refinement. Start by implementing the foundational
                elements: professional photo, compelling headline, and comprehensive summary. Then
                gradually incorporate advanced strategies like content creation, strategic
                networking, and analytics review. Remember, LinkedIn success comes from authentic
                engagement and providing value to your professional community.
              </p>
              <p className="mt-4">
                The investment you make in your LinkedIn presence today will pay dividends
                throughout your career. Whether you're seeking new opportunities, building client
                relationships, or establishing thought leadership, a well-optimized LinkedIn profile
                serves as your most powerful professional asset. Start implementing these strategies
                today, and watch as your LinkedIn profile transforms from a static resume into a
                dynamic career catalyst.
              </p>
            </div>

            <div className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h3 className="mb-4 font-bold text-2xl text-gray-800">
                Ready to Supercharge Your LinkedIn Profile?
              </h3>
              <p className="mb-6 text-gray-600">
                Take your professional presence to the next level with our{' '}
                <Link
                  href="/resume-optimizer"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  AI-Powered Resume Optimizer
                </Link>{' '}
                that also provides LinkedIn optimization recommendations. Our advanced technology
                analyzes your profile against industry best practices and top performers in your
                field, providing personalized suggestions to improve your visibility and engagement.
              </p>
              <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/resume-optimizer">
                  Optimize Your Profile Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Whitepaper Download Section */}
          <section className="mt-16">
            <h2 className="mb-4 font-bold text-2xl text-gray-900">
              Download Our LinkedIn Optimization Checklist
            </h2>
            <WhitepaperCard
              title="LinkedIn Optimization Checklist"
              description="A comprehensive PDF checklist with over 50 actionable tips to maximize your LinkedIn profile's effectiveness and visibility."
              imageUrl="/images/whitepapers/linkedin-optimization-checklist.jpg"
              downloadUrl="/whitepapers/linkedin-optimization-checklist.pdf"
              fileSize="1.8 MB"
            />
          </section>

          {/* Related Articles */}
          <section className="mt-20 border-t pt-8">
            <h2 className="mb-6 font-bold text-2xl text-gray-900">Related Articles</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Link href="/blog/digital-personal-branding" className="group">
                <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md group-hover:translate-x-2">
                  <h3 className="font-semibold text-xl transition-colors group-hover:text-blue-600">
                    Personal Branding in the Digital Age
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Build your professional identity online with effective digital branding
                    strategies
                  </p>
                </div>
              </Link>
              <Link href="/blog/career-transition-strategies" className="group">
                <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md group-hover:translate-x-2">
                  <h3 className="font-semibold text-xl transition-colors group-hover:text-blue-600">
                    Career Transition Strategies
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Navigate career changes successfully with proven transition strategies
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* Comments/Engagement */}
          <section className="mt-16 border-t pt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-2xl text-gray-900">Join the Conversation</h2>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Leave a Comment
              </Button>
            </div>
            <p className="mb-6 text-gray-500">
              What LinkedIn optimization strategies have worked best for you? Share your experiences
              and tips to help other professionals maximize their LinkedIn presence.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
