import { Link } from "react-router";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";
import {
  ArrowRightIcon,
  SparklesIcon,
  ShieldIcon,
  GlobeIcon,
  ZapIcon,
} from "lucide-react";
import { LuGithub } from "react-icons/lu";
import { motion } from "framer-motion";

export function HeroSection() {
  const user = useSelector((state: RootState) => state.app.user);

  return (
    <section className="relative flex-1 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000 opacity-50" />

      <div className="container relative mx-auto flex flex-col items-center justify-center gap-8 px-4 py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm backdrop-blur-sm"
          >
            <SparklesIcon className="mr-2 h-4 w-4 text-primary animate-pulse" />
            <span className="font-medium">Open Source Expense Tracking</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-tight"
          >
            Split expenses{" "}
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent animate-pulse">
              fairly
            </span>{" "}
            with friends and family
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto max-w-4xl text-xl text-muted-foreground sm:text-2xl leading-relaxed"
          >
            The open-source way to track shared expenses and balances with
            housemates, trips, groups, friends, and family.{" "}
            <span className="font-semibold text-foreground">
              Free forever, no hidden costs.
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col items-center gap-6 sm:flex-row"
        >
          {user ? (
            <Button
              size="lg"
              asChild
              className="group shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <AuthModal variant="default" size="lg" />
          )}
          <Button
            size="lg"
            variant="outline"
            asChild
            className="group shadow-lg hover:shadow-xl transition-all duration-300 border-2"
          >
            <a
              href="https://github.com/Abhi1264/fairly"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LuGithub className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Star on GitHub
            </a>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center gap-4 md:gap-8 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-green-500" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-4 w-4 text-blue-500" />
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-2">
            <ZapIcon className="h-4 w-4 text-yellow-500" />
            <span>Lightning Fast</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 