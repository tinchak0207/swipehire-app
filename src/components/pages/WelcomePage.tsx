
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileVideo2, UserCircle, Briefcase, HeartHandshake, Building, Users, Zap, Sparkles, BarChart3, ListChecks, Construction } from "lucide-react"; // Added ListChecks, Construction

interface WelcomePageProps {
  onStartExploring: () => void;
}

export function WelcomePage({ onStartExploring }: WelcomePageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 dynamic-bg">
      <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-sm animate-fadeIn">
        <CardHeader className="text-center space-y-3 pt-8">
          <FileVideo2 className="mx-auto h-16 w-16 text-primary animate-bounce" />
          <CardTitle className="text-4xl font-bold">Welcome to SwipeHire!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground px-4">
            The Future of Hiring: Dynamic, Engaging, and AI-Powered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6 text-left px-6 sm:px-8">
            <div className="space-y-5">
                <div>
                    <h3 className="text-xl font-semibold text-primary mb-2.5 flex items-center">
                        <UserCircle className="h-6 w-6 mr-2.5" /> For Job Seekers:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-foreground list-none pl-1">
                        <li className="flex items-start"><Sparkles className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Showcase Your Personality: Craft an AI-assisted video resume & dynamic profile.</span></li>
                        <li className="flex items-start"><Briefcase className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Discover Your Ideal Workplace: Swipe through companies that genuinely match your vibe & values.</span></li>
                        <li className="flex items-start"><HeartHandshake className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Meaningful Connections: Connect directly only with recruiters truly interested in *you*.</span></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-xl font-semibold text-primary mb-2.5 flex items-center">
                        <Building className="h-6 w-6 mr-2.5" /> For Recruiters:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-foreground list-none pl-1">
                        <li className="flex items-start"><Zap className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Attract Top Talent: Showcase your unique company culture & roles with engaging video.</span></li>
                        <li className="flex items-start"><Users className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>See Beyond the Paper: Discover top talent through dynamic video profiles, not just static text.</span></li>
                        <li className="flex items-start"><BarChart3 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Hire Smarter, Not Harder: Fast-track hiring with AI-powered insights & mutual-interest matches.</span></li>
                    </ul>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/50 text-center">
                 <h3 className="text-md font-semibold text-primary mb-2 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-2 text-yellow-400 fill-yellow-400" /> Why SwipeHire?
                </h3>
                <p className="text-sm text-muted-foreground italic">
                    Move beyond static resumes. SwipeHire brings profiles and company cultures to life with AI-powered video and intelligent matching. Connect more authentically, hire more effectively.
                </p>
            </div>

            <div className="pt-4 mt-2 border-t border-border/50">
                 <h3 className="text-md font-semibold text-primary mb-2 flex items-center">
                    <Construction className="h-5 w-5 mr-2 text-accent" /> Our Vision & What's Next (Conceptual)
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                    We're committed to evolving SwipeHire into the most intuitive and effective platform for talent connection. Your feedback is vital as we build:
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-4">
                    <li>Advanced AI Video Coaching & Feedback</li>
                    <li>Enhanced Recruiter Tools for Candidate Management</li>
                    <li>Community Features & Industry Insights</li>
                    <li>More Powerful Personalization Options</li>
                </ul>
            </div>


          <div className="text-center">
            <Button 
              onClick={onStartExploring} 
              size="lg" 
              className="w-3/4 sm:w-1/2 text-xl py-4 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Start Exploring SwipeHire"
            >
              Start Exploring
            </Button>
          </div>
        </CardContent>
        <CardFooter className="pb-6 justify-center">
            <p className="text-xs text-muted-foreground">
              Join the hiring revolution!
            </p>
        </CardFooter>
      </Card>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
