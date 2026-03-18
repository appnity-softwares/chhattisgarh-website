import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "./language-switcher";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu, LogIn } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#stories", label: "Success Stories" },
];

export function Navbar() {
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
                    href="/#download"
                    className="text-lg font-bold text-primary py-4"
                  >
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
          <Button asChild className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-9">
            <Link href="/#download">Download App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

