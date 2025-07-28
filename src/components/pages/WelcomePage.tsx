'use client';

import AOS from 'aos';
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle,
  FileVideo2,
  Gift,
  HeartHandshake,
  Linkedin,
  Mail,
  Rocket,
  Sparkles,
  Twitter,
  User,
  Wand2,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'aos/dist/aos.css';
import { ScrollProgressBar } from '@/components/common/ScrollProgressBar';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';
import JobAgentPanel from '@/components/pages/JobAgentPanel';

interface WelcomePageProps {
  onStartExploring: () => void;
  onGuestMode: () => void;
}

// Moved FeatureCard outside WelcomePage component
const FeatureCard = ({
  icon,
  title,
  description,
  aosAnimation,
  aosDelay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  aosAnimation?: string;
  aosDelay?: string;
}) => {
  const Icon = icon;
  return (
    <Card
      className="subtle-card-hover group flex h-full flex-col bg-card text-center shadow-lg"
      data-aos={aosAnimation || 'fade-up'}
      data-aos-delay={aosDelay}
    >
      <CardHeader className="pb-4">
        <Icon className="mx-auto mb-3 h-10 w-10 text-primary transition-all duration-300 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:text-accent" />
        <CardTitle className="font-heading font-semibold text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow rounded-b-lg transition-colors duration-300 group-hover:bg-muted/70">
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

// Moved TestimonialCard outside WelcomePage component
const TestimonialCard = ({
  quote,
  author,
  role,
  avatar,
  aosAnimation,
  aosDelay,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  aosAnimation?: string;
  aosDelay?: string;
}) => {
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayedQuote('');
    setIsTypingComplete(false);
    let index = 0;
    const typingSpeed = 40;
    let typingInterval: NodeJS.Timeout | undefined;

    const delayMs = Number.parseInt(aosDelay || '0', 10);
    const startDelay = (Number.isNaN(delayMs) ? 0 : delayMs) + 300;

    const timer = setTimeout(() => {
      if (quote) {
        typingInterval = setInterval(() => {
          if (index < quote.length) {
            setDisplayedQuote((prev) => prev + quote.charAt(index));
            index++;
          } else {
            if (typingInterval) clearInterval(typingInterval);
            setIsTypingComplete(true);
          }
        }, typingSpeed);
      }
    }, startDelay);

    return () => {
      clearTimeout(timer);
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [quote, aosDelay]);

  return (
    <Card
      className="subtle-card-hover group flex h-full flex-col bg-card shadow-lg"
      data-aos={aosAnimation || 'fade-up'}
      data-aos-delay={aosDelay}
    >
      <CardContent className="flex flex-grow flex-col pt-6">
        <blockquote className="min-h-[6em] flex-grow text-muted-foreground italic leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
          {displayedQuote}
          {!isTypingComplete && <span className="typing-cursor" />}
        </blockquote>
        <div className="mt-4 flex items-center border-border/50 border-t pt-4">
          <Image
            src={avatar}
            alt={author}
            width={40}
            height={40}
            className="mr-3 transform rounded-full border-2 border-primary/20 transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={
              author === 'Sarah L.'
                ? 'woman smiling'
                : author === 'John B.'
                  ? 'man professional'
                  : 'person happy'
            }
          />
          <div>
            <p className="font-heading font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
              {author}
            </p>
            <p className="text-muted-foreground text-xs">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function WelcomePage({ onStartExploring, onGuestMode }: WelcomePageProps) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollProgressBar />
      <header className="sticky top-0 z-50 w-full bg-background/90 shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary transition-opacity hover:opacity-80"
          >
            <FileVideo2 className="h-8 w-8" />
            <span className="font-bold font-heading text-2xl text-foreground">SwipeHire</span>
          </Link>
          <nav className="hidden items-center space-x-6 md:flex">
            <a
              href="#features"
              onClick={(e) => handleNavLinkClick(e, 'features')}
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavLinkClick(e, 'how-it-works')}
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleNavLinkClick(e, 'pricing')}
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
            >
              It's Free!
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavLinkClick(e, 'about')}
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
            >
              About
            </a>
            <Link
              href="/blog"
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
            >
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              onClick={onStartExploring}
              variant="link"
              size="sm"
              className="hidden px-3 py-2 font-semibold text-foreground hover:text-primary sm:inline-flex"
            >
              Log In
            </Button>
            <Button
              onClick={onStartExploring}
              variant="default"
              size="sm"
              className="subtle-button-hover rounded-md bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section
          id="hero"
          className="relative flex min-h-screen items-center bg-gray-900 text-white"
          data-aos="fade-in"
        >
          <div
            className="absolute inset-0 z-0 h-full w-full bg-center bg-cover"
            style={{ backgroundImage: "url('/heroimage/office.jpg')" }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-black/60" />

          <div className="container relative z-20 mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 lg:gap-20">
            {/* Left Column */}
            <div className="text-center md:text-left" data-aos="fade-right">
              <h1 className="mb-6 font-extrabold font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Unlock Your Career
                <br />
                Potential <span className="text-accent">✨</span>
              </h1>
              <p className="mx-auto mb-10 max-w-xl text-base text-slate-200 leading-relaxed sm:text-lg md:mx-0 md:text-xl">
                SwipeHire revolutionizes recruitment with AI-powered video resumes and intelligent
                talent matching. Create your AI resume, find remote job opportunities, or connect
                with efficient recruitment software.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
                <Button
                  onClick={onStartExploring}
                  size="lg"
                  className="subtle-button-hover w-full bg-white px-8 py-3 font-semibold text-lg text-primary shadow-lg hover:bg-slate-100 hover:shadow-xl sm:w-auto"
                >
                  <Rocket className="mr-2 h-5 w-5" /> Get Started Free
                </Button>
                <Button
                  onClick={onGuestMode}
                  variant="secondary"
                  size="lg"
                  className="subtle-button-hover w-full border-slate-600 bg-slate-700/80 px-8 py-3 text-lg text-white shadow-md hover:bg-slate-600/90 hover:shadow-lg sm:w-auto"
                >
                  <User className="mr-2 h-5 w-5" /> Continue as Guest
                </Button>
              </div>
            </div>

            {/* Right Column - Manus-like Agent */}
            <div
              className="relative mx-auto w-full max-w-md"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <JobAgentPanel onGetJobClick={onStartExploring} />
            </div>
          </div>
        </section>

        <section
          className="bg-primary/90 py-5 text-primary-foreground"
          data-aos="fade-in"
          data-aos-delay="100"
        >
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <p className="flex items-center justify-center font-medium text-md sm:text-lg">
              <Brain className="mr-2 h-6 w-6" />
              Join thousands finding their dream jobs & top talent with AI-driven insights.
            </p>
          </div>
        </section>

        <section id="features" className="bg-background py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center" data-aos="fade-up">
              <h2 className="font-bold font-heading text-3xl text-foreground md:text-4xl">
                Why SwipeHire for AI Recruitment & Job Seeking?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Experience the next generation of recruitment and job searching with tools designed
                for impact, from AI resumes to talent matching systems.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={FileVideo2}
                title="AI Video Resumes"
                description="Showcase your personality and skills beyond paper. Get AI assistance to create compelling video introductions."
                aosAnimation="fade-right"
                aosDelay="0"
              />
              <FeatureCard
                icon={Sparkles}
                title="Intelligent Talent Matching"
                description="Our AI connects you with the right opportunities or candidates based on deep profile analysis and preferences."
                aosAnimation="fade-up"
                aosDelay="100"
              />
              <FeatureCard
                icon={Wand2}
                title="AI Recruitment Toolkit"
                description="Access tools like script generators, avatar creators, and video feedback to perfect your application or job posting."
                aosAnimation="fade-left"
                aosDelay="200"
              />
              <FeatureCard
                icon={HeartHandshake}
                title="Mutual Interest First"
                description="Connect only when both parties express interest, making interactions more meaningful and efficient. Swipe to find jobs easily."
                aosAnimation="fade-right"
                aosDelay="0"
              />
              <FeatureCard
                icon={Briefcase}
                title="Dynamic Job Postings"
                description="Recruiters can create engaging job posts with video, showcasing company culture and role specifics for efficient recruitment."
                aosAnimation="fade-up"
                aosDelay="100"
              />
              <FeatureCard
                icon={Zap}
                title="Staff Diary & Community"
                description="Share experiences, insights, and connect with a community of professionals. Explore remote job opportunities."
                aosAnimation="fade-left"
                aosDelay="200"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-muted/50 py-20 md:py-28" data-aos="fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center" data-aos="fade-up">
              <h2 className="font-bold font-heading text-3xl text-foreground md:text-4xl">
                Simple Steps to Success with Our Recruitment Platform
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Get started in minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3">
              <div className="space-y-3 p-6" data-aos="zoom-in" data-aos-delay="0">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary font-bold text-2xl text-primary-foreground shadow-md">
                  1
                </div>
                <h3 className="font-heading font-semibold text-foreground text-xl">
                  Create Your AI Profile
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Job seekers build a dynamic profile with an AI resume and video. Recruiters
                  showcase their company and roles with our AI recruitment software.
                </p>
              </div>
              <div className="space-y-3 p-6" data-aos="zoom-in" data-aos-delay="100">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary font-bold text-2xl text-primary-foreground shadow-md">
                  2
                </div>
                <h3 className="font-heading font-semibold text-foreground text-xl">
                  Swipe & Discover Talent
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Explore AI-matched candidates or job opportunities with an intuitive swipe
                  interface. Ideal for finding remote job opportunities or specific talent.
                </p>
              </div>
              <div className="space-y-3 p-6" data-aos="zoom-in" data-aos-delay="200">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary font-bold text-2xl text-primary-foreground shadow-md">
                  3
                </div>
                <h3 className="font-heading font-semibold text-foreground text-xl">
                  Connect & Engage Efficiently
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  When it's a mutual match via our talent matching system, connect directly, chat,
                  and take the next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-background py-20 md:py-28" data-aos="fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center" data-aos="fade-up">
              <h2 className="font-bold font-heading text-3xl text-foreground md:text-4xl">
                Loved by Professionals
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                See what our early users are saying.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <TestimonialCard
                quote="SwipeHire's video resume feature helped me stand out and land my dream job! The AI feedback was invaluable."
                author="Sarah L."
                role="Software Engineer"
                avatar="https://placehold.co/100x100/A663CC/FFFFFF.png?text=SL"
                aosAnimation="fade-right"
                aosDelay="0"
              />
              <TestimonialCard
                quote="Finding qualified candidates used to be a chore. SwipeHire's AI recruitment software and talent matching system is a game-changer."
                author="John B."
                role="HR Manager"
                avatar="https://placehold.co/100x100/63A6FF/FFFFFF.png?text=JB"
                aosAnimation="fade-up"
                data-aos-delay="100"
              />
              <TestimonialCard
                quote="The AI tools for video resumes are incredibly helpful. This platform made my job search efficient and modern!"
                author="Maria G."
                role="Product Designer"
                avatar="https://placehold.co/100x100/FF6B6B/FFFFFF.png?text=MG"
                aosAnimation="fade-left"
                data-aos-delay="200"
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-muted/50 py-20 md:py-28" data-aos="fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center" data-aos="fade-up">
              <h2 className="flex items-center justify-center font-bold font-heading text-3xl text-foreground md:text-4xl">
                <Gift className="mr-3 h-10 w-10 text-green-500" />
                SwipeHire is Now{' '}
                <span className="mx-2 text-green-500 underline decoration-green-500/70 decoration-wavy underline-offset-4">
                  completely free
                </span>
                for job seekers!
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
                That's right! All features, for everyone. We believe in democratizing access to
                powerful hiring and job-seeking tools like AI Resumes and Video Interview Tools. No
                tiers, no subscriptions, no hidden costs. Just pure value.
              </p>
            </div>
            <div
              className="mx-auto max-w-4xl rounded-xl border border-primary/20 bg-card p-8 shadow-2xl sm:p-10"
              data-aos="zoom-in-up"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      AI Video Resume Builder
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Craft compelling video intros with AI script assistance, avatar generation,
                      and recording tools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Intelligent Candidate & Job Matching
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Our AI talent matching system connects job seekers with relevant roles and
                      recruiters with ideal candidates.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Unlimited Swipes & Connections
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Explore as many profiles or job postings as you need to find your perfect
                      match. Swipe to find jobs!
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Direct Messaging on Matches
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Once a mutual interest is established, connect and chat directly within our
                      privacy recruitment platform.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Dynamic Profile & Job Posting Creation
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Full access for both job seekers to create rich profiles and recruiters to
                      post detailed jobs with video interview tools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Staff Diary & Community Access
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Share insights, learn from peers, and engage with the professional community
                      for efficient recruitment and job seeking.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 text-center">
                <Button
                  onClick={onStartExploring}
                  size="lg"
                  className="subtle-button-hover bg-primary px-10 py-3 font-semibold text-lg text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" /> Join SwipeHire for Free
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="hero-gradient-bg-secondary py-24 text-white md:py-32"
          data-aos="fade-in"
        >
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 font-bold font-heading text-3xl leading-tight md:text-4xl">
              Ready to Transform Your Hiring or Job Search?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-slate-200 leading-relaxed">
              Join SwipeHire today and experience a smarter, more engaging way to connect with our
              talent matching system and AI recruitment software.
            </p>
            <Button
              onClick={onStartExploring}
              size="lg"
              className="subtle-button-hover bg-white px-10 py-3 font-semibold text-lg text-primary shadow-lg hover:bg-slate-100 hover:shadow-xl"
            >
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <section className="bg-background py-10 text-center" data-aos="fade-up">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="mb-3 font-semibold text-foreground text-xl">We are Award-Winning!</h3>
          <div className="flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row sm:gap-8">
            {/* LaunchGNS iframe removed */}
            <a
              href="https://www.producthunt.com/products/swipehire?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-swipehire"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=973611&theme=dark&t=1748971139959"
                alt="SwipeHire - Tinder-like Video Resumes for AI-Powered Recruitment | Product Hunt"
                style={{ width: '250px', height: '54px' }}
                width="250"
                height="54"
                className="rounded shadow-md"
              />
            </a>
            <a
              href="https://fazier.com/launches/swipehire"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://fazier.com/api/v1/public/badges/embed_image.svg?launch_id=4627&badge_type=daily&theme=light"
                width={270}
                height={54}
                alt="Fazier badge"
                className="rounded shadow-md"
              />
            </a>
            <a
              href="https://www.saashub.com/swipehire?utm_source=badge&utm_campaign=badge&utm_content=swipehire&badge_variant=color&badge_kind=approved"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1"
                alt="SwipeHire badge"
                width={150}
                height={52}
                style={{ maxWidth: '150px' }}
                className="rounded shadow-md"
              />
            </a>
            <a
              href="https://startupfa.me/s/swipehire?utm_source=studio--swipehire-3bscz.us-central1.hosted.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://startupfa.me/badges/featured-badge.webp"
                alt="Featured on Startup Fame"
                width="171"
                height="54"
                className="rounded shadow-md"
              />
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-10 text-slate-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h5 className="mb-4 font-heading font-semibold text-lg text-slate-200">SwipeHire</h5>
              <p className="text-sm leading-relaxed">
                Revolutionizing recruitment through AI and video. Connecting talent with
                opportunity, seamlessly. Your privacy recruitment platform for efficient hiring.
              </p>
            </div>
            <div>
              <h5 className="mb-4 font-heading font-semibold text-lg text-slate-200">
                Quick Links
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    onClick={(e) => handleNavLinkClick(e, 'features')}
                    className="transition-colors hover:text-slate-200"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    onClick={(e) => handleNavLinkClick(e, 'how-it-works')}
                    className="transition-colors hover:text-slate-200"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    onClick={(e) => handleNavLinkClick(e, 'pricing')}
                    className="transition-colors hover:text-slate-200"
                  >
                    It's Free!
                  </Link>
                </li>
                <li>
                  <Link
                    href="#about"
                    onClick={(e) => handleNavLinkClick(e, 'about')}
                    className="transition-colors hover:text-slate-200"
                  >
                    About Us (Conceptual)
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-heading font-semibold text-lg text-slate-200">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="transition-colors hover:text-slate-200" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="transition-colors hover:text-slate-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="transition-colors hover:text-slate-200" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-slate-700 border-t pt-8 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} SwipeHire. All rights reserved. Built with AI
              assistance.
            </p>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
      <style jsx>{`
        html {
          scroll-behavior: smooth;
        }
        .font-heading {
          font-family: var(--font-montserrat), var(--font-geist-sans), sans-serif;
        }
      `}</style>
    </div>
  );
}
