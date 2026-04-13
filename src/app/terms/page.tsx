import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "नियम एवं शर्तें | Terms & Conditions",
    description: "ChhattisgarhShadi.com के नियम एवं शर्तें - सेवा का उपयोग करने से पहले कृपया ध्यान से पढ़ें।",
};

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                            नियम एवं शर्तें
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Terms & Conditions
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            अंतिम अपडेट: 2025
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <p className="text-sm text-amber-900 dark:text-amber-200">
                                ChhattisgarhShadi.com (&quot;हम&quot;, &quot;हमारा प्लेटफ़ॉर्म&quot;) का उपयोग करने पर आप नीचे दी गई सभी शर्तों का पालन करने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, कृपया वेबसाइट/ऐप का उपयोग न करें।
                            </p>
                        </div>

                        <div className="prose prose-lg max-w-none space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>1. सेवा का उद्देश्य</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>ChhattisgarhShadi.com एक ऑनलाइन मैट्रिमोनियल प्लेटफ़ॉर्म है जिसका उद्देश्य योग्य व्यक्तियों को जीवनसाथी खोजने में सहायता करना है। हम किसी भी प्रकार की शादी की गारंटी नहीं देते।</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>2. अकाउंट बनाना</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>उपयोगकर्ता को अपना अकाउंट बनाने के लिए सही, पूर्ण और वास्तविक जानकारी देनी होगी।</li>
                                        <li>प्रोफ़ाइल में गलत जानकारी देना, किसी और की पहचान का उपयोग करना कानूनन अपराध है।</li>
                                        <li>एक व्यक्ति केवल एक ही अकाउंट बना सकता है।</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>3. प्रोफाइल व कंटेंट</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>आप द्वारा डाली गई सभी जानकारी, फ़ोटो और डॉक्यूमेंट आपकी जिम्मेदारी पर होंगे।</li>
                                        <li>आप यह सुनिश्चित करते हैं कि आपका कंटेंट किसी की भावनाओं को ठेस नहीं पहुंचाएगा और किसी भी कानून का उल्लंघन नहीं करेगा।</li>
                                        <li>अश्लील, आक्रामक, हिंसक या गलत जानकारी वाली प्रोफ़ाइल को बिना सूचना हटाया जा सकता है।</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>4. सदस्यता/प्लान</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>यदि आप कोई प्रीमियम प्लान खरीदते हैं, तो प्लान की फीस नॉन-रिफंडेबल है (जब तक कि वेबसाइट पर अलग से उल्लेख न हो)।</li>
                                        <li>सेवा की सुविधाएँ समय–समय पर बदली जा सकती हैं।</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>5. अन्य उपयोगकर्ताओं से संपर्क</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>उपयोगकर्ता स्वयं अपने विवेक से किसी भी व्यक्ति से संपर्क करता है।</li>
                                        <li>किसी प्रकार की वित्तीय लेनदेन, धोखाधड़ी या विवाद में ChhattisgarhShadi.com जिम्मेदार नहीं होगा।</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>6. प्रतिबंध</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold">प्लेटफ़ॉर्म पर निम्न कार्य सख्त वर्जित हैं:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>किसी भी प्रकार का स्पैम, विज्ञापन या गैर–संबंधित संदेश भेजना</li>
                                        <li>किसी व्यक्ति को परेशान करना, धमकी देना या अनैतिक व्यवहार</li>
                                        <li>प्लेटफ़ॉर्म का विवाह से अलग किसी अन्य उद्देश्य के लिए उपयोग</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>7. अकाउंट समाप्ति</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>हम किसी भी उपयोगकर्ता का अकाउंट निम्न कारणों से समाप्त कर सकते हैं:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>गलत जानकारी देना</li>
                                        <li>नियमों का उल्लंघन</li>
                                        <li>कोई अवैध गतिविधि</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>8. दायित्व सीमा (Limitation of Liability)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>ChhattisgarhShadi.com किसी भी तरह की शादी, संबंध, मुलाकात या वित्तीय लेनदेन की गारंटी नहीं देता।</p>
                                    <p className="font-semibold">सभी निर्णय उपयोगकर्ता की अपनी जिम्मेदारी पर होते हैं।</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>9. बाल सुरक्षा और CSAE नीति (Child Safety & CSAE Policy)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg mb-6">
                                        <p className="font-bold text-lg mb-2 underline">English Version (Mandatory for Google Play Compliance)</p>
                                        <p className="font-semibold italic mb-1">App Name: ChhattisgarhShadi.Com</p>
                                        <p className="font-semibold italic mb-3">Developer: Appnity Softwares Private Limited</p>
                                        
                                        <p className="mb-2 font-bold text-red-600">Strict Zero-Tolerance Policy for Child Sexual Abuse and Exploitation (CSAE):</p>
                                        <p className="mb-2 text-sm text-foreground">ChhattisgarhShadi.Com strictly prohibits any behavior, content, or activity that facilitates the exploitation or abuse of children. We have a Zero-Tolerance policy for the following:</p>
                                        <ul className="mb-4 text-sm list-disc pl-5 space-y-1">
                                            <li><strong>Inappropriate interaction targeted at a child:</strong> solicitation, physical contact, or caressing.</li>
                                            <li><strong>Child grooming:</strong> befriending a child online to facilitate sexual contact or exchanging imagery.</li>
                                            <li><strong>Sexualization of a minor:</strong> imagery that depicts, encourages, or promotes sexual exploitation.</li>
                                            <li><strong>Sextortion:</strong> threatening or blackmailing children using intimate images or access reports.</li>
                                            <li><strong>Trafficking:</strong> advertising, solicitation, or facilitation of commercial sexual exploitation of children.</li>
                                            <li><strong>CSAM:</strong> Creation, sharing, or distribution of Child Sexual Abuse Material.</li>
                                        </ul>
                                        <p className="mb-2 text-sm">Our platform is strictly for matrimonial services for adults (18+). Minors are strictly prohibited from using this service.</p>
                                        <p className="mb-2 text-sm">Any user found violating child safety standards will face immediate account termination and permanent ban. We will report all confirmed CSAM and related incidents to Law Enforcement Agencies (LEA) and the National Center for Missing & Exploited Children (NCMEC).</p>
                                        <p className="mb-2 text-sm"><strong>In-App Reporting:</strong> Users can report concerns directly in the app. All reports are addressed immediately.</p>
                                        <p className="mb-2 text-sm"><strong>Safety Contact:</strong> For child safety-specific notifications, contact our point of contact at: <a href="mailto:chhattisgarhshadi@gmail.com" className="text-primary font-bold hover:underline">chhattisgarhshadi@gmail.com</a>.</p>
                                    </div>
                                    <hr className="my-4" />
                                    <p className="font-semibold text-muted-foreground italic underline">हिंदी संस्करण (Hindi Translation):</p>
                                    <p className="font-semibold">App Name: ChhattisgarhShadi.Com</p>
                                    <p className="font-semibold">Developer: Appnity Softwares Private Limited</p>
                                    <p>छत्तीसगढ़ शादी के उपयोग के लिए आपकी आयु 18 वर्ष या उससे अधिक होनी चाहिए। हम बाल यौन शोषण और दुर्व्यवहार (Child Sexual Abuse and Exploitation - CSAE) के खिलाफ जीरो-टॉलरेंस नीति रखते हैं।</p>
                                    <p>CSAE या बाल सुरक्षा से संबंधित किसी भी प्रावधान का उल्लंघन करने वाले किसी भी खाते को तुरंत समाप्त कर दिया जाएगा और उचित कानूनी एजेंसियों (Law Enforcement) को रिपोर्ट किया जाएगा।</p>
                                    <p>यदि आपको बच्चों की सुरक्षा को लेकर कोई संदिग्ध गतिविधि दिखाई देती है, तो कृपया ऐप के रिपोर्ट विकल्प का उपयोग करें या तुरंत हमारे बाल सुरक्षा संपर्क बिंदु (Child safety-specific point of contact) <a href="mailto:chhattisgarhshadi@gmail.com" className="text-primary hover:underline">chhattisgarhshadi@gmail.com</a> पर सूचित करें।</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>10. नियमों में बदलाव</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>हम समय–समय पर इन नियमों में बदलाव कर सकते हैं। नवीनतम नियम हमारी वेबसाइट/ऐप पर उपलब्ध होंगे।</p>
                                </CardContent>
                            </Card>

                            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    किसी भी सवाल के लिए संपर्क करें:{" "}
                                    <a href="mailto:Chhattisgarhshadi@gmail.com" className="text-primary hover:underline">
                                        Chhattisgarhshadi@gmail.com
                                    </a>
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
