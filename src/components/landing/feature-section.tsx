"use client";

import { CheckCircle, Shield, Users, Smartphone, Globe, HeartHandshake } from "lucide-react";

const features = [
    {
        icon: <Shield className="h-10 w-10 text-primary" />,
        title: "100% Verified Profiles",
        description: "Zero tolerance for fake profiles. Every user is manually verified via mobile and ID proof."
    },
    {
        icon: <Globe className="h-10 w-10 text-primary" />,
        title: "Community Focused",
        description: "Specialized filters for Chhattisgarh's unique castes (Sahu, Kurmi, Yadav, etc.) and regions."
    },
    {
        icon: <Smartphone className="h-10 w-10 text-primary" />,
        title: "Easy-to-Use App",
        description: "Access matches on the go with our lightweight Android and iOS apps. Available in Chhattisgarhi."
    },
    {
        icon: <HeartHandshake className="h-10 w-10 text-primary" />,
        title: "Dedicated Support",
        description: "Our relationship managers assist you at every step, from profile creation to connection."
    },
    {
        icon: <Users className="h-10 w-10 text-primary" />,
        title: "Privacy Control",
        description: "You decide who sees your photo and contact details. Your data is safe with us."
    },
    {
        icon: <CheckCircle className="h-10 w-10 text-primary" />,
        title: "High Success Rate",
        description: "Join the platform with the highest engagement and marriage success rate in the state."
    }
];

export function FeatureSection() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-gray-900">
                        Why Choose <span className="text-primary">Chhattisgarh Shaadi?</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Because finding a life partner is not just about algorithms, it's about understanding culture, values, and trust.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-0">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>

                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 relative z-10">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-lg font-light group-hover:text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
