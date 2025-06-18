import {
  UsersIcon,
  CreditCardIcon,
  BarChart3Icon,
  CheckIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
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
  ];

  return (
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
          {features.map((feature, index) => (
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
  );
} 