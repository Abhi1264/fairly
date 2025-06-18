import { Link } from "react-router";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";
import { ArrowRightIcon } from "lucide-react";
import { LuGithub } from "react-icons/lu";
import { motion } from "framer-motion";

export function CTASection() {
  const user = useSelector((state: RootState) => state.app.user);

  return (
    <section className="bg-gradient-to-b from-primary/80 via-primary/50 to-primary/80 text-primary-foreground relative overflow-hidden">
      <div className="container relative mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-4xl text-primary-foreground font-bold tracking-tight sm:text-5xl mb-6">
            Ready to start splitting expenses fairly?
          </h2>
          <p className="text-xl text-primary-foreground mb-12 leading-relaxed">
            Join thousands of users who trust Fairly for their expense tracking
            needs. Start today and never worry about splitting bills again.
          </p>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {user ? (
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <AuthModal variant="secondary" size="lg" />
            )}
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-primary-foreground/20 hover:border-primary-foreground/40 transition-all duration-300"
            >
              <a
                href="https://github.com/Abhi1264/fairly"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuGithub className="mr-2 h-5 w-5" />
                Star on GitHub
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
