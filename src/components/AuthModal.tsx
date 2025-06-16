// Import required dependencies
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { toast } from "sonner";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./ui/button";
import { FaGoogle } from "react-icons/fa";

/**
 * Props interface for the AuthModal component
 * Extends button variant props to allow customization of the trigger button
 */
interface AuthModalProps extends VariantProps<typeof buttonVariants> {}

/**
 * AuthModal component that provides Google authentication
 * Displays a dialog with a Google sign-in button
 */
export function AuthModal({
  variant = "outline",
  size = "default",
}: AuthModalProps) {
  // State management for loading and dialog visibility
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles the Google sign-in process
   * Creates a Google auth provider, adds required scopes, and initiates sign-in
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for profile and email access
      provider.addScope("profile");
      provider.addScope("email");
      await signInWithPopup(auth, provider);
      toast.success("Successfully signed in!");
      setDialogOpen(false);
      navigate("/dashboard"); // Redirect to dashboard after successful sign-in
    } catch (err) {
      console.error("Error signing in with Google:", err);
      toast.error("Error signing in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles dialog open state changes
   * @param open - Boolean indicating if dialog should be open
   */
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      {/* Trigger button for opening the auth dialog */}
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          Sign In
        </Button>
      </DialogTrigger>

      {/* Auth dialog content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In with Google</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            {/* Helper text explaining the sign-in process */}
            <p className="text-sm text-muted-foreground text-center">
              Sign in with your Google account to continue
            </p>
            {/* Google sign-in button with loading state */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full max-w-sm"
              variant="outline"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <div className="flex items-center gap-2">
                  <FaGoogle />
                  Sign in with Google
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
