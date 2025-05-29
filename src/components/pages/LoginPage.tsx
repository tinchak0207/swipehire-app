
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Compass } from "lucide-react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, type UserCredential, type FirebaseError, type User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLoginSuccess: (user: UserCredential['user']) => void;
  onLoginBypass: () => void; // New prop for bypass
}

export function LoginPage({ onLoginSuccess, onLoginBypass }: LoginPageProps) {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google Sign-In successful:", user);
      toast({
        title: "Signed In Successfully!",
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      onLoginSuccess(user);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Error during Google Sign-In:", firebaseError);
      let errorMessage = "Failed to sign in with Google.";
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in process was cancelled.";
      } else if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Google Sign-In Failed",
        description: `${errorMessage} Proceeding with a Dev User for testing.`,
        variant: "destructive",
        duration: 5000,
      });

      // Temporary bypass for development
      setTimeout(() => {
        onLoginBypass();
      }, 2000); // Short delay so user can see the error toast
    }
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
            <Compass className="mr-2 h-5 w-5" />
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
