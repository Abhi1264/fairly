import { useTheme } from "./ThemeToggle";

/**
 * Logo component
 * Renders the Fairly logo with a dynamic theme-based image source
 * @param className - Optional className for the logo
 * @returns A themed logo image element
 */
export function Logo({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/fairly-white.svg" : "/fairly-black.svg";

  return <img src={logoSrc} alt="Fairly" className={`h-6 ${className}`} />;
}
