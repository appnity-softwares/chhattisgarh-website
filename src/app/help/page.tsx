"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    HelpCircle, 
    MessageCircle, 
    Mail, 
    Phone, 
    ChevronDown, 
    ChevronUp,
    ShieldCheck,
    Zap,
    Search as SearchIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";

const FAQ_DATA = [
    {
        category: "Account & Profile",
        icon: HelpCircle,
        items: [
            { q: "How do I create my profile?", a: "After signing up with your phone number, you'll be guided through a step-by-step profile creation. Fill in your personal details, family information, and partner preferences." },
            { q: "How do I edit my profile?", a: "Go to your Dashboard, click on 'Edit Profile' from the sidebar. You can update your bio, career, and photos anytime." }
        ]
    },
    {
        category: "Privacy & Security",
        icon: ShieldCheck,
        items: [
            { q: "Is my contact number private?", a: "Yes! Your phone number is never shown publicly. It's only visible to premium members whose interest you have accepted." },
            { q: "Can I block someone?", a: "Absolutely. On any profile, click the three-dot menu and select 'Block'. Blocked users cannot see you or contact you." }
        ]
    },
    {
        category: "Subscription & Premium",
        icon: Zap,
        items: [
            { q: "What are the benefits of Premium?", a: "Premium members can view contact details, see who viewed them, and get priority in discovery results." }
        ]
    }
];

export default function HelpPage() {
    const [openItem, setOpenItem] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="container mx-auto px-4 py-20 lg:py-32">
                {/* Hero */}
                <div className="flex flex-col items-center text-center space-y-6 mb-20">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary/10 p-4 rounded-3xl"
                    >
                        <HelpCircle className="w-12 h-12 text-primary" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                        How can we <span className="text-primary italic">Help?</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl font-medium">
                        Search our knowledge base or get in touch with our support team in Chhattisgarh.
                    </p>
                    <div className="relative w-full max-w-xl group">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Describe your issue..." 
                            className="h-16 pl-16 pr-6 bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2rem] text-lg font-bold shadow-2xl shadow-primary/5"
                        />
                    </div>
                </div>

                {/* Quick Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <Card className="bg-green-500/5 border-green-500/10 rounded-[2.5rem] group hover:bg-green-500/10 transition-all p-8 text-center space-y-4">
                        <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-widest text-foreground">WhatsApp Support</h3>
                        <p className="text-sm text-muted-foreground font-medium">Instant help from our team</p>
                        <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl">CHAT NOW</Button>
                    </Card>

                    <Card className="bg-primary/5 border-primary/10 rounded-[2.5rem] group hover:bg-primary/10 transition-all p-8 text-center space-y-4">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Mail className="w-7 h-7" />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-widest text-foreground">Email Us</h3>
                        <p className="text-sm text-muted-foreground font-medium">Resolution within 24 hours</p>
                        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl">SEND EMAIL</Button>
                    </Card>

                    <Card className="bg-blue-500/5 border-blue-500/10 rounded-[2.5rem] group hover:bg-blue-500/10 transition-all p-8 text-center space-y-4">
                        <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Phone className="w-7 h-7" />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-widest text-foreground">Call Us</h3>
                        <p className="text-sm text-muted-foreground font-medium">10 AM - 7 PM, Mon-Sat</p>
                        <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl">CALL HELP</Button>
                    </Card>
                </div>

                {/* FAQ Content */}
                <div className="max-w-4xl mx-auto space-y-12 pb-32">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-center">Frequently Asked <span className="text-primary italic">Questions</span></h2>
                    
                    <div className="space-y-6">
                        {FAQ_DATA.map((cat, catIdx) => (
                            <div key={catIdx} className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <cat.icon className="w-5 h-5 text-primary" />
                                    <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">{cat.category}</h3>
                                </div>
                                <div className="space-y-3">
                                    {cat.items.map((item, itemIdx) => {
                                        const id = `${catIdx}-${itemIdx}`;
                                        const isOpen = openItem === id;
                                        return (
                                            <Card key={id} className={`bg-card/30 border-white/5 rounded-2xl overflow-hidden transition-all ${isOpen ? 'ring-1 ring-primary/20 shadow-xl' : 'hover:bg-card/50'}`}>
                                                <button 
                                                    onClick={() => setOpenItem(isOpen ? null : id)}
                                                    className="w-full flex items-center justify-between p-6 text-left"
                                                >
                                                    <span className="font-bold text-foreground">{item.q}</span>
                                                    {isOpen ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="px-6 pb-6"
                                                        >
                                                            <div className="h-px bg-white/5 mb-4" />
                                                            <p className="text-muted-foreground font-medium leading-relaxed">{item.a}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
