import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
    title: "रिफंड नीति | Refund Policy",
    description: "ChhattisgarhShadi.com की रिफंड नीति - प्रीमियम सदस्यता और भुगतान से संबंधित जानकारी।",
};

export default function RefundPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-16 bg-background">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                            रिफंड नीति
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Refund Policy
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            अंतिम अपडेट: 2025
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <p className="text-sm text-red-900 dark:text-red-200">
                                <strong>महत्वपूर्ण:</strong> ChhattisgarhShadi.com पर खरीदी गई प्रीमियम सदस्यता सामान्यतः नॉन-रिफंडेबल है। कृपया खरीदने से पहले ध्यान से पढ़ें।
                            </p>
                        </div>

                        <div className="space-y-8 text-foreground leading-relaxed">
                            <Card>
                                <CardHeader>
                                    <CardTitle>1. सामान्य रिफंड नीति</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p>
                                        ChhattisgarhShadi.com पर खरीदी गई सभी प्रीमियम सदस्यता योजनाएं (Plans) <strong>सामान्यतः नॉन-रिफंडेबल</strong> हैं।
                                    </p>
                                    <p>
                                        एक बार भुगतान सफलतापूर्वक हो जाने के बाद, उपयोगकर्ता को तुरंत प्रीमियम सुविधाओं तक पहुंच मिल जाती है, इसलिए रिफंड की सुविधा उपलब्ध नहीं है।
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>2. विशेष परिस्थितियों में रिफंड</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>निम्नलिखित परिस्थितियों में हम रिफंड पर विचार कर सकते हैं:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-4">
                                        <li><strong>तकनीकी त्रुटि:</strong> यदि भुगतान सफल हो गया लेकिन प्रीमियम सुविधाएं सक्रिय नहीं हुईं</li>
                                        <li><strong>डुप्लीकेट भुगतान:</strong> यदि गलती से एक ही प्लान के लिए दो बार भुगतान हो गया</li>
                                        <li><strong>सेवा विफलता:</strong> यदि हमारे प्लेटफ़ॉर्म में गंभीर तकनीकी समस्या के कारण सेवा प्रदान नहीं की जा सकी</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>3. रिफंड अनुरोध कैसे करें</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>यदि आपको लगता है कि आप रिफंड के पात्र हैं, तो कृपया निम्नलिखित जानकारी के साथ हमसे संपर्क करें:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-4">
                                        <li>आपका पंजीकृत ईमेल पता / मोबाइल नंबर</li>
                                        <li>भुगतान की तारीख और राशि</li>
                                        <li>Transaction ID / Order ID</li>
                                        <li>समस्या का विवरण</li>
                                    </ul>
                                    <div className="mt-4 p-4 bg-muted rounded-lg">
                                        <p className="font-semibold">संपर्क करें:</p>
                                        <p className="text-sm mt-2">
                                            ईमेल:{" "}
                                            <a href="mailto:Chhattisgarhshadi@gmail.com" className="text-primary hover:underline">
                                                Chhattisgarhshadi@gmail.com
                                            </a>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>4. रिफंड प्रक्रिया का समय</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>यदि आपका रिफंड अनुरोध स्वीकृत हो जाता है:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-4">
                                        <li>रिफंड प्रक्रिया शुरू होने में <strong>3-5 कार्य दिवस</strong> लग सकते हैं</li>
                                        <li>रिफंड राशि आपके बैंक खाते/कार्ड में <strong>7-10 कार्य दिवस</strong> में वापस आ जाएगी</li>
                                        <li>कुछ मामलों में बैंक के नियमों के अनुसार अधिक समय लग सकता है</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>5. रिफंड के पात्र नहीं</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>निम्नलिखित परिस्थितियों में रिफंड नहीं दिया जाएगा:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-4">
                                        <li>यदि आपने सेवा का उपयोग शुरू कर दिया है (मैच रिक्वेस्ट भेजी, मैसेज किए, आदि)</li>
                                        <li>सदस्यता अवधि समाप्त होने के बाद</li>
                                        <li>यदि आपका अकाउंट नियमों के उल्लंघन के कारण बंद किया गया है</li>
                                        <li>व्यक्तिगत कारणों से (जैसे: मन बदलना, शादी हो जाना, आदि)</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>6. स्वचालित नवीनीकरण</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        वर्तमान में हमारे पास स्वचालित नवीनीकरण (Auto-renewal) की सुविधा नहीं है।
                                        सदस्यता समाप्त होने के बाद आपको मैन्युअल रूप से नवीनीकरण करना होगा।
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>7. संपर्क सहायता</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        यदि आपके पास रिफंड या भुगतान से संबंधित कोई प्रश्न है,
                                        कृपया हमारी सहायता टीम से संपर्क करें। हम आपकी सहायता के लिए तत्पर हैं।
                                    </p>
                                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                                        <p className="text-sm font-semibold">ग्राहक सहायता उपलब्ध:</p>
                                        <p className="text-sm mt-1">सोमवार - शनिवार: 10:00 AM - 6:00 PM IST</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>नोट:</strong> ChhattisgarhShadi.com को किसी भी समय इस रिफंड नीति में बदलाव करने का अधिकार है।
                                    नवीनतम नीति हमेशा इस पेज पर उपलब्ध रहेगी।
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
