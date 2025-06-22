import { Link } from "react-router";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";
import { ArrowRightIcon } from "lucide-react";
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export function LandingHeader() {
  const user = useSelector((state: RootState) => state.app.user);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Logo className="h-8" />
          <span className="text-xl font-semibold">Fairly</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <ThemeToggle />
          {user ? (
            <Button
              asChild
              variant="default"
              size="sm"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link to="/dashboard">
                Dashboard
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <AuthModal variant="default" size="lg" />
          )}
        </motion.div>
      </div>
    </header>
  );
} 