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
            <p>A great video resume starts with a great plan. Before you even think about hitting the record button, take the time to carefully plan your content. This is the foundation upon which your entire video will be built. Start by creating a detailed script or outline. This will help you to structure your thoughts and ensure that you cover all of your key selling points. Identify the top three to five things you want the hiring manager to know about you, and make sure these are front and center in your video. Structure your content logically, with a clear beginning, middle, and end. Practice your delivery multiple times, until you feel comfortable and confident. And finally, time your presentation to ensure that it is concise and to the point. Remember, the ideal length for a video resume is between 60 and 90 seconds.</p>

            {/* Pro Tip Callout */}
            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Practice in front of a mirror or record a test video to refine your delivery and
                body language. Pay attention to your posture, gestures, and facial expressions. A confident and engaging presence can make all the difference.
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
            <p>You don't need a Hollywood studio to create a professional-looking video resume, but you do need to pay attention to the technical details. Good lighting is essential. Natural light from a window is often the best option, but if that's not possible, use a ring light or other artificial light source to illuminate your face. A quality microphone is also a must. The built-in microphone on your laptop or phone may not be sufficient, so consider investing in an external microphone to ensure that your audio is clear and crisp. Choose a clean and professional background that is free from clutter. A neutral wall or a bookshelf can work well. Test your equipment before you start recording to make sure everything is working properly. And finally, record in a quiet environment where you won't be interrupted.</p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Natural light from a window is often the best and most flattering source for video
                resumes. Position yourself so that the light is facing you, not behind you. This will help to eliminate shadows and create a more professional look.
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
            <p>Your presentation skills are just as important as the content of your video resume. After all, you're not just sharing information; you're making a personal connection with the hiring manager. Maintain good posture and make eye contact with the camera. This will help to create a sense of connection and engagement. Speak clearly and at a moderate pace. Avoid speaking too quickly or too slowly. Use natural gestures and facial expressions to convey your personality and enthusiasm. Dress professionally, as you would for an in-person interview. And most importantly, show enthusiasm and confidence. Let your passion for your work shine through. A genuine smile can go a long way in making a positive impression.</p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>Smile and let your personality shine—employers want to see the real you! Authenticity is key. Don't try to be someone you're not. Let your unique personality and passion come through in your video.</span>
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
            <p>The way you structure your content can have a big impact on its effectiveness. Start with a strong introduction that grabs the viewer's attention and clearly states who you are and what you do. Then, highlight your key achievements with specific examples. Don't just say you're a great team player; tell a story about a time you collaborated with a team to achieve a difficult goal. Showcase your relevant skills and experience, and be sure to include specific metrics and results to quantify your accomplishments. For example, instead of saying you "improved sales," say you "increased sales by 15% in the first quarter." Finally, end with a clear call to action. Tell the hiring manager what you want them to do next, whether it's visiting your LinkedIn profile or scheduling an interview.</p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Use real numbers and results to make your achievements more credible and memorable.
                Quantifying your accomplishments is one of the most powerful things you can do to make your video resume stand out.
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
            <p>There are a few common mistakes that can derail an otherwise great video resume. One of the biggest is making the video too long. Remember, hiring managers are busy people, so keep your video concise and to the point. Another common mistake is reading directly from a script. This can make you sound robotic and unnatural. Instead, use your script as a guide, but speak in your own words. Poor lighting or audio can also be a major turn-off, so make sure your technical setup is up to par. Including irrelevant information is another no-no. Stick to the information that is most relevant to the job you are applying for. And finally, don't forget to proofread your content for any spelling or grammar errors.</p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>Keep your video concise and focused—less is often more! Aim for a video that is between 60 and 90 seconds long. This is long enough to get your key points across, but not so long that you lose the viewer's attention.</span>
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
            <p>A few technical tweaks can make a big difference in the overall quality of your video resume. Use a high-quality video resolution, such as 1080p or 4K. This will ensure that your video looks sharp and professional. Good audio quality is also essential. Use an external microphone to ensure that your audio is clear and easy to understand. Add subtitles or captions to your video to make it more accessible to viewers who may be watching with the sound off. Include a professional thumbnail that is eye-catching and relevant to your video. And finally, export your video in a widely supported format, such as MP4, to ensure that it can be viewed on any device.</p>

            <div className="my-6 rounded-md border-gray-400 border-l-4 bg-gray-100 p-4">
              <span className="mb-1 block font-semibold text-gray-700">Pro Tip:</span>
              <span>
                Review your video on multiple devices to ensure quality and compatibility.
                What looks good on your laptop may not look as good on a phone or tablet. So, be sure to test your video on a variety of devices before you send it off.
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
            <p>Your video resume is an opportunity to show the hiring manager who you are as a person, not just as a professional. So, don't be afraid to let your personality shine through. Share a personal story or passion that is relevant to the job or company. Showcase your creativity and authenticity. Tailor your message to the specific job and company you are applying for. Express your enthusiasm for the role and the company. And most importantly, be yourself. Employers value authenticity, so don't try to be someone you're not. Let your unique personality and passion come through in your video, and you'll be sure to make a lasting impression.</p>

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
