import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "गोपनीयता नीति | Privacy Policy",
    description: "ChhattisgarhShadi.com की गोपनीयता नीति - जानिए हम आपकी जानकारी कैसे एकत्रित करते हैं, उपयोग करते हैं और सुरक्षित रखते हैं।",
};

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                            गोपनीयता नीति
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Privacy Policy
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            अंतिम अपडेट: 2025
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-lg text-muted-foreground mb-8">
                                हमारी गोपनीयता नीति का उद्देश्य यह समझाना है कि हम आपकी जानकारी कैसे एकत्रित करते हैं, उपयोग करते हैं और सुरक्षित रखते हैं।
                            </p>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>1. एकत्र की जाने वाली जानकारी</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>जब आप अकाउंट बनाते हैं, हम निम्न जानकारी एकत्र करते हैं:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>नाम, पता, लिंग, जन्म तिथि</li>
                                        <li>ईमेल, मोबाइल नंबर</li>
                                        <li>प्रोफ़ाइल फ़ोटो, बायो, धार्मिक/सामाजिक जानकारी</li>
                                        <li>लोकेशन डेटा (यदि अनुमति दी गई हो)</li>
                                        <li>लॉग डेटा (IP address, device info)</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>2. जानकारी का उपयोग</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>हम आपकी जानकारी निम्न कार्यों के लिए उपयोग करते हैं:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>आपकी प्रोफ़ाइल बनाना और दिखाना</li>
                                        <li>मैचिंग सुझाव देना</li>
                                        <li>ग्राहक सहायता</li>
                                        <li>सुरक्षा उद्देश्यों के लिए</li>
                                        <li>हमारी सेवा को बेहतर बनाने के लिए</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>3. जानकारी की साझेदारी</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold">हम आपकी जानकारी किसी तीसरे पक्ष को कभी नहीं बेचते।</p>
                                    <p>हम निम्न परिस्थितियों में जानकारी साझा कर सकते हैं:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>कानूनी आदेश / सरकारी जांच</li>
                                        <li>सेवा प्रदाता (जैसे SMS, ईमेल कंपनी)</li>
                                        <li>सुरक्षा या धोखाधड़ी रोकने के लिए आवश्यक हो</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>4. डेटा सुरक्षा</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>हम आपके डेटा की सुरक्षा के लिए एन्क्रिप्शन, सुरक्षित सर्वर और अन्य सुरक्षा मानकों का उपयोग करते हैं।</p>
                                    <p className="mt-2 text-sm text-muted-foreground">लेकिन इंटरनेट पर 100% सुरक्षा की गारंटी कोई नहीं दे सकता।</p>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>5. उपयोगकर्ता अधिकार</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>आपको निम्न अधिकार प्राप्त हैं:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>अपनी जानकारी देखना</li>
                                        <li>जानकारी में संशोधन करना</li>
                                        <li>प्रोफ़ाइल डिलीट करवाना</li>
                                        <li>हमारी सर्विस का उपयोग बंद करना</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>6. कुकीज़ (Cookies)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>हम वेबसाइट/ऐप अनुभव बेहतर करने के लिए कुकीज़ का उपयोग करते हैं।</p>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>7. बच्चों की गोपनीयता</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold">18 वर्ष से कम उम्र के लोगों को यह प्लेटफ़ॉर्म उपयोग करने की अनुमति नहीं है।</p>
                                </CardContent>
                            </Card>

                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>8. गोपनीयता नीति में परिवर्तन</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>हम समय-समय पर इस नीति में बदलाव कर सकते हैं। नया वर्ज़न वेबसाइट पर उपलब्ध होगा।</p>
                                </CardContent>
                            </Card>

                            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    यदि आपके कोई प्रश्न हैं, कृपया हमसे संपर्क करें:{" "}
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
