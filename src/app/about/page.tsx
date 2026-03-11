import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Shield, Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "हमारे बारे में | About Us",
    description: "ChhattisgarhShadi.com के बारे में जानें - छत्तीसगढ़ का पहला और सबसे भरोसेमंद ऑनलाइन मैट्रिमोनियल प्लेटफ़ॉर्म।",
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                            हमारे बारे में
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            About ChhattisgarhShadi.com
                        </p>
                    </div>
                </section>

                {/* Mission Statement */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold font-headline mb-4">
                                छत्तीसगढ़ियों का अपना विवाह मंच
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                                ChhattisgarhShadi.com छत्तीसगढ़ का पहला और सबसे भरोसेमंद ऑनलाइन मैट्रिमोनियल प्लेटफ़ॉर्म है।
                                हमारा उद्देश्य छत्तीसगढ़ी परिवारों को आधुनिक तकनीक का उपयोग करते हुए पारंपरिक मूल्यों के साथ
                                अपने बच्चों के लिए सही जीवनसाथी खोजने में मदद करना है।
                            </p>
                        </div>

                        {/* Our Story */}
                        <Card className="mb-12">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold mb-4">हमारी कहानी</h3>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>
                                        2024 में शुरू हुआ ChhattisgarhShadi.com का जन्म एक सरल विचार से हुआ -
                                        छत्तीसगढ़ के लोगों के लिए एक ऐसा प्लेटफ़ॉर्म बनाना जहाँ वे अपनी संस्कृति,
                                        परंपरा और मूल्यों को समझने वाले जीवनसाथी से मिल सकें।
                                    </p>
                                    <p>
                                        हमने देखा कि अधिकांश मैट्रिमोनियल वेबसाइटें बड़े शहरों पर ध्यान केंद्रित करती हैं,
                                        जबकि छोटे शहरों और गांवों के लोगों के लिए सही मैच खोजना मुश्किल होता है।
                                        इसी समस्या को हल करने के लिए हमने ChhattisgarhShadi.com बनाया।
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Core Values */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            <Card className="text-center p-6">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Heart className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">विश्वास और सुरक्षा</h3>
                                <p className="text-muted-foreground">
                                    हम आपकी गोपनीयता और सुरक्षा को सबसे अधिक महत्व देते हैं।
                                    सभी प्रोफाइल की जांच की जाती है।
                                </p>
                            </Card>

                            <Card className="text-center p-6">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">स्थानीय समुदाय</h3>
                                <p className="text-muted-foreground">
                                    छत्तीसगढ़ की संस्कृति, भाषा और परंपराओं को समझने वाला प्लेटफ़ॉर्म।
                                </p>
                            </Card>

                            <Card className="text-center p-6">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Shield className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">सत्यापित प्रोफाइल</h3>
                                <p className="text-muted-foreground">
                                    हम यह सुनिश्चित करते हैं कि सभी प्रोफाइल वास्तविक और सत्यापित हों।
                                </p>
                            </Card>

                            <Card className="text-center p-6">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">सरल और आसान</h3>
                                <p className="text-muted-foreground">
                                    आधुनिक तकनीक के साथ सरल और उपयोग में आसान इंटरफ़ेस।
                                </p>
                            </Card>
                        </div>

                        {/* Statistics */}
                        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 mb-12">
                            <h3 className="text-2xl font-bold text-center mb-8">हमारी उपलब्धियां</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-primary mb-1">5000+</p>
                                    <p className="text-sm text-muted-foreground">पंजीकृत यूजर</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-primary mb-1">1200+</p>
                                    <p className="text-sm text-muted-foreground">सफल मैच</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-primary mb-1">450+</p>
                                    <p className="text-sm text-muted-foreground">शादियां</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-primary mb-1">3500+</p>
                                    <p className="text-sm text-muted-foreground">एक्टिव प्रोफाइल</p>
                                </div>
                            </div>
                        </div>

                        {/* What Makes Us Different */}
                        <Card className="mb-12">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold mb-4">हम अलग क्यों हैं?</h3>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>छत्तीसगढ़ पर केंद्रित:</strong> हम केवल छत्तीसगढ़ और आसपास के क्षेत्रों पर ध्यान देते हैं</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>स्थानीय भाषा:</strong> हिंदी और छत्तीसगढ़ी में सपोर्ट</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>सस्ती सदस्यता:</strong> किफायती कीमत में प्रीमियम सुविधाएं</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>व्यक्तिगत सपोर्ट:</strong> स्थानीय टीम द्वारा मदद</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>तेज़ मैचिंग:</strong> एडवांस्ड एल्गोरिथम से बेहतर मैच सुझाव</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Our Commitment */}
                        <div className="text-center bg-muted/50 rounded-lg p-8">
                            <h3 className="text-2xl font-bold mb-4">हमारा वादा</h3>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                हम छत्तीसगढ़ के हर परिवार को उनके बच्चों के लिए सही जीवनसाथी खोजने में मदद करने के लिए
                                प्रतिबद्ध हैं। आपका विश्वास और संतुष्टि हमारी सफलता की कुंजी है।
                            </p>
                            <div className="mt-6">
                                <a
                                    href="/contact"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    हमसे संपर्क करें
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
