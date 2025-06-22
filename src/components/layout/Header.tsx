// Import required dependencies
import { Link } from "react-router";
import { Menu } from "lucide-react";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";
import { CreateGroupModal } from "../CreateGroupModal";
import { OfflineIndicator } from "../OfflineIndicator";

// Props interface for the Header component
interface HeaderProps {
  /** Callback function to control mobile sidebar visibility */
  setIsMobileSidebarOpen: (value: boolean) => void;
}

/**
 * Header component that displays the app's top navigation bar
 * Includes mobile menu toggle, logo, theme toggle, group creation modal, and offline indicator
 */
export function Header({ setIsMobileSidebarOpen }: HeaderProps) {
  return (
    // Fixed header with backdrop blur effect
    <header className="fixed top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Left section: Mobile menu button and logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="lg:hidden flex items-center">
            <Logo className="h-6" />
            <span className="font-semibold text-lg">Fairly</span>
          </Link>
        </div>

        {/* Center section: Offline indicator (hidden on mobile) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <OfflineIndicator />
        </div>

        {/* Right section: Theme toggle, offline indicator (mobile), and create group button */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <div className="md:hidden">
            <OfflineIndicator />
          </div>
          <CreateGroupModal />
        </div>
      </div>
    </header>
  );
}
