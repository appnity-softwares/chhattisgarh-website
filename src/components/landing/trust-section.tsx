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
        <section className="py-20 bg-secondary/30 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4" ref={ref}>
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-gray-900">
                        Trusted by <span className="text-primary">Chhattisgarh</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        We are the fastest growing and most trusted matrimony platform dedicated to the communities of Chhattisgarh.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                                transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                            `}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="h-16 w-16 mx-auto mb-6 bg-secondary/50 rounded-full flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                            <p className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</p>
                            <p className="text-sm text-muted-foreground">{stat.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
