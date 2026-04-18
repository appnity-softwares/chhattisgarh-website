"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length <= 1) return null; // Don't show on root /dashboard

    return (
        <nav className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2">
            <Link 
                href="/dashboard"
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
                <Home className="w-3.5 h-3.5" />
                DASHBOARD
            </Link>

            {segments.slice(1).map((segment, index) => {
                const href = `/${segments.slice(0, index + 2).join("/")}`;
                const isLast = index === segments.length - 2;
                
                // Prettify segment name
                const label = segment
                    .replace(/-/g, " ")
                    .replace(/^\w/, (c) => c.toUpperCase());

                return (
                    <motion.div 
                        key={href}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                        <Link
                            href={href}
                            className={`text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${isLast ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {label}
                        </Link>
                    </motion.div>
                );
            })}
        </nav>
    );
}
