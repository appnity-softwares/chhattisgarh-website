import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustSection } from "@/components/landing/trust-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { SuccessStories } from "@/components/landing/success-stories";
import { PublicStatsSection } from "@/components/landing/public-stats-section";
import { AppStoreBadges } from "@/components/layout/app-store-badges";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <PublicStatsSection />
        <FeatureSection />
        <SuccessStories />

        {/* Final CTA / App Download Section */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6">
              Ready to Find Your Match?
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join thousands of happy couples from Chhattisgarh. Your profile is waiting.
            </p>
            <div className="flex justify-center">
              <AppStoreBadges />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

