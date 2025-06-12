
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, Brain, Briefcase, CheckCircle, ChevronDown, FileVideo2, HeartHandshake, Linkedin, LogIn, Mail, Rocket, Sparkles, Star, Twitter, User, Users, Wand2, Zap, Gift } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';
import { ScrollProgressBar } from '@/components/common/ScrollProgressBar';

interface WelcomePageProps {
  onStartExploring: () => void;
  onGuestMode: () => void;
}

// Moved FeatureCard outside WelcomePage component
const FeatureCard = ({ icon, title, description, aosAnimation, aosDelay }: { icon: React.ElementType, title: string, description: string, aosAnimation?: string, aosDelay?: string }) => {
  const Icon = icon;
  return (
    <Card className="text-center shadow-lg bg-card subtle-card-hover h-full flex flex-col group" data-aos={aosAnimation || "fade-up"} data-aos-delay={aosDelay}>
      <CardHeader className="pb-4">
        <Icon className="mx-auto h-10 w-10 text-primary mb-3 group-hover:scale-110 group-hover:text-accent group-hover:rotate-[10deg] transition-all duration-300" />
        <CardTitle className="text-xl font-semibold font-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow group-hover:bg-muted/70 transition-colors duration-300 rounded-b-lg">
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

// Moved TestimonialCard outside WelcomePage component
const TestimonialCard = ({ quote, author, role, avatar, aosAnimation, aosDelay }: { quote: string, author: string, role: string, avatar: string, aosAnimation?: string, aosDelay?: string }) => {
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayedQuote('');
    setIsTypingComplete(false);
    let index = 0;
    const typingSpeed = 40;
    let typingInterval: NodeJS.Timeout | undefined;

    const delayMs = parseInt(aosDelay || "0", 10);
    const startDelay = (isNaN(delayMs) ? 0 : delayMs) + 300;

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
     <Card className="shadow-lg bg-card subtle-card-hover h-full flex flex-col group" data-aos={aosAnimation || "fade-up"} data-aos-delay={aosDelay}>
      <CardContent className="pt-6 flex-grow flex flex-col">
        <blockquote className="italic text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed flex-grow min-h-[6em]">
          {displayedQuote}
          {!isTypingComplete && <span className="typing-cursor"></span>}
        </blockquote>
        <div className="mt-4 flex items-center pt-4 border-t border-border/50">
          <Image
            src={avatar}
            alt={author}
            width={40}
            height={40}
            className="rounded-full mr-3 border-2 border-primary/20 transform transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={author === "Sarah L." ? "woman smiling" : author === "John B." ? "man professional" : "person happy"}
          />
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 font-heading">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollProgressBar />
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <FileVideo2 className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground font-heading">SwipeHire</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavLinkClick(e, 'how-it-works')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#pricing" onClick={(e) => handleNavLinkClick(e, 'pricing')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">It's Free!</a>
            <a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-2">
             <Button onClick={onStartExploring} variant="link" size="sm" className="text-foreground hover:text-primary px-3 py-2 hidden sm:inline-flex font-semibold">
              Log In
            </Button>
            <Button onClick={onStartExploring} variant="default" size="sm" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md subtle-button-hover font-semibold">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section
          id="hero"
          className="relative py-24 md:py-36 text-white parallax-hero"
          style={{ backgroundImage: "url('/heroimage/office.jpg')" }}
          data-aos="fade-in"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-indigo-800/30 to-transparent opacity-70 z-0"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight font-heading" data-aos="fade-up">
              Unlock Your Career <br />
              Potential <span className="text-accent">✨</span> <br />
              Discover Top Talent.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed" data-aos="fade-up" data-aos-delay="100">
              SwipeHire revolutionizes recruitment with AI-powered video resumes and intelligent talent matching. Create your AI resume, find remote job opportunities, or connect with efficient recruitment software.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8" data-aos="fade-up" data-aos-delay="200">
              <Button onClick={onStartExploring} size="lg" className="bg-white text-primary hover:bg-slate-100 w-full sm:w-auto text-lg px-8 py-3 subtle-button-hover shadow-lg hover:shadow-xl font-semibold">
                <Rocket className="mr-2 h-5 w-5" /> Get Started Free
              </Button>
              <Button onClick={onGuestMode} variant="secondary" size="lg" className="bg-slate-700/80 border-slate-600 hover:bg-slate-600/90 text-white w-full sm:w-auto text-lg px-8 py-3 subtle-button-hover shadow-md hover:shadow-lg">
                <User className="mr-2 h-5 w-5" /> Continue as Guest
              </Button>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-70 cursor-pointer" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <ChevronDown className="h-8 w-8" />
            </div>
          </div>
        </section>

        <section className="py-5 bg-primary/90 text-primary-foreground" data-aos="fade-in" data-aos-delay="100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-md sm:text-lg font-medium flex items-center justify-center">
              <Brain className="mr-2 h-6 w-6" />
              Join thousands finding their dream jobs & top talent with AI-driven insights.
            </p>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Why SwipeHire for AI Recruitment & Job Seeking?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Experience the next generation of recruitment and job searching with tools designed for impact, from AI resumes to talent matching systems.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={FileVideo2} title="AI Video Resumes" description="Showcase your personality and skills beyond paper. Get AI assistance to create compelling video introductions." aosAnimation="fade-right" aosDelay="0" />
              <FeatureCard icon={Sparkles} title="Intelligent Talent Matching" description="Our AI connects you with the right opportunities or candidates based on deep profile analysis and preferences." aosAnimation="fade-up" aosDelay="100" />
              <FeatureCard icon={Wand2} title="AI Recruitment Toolkit" description="Access tools like script generators, avatar creators, and video feedback to perfect your application or job posting." aosAnimation="fade-left" aosDelay="200" />
              <FeatureCard icon={HeartHandshake} title="Mutual Interest First" description="Connect only when both parties express interest, making interactions more meaningful and efficient. Swipe to find jobs easily." aosAnimation="fade-right" aosDelay="0" />
              <FeatureCard icon={Briefcase} title="Dynamic Job Postings" description="Recruiters can create engaging job posts with video, showcasing company culture and role specifics for efficient recruitment." aosAnimation="fade-up" aosDelay="100" />
              <FeatureCard icon={Zap} title="Staff Diary & Community" description="Share experiences, insights, and connect with a community of professionals. Explore remote job opportunities." aosAnimation="fade-left" aosDelay="200" />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 md:py-28 bg-muted/50" data-aos="fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Simple Steps to Success with Our Recruitment Platform</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">Get started in minutes.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              <div className="p-6 space-y-3" data-aos="zoom-in" data-aos-delay="0">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">1</div>
                <h3 className="text-xl font-semibold text-foreground font-heading">Create Your AI Profile</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Job seekers build a dynamic profile with an AI resume and video. Recruiters showcase their company and roles with our AI recruitment software.</p>
              </div>
              <div className="p-6 space-y-3" data-aos="zoom-in" data-aos-delay="100">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">2</div>
                <h3 className="text-xl font-semibold text-foreground font-heading">Swipe & Discover Talent</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Explore AI-matched candidates or job opportunities with an intuitive swipe interface. Ideal for finding remote job opportunities or specific talent.</p>
              </div>
              <div className="p-6 space-y-3" data-aos="zoom-in" data-aos-delay="200">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">3</div>
                <h3 className="text-xl font-semibold text-foreground font-heading">Connect & Engage Efficiently</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">When it's a mutual match via our talent matching system, connect directly, chat, and take the next steps.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 md:py-28 bg-background" data-aos="fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Loved by Professionals</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">See what our early users are saying.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                role="HR Manager, Tech Corp"
                avatar="https://placehold.co/100x100/63A6FF/FFFFFF.png?text=JB"
                aosAnimation="fade-up" data-aos-delay="100"
              />
              <TestimonialCard
                quote="The AI tools for video resumes are incredibly helpful. This platform made my job search efficient and modern!"
                author="Maria G."
                role="Marketing Specialist"
                avatar="https://placehold.co/100x100/FF6B6B/FFFFFF.png?text=MG"
                aosAnimation="fade-left" data-aos-delay="200"
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-28 bg-muted/50" data-aos="fade-up">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16" data-aos="fade-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading flex items-center justify-center">
                      <Gift className="mr-3 h-10 w-10 text-green-500" />
                      SwipeHire is Now <span className="text-green-500 underline decoration-wavy decoration-green-500/70 underline-offset-4 ml-2">completely free</span> for job seekers!
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                      That's right! All features, for everyone. We believe in democratizing access to powerful hiring and job-seeking tools like AI Resumes and Video Interview Tools.
                      No tiers, no subscriptions, no hidden costs. Just pure value.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto bg-card p-8 sm:p-10 rounded-xl shadow-2xl border border-primary/20" data-aos="zoom-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">AI Video Resume Builder</h3>
                                <p className="text-sm text-muted-foreground">Craft compelling video intros with AI script assistance, avatar generation, and recording tools.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Intelligent Candidate & Job Matching</h3>
                                <p className="text-sm text-muted-foreground">Our AI talent matching system connects job seekers with relevant roles and recruiters with ideal candidates.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Unlimited Swipes & Connections</h3>
                                <p className="text-sm text-muted-foreground">Explore as many profiles or job postings as you need to find your perfect match. Swipe to find jobs!</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Direct Messaging on Matches</h3>
                                <p className="text-sm text-muted-foreground">Once a mutual interest is established, connect and chat directly within our privacy recruitment platform.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Dynamic Profile & Job Posting Creation</h3>
                                <p className="text-sm text-muted-foreground">Full access for both job seekers to create rich profiles and recruiters to post detailed jobs with video interview tools.</p>
                            </div>
                        </div>
                         <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Staff Diary & Community Access</h3>
                                <p className="text-sm text-muted-foreground">Share insights, learn from peers, and engage with the professional community for efficient recruitment and job seeking.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 text-center">
                        <Button onClick={onStartExploring} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-3 subtle-button-hover shadow-lg hover:shadow-xl font-semibold">
                           <Sparkles className="mr-2 h-5 w-5"/> Join SwipeHire for Free
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section id="about" className="py-24 md:py-32 hero-gradient-bg-secondary text-white" data-aos="fade-in">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight font-heading">Ready to Transform Your Hiring or Job Search?</h2>
            <p className="text-lg text-slate-200 max-w-xl mx-auto mb-10 leading-relaxed">
              Join SwipeHire today and experience a smarter, more engaging way to connect with our talent matching system and AI recruitment software.
            </p>
            <Button onClick={onStartExploring} size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-10 py-3 subtle-button-hover shadow-lg hover:shadow-xl font-semibold">
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <section className="py-10 bg-background text-center" data-aos="fade-up">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-foreground mb-3">We are Award-Winning!</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {/* LaunchGNS iframe removed */}
            <a href="https://www.producthunt.com/products/swipehire?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-swipehire" target="_blank" rel="noopener noreferrer">
              <Image
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=973611&theme=dark&t=1748971139959"
                alt="SwipeHire - Tinder-like Video Resumes for AI-Powered Recruitment | Product Hunt"
                style={{width: "250px", height: "54px"}}
                width="250"
                height="54"
                className="shadow-md rounded"
              />
            </a>
            <a href="https://fazier.com" target="_blank" rel="noopener noreferrer">
              <Image src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=dark" width={250} height={54} alt="Fazier badge" className="shadow-md rounded" />
            </a>
            <a href='https://www.saashub.com/swipehire?utm_source=badge&utm_campaign=badge&utm_content=swipehire&badge_variant=color&badge_kind=approved' target='_blank' rel="noopener noreferrer">
              <Image src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" alt="SwipeHire badge" width={150} height={52} style={{maxWidth: "150px"}} className="shadow-md rounded"/>
            </a>
            <a href="https://startupfa.me/s/swipehire?utm_source=studio--swipehire-3bscz.us-central1.hosted.app" target="_blank" rel="noopener noreferrer">
              <Image src="https://startupfa.me/badges/featured-badge.webp" alt="Featured on Startup Fame" width="171" height="54" className="shadow-md rounded" />
            </a>
          </div>
        </div>
      </section>

      <footer className="py-10 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <h5 className="font-semibold text-slate-200 mb-4 text-lg font-heading">SwipeHire</h5>
              <p className="text-sm leading-relaxed">Revolutionizing recruitment through AI and video. Connecting talent with opportunity, seamlessly. Your privacy recruitment platform for efficient hiring.</p>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-4 text-lg font-heading">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="hover:text-slate-200 transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" onClick={(e) => handleNavLinkClick(e, 'how-it-works')} className="hover:text-slate-200 transition-colors">How It Works</Link></li>
                <li><Link href="#pricing" onClick={(e) => handleNavLinkClick(e, 'pricing')} className="hover:text-slate-200 transition-colors">It's Free!</Link></li>
                <li><Link href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="hover:text-slate-200 transition-colors">About Us (Conceptual)</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-4 text-lg font-heading">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-slate-200 transition-colors" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="hover:text-slate-200 transition-colors" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
                <a href="#" className="hover:text-slate-200 transition-colors" aria-label="Email"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SwipeHire. All rights reserved. Built with AI assistance.</p>
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
