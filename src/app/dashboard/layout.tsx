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
    Ban,
    CreditCard,
    Crown,
    HelpCircle,
    Star,
    Zap
} from "lucide-react";
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
import { useProfile } from "@/hooks/use-profile";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useUserAccess } from "@/hooks/use-user-access";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const userStore = useUserAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { unreadMessages } = useDashboardStats();
    const { data: user } = useProfile();
    const { data: access } = useUserAccess();

    const userName = user?.profile ? `${(user.profile as any).firstName} ${(user.profile as any).lastName}` : "User";
    const userRole = access?.isPremium ? "Premium Member" : "Free Member";
    const userAvatar = (user?.profile as any)?.media?.[0]?.url || "";

    const sidebarLinks = [
        { href: "/dashboard", label: "Discovery", icon: Sparkles },
        { href: "/dashboard/matches", label: "My Matches", icon: Users },
        { href: "/dashboard/shortlist", label: "Shortlisted", icon: Heart },
        { href: "/dashboard/chat", label: "Messages", icon: MessageSquare, badge: "unreadMessages" },
        { href: "/dashboard/membership", label: access?.isPremium ? "Premium Benefits" : "Upgrade Plan", icon: CreditCard },
        { href: "/dashboard/boost", label: "Boost Reach", icon: Zap },
    ];

    const secondaryLinks = [
        { href: "/dashboard/profile", label: "Edit Profile", icon: User },
        { href: "/dashboard/stories", label: "Success Stories", icon: Star },
        { href: "/dashboard/blocked", label: "Blocked Users", icon: Ban },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const subscription = user?.subscription as any;
    const daysLeft = subscription?.endDate ?
        Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-[#0a0a0a]" />
    }

    const hasUnreadNotifications = unreadMessages > 0;

    return (
        <div className="h-screen bg-[#0a0a0a] text-foreground flex overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] opacity-10" />
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 h-full flex-col flex-shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl relative z-20 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tighter uppercase leading-none">CG <span className="text-primary italic">SHADI</span></h2>
                            <p className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase mt-1">Matrimony</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto no-scrollbar">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-4">Discovery</p>
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        const hasBadge = link.badge === "unreadMessages" && unreadMessages > 0;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-primary text-white shadow-xl shadow-primary/30 active:scale-95' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-primary/60 group-hover:text-primary transition-colors'}`} />
                                <span className="font-bold tracking-tight text-[13px]">{link.label}</span>
                                {hasBadge && !active && (
                                    <span className="ml-auto bg-primary text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                                        {unreadMessages}
                                    </span>
                                )}
                                {active && (
                                    <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                                )}
                            </Link>
                        );
                    })}

                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mt-10 mb-4">Personal Space</p>
                    {secondaryLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-primary text-white shadow-xl shadow-primary/30 active:scale-95' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                                <span className="font-bold tracking-tight text-[13px]">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer / Premium Status */}
                <div className="p-4 mt-auto">
                    {!access?.isPremium ? (
                        <Link href="/dashboard/membership">
                            <div className="bg-gradient-to-br from-primary to-rose-600 p-5 rounded-[2rem] relative overflow-hidden group cursor-pointer transition-transform active:scale-95">
                                <div className="relative z-10">
                                    <Crown className="w-8 h-8 text-white/50 mb-3" />
                                    <p className="text-white font-black text-xs uppercase tracking-widest leading-none">Go Premium</p>
                                    <p className="text-white/70 text-[10px] mt-2 font-medium">Unlock full access to all profiles today.</p>
                                </div>
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            </div>
                        </Link>
                    ) : (
                        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                    <Crown className="text-black w-4 h-4" />
                                </div>
                                <p className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Premium Active</p>
                            </div>
                            <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">{daysLeft} Days remaining</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#070707] relative">
                {/* Header */}
                <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-black/40 backdrop-blur-xl z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 text-muted-foreground" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </Button>
                        <div className="hidden sm:block">
                            <h2 className="text-base font-black tracking-widest uppercase text-foreground opacity-90">Chhattisgarh <span className="text-primary italic">Shadi</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/notifications">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 relative group h-10 w-10 border border-white/5 transition-all">
                                <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                {hasUnreadNotifications && (
                                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-[#070707]" />
                                )}
                            </Button>
                        </Link>

                        <div className="h-8 w-px bg-white/5 mx-2 hidden sm:block" />

                        <div className="flex items-center gap-3 pl-1">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-black text-foreground leading-none">{userName}</p>
                                <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1.5 opacity-80">{userRole}</p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="outline-none focus:ring-0">
                                        <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer shadow-lg">
                                            <AvatarImage src={userAvatar} loading="eager" />
                                            <AvatarFallback className="text-[11px] font-black bg-primary/10 text-primary uppercase">{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-[#111] backdrop-blur-2xl border-white/10 rounded-2xl p-2 shadow-4xl">
                                    <DropdownMenuLabel className="px-3 py-2.5">
                                        <p className="font-black text-xs text-foreground truncate">{userName}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight truncate mt-1">{user?.phone || user?.email}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-muted-foreground hover:text-foreground text-[11px] font-bold transition-colors">
                                            <User className="w-4 h-4" />
                                            View & Edit Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-muted-foreground hover:text-foreground text-[11px] font-bold transition-colors">
                                            <Settings className="w-4 h-4" />
                                            System Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            userStore.logout();
                                            router.push('/login');
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-500 group text-[11px] font-bold transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        Log Out Session
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Children Slot */}
                <div className="flex-1 overflow-y-auto no-scrollbar lg:px-8 py-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                        <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/5 z-50 lg:hidden flex flex-col p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                                        <Sparkles className="text-white w-5 h-5" />
                                    </div>
                                    <h2 className="text-base font-black tracking-widest uppercase">CG <span className="text-primary italic">SHADI</span></h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full hover:bg-white/5">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <nav className="space-y-2">
                                {sidebarLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = pathname === link.href;
                                    return (
                                        <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}>
                                            <Icon className="w-5 h-5" />
                                            <span className="font-bold text-sm">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
