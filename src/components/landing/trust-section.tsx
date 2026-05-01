"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Heart, ShieldCheck, MessageCircle } from "lucide-react";

const stats = [
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        value: "10,000+",
        label: "Authentic Profiles",
        description: "100% Mobile verified profiles from Chhattisgarh"
    },
    {
        icon: <Heart className="h-8 w-8 text-primary" />,
        value: "500+",
        label: "Happy Weddings",
        description: "Helping families unite across the state"
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-accent" />,
        value: "100%",
        label: "Secure & Private",
        description: "Your privacy is our utmost priority"
    },
    {
        icon: <MessageCircle className="h-8 w-8 text-primary" />,
        value: "1M+",
        label: "Connections Made",
        description: "Bringing people together every day"
    }
];

export function TrustSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* High-end Decorative Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10" ref={ref}>
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6 text-foreground leading-tight">
                        Trusted by <span className="text-primary font-medium">Chhattisgarh</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
                        The fastest growing and most trusted matrimony platform dedicated to the vibrant communities of Chhattisgarh.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-8 bg-card/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500
                                transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                            `}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="h-16 w-16 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                                {stat.icon}
                            </div>
                            <h3 className="text-4xl font-bold text-foreground mb-3 font-headline tracking-tighter">
                                {stat.value}
                            </h3>
                            <p className="text-lg font-bold text-primary mb-3 uppercase tracking-wider text-sm">
                                {stat.label}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
