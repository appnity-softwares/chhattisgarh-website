import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "सामान्य प्रश्न | FAQ",
    description: "ChhattisgarhShadi.com के बारे में अक्सर पूछे जाने वाले प्रश्नों के उत्तर - पंजीकरण, सदस्यता, सुरक्षा और अधिक।",
};

export default function FAQPage() {
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
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Accordion type="single" collapsible className="space-y-4">
                            {/* General Questions */}
                            <Card className="p-1">
                                <AccordionItem value="item-1" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            1. ChhattisgarhShadi.com क्या है?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        ChhattisgarhShadi.com छत्तीसगढ़ का सबसे भरोसेमंद ऑनलाइन मैट्रिमोनियल प्लेटफ़ॉर्म है।
                                        हम छत्तीसगढ़ और आसपास के क्षेत्रों के लोगों को अपना सही जीवनसाथी खोजने में मदद करते हैं।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-2" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            2. क्या यह सेवा मुफ्त है?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        हाँ, बेसिक सदस्यता पूरी तरह मुफ्त है। आप अपनी प्रोफाइल बना सकते हैं, मैच देख सकते हैं और
                                        सीमित संख्या में इंटरेस्ट भेज सकते हैं। अधिक सुविधाओं के लिए प्रीमियम सदस्यता उपलब्ध है।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-3" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            3. पंजीकरण कैसे करें?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        <ol className="list-decimal pl-6 space-y-2">
                                            <li>हमारी वेबसाइट या ऐप पर जाएं</li>
                                            <li>अपने Google खाते से साइन इन करें</li>
                                            <li>अपनी बेसिक जानकारी भरें</li>
                                            <li>फोन नंबर वेरीफाई करें</li>
                                            <li>अपनी प्रोफाइल पूरी करें और मैच खोजना शुरू करें!</li>
                                        </ol>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            {/* Premium Membership */}
                            <Card className="p-1">
                                <AccordionItem value="item-4" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            4. प्रीमियम सदस्यता के क्या फायदे हैं?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        <p className="mb-2">प्रीमियम सदस्यता से आपको मिलता है:</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>असीमित मैच रिक्वेस्ट भेजें</li>
                                            <li>डायरेक्ट मैसेजिंग की सुविधा</li>
                                            <li>प्रोफाइल विजिटर्स देखें</li>
                                            <li>असीमित शॉर्टलिस्ट</li>
                                            <li>प्राथमिकता सपोर्ट</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-5" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            5. प्रीमियम प्लान की कीमत क्या है?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        हमारे पास अलग-अलग प्लान उपलब्ध हैं। वर्तमान कीमत और ऑफर देखने के लिए ऐप में
                                        प्रीमियम सेक्शन देखें या हमसे संपर्क करें।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            {/* Safety & Privacy */}
                            <Card className="p-1">
                                <AccordionItem value="item-6" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            6. मेरी जानकारी कितनी सुरक्षित है?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        आपकी सुरक्षा हमारी प्राथमिकता है। हम आपके डेटा को एन्क्रिप्टेड सर्वर पर सुरक्षित रखते हैं।
                                        आपकी व्यक्तिगत जानकारी (जैसे फोन नंबर, पता) केवल आपकी अनुमति से ही साझा होती है।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-7" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            7. प्रोफाइल वेरीफिकेशन कैसे होता है?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        हम सभी प्रोफाइल की समीक्षा करते हैं। आप अपने डॉक्यूमेंट (आधार कार्ड, पैन कार्ड)
                                        अपलोड करके अपनी प्रोफाइल को वेरीफाई करा सकते हैं। वेरीफाइड प्रोफाइल को विशेष बैज मिलता है।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            {/* Matching & Communication */}
                            <Card className="p-1">
                                <AccordionItem value="item-8" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            8. मैच कैसे खोजें?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        हमारा ऐप आपकी पसंद के आधार पर स्वचालित रूप से मैच सुझाता है। आप फिल्टर का उपयोग करके
                                        उम्र, धर्म, जाति, शिक्षा, व्यवसाय आदि के आधार पर भी खोज सकते हैं।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-9" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            9. मैसेजिंग कैसे करें?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        जब दोनों यूजर एक-दूसरे को इंटरेस्ट भेजते हैं और स्वीकार करते हैं, तो वे डायरेक्ट मैसेज कर सकते हैं।
                                        प्रीमियम यूजर को मैसेजिंग की अधिक सुविधाएं मिलती हैं।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            {/* Technical Support */}
                            <Card className="p-1">
                                <AccordionItem value="item-10" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            10. अगर कोई समस्या हो तो क्या करें?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        <p className="mb-2">आप हमसे निम्न माध्यमों से संपर्क कर सकते हैं:</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>ईमेल: <a href="mailto:Chhattisgarhshadi@gmail.com" className="text-primary hover:underline">Chhattisgarhshadi@gmail.com</a></li>
                                            <li>समय: सोमवार - शनिवार, 10:00 AM - 6:00 PM</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-11" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            11. प्रोफाइल कैसे डिलीट करें?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        ऐप में Settings में जाएं और "Delete Account" ऑप्शन चुनें। एक बार अकाउंट डिलीट होने पर,
                                        आपकी सभी जानकारी स्थायी रूप से हटा दी जाएगी।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            <Card className="p-1">
                                <AccordionItem value="item-12" className="border-0">
                                    <AccordionTrigger className="px-6 hover:no-underline">
                                        <span className="text-left font-semibold">
                                            12. क्या मैं वेबसाइट और ऐप दोनों का उपयोग कर सकता हूं?
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                                        हाँ! आप वेबसाइट पर अपने स्टेट्स देख सकते हैं, लेकिन पूर्ण सुविधाओं के लिए मोबाइल ऐप का उपयोग
                                        करें।
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        </Accordion>

                        {/* Still Have Questions */}
                        <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
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
