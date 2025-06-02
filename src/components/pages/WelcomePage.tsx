
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, Brain, Briefcase, CheckCircle, ChevronDown, FileVideo2, HeartHandshake, Linkedin, LogIn, Mail, Rocket, Sparkles, Star, Twitter, User, Users, Wand2, Zap } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';

interface WelcomePageProps {
  onStartExploring: () => void;
  onGuestMode: () => void;
}

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

const TestimonialCard = ({ quote, author, role, avatar, aosAnimation, aosDelay }: { quote: string, author: string, role: string, avatar: string, aosAnimation?: string, aosDelay?: string }) => {
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayedQuote('');
    setIsTypingComplete(false);
    let index = 0;
    const typingSpeed = 40;
    const startDelay = parseInt(aosDelay || "0", 10) + 300;
    let typingInterval: NodeJS.Timeout | undefined;

    const timer = setTimeout(() => {
      if (quote) {
        typingInterval = setInterval(() => {
          if (index < quote.length) {
            setDisplayedQuote((prev) => prev + quote.charAt(index));
            index++;
          } else {
            clearInterval(typingInterval);
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
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <FileVideo2 className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground font-heading">SwipeHire</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavLinkClick(e, 'how-it-works')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#pricing" onClick={(e) => handleNavLinkClick(e, 'pricing')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
          </nav>
          <Button onClick={onStartExploring} variant="default" size="sm" className="subtle-button-hover">
            Log In / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section
          id="hero"
          className="relative py-24 md:py-36 text-white parallax-hero"
          style={{ backgroundImage: "url('/heroimage/office.jpg')" }}
          data-aos="fade-in"
        >
          <div className="absolute inset-0 hero-gradient-bg opacity-80 z-0"></div>
          <div className="absolute inset-0 bg-black/50 z-0"></div> {/* Overlay for better text contrast */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight font-heading" data-aos="fade-up">
              Unlock Your Career Potential <span className="text-accent">✨</span>
              <br className="hidden sm:block" />
              Discover Top Talent.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed" data-aos="fade-up" data-aos-delay="100">
              SwipeHire revolutionizes recruitment with AI-powered video resumes and intelligent matching. Connect authentically, hire effectively.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8" data-aos="fade-up" data-aos-delay="200">
              <Button onClick={onStartExploring} size="lg" className="bg-white text-primary hover:bg-slate-100 w-full sm:w-auto text-lg px-8 py-3 subtle-button-hover shadow-lg hover:shadow-xl">
                <Rocket className="mr-2 h-5 w-5" /> Get Started Free
              </Button>
              <Button onClick={onGuestMode} variant="secondary" size="lg" className="bg-slate-800/70 border-slate-600 hover:bg-slate-700/90 text-white w-full sm:w-auto text-lg px-8 py-3 subtle-button-hover shadow-md hover:shadow-lg">
                <User className="mr-2 h-5 w-5" /> Continue as Guest
              </Button>
            </div>
            <button onClick={onStartExploring} className="text-sm text-slate-300 hover:text-white transition-colors" data-aos="fade-up" data-aos-delay="300">
              Already have an account? <span className="font-semibold underline">Log In</span>
            </button>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-70">
              <ChevronDown className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-5 bg-primary/90 text-primary-foreground" data-aos="fade-in" data-aos-delay="100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-md sm:text-lg font-medium flex items-center justify-center">
              <Brain className="mr-2 h-6 w-6" />
              Join thousands finding their dream jobs & top talent with AI-driven insights.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Why SwipeHire?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Experience the next generation of recruitment and job searching with tools designed for impact.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={FileVideo2} title="AI Video Resumes" description="Showcase your personality and skills beyond paper. Get AI assistance to create compelling video introductions." aosAnimation="fade-right" aosDelay="0" />
              <FeatureCard icon={Sparkles} title="Intelligent Matching" description="Our AI connects you with the right opportunities or candidates based on deep profile analysis and preferences." aosAnimation="fade-up" aosDelay="100" />
              <FeatureCard icon={Wand2} title="AI Toolkit" description="Access tools like script generators, avatar creators, and video feedback to perfect your application or job posting." aosAnimation="fade-left" aosDelay="200" />
              <FeatureCard icon={HeartHandshake} title="Mutual Interest First" description="Connect only when both parties express interest, making interactions more meaningful and efficient." aosAnimation="fade-right" aosDelay="0" />
              <FeatureCard icon={Briefcase} title="Dynamic Job Postings" description="Recruiters can create engaging job posts with video, showcasing company culture and role specifics." aosAnimation="fade-up" aosDelay="100" />
              <FeatureCard icon={Zap} title="Staff Diary & Community" description="Share experiences, insights, and connect with a community of professionals within your field." aosAnimation="fade-left" aosDelay="200" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted/50" data-aos="fade-up">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Simple Steps to Success</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">Get started in minutes.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              <div className="p-6 space-y-3" data-aos="zoom-in" data-aos-delay="0">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">1</div>
                <h3 className="text-xl font-semibold text-foreground font-heading">Create Your Profile</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Job seekers build a dynamic profile with video. Recruiters showcase their company and roles.</p>
              </div>
              <div className="p-6 space-y-3" data-aos="zoom-in" data-aos-delay="100">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">2</div>
                <h3 className="text-xl font-semibold text-foreground font-heading">Swipe & Discover</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Explore AI-matched candidates or job opportunities with an intuitive swipe interface.</p>
              </div>
              <div className="p-6 space-y-3" data-aos="zoom-in" data-aos-delay="200">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">3</div>
                <h3 className="text-xl font-semibold text-foreground font-heading">Connect & Engage</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">When it's a mutual match, connect directly, chat, and take the next steps.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
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
                quote="Finding qualified candidates used to be a chore. SwipeHire's AI matching is a game-changer for our recruitment process."
                author="John B."
                role="HR Manager, Tech Corp"
                avatar="https://placehold.co/100x100/63A6FF/FFFFFF.png?text=JB"
                aosAnimation="fade-up" data-aos-delay="100"
              />
              <TestimonialCard
                quote="The AI tools are incredibly helpful for crafting the perfect application. Highly recommend this platform!"
                author="Maria G."
                role="Marketing Specialist"
                avatar="https://placehold.co/100x100/FF6B6B/FFFFFF.png?text=MG"
                aosAnimation="fade-left" data-aos-delay="200"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 bg-muted/50" data-aos="fade-up">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16" data-aos="fade-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Simple, Transparent Pricing</h2>
                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">Choose the plan that's right for you. (Conceptual)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {/* Basic Plan */}
                    <Card className="flex flex-col shadow-lg subtle-card-hover" data-aos="flip-left" data-aos-delay="0">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl text-primary font-heading">Job Seeker Basic</CardTitle>
                            <CardDescription>Get started and find opportunities.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold text-foreground font-heading">Free</p>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Create Profile & Video</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Swipe on Jobs</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Basic AI Tools</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto pt-6 p-6">
                            <Button onClick={onStartExploring} className="w-full bg-primary hover:bg-primary/90 subtle-button-hover">Sign Up Free</Button>
                        </CardFooter>
                    </Card>
                    {/* Pro Plan */}
                    <Card className="flex flex-col shadow-xl border-2 border-primary relative subtle-card-hover" data-aos="flip-up" data-aos-delay="100">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-md">Most Popular</div>
                        <CardHeader className="pb-4 pt-8">
                            <CardTitle className="text-2xl text-primary font-heading">Recruiter Pro</CardTitle>
                            <CardDescription>Find top talent faster.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold text-foreground font-heading">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Post Unlimited Jobs</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Advanced Candidate Search</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Full AI Matching Insights</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Priority Support</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto pt-6 p-6">
                            <Button onClick={onStartExploring} className="w-full bg-primary hover:bg-primary/90 subtle-button-hover">Get Started</Button>
                        </CardFooter>
                    </Card>
                     {/* Enterprise Plan */}
                    <Card className="flex flex-col shadow-lg subtle-card-hover" data-aos="flip-right" data-aos-delay="200">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl text-primary font-heading">Enterprise</CardTitle>
                            <CardDescription>Custom solutions for your team.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold text-foreground font-heading">Custom</p>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Volume Hiring Tools</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> API Access & Integrations</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Dedicated Account Manager</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> Custom Branding</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto pt-6 p-6">
                           <Button onClick={() => alert('Contact sales for Enterprise plan!')} variant="outline" className="w-full subtle-button-hover">Contact Sales</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section id="about" className="py-24 md:py-32 hero-gradient-bg-secondary text-white" data-aos="fade-in">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight font-heading">Ready to Transform Your Hiring or Job Search?</h2>
            <p className="text-lg text-slate-200 max-w-xl mx-auto mb-10 leading-relaxed">
              Join SwipeHire today and experience a smarter, more engaging way to connect.
            </p>
            <Button onClick={onStartExploring} size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-10 py-3 subtle-button-hover shadow-lg hover:shadow-xl">
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <h5 className="font-semibold text-slate-200 mb-4 text-lg font-heading">SwipeHire</h5>
              <p className="text-sm leading-relaxed">Revolutionizing recruitment through AI and video. Connecting talent with opportunity, seamlessly.</p>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-4 text-lg font-heading">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="hover:text-slate-200 transition-colors">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleNavLinkClick(e, 'how-it-works')} className="hover:text-slate-200 transition-colors">How It Works</a></li>
                <li><a href="#pricing" onClick={(e) => handleNavLinkClick(e, 'pricing')} className="hover:text-slate-200 transition-colors">Pricing</a></li>
                <li><a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="hover:text-slate-200 transition-colors">About Us (Conceptual)</a></li>
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
          font-family: var(--font-heading);
        }
      `}</style>
    </div>
  );
}
