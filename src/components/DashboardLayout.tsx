// Import required dependencies
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";
import { AuthModal } from "./AuthModal";
import { useState } from "react";
import { Sidebar } from "./layout/Sidebar";
import { Header } from "./layout/Header";

// Props interface for the DashboardLayout component
interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout component that provides the main layout structure for authenticated and unauthenticated users
 * Handles responsive sidebar, mobile navigation, and authentication state
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Get current user from Redux store
  const user = useSelector((state: RootState) => state.app.user);

  // State management for sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Render unauthenticated layout with auth modal
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="flex justify-end">
            <AuthModal />
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Render authenticated layout with sidebar and header
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Backdrop - Only visible on mobile when sidebar is open */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar - Collapsible on desktop, slide-out on mobile */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsCollapsed={setIsCollapsed}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area - Adjusts padding based on sidebar state */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Fixed Header with mobile menu toggle */}
        <Header setIsMobileSidebarOpen={setIsMobileSidebarOpen} />
        <div className="h-14" /> {/* Spacer for fixed header */}
        <main className="container mx-auto p-4">{children}</main>
      </div>
    </div>
  );
}
