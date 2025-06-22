'use client';

import { ArrowLeft, Calendar, Clock, MessageSquare, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';
import { Button } from '@/components/ui/button';

export default function VideoResumeTipsPage() {
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
              <span>March 14, 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>10 min read</span>
            </div>
            <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 font-semibold text-white text-xs">
              Popular
            </span>
          </div>

          {/* Title & Author */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="mb-2 font-extrabold text-5xl text-gray-900 leading-tight">
              Video Resume Mastery: 7 Expert Tips to Make Your Application Stand Out in 2024
            </h1>
            <ShareButton
              url={currentUrl}
              title="Video Resume Mastery: 7 Expert Tips to Make Your Application Stand Out in 2024"
            />
          </div>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <span className="text-gray-400">
                <Users className="h-6 w-6" />
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Sarah Chen</span>
              <div className="text-gray-500 text-xs">Senior HR Consultant</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src="/images/blog/video-resume-main.jpg"
              alt="Video Resume Tips"
              fill
              className="object-cover"
              priority
            />
          </div>

          <section className="prose prose-lg max-w-none text-gray-700">
            {/* Quote Block */}
            <blockquote className="mb-8 rounded-md border-blue-500 border-l-4 bg-blue-50 p-4 font-medium text-gray-700 text-lg">
              "Candidates who submit video resumes are 3x more likely to get an interview than those
              who only submit traditional resumes."
            </blockquote>

            {/* Introduction */}
            <p>
              In today's digital-first job market, a video resume can be your secret weapon for
              standing out. But creating an effective video resume requires more than just turning
              on your camera. In this comprehensive guide, we'll share seven expert tips to help you
              create a compelling video resume that captures attention and showcases your unique
              value proposition.
            </p>

            {/* Key Takeaways */}
            <div className="mb-8 rounded-lg border-blue-500 border-l-4 bg-blue-50 p-6">
              <h3 className="mb-4 font-semibold text-blue-700 text-xl">Key Takeaways</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li>Keep your video resume under 2 minutes</li>
                <li>Focus on storytelling and personality</li>
                <li>Use professional lighting and audio</li>
                <li>Include specific achievements and examples</li>
                <li>End with a clear call to action</li>
              </ul>
            </div>

            {/* Main Content Sections */}
            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              1. Planning Your Content: The Foundation of Success
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-planning.jpg"
                alt="Video Resume Planning"
                fill
                className="object-cover"
              />
            </div>
            <p>Before hitting record, take time to plan your content:</p>
            <ul className="list-disc pl-5">
              <li>Create a detailed script or outline</li>
              <li>Identify your key selling points</li>
              <li>Structure your content logically</li>
              <li>Practice your delivery</li>
              <li>Time your presentation</li>
            </ul>

            {/* Pro Tip Callout */}
            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Practice in front of a mirror or record a test video to refine your delivery and
                body language.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              2. Technical Setup: Professional Quality Matters
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-setup.jpg"
                alt="Video Resume Setup"
                fill
                className="object-cover"
              />
            </div>
            <p>Ensure your video looks and sounds professional:</p>
            <ul className="list-disc pl-5">
              <li>Use good lighting (natural or artificial)</li>
              <li>Invest in a quality microphone</li>
              <li>Choose a clean, professional background</li>
              <li>Test your equipment before recording</li>
              <li>Record in a quiet environment</li>
            </ul>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Natural light from a window is often the best and most flattering source for video
                resumes.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              3. Presentation Skills: Making a Lasting Impression
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-presentation.jpg"
                alt="Video Resume Presentation"
                fill
                className="object-cover"
              />
            </div>
            <p>Master the art of on-camera presentation:</p>
            <ul className="list-disc pl-5">
              <li>Maintain good posture and eye contact</li>
              <li>Speak clearly and at a moderate pace</li>
              <li>Use natural gestures and expressions</li>
              <li>Dress professionally</li>
              <li>Show enthusiasm and confidence</li>
            </ul>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>Smile and let your personality shine—employers want to see the real you!</span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              4. Content Structure: Telling Your Story
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-structure.jpg"
                alt="Video Resume Structure"
                fill
                className="object-cover"
              />
            </div>
            <p>Organize your content for maximum impact:</p>
            <ul className="list-disc pl-5">
              <li>Start with a strong introduction</li>
              <li>Highlight key achievements with examples</li>
              <li>Showcase relevant skills and experience</li>
              <li>Include specific metrics and results</li>
              <li>End with a clear call to action</li>
            </ul>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Use real numbers and results to make your achievements more credible and memorable.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              5. Common Mistakes to Avoid
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-mistakes.jpg"
                alt="Video Resume Mistakes"
                fill
                className="object-cover"
              />
            </div>
            <p>Steer clear of these common pitfalls:</p>
            <ul className="list-disc pl-5">
              <li>Making the video too long</li>
              <li>Reading directly from a script</li>
              <li>Using poor lighting or audio</li>
              <li>Including irrelevant information</li>
              <li>Forgetting to proof your content</li>
            </ul>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>Keep your video concise and focused—less is often more!</span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              6. Technical Tips for Success
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-technical.jpg"
                alt="Video Resume Technical Tips"
                fill
                className="object-cover"
              />
            </div>
            <p>Optimize your video for professional viewing:</p>
            <ul className="list-disc pl-5">
              <li>Use high-quality video resolution</li>
              <li>Ensure good audio quality</li>
              <li>Add subtitles or captions</li>
              <li>Include a professional thumbnail</li>
              <li>Export in a widely supported format (MP4)</li>
            </ul>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Review your video on multiple devices to ensure quality and compatibility.
              </span>
            </div>

            <h2 className="mt-12 mb-4 font-bold text-3xl text-gray-900">
              7. Stand Out: Show Your Personality
            </h2>
            <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/blog/video-resume-standout.jpg"
                alt="Stand Out with Your Video Resume"
                fill
                className="object-cover"
              />
            </div>
            <p>Let your unique qualities shine through:</p>
            <ul className="list-disc pl-5">
              <li>Share a personal story or passion</li>
              <li>Showcase creativity and authenticity</li>
              <li>Tailor your message to the job and company</li>
              <li>Express enthusiasm for the role</li>
              <li>Be yourself—employers value authenticity</li>
            </ul>

            {/* Conclusion */}
            <div className="my-8 rounded-lg border-blue-500 border-l-4 bg-blue-50 p-6">
              <h3 className="mb-2 font-semibold text-blue-700 text-xl">Conclusion</h3>
              <p>
                A well-crafted video resume can set you apart in a crowded job market. By following
                these expert tips, you'll be well on your way to creating a video resume that gets
                noticed—and gets results. Ready to take your job search to the next level? Start
                recording today!
              </p>
            </div>
          </section>

          {/* Whitepaper Download Section */}
          <section className="mt-16">
            <h2 className="mb-4 font-bold text-2xl text-gray-900">
              Download Our Free Video Resume Guide
            </h2>
            <WhitepaperCard
              title="Video Resume Guide"
              description="A step-by-step PDF guide to help you plan, record, and edit a winning video resume."
              imageUrl="/images/whitepapers/video-resume-guide.jpg"
              downloadUrl="/whitepapers/video-resume-guide.pdf"
              fileSize="2.1 MB"
            />
          </section>

          {/* Related Articles */}
          <section className="mt-20 border-t pt-8">
            <h2 className="mb-6 font-bold text-2xl text-gray-900">Related Articles</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Link href="/blog/remote-work-guide" className="group">
                <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md group-hover:translate-x-2">
                  <h3 className="font-semibold text-xl transition-colors group-hover:text-blue-600">
                    Remote Work Guide
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Learn how to thrive in a remote work environment
                  </p>
                </div>
              </Link>
              <Link href="/blog/employer-best-practices" className="group">
                <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md group-hover:translate-x-2">
                  <h3 className="font-semibold text-xl transition-colors group-hover:text-blue-600">
                    Employer Best Practices
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Discover how employers evaluate video resumes
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
              Share your video resume experiences. What tips have worked for you? What challenges
              have you faced? Let's discuss in the comments below.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
