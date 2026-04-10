"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "./language-switcher";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu, LogIn, Download } from "lucide-react";
import { configService } from "@/services/config.service";

const navLinks = [
  { href: "/browse", label: "Browse Profiles" },
  { href: "/#features", label: "Features" },
  { href: "/#stories", label: "Success Stories" },
];

export function Navbar() {
  const [apkUrl, setApkUrl] = useState("/#download");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await configService.getAllConfigs();
        const infoConfig = data.find(c => c.key === 'app_info');
        if (infoConfig) {
          const info = JSON.parse(infoConfig.value);
          if (info.apkUrl) setApkUrl(info.apkUrl);
        }
      } catch (err) {
        console.error("Failed to load nav links");
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
                    target={apkUrl.startsWith("http") ? "_blank" : "_self"}
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
          
          <Button variant="ghost" asChild className="hidden sm:flex text-muted-foreground hover:text-primary font-bold">
            <Link href="/login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </Button>

          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-9 group shadow-lg shadow-primary/20">
            <Link href="/register">
              Join Now
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

