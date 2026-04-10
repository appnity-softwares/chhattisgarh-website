"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Users,
    Heart,
    MessageSquare,
    Sparkles,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    CreditCard,
    ShieldCheck,
    HelpCircle
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDashboardStats } from "@/hooks/use-dashboard-stats";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const sidebarLinks = [
    { href: "/dashboard", label: "Discovery", icon: Sparkles },
    { href: "/dashboard/matches", label: "My Matches", icon: Users },
    { href: "/dashboard/shortlist", label: "Shortlisted", icon: Heart },
    { href: "/dashboard/chat", label: "Messages", icon: MessageSquare, badge: "unreadMessages" },
    { href: "/dashboard/membership", label: "Membership", icon: CreditCard },
];

const secondaryLinks = [
    { href: "/dashboard/profile", label: "Edit Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

import { useProfile } from "@/hooks/use-profile";
import { useUserAuthStore } from "@/stores/user-auth-store";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter(); // Added router for logout redirection
    const userStore = useUserAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { unreadMessages } = useDashboardStats();
    const { data: user } = useProfile();

    const userName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "User";
    const userRole = user?.subscription?.planName ? `${user.subscription.planName} Member` : "Free Member";
    const userAvatar = user?.profile?.media?.[0]?.url || "";

    const daysLeft = user?.subscription?.endDate ?
        Math.max(0, Math.ceil((new Date(user.subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-[#0a0a0a]" />;
    }

    const hasUnreadNotifications = unreadMessages > 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground flex overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] opacity-10" />
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-72 h-screen flex-col border-r border-white/5 bg-card/10 backdrop-blur-xl relative z-20 overflow-hidden sticky top-0">
                <div className="p-8">
                    <Logo />
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar no-scrollbar">
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 opacity-50">Discovery</p>
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        const hasBadge = link.badge === "unreadMessages" && unreadMessages > 0;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-primary group-hover:scale-110 transition-transform'}`} />
                                <span className="font-bold text-sm tracking-tight">{link.label}</span>
                                {hasBadge && !active && (
                                    <span className="ml-auto bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-primary/30">
                                        {unreadMessages}
                                    </span>
                                )}
                                {active && (
                                    <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </Link>
                        );
                    })}

                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-8 mb-3 opacity-50">Account</p>
                    {secondaryLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                            >
                                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="font-bold text-sm tracking-tight">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="bg-gradient-to-br from-rose-500/10 to-primary/10 border border-primary/20 rounded-3xl p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-bl-full -mr-4 -mt-4 blur-xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-xs font-black text-white mb-0.5">{user?.subscription?.planName || "Get Premium"}</h4>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-2">
                            {user?.subscription ? `Expires in ${daysLeft} days` : "Unlock full features"}
                        </p>
                        <Link href="/dashboard/membership">
                            <Button size="sm" className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 text-[9px] font-black rounded-xl h-7">
                                {user?.subscription ? "EXTEND PLAN" : "UPGRADE NOW"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-background/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden hover:bg-white/5 rounded-xl"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <div className="hidden sm:block">
                            <h2 className="text-xl font-black tracking-tight uppercase text-foreground">Matches <span className="text-primary italic">Dashboard</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/notifications">
                            <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 relative group h-10 w-10">
                                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                {hasUnreadNotifications && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#0a0a0a]" />
                                )}
                            </Button>
                        </Link>

                        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

                        <div className="flex items-center gap-3 pl-2">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-black text-foreground">{userName}</p>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{userRole}</p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="outline-none focus:ring-0">
                                        <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer">
                                            <AvatarImage src={userAvatar} loading="eager" />
                                            <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-card/90 backdrop-blur-xl border-white/10 rounded-2xl p-2 shadow-3xl">
                                    <DropdownMenuLabel className="px-4 py-3">
                                        <p className="font-black text-sm text-foreground">{userName}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{user?.email || user?.phone}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 text-muted-foreground hover:text-foreground">
                                            <User className="w-4 h-4" />
                                            <span className="font-bold text-sm">Edit Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 text-muted-foreground hover:text-foreground">
                                            <Settings className="w-4 h-4" />
                                            <span className="font-bold text-sm">Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            userStore.logout();
                                            router.push('/login');
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-400 group"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        <span className="font-bold text-sm">Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 pb-28 lg:pb-10 scroll-smooth custom-scrollbar">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
                <nav className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl h-18 flex items-center justify-around px-2 shadow-2xl shadow-primary/20">
                    {[
                        { href: "/dashboard", icon: Sparkles, label: "Feed" },
                        { href: "/dashboard/matches", icon: Users, label: "Matches" },
                        { href: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
                        { href: "/dashboard/activity", icon: Bell, label: "Visits" },
                        { href: "/dashboard/profile", icon: User, label: "Me" },
                    ].map((tab) => {
                        const active = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className="flex flex-col items-center justify-center gap-1 group relative w-12"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute -top-3 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(224,30,90,0.8)]"
                                    />
                                )}
                                <tab.icon className={`w-5 h-5 transition-all ${active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-muted-foreground'}`}>{tab.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
                    >
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="w-72 h-full bg-card border-r border-white/10 p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <Logo />
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <nav className="flex-1 space-y-2 overflow-y-auto">
                                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Discovery</p>
                                {sidebarLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
                                    >
                                        <link.icon className={`w-5 h-5 ${pathname === link.href ? 'text-white' : 'text-primary'}`} />
                                        <span className="font-bold text-sm">{link.label}</span>
                                    </Link>
                                ))}

                                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-8 mb-4">Support & Care</p>
                                <Link
                                    href="/help"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-muted-foreground hover:bg-white/5"
                                >
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                    <span className="font-bold text-sm">Help & Safety</span>
                                </Link>
                                <Link
                                    href="/help"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-muted-foreground hover:bg-white/5"
                                >
                                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-bold text-sm">FAQs</span>
                                </Link>
                            </nav>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
