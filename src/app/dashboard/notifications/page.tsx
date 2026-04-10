"use client";

import { motion } from "framer-motion";
import { 
    Bell, 
    Heart, 
    MessageSquare, 
    UserPlus, 
    Zap, 
    Trash2,
    CheckCircle2,
    ArrowRight,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: "interest",
        from: "Sneha Patel",
        message: "sent you a 🧡 interest request.",
        time: "10 mins ago",
        read: false,
        icon: Heart,
        iconColor: "text-primary"
    },
    {
        id: 2,
        type: "view",
        from: "Rahul Sahu",
        message: "viewed your profile 3 times today.",
        time: "2 hours ago",
        read: true,
        icon: Bell,
        iconColor: "text-amber-500"
    },
    {
        id: 3,
        type: "accept",
        from: "Anjali Verma",
        message: "accepted your interest request. You can now chat!",
        time: "5 hours ago",
        read: false,
        icon: CheckCircle2,
        iconColor: "text-green-500"
    },
    {
        id: 4,
        type: "system",
        from: "CG Shaadi team",
        message: "Your profile is 85% complete. Add more photos!",
        time: "1 day ago",
        read: true,
        icon: Zap,
        iconColor: "text-primary"
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...prev, ...n, read: true })));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">Alert <span className="text-primary italic">Center</span></h1>
                    <p className="text-muted-foreground font-light text-lg">Stay updated with your match activity and interests</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={markAllRead}
                        className="h-12 px-6 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                        Mark all as read
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-12 w-12 rounded-xl bg-card border-white/5 p-0 hover:bg-white/5 active:scale-95 transition-all text-red-400 border-red-500/10"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {notifications.map((notification, i) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group"
                    >
                        <Card className={`relative overflow-hidden transition-all duration-300 rounded-[2rem] border-white/5 ${notification.read ? 'bg-card/20 opacity-80' : 'bg-card/50 ring-1 ring-primary/20 shadow-xl shadow-primary/5'}`}>
                            {!notification.read && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                            )}
                            
                            <CardContent className="p-6 md:p-8 flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center relative shrink-0`}>
                                    <notification.icon className={`w-6 h-6 ${notification.iconColor}`} />
                                    {!notification.read && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                                            {notification.from}
                                        </h4>
                                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            {notification.time}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>

                                <Button variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Empty State Illustration would go here if laundry list was empty */}
            {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-32 h-32 bg-card/40 rounded-full flex items-center justify-center">
                        <Bell className="w-16 h-16 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black text-xl uppercase tracking-widest text-foreground">All Caught Up!</h3>
                        <p className="text-muted-foreground font-medium">We'll notify you when someone shows interest in your profile.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
