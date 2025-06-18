import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function FAQSection() {
  const faqs = [
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
  ];

  return (
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
            {faqs.map((faq, index) => (
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
  );
} 