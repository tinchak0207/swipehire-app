
"use client";

import { useState } from "react"; // Added for loading state
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Eye, Sparkles, CheckCircle, ShieldCheck, Chrome, Loader2 } from "lucide-react"; // Added Chrome, Loader2, ShieldCheck
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, type UserCredential, type FirebaseError } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip

interface LoginPageProps {
  onLoginBypass: () => void;
  onGuestMode: () => void;
}

export function LoginPage({ onLoginBypass, onGuestMode }: LoginPageProps) {
  const { toast } = useToast();
  const [isLoadingGoogleSignIn, setIsLoadingGoogleSignIn] = useState(false); // Added loading state

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogleSignIn(true); // Set loading true
    const provider = new GoogleAuthProvider();
    try {
      console.log("LoginPage: Attempting signInWithPopup...");
      const result: UserCredential = await signInWithPopup(auth, provider);
      console.log("LoginPage: signInWithPopup successful, user:", result.user);
      toast({
        title: "Sign-In Successful!",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
      // onLoginBypass will be triggered by onAuthStateChanged in AppContent, so no direct call here.
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Error during Google Sign-In (Popup):", firebaseError.code, firebaseError.message);
      let errorMessage = "Failed to sign in with Google using popup.";
      let shouldBypass = true;

      if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by the browser. Please allow pop-ups for this site.";
      } else if (firebaseError.code === 'auth/cancelled-popup-request' || firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled. The Google Sign-In window was closed.";
        shouldBypass = false;
        toast({
          title: "Sign-In Cancelled or Popup Issue",
          description: errorMessage,
          variant: "default",
        });
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage = "Sign-in method is not enabled. Please contact support.";
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google Sign-In. Check Firebase console.";
      }

      if (shouldBypass) {
        toast({
          title: "Google Sign-In Failed (Popup)",
          description: `${errorMessage} Code: ${firebaseError.code}. For development, a bypass will be attempted.`,
          variant: "destructive",
          duration: 7000,
        });
        setTimeout(() => {
          onLoginBypass(); // Attempt bypass after showing error
        }, 2000);
      }
    } finally {
      setIsLoadingGoogleSignIn(false); // Set loading false
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 dynamic-bg w-full h-full">
      <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-card via-muted/20 to-card backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pt-8">
          <LogIn className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold animate-text-glow">Welcome to SwipeHire</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            Sign in to discover your next opportunity or top talent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="text-left px-2 space-y-2 mb-4">
            <h3 className="text-lg font-semibold text-primary flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
              Sign In or Register to:
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground list-none pl-1">
              <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Access powerful AI Profile Tools.</span></li>
              <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Discover personalized matches.</span></li>
              <li className="flex items-start"><CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>Engage in direct messaging & build connections.</span></li>
            </ul>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            size="lg"
            variant="outline" // Changed to outline for better contrast with icon
            className="w-full text-lg py-3 border-input bg-background hover:bg-accent hover:text-accent-foreground"
            aria-label="Sign in with Google"
            disabled={isLoadingGoogleSignIn}
          >
            {isLoadingGoogleSignIn ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5 text-red-500" /> // Using Chrome as a stand-in for Google icon
            )}
            Sign in with Google
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onGuestMode}
                  variant="outline"
                  size="lg"
                  className="w-full text-lg py-3 border-primary text-primary hover:bg-primary/10"
                  aria-label="Continue as Guest"
                  disabled={isLoadingGoogleSignIn}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Continue as Guest
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guest mode offers limited functionality. Sign in for the full experience.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <p className="text-center text-xs text-muted-foreground pt-2">
            More sign-in options like Email & LinkedIn coming soon!
          </p>

        </CardContent>
        <CardFooter className="pb-8">
            <p className="text-center text-xs text-muted-foreground w-full flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-green-600" /> By signing in, you agree to our (conceptual) Terms of Service and Privacy Policy.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
