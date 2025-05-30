
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Compass, Eye, Sparkles } from "lucide-react"; // Added Sparkles
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, type UserCredential, type FirebaseError } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLoginBypass: () => void;
  onGuestMode: () => void;
}

export function LoginPage({ onLoginBypass, onGuestMode }: LoginPageProps) {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("LoginPage: Attempting signInWithPopup...");
      const result: UserCredential = await signInWithPopup(auth, provider);
      console.log("LoginPage: signInWithPopup successful, user:", result.user);
      // onAuthStateChanged in HomePage will handle the main state updates.
      toast({
        title: "Sign-In Successful!",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
      });
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
          onLoginBypass();
        }, 2000);
      }
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
          <p className="text-sm text-accent flex items-center justify-center pt-1">
            <Sparkles className="h-4 w-4 mr-1.5 text-yellow-500" />
            Unlock AI tools, personalized matches, & direct messaging!
          </p>
        </CardHeader>
        <CardContent className="space-y-4 py-8">
          <Button
            onClick={handleGoogleSignIn}
            size="lg"
            className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Sign in with Google"
          >
            <Compass className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <Button
            onClick={onGuestMode}
            variant="outline"
            size="lg"
            className="w-full text-lg py-3 border-primary text-primary hover:bg-primary/10"
            aria-label="Continue as Guest"
          >
            <Eye className="mr-2 h-5 w-5" />
            Continue as Guest
          </Button>
        </CardContent>
        <CardFooter className="pb-8">
            <p className="text-center text-xs text-muted-foreground w-full">
              By signing in, you agree to our (conceptual) Terms of Service and Privacy Policy.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
