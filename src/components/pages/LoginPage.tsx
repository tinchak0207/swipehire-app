
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Compass } from "lucide-react"; // Using Compass as a generic 'Google-like' icon

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const handleGoogleSignIn = () => {
    // Simulate Google Sign-In
    console.log("Simulating Google Sign-In...");
    // In a real app, you'd integrate Firebase Authentication or a similar OAuth provider here.
    // This would involve redirecting to Google, handling the response, and getting user info.
    // For this prototype, we just call onLoginSuccess directly.
    onLoginSuccess(); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 dynamic-bg">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 pt-8">
          <LogIn className="mx-auto h-14 w-14 text-primary" />
          <CardTitle className="text-3xl font-bold">Welcome to SwipeHire</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            Sign in to discover your next opportunity or top talent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-8">
          <Button 
            onClick={handleGoogleSignIn} 
            size="lg" 
            className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Sign in with Google"
          >
            <Compass className="mr-2 h-5 w-5" /> {/* Placeholder for Google Icon */}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="pb-8">
            <p className="text-center text-xs text-muted-foreground w-full">
              By signing in, you agree to our Terms of Service and Privacy Policy (not really, this is a demo!).
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
