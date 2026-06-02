import LandingNav      from "./components/landing/LandingNav";
import HeroSection     from "./components/landing/HeroSection";
import StatsBar        from "./components/landing/StatsBar";
import HowItWorks      from "./components/landing/HowItWorks";
import PricingSection  from "./components/landing/PricingSection";
import OperatorsSection from "./components/landing/OperatorsSection";
import FaqSection      from "./components/landing/FaqSection";
import FooterCta       from "./components/landing/FooterCta";

export default function LandingPage() {
  return (
    <div style={{ position: "relative" }}>
      <LandingNav />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <PricingSection />
      <OperatorsSection />
      <FaqSection />
      <FooterCta />
    </div>
  );
}
