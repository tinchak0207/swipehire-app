
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileVideo2, UserCircle, Briefcase, HeartHandshake, Building, Users, Zap, CheckCircle } from "lucide-react"; // Added more icons

interface WelcomePageProps {
  onStartExploring: () => void;
}

export function WelcomePage({ onStartExploring }: WelcomePageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 dynamic-bg">
      <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-sm animate-fadeIn">
        <CardHeader className="text-center space-y-4 pt-10">
          <FileVideo2 className="mx-auto h-16 w-16 text-primary animate-bounce" />
          <CardTitle className="text-4xl font-bold">Welcome to SwipeHire!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground px-4">
            Discover Your Next Opportunity or Top Talent - The Smarter Way.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-8 text-left px-6 sm:px-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-semibold text-primary mb-2 flex items-center">
                        <UserCircle className="h-6 w-6 mr-2" /> For Job Seekers:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-foreground list-none pl-0">
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Craft a stunning video resume & profile.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Swipe through companies that match your vibe.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Connect directly with interested recruiters.</span></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-xl font-semibold text-primary mb-2 flex items-center">
                        <Building className="h-6 w-6 mr-2" /> For Recruiters:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-foreground list-none pl-0">
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Showcase your unique company culture & open roles.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Discover top talent with engaging video profiles.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Fast-track hiring with mutual-interest matches.</span></li>
                    </ul>
                </div>
            </div>
          <div className="text-center">
            <Button 
              onClick={onStartExploring} 
              size="lg" 
              className="w-3/4 sm:w-1/2 text-xl py-4 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Start Exploring SwipeHire"
            >
              Start Exploring
            </Button>
          </div>
        </CardContent>
        <CardFooter className="pb-8 justify-center">
            <p className="text-xs text-muted-foreground">
              Let's find your perfect match!
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
