'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, LogOut, BarChart, Users, Shield, FileWarning, Briefcase, DollarSign, LineChart, BadgeCheck, ClipboardList, FileText, Mail, Settings } from 'lucide-react';
import { adminNavItems } from '@/lib/placeholder-data';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useAuthStore } from '@/stores/auth-store';
import authService from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const getIconForRoute = (href: string) => {
  switch (href) {
    case '/admin': return <BarChart className="w-4 h-4" />;
    case '/admin/analytics': return <LineChart className="w-4 h-4" />;
    case '/admin/activity': return <ClipboardList className="w-4 h-4" />;
    case '/admin/audit-logs': return <FileText className="w-4 h-4" />;
    case '/admin/users': return <Users className="w-4 h-4" />;
    case '/admin/profiles': return <Shield className="w-4 h-4" />;
    case '/admin/verifications': return <BadgeCheck className="w-4 h-4" />;
    case '/admin/agents': return <Briefcase className="w-4 h-4" />;
    case '/admin/reports': return <FileWarning className="w-4 h-4" />;
    case '/admin/messages': return <Mail className="w-4 h-4" />;
    case '/admin/subscriptions': return <DollarSign className="w-4 h-4" />;
    case '/admin/settings': return <Settings className="w-4 h-4" />;
    default: return <div className="w-4 h-4" />;
  }
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, accessToken, refreshToken, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (accessToken && refreshToken) {
        await authService.logout(accessToken, refreshToken);
      }
      logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      router.push('/admin-secure-login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/admin-secure-login');
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    {getIconForRoute(item.href)}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  <AvatarImage src={user?.profilePicture || undefined} alt={user?.email || 'Admin'} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Admin Panel</span>
                  <span className="text-xs font-normal text-muted-foreground truncate max-w-[200px]">
                    {user?.email || 'admin@example.com'}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
