import HeroSection from "./hero-section";
import FeaturesOne from "./features-one";
import TrustSection from "./trust-section";
import WhoItsFor from "./who-its-for";
import Testimonials from "./testimonials";
import CallToAction from "./call-to-action";
import FAQs from "./faqs";
import Footer from "./footer";
import CustomClerkPricing from "@/components/custom-clerk-pricing";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesOne />
      <TrustSection />
      <WhoItsFor />
      <section className="bg-muted/50 py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 mx-auto max-w-2xl space-y-6 text-center">
              <h1 className="text-center text-4xl font-semibold lg:text-5xl">Student Membership Blocks</h1>
              <p>Choose the plan that fits your clinical rotation needs. All plans include guaranteed preceptor matches and full support.</p>
          </div>
          <CustomClerkPricing />
        </div>
      </section>
      <Testimonials />
      <CallToAction />
      <FAQs />
      <Footer />
    </div>
  );
}
