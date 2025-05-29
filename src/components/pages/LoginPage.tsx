
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Compass } from "lucide-react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithRedirect, type UserCredential, type FirebaseError } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLoginSuccess: (user: UserCredential['user']) => void;
  onLoginBypass: () => void;
}

export function LoginPage({ onLoginSuccess, onLoginBypass }: LoginPageProps) {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Using signInWithRedirect instead of signInWithPopup
      await signInWithRedirect(auth, provider);
      // The result will be handled by getRedirectResult in HomePage after redirect.
      // No immediate onLoginSuccess call here.
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Error initiating Google Sign-In redirect:", firebaseError);
      let errorMessage = "Failed to initiate sign-in with Google.";
      if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      }
      // Other immediate errors from signInWithRedirect are less common than with popup
      
      toast({
        title: "Google Sign-In Initiation Failed",
        description: `${errorMessage} You can try again or use the bypass for development.`,
        variant: "destructive",
        duration: 5000,
      });
       // Still offer bypass if initiation fails for some reason
      setTimeout(() => {
        onLoginBypass();
      }, 2000);
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
