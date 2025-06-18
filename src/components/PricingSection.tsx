import { useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function PricingSection() {
  const [activePricing, setActivePricing] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    {
      name: "Free",
      price: { monthly: "$0", yearly: "$0" },
      description: "Perfect for personal use and small groups",
      features: [
        "Unlimited expenses",
        "Unlimited groups",
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
  ];

  return (
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
          {plans.map((plan, index) => (
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
                <p className="text-muted-foreground mb-8">{plan.description}</p>
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
  );
}
