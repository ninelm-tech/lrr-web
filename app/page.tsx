import LandingNav       from "./components/landing/LandingNav";
import HeroSection      from "./components/landing/HeroSection";
import StatsBar         from "./components/landing/StatsBar";
import HowItWorks       from "./components/landing/HowItWorks";
import PricingSection   from "./components/landing/PricingSection";
import OperatorsSection from "./components/landing/OperatorsSection";
import FaqSection       from "./components/landing/FaqSection";
import FooterCta        from "./components/landing/FooterCta";

interface Props {
  searchParams: Promise<{ login?: string; next?: string }>;
}

export default async function LandingPage({ searchParams }: Props) {
  const params = await searchParams;
  const autoLogin = params.login === "1";
  const next      = params.next ?? "";

  return (
    <div style={{ position: "relative" }}>
      <LandingNav />
      <HeroSection autoLogin={autoLogin} next={next} />
      <StatsBar />
      <HowItWorks />
      <PricingSection />
      <OperatorsSection />
      <FaqSection />
      <FooterCta />
    </div>
  );
}
