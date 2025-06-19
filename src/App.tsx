// Import necessary dependencies for routing, components, and state management
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { GroupList } from "./components/GroupList";
import { GroupDetails } from "./components/groups/GroupDetails";
import { CurrencyConverterPage } from "./components/CurrencyConverterPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "./lib/store";
import { ThemeProvider } from "./components/ThemeToggle";
import { Skeleton } from "./components/ui/skeleton";
import { AuthProvider } from "./components/AuthProvider";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Shows loading state while checking auth status
 * Redirects to landing page if user is not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Get authentication state from Redux store
  const { user, authLoading } = useSelector((state: RootState) => state.app);

  // Display loading skeleton while authentication state is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="space-y-8">
            {/* Header skeleton with logo and user info placeholders */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>

            {/* Content skeleton with card placeholders */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to landing page
  if (!user) {
    return <Navigate to="/" />;
  }

  // Render protected content within dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
}

/**
 * Main App Component
 * Sets up routing, theme, and authentication context
 * Defines all application routes including public and protected routes
 */
function App() {
  return (
    // Wrap app with theme and authentication providers
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes accessible without authentication */}
              <Route path="/" element={<LandingPage />} />

              {/* Protected routes requiring authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <GroupList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <ProtectedRoute>
                    <GroupDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/currency-converter"
                element={
                  <ProtectedRoute>
                    <CurrencyConverterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Feature routes (coming soon) */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto p-4">
                      Settings Page (Coming Soon)
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto p-4">
                      Profile Page (Coming Soon)
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Fallback route for undefined paths */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            {/* Global toast notifications */}
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
