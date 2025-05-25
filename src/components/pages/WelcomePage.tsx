
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileVideo2, CheckCircle } from "lucide-react";

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
            The smarter way to connect talent and opportunity through dynamic video resumes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-8 text-center">
            <div className="space-y-2 text-left px-6 text-sm text-foreground">
                <p className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Discover top talent or your next dream job with engaging video profiles.</span></p>
                <p className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Utilize AI-powered tools to create compelling video scripts and avatars.</span></p>
                <p className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Experience an intuitive, swipe-based interface for quick decision-making.</span></p>
            </div>
          <Button 
            onClick={onStartExploring} 
            size="lg" 
            className="w-3/4 text-xl py-4 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Start Exploring SwipeHire"
          >
            Start Exploring
          </Button>
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
