
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Briefcase, CheckCircle, ChevronDown, Construction, FileVideo2, HeartHandshake, Linkedin, LogIn, Mail, Rocket, Sparkles, Star, Twitter, User, UserCircle, Users, Wand2, Zap } from "lucide-react";
import Link from 'next/link'; // Import Link
import Image from 'next/image'; // Import Image

interface WelcomePageProps {
  onStartExploring: () => void; // Renamed from onGetStarted for consistency with page.tsx
  onGuestMode: () => void;    // Renamed from onContinueAsGuest
}

const FeatureCard = ({ icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  const Icon = icon;
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="pb-3">
        <Icon className="mx-auto h-10 w-10 text-primary mb-2" />
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

const TestimonialCard = ({ quote, author, role, avatar }: { quote: string, author: string, role: string, avatar: string }) => (
  <Card className="shadow-lg bg-card">
    <CardContent className="pt-6">
      <blockquote className="italic text-muted-foreground">"{quote}"</blockquote>
      <div className="mt-4 flex items-center">
        <Image src={avatar} alt={author} width={40} height={40} className="rounded-full mr-3" data-ai-hint="person face" />
        <div>
          <p className="font-semibold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function WelcomePage({ onStartExploring, onGuestMode }: WelcomePageProps) {

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
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <FileVideo2 className="h-8 w-8" />
            <span className="text-2xl font-bold text-foreground">SwipeHire</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavLinkClick(e, 'how-it-works')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#pricing" onClick={(e) => handleNavLinkClick(e, 'pricing')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
          </nav>
          <Button onClick={onStartExploring} variant="default" size="sm">
            Log In / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative py-20 md:py-32 text-white hero-gradient-bg">
          <div className="absolute inset-0 bg-black/30 z-0"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Unlock Your Career Potential.
              <br className="hidden sm:block" />
              Discover Top Talent.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10">
              SwipeHire revolutionizes recruitment with AI-powered video resumes and intelligent matching. Connect authentically, hire effectively.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
              <Button onClick={onStartExploring} size="lg" className="bg-white text-primary hover:bg-slate-100 w-full sm:w-auto text-lg px-8 py-3">
                <Rocket className="mr-2 h-5 w-5" /> Get Started Free
              </Button>
              <Button onClick={onGuestMode} variant="secondary" size="lg" className="bg-slate-800/70 border-slate-600 hover:bg-slate-700/90 text-white w-full sm:w-auto text-lg px-8 py-3">
                <User className="mr-2 h-5 w-5" /> Continue as Guest
              </Button>
            </div>
            <button onClick={onStartExploring} className="text-sm text-slate-300 hover:text-white transition-colors">
              Already have an account? <span className="font-semibold underline">Log In</span>
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-70">
              <ChevronDown className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-4 bg-primary/90 text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-md sm:text-lg font-medium flex items-center justify-center">
              <Brain className="mr-2 h-6 w-6" />
              Join thousands finding their dream jobs & top talent with AI-driven insights.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why SwipeHire?</h2>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the next generation of recruitment and job searching.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={FileVideo2} title="AI Video Resumes" description="Showcase your personality and skills beyond paper. Get AI assistance to create compelling video introductions." />
              <FeatureCard icon={Sparkles} title="Intelligent Matching" description="Our AI connects you with the right opportunities or candidates based on deep profile analysis and preferences." />
              <FeatureCard icon={Wand2} title="AI Toolkit" description="Access tools like script generators, avatar creators, and video feedback to perfect your application or job posting." />
              <FeatureCard icon={HeartHandshake} title="Mutual Interest First" description="Connect only when both parties express interest, making interactions more meaningful and efficient." />
              <FeatureCard icon={Briefcase} title="Dynamic Job Postings" description="Recruiters can create engaging job posts with video, showcasing company culture and role specifics." />
              <FeatureCard icon={Zap} title="Staff Diary & Community" description="Share experiences, insights, and connect with a community of professionals within your field (coming soon)." />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Simple Steps to Success</h2>
              <p className="mt-3 text-lg text-muted-foreground">Get started in minutes.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">1</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground text-sm">Job seekers build a dynamic profile with video. Recruiters showcase their company and roles.</p>
              </div>
              <div className="p-6">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">2</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Swipe & Discover</h3>
                <p className="text-muted-foreground text-sm">Explore AI-matched candidates or job opportunities with an intuitive swipe interface.</p>
              </div>
              <div className="p-6">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">3</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Connect & Engage</h3>
                <p className="text-muted-foreground text-sm">When it's a mutual match, connect directly, chat, and take the next steps.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section (Conceptual) */}
        <section id="testimonials" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Loved by Professionals</h2>
              <p className="mt-3 text-lg text-muted-foreground">See what our early users are saying.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="SwipeHire's video resume feature helped me stand out and land my dream job!" 
                author="Sarah L." 
                role="Software Engineer"
                avatar="https://placehold.co/100x100.png?text=SL"
              />
              <TestimonialCard 
                quote="Finding qualified candidates used to be a chore. SwipeHire's AI matching is a game-changer." 
                author="John B." 
                role="HR Manager, Tech Corp"
                avatar="https://placehold.co/100x100.png?text=JB"
              />
              <TestimonialCard 
                quote="The AI tools are incredibly helpful for crafting the perfect application. Highly recommend!" 
                author="Maria G." 
                role="Marketing Specialist"
                avatar="https://placehold.co/100x100.png?text=MG"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section (Conceptual) */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Simple, Transparent Pricing</h2>
                    <p className="mt-3 text-lg text-muted-foreground">Choose the plan that's right for you. (Conceptual)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {/* Basic Plan */}
                    <Card className="flex flex-col shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl text-primary">Job Seeker Basic</CardTitle>
                            <CardDescription>Get started and find opportunities.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="text-4xl font-bold text-foreground">Free</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Create Profile & Video</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Swipe on Jobs</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Basic AI Tools</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={onStartExploring} className="w-full bg-primary hover:bg-primary/90">Sign Up Free</Button>
                        </CardFooter>
                    </Card>
                    {/* Pro Plan */}
                    <Card className="flex flex-col shadow-xl border-2 border-primary relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-md">Most Popular</div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl text-primary">Recruiter Pro</CardTitle>
                            <CardDescription>Find top talent faster.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="text-4xl font-bold text-foreground">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Post Unlimited Jobs</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Advanced Candidate Search</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Full AI Matching Insights</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Priority Support</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={onStartExploring} className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                        </CardFooter>
                    </Card>
                     {/* Enterprise Plan */}
                    <Card className="flex flex-col shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl text-primary">Enterprise</CardTitle>
                            <CardDescription>Custom solutions for your team.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="text-4xl font-bold text-foreground">Custom</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Volume Hiring Tools</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> API Access</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Dedicated Account Manager</li>
                                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Custom Integrations</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button onClick={() => alert('Contact sales for Enterprise plan!')} variant="outline" className="w-full">Contact Sales</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section id="about" className="py-16 md:py-24 hero-gradient-bg-secondary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Hiring or Job Search?</h2>
            <p className="text-lg text-slate-200 max-w-xl mx-auto mb-8">
              Join SwipeHire today and experience a smarter, more engaging way to connect.
            </p>
            <Button onClick={onStartExploring} size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-10 py-3">
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="font-semibold text-slate-200 mb-3">SwipeHire</h5>
              <p className="text-sm">Revolutionizing recruitment through AI and video.</p>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-3">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="hover:text-slate-200">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleNavLinkClick(e, 'how-it-works')} className="hover:text-slate-200">How It Works</a></li>
                <li><a href="#pricing" onClick={(e) => handleNavLinkClick(e, 'pricing')} className="hover:text-slate-200">Pricing</a></li>
                <li><a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="hover:text-slate-200">About Us (Conceptual)</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-3">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-slate-200" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="hover:text-slate-200" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
                <a href="#" className="hover:text-slate-200" aria-label="Email"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SwipeHire. All rights reserved. Built with AI assistance.</p>
          </div>
        </div>
      </footer>
      <style jsx>{`
        .hero-gradient-bg {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--accent) / 0.8) 100%),
                      linear-gradient(to right, #0f172a, #1e293b); /* Fallback dark blue gradient */
          background-blend-mode: multiply;
        }
         .hero-gradient-bg-secondary { /* Slightly different gradient for variation */
          background: linear-gradient(135deg, hsl(var(--accent) / 0.85) 0%, hsl(var(--secondary) / 0.7) 100%),
                      linear-gradient(to right, #1e3a8a, #3b82f6); /* Blue-ish fallback */
          background-blend-mode: multiply;
        }
      `}</style>
    </div>
  );
}

    