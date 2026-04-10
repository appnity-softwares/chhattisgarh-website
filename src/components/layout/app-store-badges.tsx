"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { configService } from "@/services/config.service";
import { DownloadCloud } from "lucide-react";

export function AppStoreBadges({ className }: { className?: string }) {
  const [links, setLinks] = useState({
    googlePlay: "https://play.google.com/store/apps",
    apk: "#"
  });

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const data = await configService.getPublicConfigs();
        const infoConfig = data.find(c => c.key === 'app_info');
        if (infoConfig) {
          const info = JSON.parse(infoConfig.value);
          setLinks({
            googlePlay: info.googlePlayUrl || "https://play.google.com/store/apps",
            apk: info.apkUrl || "#"
          });
        }
      } catch (err) {
        console.error("Failed to load store links");
      }
    };
    loadLinks();
  }, []);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${className}`}>
      {/* Google Play Badge */}
      <Link
        href={links.googlePlay}
        target="_blank"
        rel="noopener noreferrer"
        className="transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-primary/20 rounded-xl overflow-hidden"
      >
        <div className="relative w-44 h-14 sm:w-48 sm:h-16">
          <Image
            src="/badges/google-play-badge.png"
            alt="Get it on Google Play"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>
      </Link>

      {/* Direct APK Download Button */}
      <Link
        href={links.apk}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl border border-gray-200 w-full sm:w-auto min-w-[200px]"
      >
        <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors shrink-0">
          <DownloadCloud className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">Official Direct</span>
          <span className="text-lg whitespace-nowrap">Download APK</span>
        </div>
      </Link>
    </div>
  );
}
