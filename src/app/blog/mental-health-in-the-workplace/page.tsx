'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MentalHealthInTheWorkplacePage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="relative h-96 bg-gradient-to-r from-green-500 to-teal-500 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Prioritizing Mental Health in the Workplace
          </h1>
          <p className="mt-4 text-xl">Creating a supportive and healthy work environment.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="prose lg:prose-xl max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">By The SwipeHire Team</p>
              <p className="text-sm text-gray-500">Published on November 2, 2023</p>
            </div>
          </div>

          <p>
            In recent years, the conversation around mental health has moved from the periphery to
            the forefront of workplace priorities. Organizations are increasingly recognizing that a
            healthy workforce is a productive workforce. Prioritizing mental health in the workplace
            is not just a compassionate approach; it's a strategic imperative that can lead to
            increased employee engagement, reduced absenteeism, and a stronger bottom line. This
            blog post explores the importance of mental health in the workplace and offers
            actionable strategies for creating a supportive and healthy work environment.
          </p>

          <h2>The Business Case for Mental Health</h2>
          <p>
            Investing in mental health is not just the right thing to do; it's also good for
            business. The World Health Organization (WHO) estimates that depression and anxiety
            disorders cost the global economy $1 trillion each year in lost productivity.
            Conversely, a study by Deloitte found that for every $1 invested in workplace mental
            health, there is a return of $5 in improved productivity and reduced absenteeism. By
            creating a mentally healthy workplace, organizations can not only improve the well-being
            of their employees but also enhance their financial performance.
          </p>

          <h2>Actionable Strategies for a Mentally Healthy Workplace</h2>
          <p>
            Creating a mentally healthy workplace requires a multi-faceted approach that involves
            leadership commitment, open communication, and accessible resources. Here are some
            actionable strategies that organizations can implement:
          </p>
          <ul>
            <li>
              <strong>Lead from the Top:</strong> Leadership plays a crucial role in shaping the
              workplace culture. When leaders openly talk about mental health and share their own
              experiences, it helps to destigmatize the issue and encourages others to seek help.
            </li>
            <li>
              <strong>Foster a Culture of Openness:</strong> Create a safe and supportive
              environment where employees feel comfortable talking about their mental health without
              fear of judgment or reprisal. Regular check-ins and open forums can help to facilitate
              these conversations.
            </li>
            <li>
              <strong>Provide Accessible Resources:</strong> Offer a range of mental health
              resources, such as employee assistance programs (EAPs), counseling services, and
              mental health apps. Ensure that employees are aware of these resources and know how to
              access them.
            </li>
            <li>
              <strong>Promote Work-Life Balance:</strong> Encourage employees to take regular
              breaks, disconnect after work hours, and use their vacation time. A healthy work-life
              balance is essential for preventing burnout and promoting overall well-being.
            </li>
            <li>
              <strong>Train Managers:</strong> Equip managers with the skills and knowledge to
              recognize the signs of mental distress, have supportive conversations with their team
              members, and direct them to the appropriate resources.
            </li>
          </ul>

          <h2>The Role of Technology</h2>
          <p>
            Technology can be a powerful tool for promoting mental health in the workplace. Mental
            health apps, virtual counseling services, and online support communities can provide
            employees with convenient and confidential access to support. Additionally, AI-powered
            tools can be used to analyze anonymized data to identify trends and patterns in employee
            well-being, allowing organizations to proactively address potential issues.
          </p>

          <h2>A Continuous Journey</h2>
          <p>
            Creating a mentally healthy workplace is not a one-time initiative; it's a continuous
            journey that requires ongoing commitment and effort. By prioritizing mental health,
            organizations can create a workplace where employees feel valued, supported, and
            empowered to thrive. This not only benefits the individual employees but also
            contributes to a more positive, productive, and resilient organization as a whole.
          </p>
        </article>

        <div className="mt-12 text-center">
          <Link href="/blog">
            <a className="text-blue-600 hover:underline">
              <ArrowLeft className="inline-block mr-2" />
              Back to Blog
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
}
