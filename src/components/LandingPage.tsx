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
  ZapIcon,
  ShieldIcon,
  GlobeIcon,
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
    <div className="flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
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

      {/* Hero section */}
      <section className="relative flex-1 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container relative mx-auto flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
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

      {/* Social Proof Section */}
      <section className="border-t bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by people worldwide
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Join thousands of users who trust Fairly for their expense
              tracking
            </p>
            <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
              {["Company 1", "Company 2", "Company 3", "Company 4"].map(
                (company, index) => (
                  <motion.div
                    key={company}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center group"
                  >
                    <div className="h-12 w-40 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 group-hover:border-primary/30 transition-all duration-300" />
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="border-t bg-gradient-to-br from-background to-muted/10">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center mb-20"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Everything you need to split expenses
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Simple, powerful features to manage shared expenses with anyone,
              anywhere. Built with modern technology for the best experience.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
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
                gradient: "from-blue-500/20 to-purple-500/20",
                iconColor: "text-blue-500",
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
                gradient: "from-green-500/20 to-emerald-500/20",
                iconColor: "text-green-500",
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
                gradient: "from-orange-500/20 to-red-500/20",
                iconColor: "text-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border bg-card/50 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:scale-105 hover:bg-card/80"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10">
                  <div
                    className={`mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 w-fit group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item) => (
                      <li
                        key={item}
                        className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                      >
                        <CheckIcon
                          className={`mr-3 h-4 w-4 ${feature.iconColor} group-hover:scale-110 transition-transform`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center mb-20"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that works best for you. No hidden fees, ever.
            </p>
            <div className="inline-flex rounded-2xl bg-muted/50 p-2 backdrop-blur-sm border border-border/50">
              <button
                onClick={() => setActivePricing("monthly")}
                className={cn(
                  "rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300",
                  activePricing === "monthly"
                    ? "bg-background shadow-lg text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setActivePricing("yearly")}
                className={cn(
                  "rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 relative",
                  activePricing === "yearly"
                    ? "bg-background shadow-lg text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-2 py-1 text-xs font-medium text-primary-foreground shadow-lg">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
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
                gradient: "from-gray-500/20 to-gray-600/20",
                popular: false,
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
                gradient: "from-primary/20 to-primary/40",
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
                gradient: "from-purple-500/20 to-purple-600/20",
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "relative rounded-2xl border bg-card/50 backdrop-blur-sm p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl",
                  plan.popular &&
                    "border-primary shadow-xl ring-2 ring-primary/20"
                )}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 py-2 text-sm font-medium text-primary-foreground shadow-lg"
                  >
                    Most Popular
                  </motion.div>
                )}

                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4 flex items-baseline">
                    <span className="text-5xl font-bold">
                      {activePricing === "monthly"
                        ? plan.price.monthly
                        : plan.price.yearly}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      /{activePricing === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    {plan.description}
                  </p>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <CheckIcon className="mr-3 h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "w-full transition-all duration-300",
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl"
                        : "bg-muted hover:bg-muted/80 border-2"
                    )}
                    variant={plan.popular ? "default" : "secondary"}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-gradient-to-br from-background to-muted/10">
        <div className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl"
          >
            <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-xl text-muted-foreground mb-16">
              Everything you need to know about Fairly
            </p>
            <Accordion type="single" collapsible className="space-y-4">
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-6 py-4 hover:border-primary/30 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground relative overflow-hidden">
        <div className="container relative mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Ready to start splitting expenses fairly?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-12 leading-relaxed">
              Join thousands of users who trust Fairly for their expense
              tracking needs. Start today and never worry about splitting bills
              again.
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

      {/* Enhanced Footer */}
      <footer className="border-t bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2">
                <Logo className="h-8" />
                <span className="text-xl font-semibold">Fairly</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The open-source way to track shared expenses and balances with
                friends, family, and groups. Free forever, no hidden costs.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/Abhi1264/fairly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50"
                >
                  <LuGithub className="h-5 w-5" />
                </a>
                {/* Add more social links here */}
              </div>
            </motion.div>

            {[
              {
                title: "Product",
                links: [
                  { name: "Features", href: "/features" },
                  { name: "Pricing", href: "/pricing" },
                  { name: "Security", href: "/security" },
                  { name: "Roadmap", href: "/roadmap" },
                ],
              },
              {
                title: "Company",
                links: [
                  { name: "About", href: "/about" },
                  { name: "Blog", href: "/blog" },
                  { name: "Careers", href: "/careers" },
                  { name: "Contact", href: "/contact" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Cookie Policy", href: "/cookies" },
                  { name: "Licenses", href: "/licenses" },
                ],
              },
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-lg mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 border-t border-border/50 pt-8 text-center"
          >
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Fairly. Open source and free forever.
              Made with ❤️ for the community.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
