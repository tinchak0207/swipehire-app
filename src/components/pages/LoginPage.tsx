
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Compass } from "lucide-react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, type FirebaseError, type UserCredential } from "firebase/auth"; // Changed to signInWithPopup
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLoginBypass: () => void;
}

export function LoginPage({ onLoginBypass }: LoginPageProps) {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Temporarily using signInWithPopup for diagnostics
      const result: UserCredential = await signInWithPopup(auth, provider);
      // If signInWithPopup is successful, onAuthStateChanged in HomePage should pick up the user.
      // We don't need to explicitly call onLoginSuccess here as HomePage handles it.
      console.log("LoginPage: signInWithPopup successful, user:", result.user);
      toast({
        title: "Sign-In Successful (Popup)",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
      // Note: HomePage's onAuthStateChanged listener will handle navigating away from LoginPage.
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Error during Google Sign-In (Popup):", firebaseError.code, firebaseError.message);
      let errorMessage = "Failed to sign in with Google using popup.";
      if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by the browser. Please allow pop-ups for this site.";
      } else if (firebaseError.code === 'auth/cancelled-popup-request' || firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled. The pop-up was closed before completing the sign-in.";
        // Don't necessarily show a destructive toast or bypass for user-cancelled popups
        toast({
          title: "Sign-In Cancelled",
          description: "The Google Sign-In popup was closed.",
          variant: "default", 
        });
        return; // Don't proceed to bypass if user explicitly closed popup
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage = "Sign-in method is not enabled. Please contact support.";
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google Sign-In. Check Firebase console.";
      }
      
      toast({
        title: "Google Sign-In Failed (Popup)",
        description: `${errorMessage} Code: ${firebaseError.code}. For development, a bypass will be attempted.`,
        variant: "destructive",
        duration: 7000,
      });
      // Offer bypass if popup sign-in fails for reasons other than explicit user cancellation
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
