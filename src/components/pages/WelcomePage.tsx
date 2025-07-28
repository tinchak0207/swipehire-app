'use client';

import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Briefcase,
  CheckCircle,
  ChevronRight,
  Eye,
  FileText,
  Github,
  HeartHandshake,
  Linkedin,
  LogIn,
  Mail,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Twitter,
  Users,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

// --- Component Interfaces ---

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  aosAnimation: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  aosAnimation?: string;
  aosDelay?: string;
}

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  aosAnimation: string;
}

interface WelcomePageProps {
  onStartExploring: () => void;
  onGuestMode: () => void;
}

// --- Reusable Components ---

const FeatureCard = ({ icon: Icon, title, description, aosAnimation }: FeatureCardProps) => (
  <div
    className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    data-aos={aosAnimation}
  >
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 font-bold text-xl text-slate-800">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const TestimonialCard = ({
  quote,
  author,
  role,
  avatar,
  aosAnimation,
  aosDelay,
}: TestimonialCardProps) => (
  <div
    className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
    data-aos={aosAnimation}
    data-aos-delay={aosDelay}
  >
    <p className="mb-4 text-slate-600 italic">"{quote}"</p>
    <div className="flex items-center">
      <Image
        src={avatar}
        alt={author}
        width={40}
        height={40}
        className="mr-3 rounded-full object-cover"
      />
      <div>
        <p className="font-semibold text-slate-800">{author}</p>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </div>
  </div>
);

const StepCard = ({ step, title, description, icon: Icon, aosAnimation }: StepCardProps) => (
  <div className="flex items-start space-x-4" data-aos={aosAnimation}>
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 font-bold text-xl text-white">
      {step}
    </div>
    <div>
      <h3 className="mb-1 flex items-center font-semibold text-xl text-slate-800">
        <Icon className="mr-2 h-5 w-5 text-primary" /> {title}
      </h3>
      <p className="text-slate-600">{description}</p>
    </div>
  </div>
);

// --- Main Welcome Page Component ---

