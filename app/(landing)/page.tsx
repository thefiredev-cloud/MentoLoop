import HeroSection from "./hero-section";
import FeaturesOne from "./features-one";
import WhoItsFor from "./who-its-for";
import CallToAction from "./call-to-action";
import FAQs from "./faqs";
import Footer from "./footer";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesOne />
      <WhoItsFor />
      <CallToAction />
      <FAQs />
      <Footer />
    </div>
  );
}