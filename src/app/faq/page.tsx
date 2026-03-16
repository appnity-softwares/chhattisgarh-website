'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, HelpCircle, Shield, Heart, Crown, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Types
interface FAQ {
    id: number;
    key: string;
    question: string;
    questionHi: string;
    answer: string;
    answerHi: string;
    faqCategory: string;
    order: number;
}

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
    'General': { icon: <HelpCircle className="w-5 h-5" />, color: 'text-orange-600', gradient: 'from-orange-50 to-orange-100/50' },
    'Account & Profile': { icon: <HelpCircle className="w-5 h-5" />, color: 'text-orange-600', gradient: 'from-orange-50 to-orange-100/50' },
    'Privacy & Security': { icon: <Shield className="w-5 h-5" />, color: 'text-green-600', gradient: 'from-green-50 to-green-100/50' },
    'Matches & Interests': { icon: <Heart className="w-5 h-5" />, color: 'text-pink-600', gradient: 'from-pink-50 to-pink-100/50' },
    'Premium & Payments': { icon: <Crown className="w-5 h-5" />, color: 'text-amber-600', gradient: 'from-amber-50 to-amber-100/50' },
    'Chhattisgarh Specific': { icon: <MapPin className="w-5 h-5" />, color: 'text-blue-600', gradient: 'from-blue-50 to-blue-100/50' },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1';

// Hardcoded fallback FAQs (used when API is unavailable)
const FALLBACK_FAQS: FAQ[] = [
    { id: 1, key: 'f1', question: 'ChhattisgarhShadi.com क्या है?', questionHi: '', answer: 'ChhattisgarhShadi.com छत्तीसगढ़ का सबसे भरोसेमंद ऑनलाइन मैट्रिमोनियल प्लेटफ़ॉर्म है। हम छत्तीसगढ़ और आसपास के क्षेत्रों के लोगों को अपना सही जीवनसाथी खोजने में मदद करते हैं।', answerHi: '', faqCategory: 'General', order: 1 },
    { id: 2, key: 'f2', question: 'क्या यह सेवा मुफ्त है?', questionHi: '', answer: 'हाँ, बेसिक सदस्यता पूरी तरह मुफ्त है। आप अपनी प्रोफाइल बना सकते हैं, मैच देख सकते हैं और सीमित संख्या में इंटरेस्ट भेज सकते हैं। अधिक सुविधाओं के लिए प्रीमियम सदस्यता उपलब्ध है।', answerHi: '', faqCategory: 'General', order: 2 },
    { id: 3, key: 'f3', question: 'पंजीकरण कैसे करें?', questionHi: '', answer: 'ऐप डाउनलोड करें, अपने Google खाते से साइन इन करें, अपनी बेसिक जानकारी भरें, फोन नंबर वेरीफाई करें, और अपनी प्रोफाइल पूरी करें!', answerHi: '', faqCategory: 'General', order: 3 },
    { id: 4, key: 'f4', question: 'प्रीमियम सदस्यता के क्या फायदे हैं?', questionHi: '', answer: 'असीमित मैच रिक्वेस्ट, डायरेक्ट मैसेजिंग, प्रोफाइल विजिटर्स देखें, असीमित शॉर्टलिस्ट, और प्राथमिकता सपोर्ट।', answerHi: '', faqCategory: 'Premium & Payments', order: 4 },
    { id: 5, key: 'f5', question: 'मेरी जानकारी कितनी सुरक्षित है?', questionHi: '', answer: 'आपकी सुरक्षा हमारी प्राथमिकता है। हम आपके डेटा को एन्क्रिप्टेड सर्वर पर सुरक्षित रखते हैं। आपकी व्यक्तिगत जानकारी केवल आपकी अनुमति से ही साझा होती है।', answerHi: '', faqCategory: 'Privacy & Security', order: 5 },
    { id: 6, key: 'f6', question: 'प्रोफाइल कैसे डिलीट करें?', questionHi: '', answer: 'ऐप में Settings में जाएं और "Delete Account" ऑप्शन चुनें। एक बार अकाउंट डिलीट होने पर, आपकी सभी जानकारी स्थायी रूप से हटा दी जाएगी।', answerHi: '', faqCategory: 'General', order: 6 },
];

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const res = await fetch(`${API_BASE}/faq`);
                const data = await res.json();
                if (data.success && data.data?.faqs?.length > 0) {
                    setFaqs(data.data.faqs);
                } else {
                    setFaqs(FALLBACK_FAQS);
                }
            } catch {
                setFaqs(FALLBACK_FAQS);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    // Filter by search
    const filteredFaqs = search.trim()
        ? faqs.filter(f =>
            f.question.toLowerCase().includes(search.toLowerCase()) ||
            f.answer.toLowerCase().includes(search.toLowerCase()) ||
            f.questionHi?.toLowerCase().includes(search.toLowerCase())
        )
        : faqs;

    // Group by category
    const grouped: Record<string, FAQ[]> = {};
    for (const faq of filteredFaqs) {
        const cat = faq.faqCategory || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(faq);
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                            सामान्य प्रश्न
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Frequently Asked Questions (FAQ)
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
                            छत्तीसगढ़ शादी के बारे में अक्सर पूछे जाने वाले प्रश्नों के उत्तर
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-md mx-auto mt-8 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search questions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredFaqs.length === 0 ? (
                            <div className="text-center py-20">
                                <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-lg text-muted-foreground">
                                    {search ? 'No questions match your search.' : 'No FAQs available yet.'}
                                </p>
                            </div>
                        ) : (
                            Object.entries(grouped).map(([category, items]) => {
                                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['General']!;
                                return (
                                    <div key={category} className="mb-10">
                                        {/* Category Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                                                <span className={config.color}>{config.icon}</span>
                                            </div>
                                            <h2 className="text-xl font-bold">{category}</h2>
                                            <Badge variant="secondary" className="ml-auto">
                                                {items.length}
                                            </Badge>
                                        </div>

                                        <Accordion type="single" collapsible className="space-y-3">
                                            {items.map((faq, index) => (
                                                <Card key={faq.id} className="p-1 transition-shadow hover:shadow-md">
                                                    <AccordionItem value={`faq-${faq.id}`} className="border-0">
                                                        <AccordionTrigger className="px-6 hover:no-underline">
                                                            <span className="text-left font-semibold flex items-center gap-3">
                                                                <span className={`text-sm font-bold ${config.color} opacity-60`}>
                                                                    {String(index + 1).padStart(2, '0')}
                                                                </span>
                                                                {faq.question}
                                                            </span>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-6 pb-6 text-muted-foreground whitespace-pre-line">
                                                            {faq.answer}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Card>
                                            ))}
                                        </Accordion>
                                    </div>
                                );
                            })
                        )}

                        {/* Still Have Questions */}
                        <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border">
                            <h2 className="text-2xl font-bold mb-4">अभी भी प्रश्न हैं?</h2>
                            <p className="text-muted-foreground mb-6">
                                हमारी टीम आपकी मदद के लिए तैयार है
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                हमसे संपर्क करें
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
