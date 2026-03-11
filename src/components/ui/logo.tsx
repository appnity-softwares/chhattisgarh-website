import { cn } from "@/lib/utils";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <HeartHandshake className="h-6 w-6" />
      <span className="font-headline">Chhattisgarh Shaadi</span>
    </Link>
  );
}
