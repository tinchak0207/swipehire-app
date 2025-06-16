"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, TrendingUp, Share2, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ShareButton } from '@/components/blog/ShareButton';
import { WhitepaperCard } from '@/components/blog/WhitepaperCard';

export default function VideoResumeTipsPage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>March 14, 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>10 min read</span>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold ml-2">Popular</span>
          </div>

          {/* Title & Author */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-5xl font-extrabold leading-tight text-gray-900 mb-2">Video Resume Mastery: 7 Expert Tips to Make Your Application Stand Out in 2024</h1>
            <ShareButton url={currentUrl} title="Video Resume Mastery: 7 Expert Tips to Make Your Application Stand Out in 2024" />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400"><Users className="w-6 h-6" /></span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Sarah Chen</span>
              <div className="text-xs text-gray-500">Senior HR Consultant</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden shadow-lg">
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
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-md mb-8 text-lg font-medium text-gray-700">
              "Candidates who submit video resumes are 3x more likely to get an interview than those who only submit traditional resumes."
            </blockquote>

            {/* Introduction */}
            <p>
              In today's digital-first job market, a video resume can be your secret weapon for standing out. But creating an effective video resume requires more than just turning on your camera. In this comprehensive guide, we'll share seven expert tips to help you create a compelling video resume that captures attention and showcases your unique value proposition.
            </p>

            {/* Key Takeaways */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">Key Takeaways</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>Keep your video resume under 2 minutes</li>
                <li>Focus on storytelling and personality</li>
                <li>Use professional lighting and audio</li>
                <li>Include specific achievements and examples</li>
                <li>End with a clear call to action</li>
              </ul>
            </div>

            {/* Main Content Sections */}
            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">1. Planning Your Content: The Foundation of Success</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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
            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-md my-6">
              <span className="block font-semibold text-gray-700 mb-1">Pro Tip:</span>
              <span>Practice in front of a mirror or record a test video to refine your delivery and body language.</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">2. Technical Setup: Professional Quality Matters</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-md my-6">
              <span className="block font-semibold text-gray-700 mb-1">Pro Tip:</span>
              <span>Natural light from a window is often the best and most flattering source for video resumes.</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">3. Presentation Skills: Making a Lasting Impression</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-md my-6">
              <span className="block font-semibold text-gray-700 mb-1">Pro Tip:</span>
              <span>Smile and let your personality shine—employers want to see the real you!</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">4. Content Structure: Telling Your Story</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-md my-6">
              <span className="block font-semibold text-gray-700 mb-1">Pro Tip:</span>
              <span>Use real numbers and results to make your achievements more credible and memorable.</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">5. Common Mistakes to Avoid</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-md my-6">
              <span className="block font-semibold text-gray-700 mb-1">Pro Tip:</span>
              <span>Keep your video concise and focused—less is often more!</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">6. Technical Tips for Success</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-md my-6">
              <span className="block font-semibold text-gray-700 mb-1">Pro Tip:</span>
              <span>Review your video on multiple devices to ensure quality and compatibility.</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">7. Stand Out: Show Your Personality</h2>
            <div className="relative w-full aspect-[16/9] my-6 rounded-lg overflow-hidden shadow-lg">
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
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-2 text-blue-700">Conclusion</h3>
              <p>
                A well-crafted video resume can set you apart in a crowded job market. By following these expert tips, you'll be well on your way to creating a video resume that gets noticed—and gets results. Ready to take your job search to the next level? Start recording today!
              </p>
            </div>
          </section>

          {/* Whitepaper Download Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Download Our Free Video Resume Guide</h2>
            <WhitepaperCard
              title="Video Resume Guide"
              description="A step-by-step PDF guide to help you plan, record, and edit a winning video resume."
              imageUrl="/images/whitepapers/video-resume-guide.jpg"
              downloadUrl="/whitepapers/video-resume-guide.pdf"
              fileSize="2.1 MB"
            />
          </section>

          {/* Related Articles */}
          <section className="mt-20 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/blog/remote-work-guide" className="group">
                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow group-hover:translate-x-2 bg-white">
                  <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">Remote Work Guide</h3>
                  <p className="text-gray-500 mt-2">Learn how to thrive in a remote work environment</p>
                </div>
              </Link>
              <Link href="/blog/employer-best-practices" className="group">
                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow group-hover:translate-x-2 bg-white">
                  <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">Employer Best Practices</h3>
                  <p className="text-gray-500 mt-2">Discover how employers evaluate video resumes</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Comments/Engagement */}
          <section className="mt-16 pt-8 border-t">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Join the Conversation</h2>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Leave a Comment
              </Button>
            </div>
            <p className="text-gray-500 mb-6">
              Share your video resume experiences. What tips have worked for you? What challenges have you faced? Let's discuss in the comments below.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
} 