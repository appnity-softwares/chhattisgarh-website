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
        <section id="download" className="py-32 bg-background relative overflow-hidden border-t border-white/5">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto bg-card/30 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-3xl shadow-primary/5">
                <h2 className="text-4xl md:text-6xl font-bold font-headline mb-8 text-foreground leading-tight">
                    Ready to Find Your <span className="text-primary italic">Match?</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                    Join thousands of happy couples from Chhattisgarh. <br className="hidden md:block" /> Your journey to a lifetime of happiness starts here.
                </p>
                <div className="flex flex-col items-center gap-6">
                    <div className="scale-110 md:scale-125 hover:scale-130 transition-transform duration-500">
                        <AppStoreBadges />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary animate-pulse mt-8">
                        Get the App Now
                    </p>
                </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

