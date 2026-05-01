"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "./language-switcher";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu, LogIn, Download } from "lucide-react";
import { configService } from "@/services/config.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useAuthStore } from "@/stores/auth-store";
import { LayoutDashboard } from "lucide-react";

const navLinks = [
  { href: "/browse", label: "Browse Profiles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
  { href: "/success-stories", label: "Success Stories" },
];

export function Navbar() {
  const [apkUrl, setApkUrl] = useState("/#download");
  const user = useUserAuthStore((state) => state.user);
  const admin = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await configService.getPublicConfigs();
        const infoConfig = data.find(c => c.key === 'app_info');
        if (infoConfig) {
          const info = JSON.parse(infoConfig.value);
          if (info.apkUrl) setApkUrl(info.apkUrl);
        } else {
          setApkUrl("https://play.google.com/store/apps/details?id=com.cgshadi.official");
        }
      } catch {
        console.error("Failed to load nav links");
        setApkUrl("https://play.google.com/store/apps/details?id=com.cgshadi.official");
      }
    };
    loadConfig();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Left Section for Mobile Menu */}
        <div className="flex items-center gap-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r border-white/10 bg-background/95 backdrop-blur-xl">
              <div className="mt-8 flex flex-col gap-6">
                <Logo />
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-semibold text-muted-foreground hover:text-primary transition-colors py-2 border-b border-white/5"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={apkUrl}
                    target="_blank"
                    className="text-lg font-bold text-primary py-4 flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download App
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo Section - Visible on All Sizes */}
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm ml-6 font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section for Desktop Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button variant="ghost" asChild className="hidden lg:flex text-muted-foreground hover:text-primary font-bold">
            <Link href={apkUrl} target="_blank" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download App
            </Link>
          </Button>
          
          {user ? (
            <Button variant="default" asChild className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-9 shadow-md">
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          ) : admin ? (
            <Button variant="default" asChild className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-9 shadow-md">
              <Link href="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Admin Panel
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:flex text-muted-foreground hover:text-primary font-bold">
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </Button>

              <Button asChild className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-9 group shadow-md">
                <Link href="/register">
                  Join Now
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