export default function WelcomePage({ onStartExploring, onGuestMode }: WelcomePageProps) {
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-lg sm:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/assets/logo.png" alt="SwipeHire Logo" width={32} height={32} />
            <span className="font-bold text-xl text-slate-800">SwipeHire</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={onGuestMode}>
              <Eye className="mr-2 h-4 w-4" /> Guest Mode
            </Button>
            <Button onClick={onStartExploring}>
              <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left" data-aos="fade-right">
            <h1 className="font-extrabold font-heading text-4xl leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              The Future of Hiring is a{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Swipe
              </span>{' '}
              Away
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Discover a revolutionary platform that connects top talent with innovative companies
              through an engaging, intuitive, and AI-powered experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" onClick={onStartExploring} className="shadow-lg">
                Get Started <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#video-demo">
                  <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative" data-aos="fade-left">
            <Image
              src="/images/hero-image.png"
              alt="SwipeHire Interface Showcase"
              width={600}
              height={600}
              className="mx-auto rounded-lg"
              priority
            />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-bold font-heading text-3xl text-slate-900 sm:text-4xl">
              Why Choose SwipeHire?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              We leverage cutting-edge technology to make hiring and job searching faster, smarter,
              and more human.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Sparkles}
              title="AI-Powered Matching"
              description="Our intelligent algorithm connects the right talent with the right opportunities, ensuring a perfect fit."
              aosAnimation="fade-up"
            />
            <FeatureCard
              icon={HeartHandshake}
              title="Engaging Swipe Interface"
              description="Move beyond traditional job boards with an intuitive, mobile-first experience that makes recruitment exciting."
              aosAnimation="fade-up"
            />
            <FeatureCard
              icon={FileText}
              title="Video Resumes"
              description="Bring your profile to life and showcase your personality with short, impactful video introductions."
              aosAnimation="fade-up"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-bold font-heading text-3xl text-slate-900 sm:text-4xl">
              Simple Steps to Success
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Whether you're hiring or job hunting, getting started is easy.
            </p>
          </div>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="mb-6 font-semibold text-2xl text-slate-800">For Job Seekers</h3>
              <div className="space-y-8">
                <StepCard
                  step={1}
                  title="Create Your Profile"
                  description="Build a dynamic profile with your skills, experience, and a video resume to stand out."
                  icon={Users}
                  aosAnimation="fade-right"
                />
                <StepCard
                  step={2}
                  title="Swipe & Apply"
                  description="Browse personalized job opportunities and apply with a simple swipe."
                  icon={Briefcase}
                  aosAnimation="fade-right"
                />
                <StepCard
                  step={3}
                  title="Get Matched"
                  description="Connect directly with recruiters when there's a mutual interest."
                  icon={MessageSquare}
                  aosAnimation="fade-right"
                />
              </div>
            </div>
            <div className="mt-8 md:mt-0">
              <h3 className="mb-6 font-semibold text-2xl text-slate-800">For Recruiters</h3>
              <div className="space-y-8">
                <StepCard
                  step={1}
                  title="Post a Job"
                  description="Easily create and publish job openings to reach a vast pool of qualified candidates."
                  icon={Briefcase}
                  aosAnimation="fade-left"
                />
                <StepCard
                  step={2}
                  title="Discover Talent"
                  description="Our AI presents you with the most relevant candidates. Swipe to express interest."
                  icon={Wand2}
                  aosAnimation="fade-left"
                />
                <StepCard
                  step={3}
                  title="Engage & Hire"
                  description="Instantly chat with matched candidates and streamline your hiring process."
                  icon={CheckCircle}
                  aosAnimation="fade-left"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="video-demo" className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-bold font-heading text-3xl text-slate-900 sm:text-4xl">
              See SwipeHire in Action
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Watch our short demo to see how easy it is to find your next opportunity or hire.
            </p>
          </div>
          <div
            className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-lg shadow-2xl"
            data-aos="zoom-in"
          >
            <Image
              src="/images/video-placeholder.jpg"
              alt="Video Demo Thumbnail"
              width={1280}
              height={720}
              className="w-full"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button
                size="lg"
                className="h-16 w-16 rounded-full p-0 shadow-lg"
                onClick={() => alert('Video player would open here!')}
              >
                <PlayCircle className="h-10 w-10" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-bold font-heading text-3xl text-slate-900 sm:text-4xl">
              Loved by Recruiters and Job Seekers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Don't just take our word for it. Here's what our users are saying.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="SwipeHire revolutionized our hiring process. The AI-driven matching is incredibly accurate, saving us countless hours."
              author="Jane Doe"
              role="HR Manager, TechCorp"
              avatar="/avatars/jane-doe.jpg"
              aosAnimation="fade-up"
              aosDelay="100"
            />
            <TestimonialCard
              quote="As a job seeker, SwipeHire made it easy to showcase my skills and connect with relevant companies. I found my dream job in weeks!"
              author="John Smith"
              role="Software Engineer"
              avatar="/avatars/john-smith.jpg"
              aosAnimation="fade-up"
              aosDelay="200"
            />
            <TestimonialCard
              quote="The video resume feature is a game-changer. It allowed me to express my personality beyond a traditional resume."
              author="Emily White"
              role="Product Designer"
              avatar="/avatars/emily-white.jpg"
              aosAnimation="fade-up"
              aosDelay="300"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="bg-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-purple-600 px-6 py-12 text-center shadow-xl md:px-12">
            <div className="relative z-10">
              <h2 className="font-bold font-heading text-3xl text-white sm:text-4xl">
                Ready to Find Your Perfect Match?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-purple-100">
                Join SwipeHire today and experience the new era of recruitment.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={onStartExploring}
                  className="bg-white text-primary shadow-lg hover:bg-slate-100"
                >
                  Sign Up for Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100">
        <div className="container mx-auto px-4 py-8 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-lg text-slate-800">SwipeHire</h3>
              <p className="mt-2 text-slate-600">
                The future of hiring is a swipe away.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-800">Quick Links</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="#features" className="text-slate-600 hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-slate-600 hover:text-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-slate-600 hover:text-primary">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-800">Connect With Us</h3>
              <div className="mt-2 flex space-x-4">
                <Link href="#" className="text-slate-500 hover:text-primary">
                  <Twitter className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-500 hover:text-primary">
                  <Linkedin className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-500 hover:text-primary">
                  <Github className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-500 hover:text-primary">
                  <Mail className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} SwipeHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
