'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LineChart, Send, DollarSign, Users, Shield,
  Briefcase, FileWarning, Mail, Settings, HelpCircle,
  LogOut, Bell, ChevronLeft, ChevronRight, LayoutDashboard,
  Wallet, Menu, X, Sparkles, Activity, Palette, Heart
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import authService from '@/services/auth.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types/api.types';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
      { href: '/admin/activity', label: 'Activity', icon: Activity },
    ]
  },
  {
    label: 'User Management',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/profiles', label: 'Profiles', icon: Shield },
      { href: '/admin/agents', label: 'Agents', icon: Briefcase },
    ]
  },
  {
    label: 'Content & Support',
    items: [
      { href: '/admin/reports', label: 'Reports', icon: FileWarning },
      { href: '/admin/stories', label: 'Success Stories', icon: Heart },
      { href: '/admin/messages', label: 'Messages', icon: Mail },
      { href: '/admin/faq', label: 'FAQs', icon: HelpCircle },
    ]
  },
  {
    label: 'Business',
    items: [
      { href: '/admin/subscriptions', label: 'Subscriptions', icon: Wallet },
      { href: '/admin/payments', label: 'Payments', icon: DollarSign },
      { href: '/admin/promo-codes', label: 'Promo Codes', icon: DollarSign },
      { href: '/admin/notifications', label: 'Push Center', icon: Send },
    ]
  },
  {
    label: 'System',
    items: [
      { href: '/admin/theme', label: 'App Theme', icon: Palette },
      { href: '/admin/diagnostics', label: 'Diagnostics', icon: Activity },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, accessToken, refreshToken, logout, isAuthenticated, hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/admin-secure-login');
    } else {
      // Use setTimeout to avoid synchronous setState warning
      setTimeout(() => setIsChecking(false), 0);
    }
  }, [isAuthenticated, router, hasHydrated]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setTimeout(() => setMobileSidebarOpen(false), 0);
  }, [pathname]);

  if (!isAuthenticated && isChecking) {
    return (
      <div className="flex h-screen items-center justify-center login-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          </div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      if (accessToken && refreshToken) {
        await authService.logout(accessToken, refreshToken);
      }
      logout();
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
      router.push('/admin-secure-login');
    } catch {
      logout();
      router.push('/admin-secure-login');
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() || 'A';
  const userEmail = user?.email || 'admin@example.com';

  const sidebarProps = {
    user,
    userInitials,
    userEmail,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isActive,
    handleLogout
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(340 40% 4%)' }}>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden lg:flex flex-col flex-shrink-0
          admin-sidebar transition-[width] duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
        `}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-50 flex flex-col w-64
          admin-sidebar transition-transform duration-300 ease-in-out lg:hidden
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="admin-header flex-shrink-0 h-16 flex items-center px-4 sm:px-6 gap-4 z-30">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page breadcrumb area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline">Admin</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-white font-medium capitalize truncate max-w-[200px]">
                {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors">
                  <Avatar className="w-7 h-7 ring-2 ring-primary/30">
                    <AvatarImage src={user?.profilePicture || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-600 to-primary text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white font-medium hidden sm:block max-w-[120px] truncate">
                    {userEmail.split('@')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-white">Administrator</span>
                    <span className="text-xs font-normal text-muted-foreground truncate">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  user: User | null;
  userInitials: string;
  userEmail: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isActive: (href: string) => boolean;
  handleLogout: () => void;
}

function SidebarContent({ 
  user, userInitials, userEmail, sidebarCollapsed, setSidebarCollapsed, 
  isActive, handleLogout 
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-primary flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[hsl(340_40_4%)]" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white leading-tight truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
              CG Shadi
            </h2>
            <p className="text-[10px] text-rose-400 font-medium tracking-wider uppercase">Admin Console</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {!sidebarCollapsed && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 pb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      sidebar-nav-item group flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                      transition-all duration-200 cursor-pointer
                      ${active ? 'active text-white' : 'text-muted-foreground hover:text-white'}
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`flex-shrink-0 w-4 h-4 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {active && !sidebarCollapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:flex px-3 py-2 border-t border-white/[0.06]">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.04] transition-all text-xs"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-3 border-t border-white/[0.06] ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`group flex items-center gap-3 rounded-xl p-2 w-full hover:bg-white/[0.04] transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-primary/30">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-rose-600 to-primary text-white text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-semibold text-white truncate">Administrator</p>
                  <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-white font-semibold">Administrator</span>
                <span className="text-xs font-normal text-muted-foreground truncate">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
