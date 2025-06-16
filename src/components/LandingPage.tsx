// Import required dependencies
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";
import {
  UsersIcon,
  CreditCardIcon,
  BarChart3Icon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
} from "lucide-react";
import { LuGithub } from "react-icons/lu";
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

/**
 * LandingPage component
 * Renders the main landing page with a header, hero section, features, pricing,
 * and frequently asked questions.
 */
export function LandingPage() {
  const user = useSelector((state: RootState) => state.app.user);
  const [activePricing, setActivePricing] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="default" size="sm">
                <Link to="/dashboard">
                  Dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <AuthModal variant="default" size="lg" />
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container relative mx-auto flex flex-col items-center justify-center gap-8 px-4 py-32 text-center md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <SparklesIcon className="mr-2 h-4 w-4 text-primary" />
              <span>Open Source Expense Tracking</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Split expenses{" "}
              <span className="bg-gradient-to-b from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                fairly
              </span>{" "}
              with friends
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
              The open-source way to track shared expenses and balances with
              housemates, trips, groups, friends, and family. Free forever, no
              hidden costs.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            {user ? (
              <Button size="lg" asChild className="group">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <AuthModal variant="default" size="lg" />
            )}
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/Abhi1264/fairly"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuGithub className="mr-2 h-5 w-5" />
                Star on GitHub
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Trusted by people worldwide
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
              {["Company 1", "Company 2", "Company 3", "Company 4"].map(
                (company) => (
                  <div
                    key={company}
                    className="flex items-center justify-center"
                  >
                    <div className="h-8 w-32 rounded bg-muted/50" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to split expenses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple, powerful features to manage shared expenses with anyone,
              anywhere.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: UsersIcon,
                title: "Group Expenses",
                description:
                  "Create groups for trips, housemates, and more. Add expenses and split them fairly with our smart algorithms.",
                features: [
                  "Multiple group types",
                  "Custom split options",
                  "Real-time updates",
                ],
              },
              {
                icon: CreditCardIcon,
                title: "Track Balances",
                description:
                  "Keep track of who owes what. Settle up with friends easily and keep everyone happy with automated calculations.",
                features: [
                  "Automated calculations",
                  "Payment history",
                  "Settlement suggestions",
                ],
              },
              {
                icon: BarChart3Icon,
                title: "Expense Analytics",
                description:
                  "Get insights into your spending patterns and group expenses with beautiful, interactive charts and reports.",
                features: [
                  "Interactive charts",
                  "Export reports",
                  "Spending insights",
                ],
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-lg border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {feature.features.map((item) => (
                    <li
                      key={item}
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that works best for you
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => setActivePricing("monthly")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium",
                    activePricing === "monthly"
                      ? "bg-background shadow"
                      : "text-muted-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActivePricing("yearly")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium",
                    activePricing === "yearly"
                      ? "bg-background shadow"
                      : "text-muted-foreground"
                  )}
                >
                  Yearly
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: { monthly: "$0", yearly: "$0" },
                description: "Perfect for personal use and small groups",
                features: [
                  "Unlimited expenses",
                  "Up to 5 groups",
                  "Basic analytics",
                  "Email support",
                  "Open source",
                ],
              },
              {
                name: "Pro",
                price: { monthly: "$9", yearly: "$86" },
                description: "Best for frequent travelers and larger groups",
                features: [
                  "Everything in Free",
                  "Unlimited groups",
                  "Advanced analytics",
                  "Priority support",
                  "Custom categories",
                  "Export to PDF/Excel",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: { monthly: "$29", yearly: "$290" },
                description: "For organizations and large teams",
                features: [
                  "Everything in Pro",
                  "Team management",
                  "API access",
                  "Custom integrations",
                  "Dedicated support",
                  "Advanced security",
                ],
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className={cn(
                  "relative rounded-lg border bg-card p-8",
                  plan.popular && "border-primary shadow-lg"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">
                    {activePricing === "monthly"
                      ? plan.price.monthly
                      : plan.price.yearly}
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    /{activePricing === "monthly" ? "month" : "year"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-8 w-full",
                    plan.popular ? "bg-primary" : "bg-muted hover:bg-muted/80"
                  )}
                  variant={plan.popular ? "default" : "secondary"}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="mt-12">
              {[
                {
                  question: "Is Fairly really free?",
                  answer:
                    "Yes! Fairly is completely free and open source. We believe in making expense tracking accessible to everyone. You can use all core features without paying a dime.",
                },
                {
                  question: "How does Fairly handle currency conversion?",
                  answer:
                    "Fairly supports multiple currencies and automatically handles currency conversion using real-time exchange rates. You can set your preferred currency for each group.",
                },
                {
                  question: "Can I use Fairly offline?",
                  answer:
                    "Yes, Fairly works offline! Your data syncs automatically when you're back online. Perfect for trips where internet access might be limited.",
                },
                {
                  question: "Is my data secure?",
                  answer:
                    "Absolutely. We take security seriously. All data is encrypted, and we never store your payment information. Plus, being open source means our code is transparent and auditable.",
                },
                {
                  question: "Can I export my data?",
                  answer:
                    "Yes! You can export your data in various formats including CSV, PDF, and Excel. This makes it easy to keep records or switch to another service if needed.",
                },
                {
                  question: "How does Fairly handle recurring expenses?",
                  answer:
                    "Fairly makes it easy to set up recurring expenses like rent, utilities, or subscriptions. You can set the frequency, amount, and split method once, and Fairly will handle the rest.",
                },
              ].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-border/40 px-4"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to start splitting expenses fairly?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of users who trust Fairly for their expense
              tracking needs.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <AuthModal variant="secondary" size="lg" />
              )}
              <Button size="lg" variant="outline" asChild>
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
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                <Logo className="h-8" />
                <span className="text-lg font-semibold">Fairly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The open-source way to track shared expenses and balances with
                friends, family, and groups.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/Abhi1264/fairly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LuGithub className="h-5 w-5" />
                </a>
                {/* Add more social links here */}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="hover:text-foreground">
                    Security
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="hover:text-foreground">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/licenses" className="hover:text-foreground">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Fairly. Open source and free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
