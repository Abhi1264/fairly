// Import required dependencies
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState, createContext, useContext } from "react";

// Key used to store theme preference in localStorage
const THEME_KEY = "fairly-theme";

// Define possible theme values
type Theme = "light" | "dark";

// Create context for theme management
// Provides theme state and toggle function to child components
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
});

/**
 * Custom hook to access theme context
 * @returns Object containing current theme and toggle function
 */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Theme provider component
 * Manages theme state and provides theme context to child components
 * Handles theme persistence and system preference detection
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state with preference from localStorage or system
  const [theme, setTheme] = useState<Theme>(() => {
    // First check localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      if (savedTheme) {
        return savedTheme;
      }
      // If no saved theme, check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  // Update document class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Save theme preference to localStorage
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a theme
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Theme toggle button component
 * Renders a button that toggles between light and dark themes
 * Includes animated sun/moon icons that transition based on current theme
 */
export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9"
    >
      {/* Sun icon - visible in light mode, hidden in dark mode */}
      <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* Moon icon - hidden in light mode, visible in dark mode */}
      <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {/* Screen reader text for accessibility */}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
