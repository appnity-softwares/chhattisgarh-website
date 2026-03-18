"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustSection } from "@/components/landing/trust-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { SuccessStories } from "@/components/landing/success-stories";
import { PublicStatsSection } from "@/components/landing/public-stats-section";
import { AppStoreBadges } from "@/components/layout/app-store-badges";
import { configService } from "@/services/config.service";
import { AlertTriangle, Hammer, RefreshCw } from "lucide-react";

export default function Home() {

  const [features, setFeatures] = useState({
    maintenanceMode: false,
    showTestimonials: true,
    enableDiscovery: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfigs = async () => {
      try {
        const data = await configService.getAllConfigs();
        const featureConfig = data.find(c => c.key === 'app_features');
        if (featureConfig) {
          const f = JSON.parse(featureConfig.value);
          setFeatures(f);
        }
      } catch (err) {
        console.error("Config check failed");
      } finally {
        setLoading(false);
      }
    };
    checkConfigs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium tracking-widest uppercase text-xs">Loading Chhattisgarh Shaadi...</p>
      </div>
    );
  }

  if (features.maintenanceMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-2xl">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Hammer className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground leading-tight">
            We're Tinkering <br /> <span className="text-primary italic">With Perfection</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 font-light leading-relaxed">
            Our platform is currently undergoing scheduled maintenance to bring you new features and a better experience. We'll be back shortly!
          </p>
          <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-4 text-left">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-foreground">Estimated Downtime</p>
              <p className="text-sm text-muted-foreground">Approx. 30-45 minutes. Thank you for your patience.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <PublicStatsSection />
        <FeatureSection />
        {features.showTestimonials && <SuccessStories />}

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

