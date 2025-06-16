// Import required dependencies
import { Link } from "react-router";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";
import { HomeIcon, UsersIcon, SettingsIcon } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Navigation component
 * Renders the main navigation bar with logo, navigation links, and user controls
 * Includes conditional rendering based on user authentication status
 */
export function Navigation() {
  // Get current user from Redux store
  const user = useSelector((state: RootState) => state.app.user);

  return (
    // Main navigation container with backdrop blur effect
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        {/* Left section: Logo and main navigation links */}
        <div className="mr-4 flex">
          {/* Logo with home link */}
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          {/* Main navigation menu */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* Home link */}
            <Link
              to="/"
              className="flex items-center gap-2 transition-colors hover:text-foreground/80"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>
            {/* Groups link */}
            <Link
              to="/groups"
              className="flex items-center gap-2 transition-colors hover:text-foreground/80"
            >
              <UsersIcon className="h-4 w-4" />
              Groups
            </Link>
            {/* Settings link - only shown when user is authenticated */}
            {user && (
              <Link
                to="/settings"
                className="flex items-center gap-2 transition-colors hover:text-foreground/80"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Link>
            )}
          </nav>
        </div>
        {/* Right section: Theme toggle and user controls */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Theme toggle button */}
          <ThemeToggle />
          {/* Conditional rendering based on authentication status */}
          {user ? (
            // Authenticated user controls
            <>
              <CreateGroupModal />
              <Button variant="outline" asChild>
                <Link to="/profile">
                  {user.displayName || user.phoneNumber}
                </Link>
              </Button>
            </>
          ) : (
            // Authentication modal for non-authenticated users
            <AuthModal />
          )}
        </div>
      </div>
    </nav>
  );
}
