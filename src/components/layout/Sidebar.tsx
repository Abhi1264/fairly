// Import required dependencies
import { Link, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../lib/store";
import { Button } from "../ui/button";
import { Logo } from "../Logo";
import {
  HomeIcon,
  UsersIcon,
  SettingsIcon,
  BarChart3Icon,
  LogOutIcon,
  PanelLeft,
  X,
  ArrowRightLeft,
} from "lucide-react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { clearUser } from "../../lib/appSlice";
import { toast } from "sonner";

/**
 * Props interface for the Sidebar component
 * Controls the sidebar's collapsed state and mobile visibility
 */
interface SidebarProps {
  /** Whether the sidebar is collapsed on desktop */
  isCollapsed: boolean;
  /** Whether the mobile sidebar is open */
  isMobileSidebarOpen: boolean;
  /** Callback to toggle sidebar collapse state */
  setIsCollapsed: (value: boolean) => void;
  /** Callback to toggle mobile sidebar visibility */
  setIsMobileSidebarOpen: (value: boolean) => void;
}

/**
 * Sidebar component that provides navigation and user controls
 * Supports both desktop (collapsible) and mobile views
 */
export function Sidebar({
  isCollapsed,
  isMobileSidebarOpen,
  setIsCollapsed,
  setIsMobileSidebarOpen,
}: SidebarProps) {
  // Get user state and location from Redux and router
  const user = useSelector((state: RootState) => state.app.user);
  const location = useLocation();
  const dispatch = useDispatch();

  /**
   * Handles user sign out process
   * Signs out from Firebase and clears user state
   */
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Groups",
      href: "/groups",
      icon: UsersIcon,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3Icon,
    },
    {
      name: "Currency Converter",
      href: "/currency-converter",
      icon: ArrowRightLeft,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 border-r bg-sidebar transition-all duration-300 ${
        isCollapsed ? "lg:w-18" : "lg:w-64"
      } ${
        isMobileSidebarOpen ? "w-56 translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Header section with logo and mobile close button */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {(!isCollapsed || !isMobileSidebarOpen) && (
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-6" />
            {(!isCollapsed || isMobileSidebarOpen) && (
              <span className="font-semibold text-lg">Fairly</span>
            )}
          </Link>
        )}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation section */}
      <nav className="space-y-1 p-4">
        {/* Desktop collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`ml-auto hidden items-center rounded-lg px-3 py-2 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 lg:flex`}
          title="Toggle Sidebar"
        >
          <PanelLeft
            className={`h-4 w-4 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Navigation items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
              title={
                isCollapsed && !isMobileSidebarOpen ? item.name : undefined
              }
            >
              <item.icon className="h-4 w-4" />
              {(!isCollapsed || isMobileSidebarOpen) && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer section with user profile and sign out */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <div
          className={`flex items-center ${
            isCollapsed && !isMobileSidebarOpen
              ? "justify-center"
              : "justify-between"
          }`}
        >
          {/* User profile section */}
          {(!isCollapsed || isMobileSidebarOpen) && (
            <div className="flex items-center gap-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10" />
              )}
              <div className="text-sm">
                <p className="font-medium">
                  {user?.displayName || user?.phoneNumber}
                </p>
              </div>
            </div>
          )}

          {/* Sign out button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50"
            title={isCollapsed && !isMobileSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
