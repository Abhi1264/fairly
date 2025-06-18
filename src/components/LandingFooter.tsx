import { Link } from "react-router";
import { LuGithub } from "react-icons/lu";
import { Logo } from "./Logo";
import { motion } from "framer-motion";

export function LandingFooter() {
  const footerSections = [
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
  ];

  return (
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

          {footerSections.map((section, index) => (
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
  );
} 