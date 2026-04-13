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
    Clock,
    Eye,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
    MATCH_REQUEST: Heart,
    MATCH_ACCEPTED: CheckCircle2,
    MATCH_REJECTED: Heart,
    MESSAGE: MessageSquare,
    PROFILE_VIEW: Eye,
    CONTACT_REQUEST: UserPlus,
    PHOTO_REQUEST: Eye,
    SUBSCRIPTION: Zap,
    SYSTEM: Bell,
    VERIFICATION: ShieldCheck,
};

const NOTIFICATION_COLORS: Record<string, string> = {
    MATCH_REQUEST: "text-primary",
    MATCH_ACCEPTED: "text-green-500",
    MATCH_REJECTED: "text-muted-foreground",
    MESSAGE: "text-blue-400",
    PROFILE_VIEW: "text-amber-500",
    CONTACT_REQUEST: "text-violet-400",
    PHOTO_REQUEST: "text-cyan-400",
    SUBSCRIPTION: "text-primary",
    SYSTEM: "text-amber-500",
    VERIFICATION: "text-green-500",
};

function getNotificationLink(notification: Notification): string | null {
    const data = notification.data as Record<string, unknown>;
    if (!data) return null;
    
    switch (notification.type) {
        case 'MATCH_REQUEST':
        case 'MATCH_ACCEPTED':
        case 'PROFILE_VIEW':
        case 'CONTACT_REQUEST':
        case 'PHOTO_REQUEST':
            return data.userId ? `/dashboard/profile/${data.userId}` : null;
        case 'MESSAGE':
            return data.senderId ? `/dashboard/chat` : null;
        case 'SUBSCRIPTION':
            return '/dashboard/membership';
        default:
            return null;
    }
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
    const { 
        notifications, 
        unreadCount,
        isLoading, 
        markAsRead, 
        markAllRead, 
        deleteAll 
    } = useNotifications();

    const handleMarkAllRead = () => {
        markAllRead.mutate();
    };

    const handleDeleteAll = () => {
        if (window.confirm("Delete all notifications? This action cannot be undone.")) {
            deleteAll.mutate();
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead.mutate(notification.id);
        }
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
                    {unreadCount > 0 && (
                        <Badge className="bg-primary/20 text-primary border-primary/20 font-black px-3 py-1">
                            {unreadCount} Unread
                        </Badge>
                    )}
                    <Button 
                        variant="ghost" 
                        onClick={handleMarkAllRead}
                        disabled={markAllRead.isPending || unreadCount === 0}
                        className="h-12 px-6 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                        {markAllRead.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Mark all as read
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleDeleteAll}
                        disabled={deleteAll.isPending || notifications.length === 0}
                        className="h-12 w-12 rounded-xl bg-card border-white/5 p-0 hover:bg-white/5 active:scale-95 transition-all text-red-400 border-red-500/10"
                    >
                        {deleteAll.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-card/20 rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            )}

            {/* Notification List */}
            {!isLoading && notifications.length > 0 && (
                <div className="space-y-4">
                    {notifications.map((notification: Notification, i: number) => {
                        const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                        const iconColor = NOTIFICATION_COLORS[notification.type] || "text-amber-500";
                        const link = getNotificationLink(notification);
                        
                        const content = (
                            <Card 
                                className={`relative overflow-hidden transition-all duration-300 rounded-[2rem] border-white/5 cursor-pointer ${notification.isRead ? 'bg-card/20 opacity-80' : 'bg-card/50 ring-1 ring-primary/20 shadow-xl shadow-primary/5'}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {!notification.isRead && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                )}
                                
                                <CardContent className="p-6 md:p-8 flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center relative shrink-0`}>
                                        <IconComponent className={`w-6 h-6 ${iconColor}`} />
                                        {!notification.isRead && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-sm uppercase tracking-widest text-foreground group-hover:text-primary transition-colors truncate">
                                                {notification.title || notification.type?.replace(/_/g, ' ')}
                                            </h4>
                                            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest shrink-0 ml-4">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed truncate">
                                            {notification.message || notification.body}
                                        </p>
                                    </div>

                                    {link && (
                                        <Button variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-95 shrink-0">
                                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );

                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group"
                            >
                                {link ? (
                                    <Link href={link}>{content}</Link>
                                ) : (
                                    content
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-32 h-32 bg-card/40 rounded-full flex items-center justify-center">
                        <Bell className="w-16 h-16 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black text-xl uppercase tracking-widest text-foreground">All Caught Up!</h3>
                        <p className="text-muted-foreground font-medium">We&apos;ll notify you when someone shows interest in your profile.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
