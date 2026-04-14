import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with Chhattisgarh Shadi team. Contact us for support, queries, or feedback about our matrimony services.",
    openGraph: {
        title: "Contact Us | Chhattisgarh Shadi",
        description: "Get in touch with Chhattisgarh Shadi team for support and queries.",
    },
};

import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                            Contact Us
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We&apos;d love to hear from you. Reach out to us for any queries,
                            support, or feedback about Chhattisgarh Shadi.
                        </p>
                    </div>
                </section>

                {/* Contact Form & Info Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
                            {/* Form Column */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>
                                    <p className="text-muted-foreground">
                                        Fill out the form below and our team will get back to you within 24 hours.
                                    </p>
                                </div>
                                <Card className="p-6">
                                    <ContactForm />
                                </Card>
                            </div>

                            {/* Info Column */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                                    <p className="text-muted-foreground">
                                        You can also reach us through these channels.
                                    </p>
                                </div>

                                <div className="grid gap-6">
                                    {/* Email Card */}
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <Mail className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Email Us</CardTitle>
                                                <CardDescription>Chhattisgarhshadi@gmail.com</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <a
                                                href="mailto:Chhattisgarhshadi@gmail.com"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Send an email
                                            </a>
                                        </CardContent>
                                    </Card>

                                    {/* Location Card */}
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <MapPin className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Our Location</CardTitle>
                                                <CardDescription>Serving Citizens of Chhattisgarh</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">
                                                Raipur, Chhattisgarh, India
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Support Hours Card */}
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <Clock className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Support Hours</CardTitle>
                                                <CardDescription>Mon - Sat, 10 AM - 6 PM IST</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                We&apos;re here to help you find your perfect match.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* App Download CTA */}
                <section className="py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            Download Our App
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                            For the best experience, download the Chhattisgarh Shadi app
                            and find your perfect match today.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="https://play.google.com/store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                                </svg>
                                Google Play
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
