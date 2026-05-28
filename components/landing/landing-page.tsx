import { LandingNav } from './landing-nav';
import { HeroSection } from './hero-section';
import { StatsSection } from './stats-section';
import { LogoMarquee } from './marquee-ticker';
import { AppShowcase } from './app-showcase';
import { VideoSection } from './video-section';
import { FeaturesSection } from './features-section';
import {
  FeaturesDarkSection,
  PhilosophySection,
} from './features-dark-section';
import { PricingSection } from './pricing-section';
import { TestimonialsSection } from './testimonials-section';
import { CtaSection } from './cta-section';
import { MarqueeTicker } from './marquee-ticker';
import { LandingFooter } from './landing-footer';

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-background">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <LogoMarquee />
      <AppShowcase />
      <VideoSection />
      <FeaturesSection />
      <FeaturesDarkSection />
      <PhilosophySection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <MarqueeTicker />
      <LandingFooter />
    </div>
  );
}
