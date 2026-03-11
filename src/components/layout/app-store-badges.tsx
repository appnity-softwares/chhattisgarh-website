import Link from "next/link";
import Image from "next/image";

export function AppStoreBadges() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Google Play Badge */}
      <Link
        href="https://play.google.com/store/apps"
        target="_blank"
        rel="noopener noreferrer"
        className="transform hover:scale-105 transition-transform duration-300"
      >
        <div className="relative w-48 h-16">
          <Image
            src="/badges/google-play-badge.png"
            alt="Get it on Google Play"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>

      {/* App Store Badge */}
      <Link
        href="https://apps.apple.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transform hover:scale-105 transition-transform duration-300"
      >
        <div className="relative w-44 h-14 sm:h-16">
          {/* Using SVG for crisp rendering */}
          <Image
            src="/badges/app-store-badge.svg"
            alt="Download on the App Store"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
    </div>
  );
}
