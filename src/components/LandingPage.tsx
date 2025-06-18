// Import required dependencies
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { SocialProofSection } from "./SocialProofSection";
import { FeaturesSection } from "./FeaturesSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
import { CTASection } from "./CTASection";
import { LandingFooter } from "./LandingFooter";

/**
 * LandingPage component
 * Renders the main landing page with a header, hero section, features, pricing,
 * and frequently asked questions.
 */
export function LandingPage() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <LandingHeader />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
